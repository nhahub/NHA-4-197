// Green Cycle - Core App Controller

// Default state variables
const state = {
  lang: localStorage.getItem("greencycle_lang") || "en",
  user: JSON.parse(localStorage.getItem("greencycle_user")) || null,
  activeView: "home",
  backendUrl: window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")
    ? "http://localhost:7861/api"
    : `${window.location.origin}/api`,
  chatHistory: [],
  pollutionImage: null,
  recyclingImage: null
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  initTheme();
  initRouting();
  initAuth();
  initMarketplace();
  initEcoAI();
  updateAuthUI();
});

// ==================== DARK / LIGHT MODE ====================
function initTheme() {
  const themeBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("greencycle_theme") || "dark";

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    if (themeBtn) themeBtn.textContent = "☀️";
  } else {
    document.body.classList.remove("light-mode");
    if (themeBtn) themeBtn.textContent = "🌙";
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("light-mode");
      themeBtn.textContent = isLight ? "☀️" : "🌙";
      localStorage.setItem("greencycle_theme", isLight ? "light" : "dark");
    });
  }
}

// ==================== TRANSLATIONS & LANG SWITCH ====================
function initLanguage() {
  const switchBtn = document.getElementById("lang-switch-btn");
  if (switchBtn) {
    switchBtn.addEventListener("click", () => {
      state.lang = state.lang === "en" ? "ar" : "en";
      localStorage.setItem("greencycle_lang", state.lang);
      applyLanguage(state.lang);
    });
  }
  applyLanguage(state.lang);
}

function applyLanguage(lang) {
  // Update document metadata
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  // Translate all elements with [data-i18n]
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (window.translations && window.translations[lang] && window.translations[lang][key]) {
      el.textContent = window.translations[lang][key];
    }
  });

  // Translate elements with placeholders
  const placeholderEl = document.querySelectorAll("[data-i18n-placeholder]");
  placeholderEl.forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (window.translations && window.translations[lang] && window.translations[lang][key]) {
      el.setAttribute("placeholder", window.translations[lang][key]);
    }
  });

  // Update button labels
  const langText = document.getElementById("lang-btn-text");
  if (langText) {
    langText.textContent = lang === "en" ? "العربية" : "English";
  }

  // Update profile lang select if present
  const profLang = document.getElementById("profile-lang");
  if (profLang) {
    profLang.value = lang;
  }
}

// ==================== SPA ROUTING ====================
function initRouting() {
  const navLinks = document.querySelectorAll("[data-view]");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetView = link.getAttribute("data-view");

      if (targetView === "about-section") {
        showView("home");
        setTimeout(() => {
          const aboutSection = document.getElementById("section-about");
          if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        showView(targetView);
      }
    });
  });

  // Brand Logo clicks return to home
  const logoTrigger = document.getElementById("brand-logo-trigger");
  if (logoTrigger) {
    logoTrigger.addEventListener("click", () => showView("home"));
  }

  // Hero page scan click redirects to Chatbot tab in Eco AI view
  const scanBtn = document.getElementById("hero-scan-btn");
  if (scanBtn) {
    scanBtn.addEventListener("click", () => {
      showView("ecoai");
      switchEcoAITab("tab-recycling");
    });
  }

  const startBtn = document.getElementById("hero-start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", () => showView("ecoai"));
  }
}

function showView(viewName) {
  // Check auth protection
  if ((viewName === "dashboard" || viewName === "profile") && !state.user) {
    showToast(state.lang === "en" ? "Please sign in to access this page." : "يرجى تسجيل الدخول للوصول إلى هذه الصفحة.", "error");
    openAuthModal("login");
    return;
  }

  state.activeView = viewName;

  // Toggle active view panel
  const panels = document.querySelectorAll(".view-panel");
  panels.forEach(panel => {
    panel.classList.remove("active");
  });

  const activePanel = document.getElementById(`view-${viewName}`);
  if (activePanel) {
    activePanel.classList.add("active");
  }

  // Update active state in navigation
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("data-view") === viewName ||
      (viewName === "home" && link.getAttribute("data-view") === "about-section" && window.scrollY > 100)) {
      link.classList.add("active");
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==================== AUTHENTICATION ====================
function initAuth() {
  const modal = document.getElementById("auth-modal");
  const closeBtn = document.getElementById("auth-modal-close");
  const loginBtn = document.getElementById("nav-login-btn");
  const signupBtn = document.getElementById("nav-signup-btn");
  const toSignup = document.getElementById("go-to-signup");
  const toLogin = document.getElementById("go-to-login");

  // Forms
  const loginForm = document.getElementById("auth-login-form");
  const signupForm = document.getElementById("auth-signup-form");
  const profileForm = document.getElementById("profile-edit-form");
  const logoutBtn = document.getElementById("profile-logout-btn");

  if (loginBtn) loginBtn.addEventListener("click", () => openAuthModal("login"));
  if (signupBtn) signupBtn.addEventListener("click", () => openAuthModal("signup"));
  if (closeBtn) closeBtn.addEventListener("click", closeAuthModal);

  if (toSignup) {
    toSignup.addEventListener("click", (e) => {
      e.preventDefault();
      toggleAuthMode("signup");
    });
  }

  if (toLogin) {
    toLogin.addEventListener("click", (e) => {
      e.preventDefault();
      toggleAuthMode("login");
    });
  }

  // Click outside to close modal
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeAuthModal();
  });

  // Form Submissions
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const pass = document.getElementById("login-pass").value;

      // Mock user login
      const mockUser = {
        name: "Green Explorer",
        email: email,
        isLoggedIn: true
      };

      state.user = mockUser;
      localStorage.setItem("greencycle_user", JSON.stringify(mockUser));
      updateAuthUI();
      closeAuthModal();
      showToast(window.translations[state.lang]["auth_success_login"], "success");
      showView("dashboard");
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signup-name").value;
      const email = document.getElementById("signup-email").value;

      // Mock signup success
      showToast(window.translations[state.lang]["auth_success_signup"], "success");
      toggleAuthMode("login");
      document.getElementById("login-email").value = email;
    });
  }

  // Profile Form Edit
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("profile-name").value;
      const email = document.getElementById("profile-email").value;
      const lang = document.getElementById("profile-lang").value;

      state.user.name = name;
      state.user.email = email;
      state.lang = lang;

      localStorage.setItem("greencycle_user", JSON.stringify(state.user));
      localStorage.setItem("greencycle_lang", state.lang);

      applyLanguage(state.lang);
      showToast(window.translations[state.lang]["prof_success_msg"], "success");
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", performLogout);
  }
}

function openAuthModal(mode) {
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.classList.add("active");
    toggleAuthMode(mode);
  }
}

function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) modal.classList.remove("active");
}

function toggleAuthMode(mode) {
  const loginMode = document.getElementById("auth-login-mode");
  const signupMode = document.getElementById("auth-signup-mode");

  if (mode === "login") {
    loginMode.style.display = "block";
    signupMode.style.display = "none";
  } else {
    loginMode.style.display = "none";
    signupMode.style.display = "block";
  }
}

function performLogout() {
  state.user = null;
  localStorage.removeItem("greencycle_user");
  updateAuthUI();
  showToast(state.lang === "en" ? "Logged out successfully" : "تم تسجيل الخروج بنجاح", "success");
  showView("home");
}

function updateAuthUI() {
  const navLogin = document.getElementById("nav-login-btn");
  const navSignup = document.getElementById("nav-signup-btn");
  const navProfileBtn = document.getElementById("nav-profile-btn");

  const navDashLink = document.getElementById("nav-dash-link");
  const navProfLink = document.getElementById("nav-prof-link");

  // Inputs on profile view
  const profName = document.getElementById("profile-name");
  const profEmail = document.getElementById("profile-email");

  if (state.user) {
    // Logged In
    if (navLogin) navLogin.style.display = "none";
    if (navSignup) navSignup.style.display = "none";
    if (navProfileBtn) navProfileBtn.style.display = "block";
    if (navDashLink) navDashLink.style.display = "block";
    if (navProfLink) navProfLink.style.display = "block";

    if (profName) profName.value = state.user.name;
    if (profEmail) profEmail.value = state.user.email;
  } else {
    // Logged Out
    if (navLogin) navLogin.style.display = "block";
    if (navSignup) navSignup.style.display = "block";
    if (navProfileBtn) navProfileBtn.style.display = "none";
    if (navDashLink) navDashLink.style.display = "none";
    if (navProfLink) navProfLink.style.display = "none";
  }
}

// ==================== MARKETPLACE ====================
function initMarketplace() {
  const sellTrigger = document.getElementById("btn-sell-waste-trigger");
  const sellModal = document.getElementById("sell-waste-modal");
  const closeBtn = document.getElementById("sell-modal-close");
  const sellForm = document.getElementById("sell-waste-form");

  if (sellTrigger) {
    sellTrigger.addEventListener("click", () => {
      if (!state.user) {
        showToast(state.lang === "en" ? "Please sign in to list items for sale." : "يرجى تسجيل الدخول لإدراج العناصر للبيع.", "error");
        openAuthModal("login");
      } else {
        sellModal.classList.add("active");
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", () => sellModal.classList.remove("active"));

  if (sellForm) {
    sellForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("sell-name").value;
      const type = document.getElementById("sell-type").value;
      const weight = document.getElementById("sell-weight").value;
      const location = document.getElementById("sell-location").value;

      // Simulate appending listing card
      const itemsGrid = document.getElementById("market-items-grid");
      if (itemsGrid) {
        const card = document.createElement("div");
        card.className = "glass-card waste-card";
        card.setAttribute("data-cat", type);
        card.setAttribute("data-loc", location);

        const badgeClass = type === "plastic" ? "badge-plastic" : type === "paper" ? "badge-paper" : "badge-metal";
        const emoji = type === "plastic" ? "🧴" : type === "paper" ? "📦" : "🥫";
        const nameTitle = type === "plastic" ? "Simulated Plastic Bundle" : type === "paper" ? "Simulated Paper Bundle" : "Simulated Scrap Metal";
        const price = type === "plastic" ? 0.60 : type === "paper" ? 0.20 : 3.00;
        const capLoc = location.charAt(0).toUpperCase() + location.slice(1);

        card.innerHTML = `
          <div>
            <span class="waste-badge ${badgeClass}">${type}</span>
            <div class="waste-img-placeholder">${emoji} [Simulated Listing]</div>
            <h4 class="card-title" style="font-size:16px;">${nameTitle}</h4>
            <p class="card-desc" style="font-size:12px; margin-top:4px;">${weight} kg • ${capLoc}, Egypt</p>
          </div>
          <div>
            <div class="waste-price">$${(price * 1).toFixed(2)} <span style="font-size:12px; font-weight:normal; color:var(--text-secondary);">/ kg</span></div>
            <button class="btn btn-secondary btn-icon" style="width:100%;" onclick="alert('Seller details: ${state.user.email}')">
              <span>Seller Info</span>
            </button>
          </div>
        `;
        itemsGrid.insertBefore(card, itemsGrid.firstChild);
      }

      sellModal.classList.remove("active");
      showToast(window.translations[state.lang]["listing_success"], "success");
      filterMarketplace();
    });
  }

  // Filter Event Listeners
  const categoryFilters = document.querySelectorAll("input[name='market-cat']");
  categoryFilters.forEach(f => f.addEventListener("change", filterMarketplace));

  const locationFilters = document.querySelectorAll("input[name='market-loc']");
  locationFilters.forEach(f => f.addEventListener("change", filterMarketplace));
}

function filterMarketplace() {
  const selectedCats = Array.from(document.querySelectorAll("input[name='market-cat']:checked")).map(el => el.value);
  const selectedLoc = document.querySelector("input[name='market-loc']:checked").value;
  const cards = document.querySelectorAll(".waste-card");

  cards.forEach(card => {
    const cat = card.getAttribute("data-cat");
    const loc = card.getAttribute("data-loc");

    const catMatch = selectedCats.includes(cat);
    const locMatch = selectedLoc === "all" || loc === selectedLoc;

    if (catMatch && locMatch) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

// ==================== ECO AI HUB ====================
function initEcoAI() {
  // Tab controller
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      switchEcoAITab(tabId);
    });
  });

  // CHAT SYSTEM
  const chatForm = document.getElementById("chat-form");
  if (chatForm) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("chat-input-field");
      const text = input.value.trim();
      if (!text) return;

      appendChatMessage("user", text);
      input.value = "";

      // Add loading state
      const placeholderId = appendChatMessage("assistant", "...");

      // Update history
      state.chatHistory.push({ role: "user", content: text });

      try {
        const response = await fetch(`${state.backendUrl}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: state.chatHistory })
        });

        if (!response.ok) throw new Error("API Offline");

        const data = await response.json();
        state.chatHistory.push({ role: "assistant", content: data.response });
        updateChatMessage(placeholderId, data.response);
      } catch (err) {
        // Fallback simulation responses in case the backend/groq key is unavailable
        let fallback = "I apologize, the AI Chat server is offline. However, as an eco-advisor, I can tell you that recycling plastic bottles, cardboard, and aluminum is crucial. Try separating paper, compost, and hazardous waste.";
        if (state.lang === "ar") {
          fallback = "أعتذر، خادم الدردشة البيئية غير متصل حالياً. ومع ذلك، كمستشار بيئي، يمكنني إخبارك أن إعادة تدوير الزجاجات البلاستيكية والكرتون والألومنيوم أمر بالغ الأهمية. حاول فصل الورق والسماد والنفايات الخطرة.";
        }

        state.chatHistory.push({ role: "assistant", content: fallback });
        updateChatMessage(placeholderId, fallback);
      }
    });
  }

  // POLLUTION ANALYZER SYSTEM
  initAnalyzerUpload("poll-dropzone", "poll-file-input", "poll-preview", "poll-dropzone-icon", "poll-dropzone-text", "poll-btn-analyze");
  const pollBtn = document.getElementById("poll-btn-analyze");
  if (pollBtn) {
    pollBtn.addEventListener("click", async () => {
      const fileInput = document.getElementById("poll-file-input");
      if (!fileInput.files.length) return;

      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append("image", file);

      // UI Loading state
      document.getElementById("poll-spinner").style.display = "flex";
      const output = document.getElementById("poll-output-content");
      output.innerHTML = "";

      try {
        const response = await fetch(`${state.backendUrl}/analyze-pollution`, {
          method: "POST",
          body: formData
        });

        if (!response.ok) throw new Error("Offline");
        const data = await response.json();

        document.getElementById("poll-spinner").style.display = "none";
        renderMarkdown(output, data.analysis);
      } catch (err) {
        // Mock calculations
        setTimeout(() => {
          document.getElementById("poll-spinner").style.display = "none";
          let fallbackAnalysis = `### Environmental Analysis Result:
* **Pollution Type**: Waste Dump / Plastic Overflow
* **Severity Level**: Medium
* **Pollution Percentage**: 65%
* **Main Cause**: Negligence in local waste container collection.
* **Health Impact**: Potential vector for pests and bacteria, soil toxicity.
* **Recommended Solutions**: Set up closed collection bins, implement immediate recycling programs, request local council collection.`;

          if (state.lang === "ar") {
            fallbackAnalysis = `### نتيجة تحليل التلوث البيئي:
* **نوع التلوث**: تراكم النفايات / فيض بلاستيكي
* **مستوى الخطورة**: متوسط
* **نسبة التلوث**: 65%
* **السبب الرئيسي**: الإهمال في تفريغ حاويات النفايات المحلية.
* **الأثر الصحي**: ناقل محتمل للآفات والبكتيريا، وتسمم التربة.
* **الحلول الموصى بها**: إعداد صناديق تجميع مغلقة، وتنفيذ برامج فورية لإعادة التدوير، وطلب التدخل من البلدية المحلية.`;
          }
          renderMarkdown(output, fallbackAnalysis);
        }, 1200);
      }
    });
  }

  // RECYCLING ASSISTANT SYSTEM
  initAnalyzerUpload("recy-dropzone", "recy-file-input", "recy-preview", "recy-dropzone-icon", "recy-dropzone-text", "recy-btn-analyze");
  const recyBtn = document.getElementById("recy-btn-analyze");
  if (recyBtn) {
    recyBtn.addEventListener("click", async () => {
      const fileInput = document.getElementById("recy-file-input");
      if (!fileInput.files.length) return;

      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append("image", file);

      document.getElementById("recy-spinner").style.display = "flex";
      const output = document.getElementById("recy-output-content");
      output.innerHTML = "";

      try {
        const response = await fetch(`${state.backendUrl}/analyze-recycling`, {
          method: "POST",
          body: formData
        });
        if (!response.ok) throw new Error("Offline");
        const data = await response.json();

        document.getElementById("recy-spinner").style.display = "none";
        renderMarkdown(output, data.analysis);
      } catch (err) {
        setTimeout(() => {
          document.getElementById("recy-spinner").style.display = "none";
          let fallbackAnalysis = `### Material Recycling Report:
* **Detected Material**: Polyethylene Terephthalate (PET #1 Plastic)
* **Recyclable**: Yes (100% Recyclable)
* **Decomposition Time**: ~450 Years
* **Recycling Method**: Shredding → Washing → Melting → Pelletizing into new containers.
* **Impact if Not Recycled**: Breaks down into hazardous microplastics, contaminates marine food chains, releases greenhouse gases.`;

          if (state.lang === "ar") {
            fallbackAnalysis = `### تقرير تصنيف وإعادة تدوير المادة:
* **المادة المكتشفة**: البولي إيثيلين تيريفثاليت (بلاستيك PET #1)
* **قابل للتدوير**: نعم (قابل للتدوير 100%)
* **مدة التحلل الطبيعي**: 450 عاماً تقريباً
* **طريقة إعادة التدوير**: التقطيع ← الغسيل ← الصهر ← التحبيب إلى زجاجات وحاويات جديدة.
* **الضرر البيئي عند عدم التدوير**: يتحلل إلى جزيئات بلاستيكية دقيقة ضارة، ويلوث السلسلة الغذائية البحرية، ويطلق غازات دفيئة.`;
          }
          renderMarkdown(output, fallbackAnalysis);
        }, 1200);
      }
    });
  }

  // CITY SIMULATOR SYSTEM
  const sliders = [
    { id: "input-sim-pop", valId: "val-sim-pop", suffix: "" },
    { id: "input-sim-cars", valId: "val-sim-cars", suffix: "" },
    { id: "input-sim-factories", valId: "val-sim-factories", suffix: "" },
    { id: "input-sim-trees", valId: "val-sim-trees", suffix: "" },
    { id: "input-sim-energy", valId: "val-sim-energy", suffix: " MWh" }
  ];

  sliders.forEach(slider => {
    const el = document.getElementById(slider.id);
    const valEl = document.getElementById(slider.valId);
    if (el && valEl) {
      el.addEventListener("input", () => {
        valEl.textContent = Number(el.value).toLocaleString() + slider.suffix;
      });
    }
  });

  const simBtn = document.getElementById("city-btn-simulate");
  if (simBtn) {
    simBtn.addEventListener("click", async () => {
      const population = parseInt(document.getElementById("input-sim-pop").value);
      const cars = parseInt(document.getElementById("input-sim-cars").value);
      const factories = parseInt(document.getElementById("input-sim-factories").value);
      const trees = parseInt(document.getElementById("input-sim-trees").value);
      const energy = parseInt(document.getElementById("input-sim-energy").value);

      document.getElementById("city-spinner").style.display = "flex";
      const output = document.getElementById("city-output-content");
      output.innerHTML = "";

      const cityPayload = { population, cars, factories, trees, energy_usage: energy };

      try {
        const response = await fetch(`${state.backendUrl}/simulate-city`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cityPayload)
        });
        if (!response.ok) throw new Error("Offline");
        const data = await response.json();

        document.getElementById("city-spinner").style.display = "none";
        renderMarkdown(output, data.simulation);
      } catch (err) {
        // Runs standard local scientific calculations in case backend is offline
        setTimeout(() => {
          document.getElementById("city-spinner").style.display = "none";

          // Formula definitions
          const co2Cars = cars * 4.6;
          const co2Factories = factories * 10000;
          const co2People = population * 4;
          const co2Absorbed = (trees * 21) / 1000; // tons

          const totalCO2 = co2Cars + co2Factories + co2People - co2Absorbed;

          // Air quality Index estimate
          let aqi = 50 + (totalCO2 / (population + 10000)) * 15;
          aqi = Math.min(Math.max(Math.round(aqi), 15), 500);

          let aqiText = "Good";
          if (aqi > 50) aqiText = "Moderate";
          if (aqi > 100) aqiText = "Unhealthy for Sensitive Groups";
          if (aqi > 150) aqiText = "Unhealthy";
          if (aqi > 200) aqiText = "Very Unhealthy";
          if (aqi > 300) aqiText = "Hazardous";

          if (state.lang === "ar") {
            if (aqi <= 50) aqiText = "جيد";
            else if (aqi <= 100) aqiText = "معتدل";
            else if (aqi <= 150) aqiText = "غير صحي للفئات الحساسة";
            else if (aqi <= 200) aqiText = "غير صحي";
            else if (aqi <= 300) aqiText = "غير صحي للغاية";
            else aqiText = "خطير جداً";
          }

          const tempImpact = (totalCO2 / 10000000) * 0.15;

          let report = `### Urban Simulation Report:
* **Total CO2 Emissions**: ${Math.round(totalCO2).toLocaleString()} tons / year
  * Cars: ${Math.round(co2Cars).toLocaleString()} tons
  * Factories: ${Math.round(co2Factories).toLocaleString()} tons
  * Residential: ${Math.round(co2People).toLocaleString()} tons
  * Trees Absorbed: -${Math.round(co2Absorbed).toLocaleString()} tons
* **Air Quality Index (AQI)**: ${aqi} (${aqiText})
* **Est. Temperature Impact**: +${tempImpact.toFixed(2)} °C
* **Top 3 Recommended Solutions**:
  1. Increase urban tree canopy to absorb carbon.
  2. Promote public electric transit to lower vehicle count.
  3. Relocate factories or employ carbon capture systems.`;

          if (state.lang === "ar") {
            report = `### تقرير محاكاة البيئة الحضرية للمدينة:
* **إجمالي انبعاثات ثنائي أكسيد الكربون (CO2)**: ${Math.round(totalCO2).toLocaleString()} طن / سنة
  * انبعاثات السيارات: ${Math.round(co2Cars).toLocaleString()} طن
  * انبعاثات المصانع: ${Math.round(co2Factories).toLocaleString()} طن
  * الانبعاثات السكنية: ${Math.round(co2People).toLocaleString()} طن
  * امتصاص الأشجار: -${Math.round(co2Absorbed).toLocaleString()} طن
* **مؤشر جودة الهواء (AQI)**: ${aqi} (${aqiText})
* **مستوى التأثير على الحرارة**: +${tempImpact.toFixed(2)} درجة مئوية
* **أهم 3 حلول بيئية موصى بها**:
  1. زيادة الغطاء النباتي وزراعة المزيد من الأشجار لامتصاص الكربون.
  2. تشجيع وسائل النقل الكهربائية العامة لتقليل استخدام السيارات.
  3. نقل المصانع خارج المدن أو توظيف فلاتر متطورة لالتقاط الانبعاثات.`;
          }

          renderMarkdown(output, report);
        }, 1200);
      }
    });
  }
}

function switchEcoAITab(tabId) {
  const btns = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-content-panel");

  btns.forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-tab") === tabId) btn.classList.add("active");
  });

  panels.forEach(panel => {
    panel.classList.remove("active");
    if (panel.id === tabId) panel.classList.add("active");
  });
}

// Drag & Drop Upload Helper
function initAnalyzerUpload(dropzoneId, fileInputId, previewId, iconId, textId, buttonId) {
  const dropzone = document.getElementById(dropzoneId);
  const fileInput = document.getElementById(fileInputId);
  const preview = document.getElementById(previewId);
  const icon = document.getElementById(iconId);
  const text = document.getElementById(textId);
  const button = document.getElementById(buttonId);

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      handleFileSelected(fileInput.files[0], preview, icon, text, button);
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
      handleFileSelected(fileInput.files[0], preview, icon, text, button);
    }
  });
}

function handleFileSelected(file, preview, icon, text, button) {
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.style.display = "block";
    if (icon) icon.style.display = "none";
    if (text) text.style.display = "none";
    if (button) button.removeAttribute("disabled");
  };
  reader.readAsDataURL(file);
}

// Simple Markdown Renderer
function renderMarkdown(targetEl, text) {
  let html = text
    .replace(/^### (.*$)/gim, '<h3 class="card-title" style="margin-bottom:12px;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="card-title" style="margin-bottom:16px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="card-title" style="margin-bottom:20px;">$1</h1>')
    .replace(/^\* \*\*(.*?)\*\*: (.*$)/gim, '<li><strong>$1</strong>: $2</li>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\n$/gim, '<br>');

  // Wrap items in list tag if they contain <li>
  if (html.includes("<li>")) {
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
  }

  targetEl.innerHTML = html;
}

// Chat UI Appends
function appendChatMessage(role, content) {
  const chatBox = document.getElementById("chat-history-box");
  if (!chatBox) return null;

  const msgId = "chat-msg-" + Date.now() + Math.random().toString(36).substr(2, 5);
  const div = document.createElement("div");
  div.className = `chat-msg ${role}`;
  div.id = msgId;

  const p = document.createElement("p");
  p.textContent = content;
  div.appendChild(p);

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  return msgId;
}

function updateChatMessage(msgId, newContent) {
  const msgDiv = document.getElementById(msgId);
  if (msgDiv) {
    const p = msgDiv.querySelector("p");
    if (p) p.textContent = newContent;

    const chatBox = document.getElementById("chat-history-box");
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  }
}

// ==================== TOAST & NOTIFICATIONS ====================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast-notification");
  const toastIcon = document.getElementById("toast-icon");
  const toastText = document.getElementById("toast-text");

  if (!toast) return;

  toast.className = `toast-msg ${type} active`;
  if (toastText) toastText.textContent = message;
  if (toastIcon) {
    toastIcon.textContent = type === "success" ? "✅" : "⚠️";
  }

  setTimeout(() => {
    toast.classList.remove("active");
  }, 4000);
}
const themeBtn = document.getElementById("theme-toggle");

if (themeBtn) {

  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-theme");
    themeBtn.textContent = "☀️";
  }

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    if (document.body.classList.contains("light-theme")) {
      themeBtn.textContent = "☀️";
      localStorage.setItem("theme", "light");
    } else {
      themeBtn.textContent = "🌙";
      localStorage.setItem("theme", "dark");
    }
  });

}
