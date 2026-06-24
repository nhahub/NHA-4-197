import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.preprocessing import StandardScaler

# Safe import XGBoost
try:
    from xgboost import XGBRegressor
    xgb_available = True
except:
    xgb_available = False

st.set_page_config(layout="wide")
st.title("CO2 Model Comparison")

# Upload
file = st.sidebar.file_uploader("Upload CSV", type=["csv"])

if file is None:
    st.stop()

df = pd.read_csv(file)

st.write("Shape:", df.shape)
st.dataframe(df.head())

# Target
TARGET = "co2_per_capita_log"

if TARGET not in df.columns:
    st.error("Target column not found")
    st.stop()

DROP = ["country", "iso_code", TARGET]
FEATURES = [c for c in df.columns if c not in DROP]

X = df[FEATURES]
y = df[TARGET]

# Remove non-numeric
X = X.select_dtypes(include=np.number)

# Split settings
test_size = st.sidebar.slider("Test Size", 0.1, 0.4, 0.2)
random_state = st.sidebar.number_input("Random State", value=42)

if st.sidebar.button("Train Models"):

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    scaler = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc = scaler.transform(X_test)

    results = {}
    models = {}

    # Linear Regression
    lr = LinearRegression()
    lr.fit(X_train_sc, y_train)
    preds = lr.predict(X_test_sc)
    results["Linear Regression"] = {
        "R2": r2_score(y_test, preds),
        "RMSE": np.sqrt(mean_squared_error(y_test, preds)),
        "CV": cross_val_score(lr, X_train_sc, y_train, cv=5).mean()
    }
    models["Linear Regression"] = lr

    # Ridge
    ridge = GridSearchCV(Ridge(), {"alpha": [0.01, 0.1, 1, 10, 100]}, cv=5)
    ridge.fit(X_train_sc, y_train)
    preds = ridge.predict(X_test_sc)
    results["Ridge"] = {
        "R2": r2_score(y_test, preds),
        "RMSE": np.sqrt(mean_squared_error(y_test, preds)),
        "CV": ridge.best_score_
    }
    models["Ridge"] = ridge

    # Random Forest
    rf = GridSearchCV(
        RandomForestRegressor(random_state=random_state),
        {"n_estimators": [100, 200], "max_depth": [None, 10, 20]},
        cv=5
    )
    rf.fit(X_train, y_train)
    preds = rf.predict(X_test)
    results["Random Forest"] = {
        "R2": r2_score(y_test, preds),
        "RMSE": np.sqrt(mean_squared_error(y_test, preds)),
        "CV": rf.best_score_
    }
    models["Random Forest"] = rf

    # Gradient Boosting
    gb = GridSearchCV(
        GradientBoostingRegressor(random_state=random_state),
        {"n_estimators": [100, 200], "learning_rate": [0.05, 0.1, 0.2], "max_depth": [3, 5]},
        cv=5
    )
    gb.fit(X_train, y_train)
    preds = gb.predict(X_test)
    results["Gradient Boosting"] = {
        "R2": r2_score(y_test, preds),
        "RMSE": np.sqrt(mean_squared_error(y_test, preds)),
        "CV": gb.best_score_
    }
    models["Gradient Boosting"] = gb

    # XGBoost
    if xgb_available:
        xgb = GridSearchCV(
            XGBRegressor(random_state=random_state, verbosity=0),
            {"n_estimators": [100, 200], "max_depth": [3, 5, 7], "learning_rate": [0.05, 0.1, 0.2]},
            cv=5
        )
        xgb.fit(X_train, y_train)
        preds = xgb.predict(X_test)
        results["XGBoost"] = {
            "R2": r2_score(y_test, preds),
            "RMSE": np.sqrt(mean_squared_error(y_test, preds)),
            "CV": xgb.best_score_
        }
        models["XGBoost"] = xgb

    # Results table
    results_df = pd.DataFrame(results).T.sort_values("R2", ascending=False)
    st.subheader("Results")
    st.dataframe(results_df)

    best_model = results_df.index[0]
    st.write("Best Model:", best_model)

    # Plot
    fig, ax = plt.subplots()
    ax.barh(results_df.index, results_df["R2"])
    ax.set_title("R2 Score")
    st.pyplot(fig)

    # Prediction
    st.subheader("Prediction")

    user_input = {}
    for col in X.columns:
        user_input[col] = st.number_input(col, value=float(df[col].median()))

    selected_model = st.selectbox("Model", list(models.keys()))

    if st.button("Predict"):
        input_df = pd.DataFrame([user_input])

        if selected_model in ["Linear Regression", "Ridge"]:
            input_df = scaler.transform(input_df)

        pred = models[selected_model].predict(input_df)[0]

        st.write("Prediction:", pred)