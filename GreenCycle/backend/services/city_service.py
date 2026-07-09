from services.config import require_client, CHAT_MODEL


def simulate_city(data: dict) -> dict:
    client = require_client()

    prompt = f"""You are an environmental scientist. Analyze this city data and provide a detailed simulation:

City Data:
- Population: {data.get('population', 0)}
- Number of Cars: {data.get('cars', 0)}
- Number of Factories: {data.get('factories', 0)}
- Number of Trees: {data.get('trees', 0)}
- Energy Usage (MWh/year): {data.get('energy_usage', 0)}

Using these scientific formulas:
- Each car produces 4.6 tons CO2/year
- Each factory produces 10,000 tons CO2/year
- Each tree absorbs 21 kg CO2/year
- Each person produces 4 tons CO2/year

Provide:
1. Current CO2 Emissions (tons/year)
2. Current Air Quality Index (AQI)
3. Current Temperature Impact
4. Prediction after 5 years if no changes
5. Prediction after 10 years if no changes
6. Top 3 Recommended Solutions with expected impact
7. Best case scenario if solutions are applied

Be specific with numbers and percentages.
Return plain text only, no Markdown formatting."""

    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[{"role": "user", "content": prompt}],
    )

    return {"simulation": response.choices[0].message.content}
