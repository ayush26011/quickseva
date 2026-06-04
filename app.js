/* ==========================================
   QuickSeva - State and Logic Engine (app.js)
   ========================================== */

// --- Constants & Mock Database Initialization ---
const DEFAULT_PROVIDERS = [
  {
    id: "p1",
    name: "Ramesh Kumar",
    role: "Construction",
    phone: "+91 98765-43210",
    rating: 4.9,
    reviewsCount: 38,
    pricePerHour: 25,
    status: "Available",
    avatar: "CN", // Construction
    bio: "Expert bricklayer and structural mason with 8+ years of home construction experience."
  },
  {
    id: "p2",
    name: "Raju Sahu",
    role: "Hardware",
    phone: "+91 87654-32109",
    rating: 4.7,
    reviewsCount: 19,
    pricePerHour: 18,
    status: "Booked",
    avatar: "HW", // Hardware
    bio: "Specialist in locks, metal fittings, door repairs, and modular cabinet installations."
  },
  {
    id: "p3",
    name: "Dheeraj Kumar",
    role: "Plumber",
    phone: "+91 76543-21098",
    rating: 4.8,
    reviewsCount: 42,
    pricePerHour: 20,
    status: "Available",
    avatar: "PL", // Plumber
    bio: "Certified master plumber specializing in leak repair, pipe routing, and bathroom fittings."
  },
  {
    id: "p4",
    name: "Mohd. Talib",
    role: "Electrician",
    phone: "+91 65432-10987",
    rating: 4.9,
    reviewsCount: 56,
    pricePerHour: 22,
    status: "Available",
    avatar: "EL", // Electrician
    bio: "Licensed residential electrician. Expert in smart home wiring, inverter installation, and DB box repair."
  },
  {
    id: "p5",
    name: "Vikram Singh",
    role: "Painter",
    phone: "+91 99988-77665",
    rating: 4.6,
    reviewsCount: 29,
    pricePerHour: 15,
    status: "Available",
    avatar: "PA", // Painter
    bio: "Professional home wall stylist offering texture coating, premium wall painting, and waterproofing."
  }
];

const DEFAULT_USERS = [
  { email: "admin@quickseva.com", password: "admin123", role: "admin", name: "System Administrator" },
  { email: "user@quickseva.com", password: "user123", role: "customer", name: "Ayush Tiwari" },
  { email: "provider@quickseva.com", password: "provider123", role: "provider", name: "Dheeraj Kumar", providerId: "p3" }
];

// Load or initialize LocalStorage Database
function initDB() {
  if (!localStorage.getItem("qs_providers")) {
    localStorage.setItem("qs_providers", JSON.stringify(DEFAULT_PROVIDERS));
  }
  if (!localStorage.getItem("qs_users")) {
    localStorage.setItem("qs_users", JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem("qs_bookings")) {
    localStorage.setItem("qs_bookings", JSON.stringify([]));
  }
  if (!localStorage.getItem("qs_audit_logs")) {
    localStorage.setItem("qs_audit_logs", JSON.stringify([
      { timestamp: new Date().toLocaleString(), action: "Database initialized", user: "System" }
    ]));
  }
}

// Helper methods to read/write state
const DB = {
  getProviders: () => JSON.parse(localStorage.getItem("qs_providers")),
  saveProviders: (data) => localStorage.setItem("qs_providers", JSON.stringify(data)),
  
  getUsers: () => JSON.parse(localStorage.getItem("qs_users")),
  saveUsers: (data) => localStorage.setItem("qs_users", JSON.stringify(data)),
  
  getBookings: () => JSON.parse(localStorage.getItem("qs_bookings")),
  saveBookings: (data) => localStorage.setItem("qs_bookings", JSON.stringify(data)),
  
  getAuditLogs: () => JSON.parse(localStorage.getItem("qs_audit_logs")),
  addAuditLog: (action, user = "Guest") => {
    const logs = JSON.parse(localStorage.getItem("qs_audit_logs")) || [];
    logs.unshift({ timestamp: new Date().toLocaleString(), action, user });
    localStorage.setItem("qs_audit_logs", JSON.stringify(logs.slice(0, 100))); // keep last 100
  },
  
  getCurrentUser: () => JSON.parse(sessionStorage.getItem("qs_current_user")),
  setCurrentUser: (user) => {
    if (user) {
      sessionStorage.setItem("qs_current_user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("qs_current_user");
    }
  }
};

// --- Toast System ---
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "danger") icon = "❌";
  if (type === "warning") icon = "⚠️";

  toast.innerHTML = `
    <span>${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove toast
  setTimeout(() => {
    toast.style.animation = "fadeIn 0.3s reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- Dynamic Avatar Generator SVG ---
function getAvatarSVG(roleInitials) {
  let colorStart = "#d4af37";
  let colorEnd = "#ffea9f";
  
  if (roleInitials === "PL") { colorStart = "#3b82f6"; colorEnd = "#93c5fd"; }
  else if (roleInitials === "HW") { colorStart = "#f59e0b"; colorEnd = "#fde047"; }
  else if (roleInitials === "EL") { colorStart = "#10b981"; colorEnd = "#6ee7b7"; }
  else if (roleInitials === "PA") { colorStart = "#ec4899"; colorEnd = "#fbcfe8"; }
  else if (roleInitials === "CN") { colorStart = "#8b5cf6"; colorEnd = "#c084fc"; }

  return `
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${roleInitials}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colorStart};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colorEnd};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad-${roleInitials})" />
      <circle cx="100" cy="80" r="35" fill="#ffffff" opacity="0.85" />
      <path d="M50 160 C50 120, 150 120, 150 160" fill="#ffffff" opacity="0.85" />
      <text x="100" y="190" font-family="Outfit, sans-serif" font-weight="bold" font-size="14" fill="#000000" text-anchor="middle" opacity="0.75">${roleInitials}</text>
    </svg>
  `;
}

// --- Client Side Routing & Views Rendering ---
const routes = {
  "#home": renderHome,
  "#services": renderServices,
  "#dashboard": renderDashboard,
  "#about": renderAbout,
  "#contact": renderContact
};

function handleRouting() {
  const hash = window.location.hash || "#home";
  
  // Highlight active navbar links
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === hash) {
      link.classList.add("active");
    }
  });

  // Toggle visible sections
  document.querySelectorAll(".page-section").forEach(sec => {
    sec.classList.remove("active");
  });
  
  const activeSectionId = hash.replace("#", "sec-");
  const activeSection = document.getElementById(activeSectionId);
  if (activeSection) {
    activeSection.classList.add("active");
  }

  // Trigger page views rendering
  const renderFn = routes[hash];
  if (renderFn) {
    renderFn();
  }
}

// --- VIEW: HOME PAGE ---
function renderHome() {
  const container = document.getElementById("sec-home");
  if (!container) return;

  const providers = DB.getProviders();
  const featured = providers.slice(0, 3); // top 3 for dashboard list

  container.innerHTML = `
    <div class="container">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <span class="hero-tag">🌟 Instant & Trusted Services</span>
          <h1 class="hero-title">Professional Home Services, <span>Instantly Booked.</span></h1>
          <p class="hero-subtitle">Get connected with vetted electricians, plumbers, masons, and hardware technicians in your neighborhood. Fast, secure, and hassle-free.</p>
          <div class="hero-actions">
            <a href="#services" class="btn btn-primary">Find a Service Provider</a>
            <a href="#about" class="btn btn-secondary">Learn More</a>
          </div>
        </div>
        <div class="hero-graphic">
          <!-- Glassmorphism badge overlay cards -->
          <div class="hero-badge-float hero-badge-1">
            <div class="hero-badge-icon">🛠️</div>
            <div>
              <h4 style="font-size:0.95rem;font-weight:700">Verified Pros</h4>
              <p style="font-size:0.75rem;color:var(--text-secondary)">100% background verified</p>
            </div>
          </div>
          <div class="hero-badge-float hero-badge-2">
            <div class="hero-badge-icon">⏱️</div>
            <div>
              <h4 style="font-size:0.95rem;font-weight:700">Fast Response</h4>
              <p style="font-size:0.75rem;color:var(--text-secondary)">Average booking under 15m</p>
            </div>
          </div>
          <!-- Cohesive CSS Shape Illustration -->
          <div style="width: 320px; height: 320px; background: radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <div style="width: 200px; height: 200px; border: 2px dashed var(--color-accent); border-radius: 50%; display:flex; align-items:center; justify-content:center; animation: pulse 4s infinite;">
              <span style="font-size: 4rem;">⚡</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Category Picker -->
      <section style="margin-bottom: 80px;">
        <div class="section-header">
          <h2 class="section-title">Explore Services By Category</h2>
          <p class="section-subtitle">Select a category below to view qualified local experts ready to help you today.</p>
        </div>
        <div class="categories-grid">
          <div class="category-card" onclick="filterByCategory('Plumber')">
            <div class="category-icon">💧</div>
            <h3 class="category-title">Plumbing</h3>
            <p class="category-count">${providers.filter(p => p.role === 'Plumber').length} Active Pros</p>
          </div>
          <div class="category-card" onclick="filterByCategory('Electrician')">
            <div class="category-icon">⚡</div>
            <h3 class="category-title">Electricity</h3>
            <p class="category-count">${providers.filter(p => p.role === 'Electrician').length} Active Pros</p>
          </div>
          <div class="category-card" onclick="filterByCategory('Construction')">
            <div class="category-icon">🏗️</div>
            <h3 class="category-title">Construction</h3>
            <p class="category-count">${providers.filter(p => p.role === 'Construction').length} Active Pros</p>
          </div>
          <div class="category-card" onclick="filterByCategory('Hardware')">
            <div class="category-icon">🔑</div>
            <h3 class="category-title">Hardware</h3>
            <p class="category-count">${providers.filter(p => p.role === 'Hardware').length} Active Pros</p>
          </div>
          <div class="category-card" onclick="filterByCategory('Painter')">
            <div class="category-icon">🎨</div>
            <h3 class="category-title">Painting</h3>
            <p class="category-count">${providers.filter(p => p.role === 'Painter').length} Active Pros</p>
          </div>
        </div>
      </section>

      <!-- Step Workflow -->
      <section style="margin-bottom: 80px;">
        <div class="section-header">
          <h2 class="section-title">How QuickSeva Works</h2>
          <p class="section-subtitle">Get the help you need in three easy steps.</p>
        </div>
        <div class="steps-container">
          <div class="step-card">
            <div class="step-num">1</div>
            <h3 class="step-title">Choose Service</h3>
            <p class="step-desc">Search local service providers based on role, ratings, and hourly price.</p>
          </div>
          <div class="step-card">
            <div class="step-num">2</div>
            <h3 class="step-title">Book Instantly</h3>
            <p class="step-desc">Enter your details and scheduled time. The provider locks in your booking.</p>
          </div>
          <div class="step-card">
            <div class="step-num">3</div>
            <h3 class="step-title">Get It Done</h3>
            <p class="step-desc">The verified expert arrives on time, completes the task, and you pay locally.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

// Global category click trigger
window.filterByCategory = function(category) {
  window.location.hash = "#services";
  setTimeout(() => {
    const checkEl = document.querySelector(`.filter-checkbox-label input[value="${category}"]`);
    if (checkEl) {
      // Uncheck others and check this one
      document.querySelectorAll('.filter-checkbox-label input[type="checkbox"]').forEach(cb => cb.checked = false);
      checkEl.checked = true;
      applyFilters();
    }
  }, 100);
};

// --- VIEW: SERVICE CATALOG ---
let currentSearchQuery = "";
let selectedRoles = [];
let minRatingFilter = 0;
let showOnlyAvailable = false;

function renderServices() {
  const container = document.getElementById("sec-services");
  if (!container) return;

  container.innerHTML = `
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Service Providers Directory</h2>
        <p class="section-subtitle">Browse, filter, and book top-rated local experts.</p>
      </div>

      <div class="catalog-wrapper">
        <!-- Sidebar filters -->
        <aside class="filters-sidebar">
          <div class="filter-title">
            <span>Filters</span>
            <button onclick="clearAllFilters()" style="font-size:0.8rem;color:var(--color-accent);font-weight:bold;cursor:pointer;">Clear All</button>
          </div>
          
          <div class="filter-group">
            <h4 class="filter-group-title">Service Type</h4>
            <label class="filter-checkbox-label">
              <input type="checkbox" value="Plumber" onchange="applyFilters()"> Plumbing
            </label>
            <label class="filter-checkbox-label">
              <input type="checkbox" value="Electrician" onchange="applyFilters()"> Electrical
            </label>
            <label class="filter-checkbox-label">
              <input type="checkbox" value="Construction" onchange="applyFilters()"> Construction
            </label>
            <label class="filter-checkbox-label">
              <input type="checkbox" value="Hardware" onchange="applyFilters()"> Hardware
            </label>
            <label class="filter-checkbox-label">
              <input type="checkbox" value="Painter" onchange="applyFilters()"> Painting
            </label>
          </div>

          <div class="filter-group">
            <h4 class="filter-group-title">Minimum Rating</h4>
            <label class="filter-checkbox-label">
              <input type="checkbox" name="rating-filter" value="4.8" onchange="applyRatingFilter(this)"> 4.8★ & above
            </label>
            <label class="filter-checkbox-label">
              <input type="checkbox" name="rating-filter" value="4.5" onchange="applyRatingFilter(this)"> 4.5★ & above
            </label>
          </div>

          <div class="filter-group">
            <h4 class="filter-group-title">Availability</h4>
            <label class="filter-checkbox-label">
              <input type="checkbox" id="available-toggle" onchange="toggleAvailabilityFilter()"> Only Available Now
            </label>
          </div>
        </aside>

        <!-- Catalog main view -->
        <div class="catalog-main">
          <div class="catalog-header">
            <div class="search-input-wrapper">
              <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              <input type="text" class="search-field" placeholder="Search by name, bio keywords..." id="search-bar" onkeyup="handleSearch(this)">
            </div>
            
            <select class="sort-select" id="sort-select" onchange="applyFilters()">
              <option value="rating">Sort: High Rating</option>
              <option value="price-low">Sort: Price Low to High</option>
              <option value="price-high">Sort: Price High to Low</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>

          <!-- Dynamic Results Container -->
          <div id="catalog-results-grid" class="providers-grid">
            <!-- Render skeleton loaders or cards dynamically -->
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Render results
  applyFilters();
}

window.handleSearch = function(el) {
  currentSearchQuery = el.value.trim().toLowerCase();
  applyFilters();
};

window.applyRatingFilter = function(checkbox) {
  const checkboxes = document.getElementsByName("rating-filter");
  checkboxes.forEach((cb) => {
    if (cb !== checkbox) cb.checked = false;
  });
  minRatingFilter = checkbox.checked ? parseFloat(checkbox.value) : 0;
  applyFilters();
};

window.toggleAvailabilityFilter = function() {
  showOnlyAvailable = document.getElementById("available-toggle").checked;
  applyFilters();
};

window.clearAllFilters = function() {
  currentSearchQuery = "";
  selectedRoles = [];
  minRatingFilter = 0;
  showOnlyAvailable = false;
  
  const searchEl = document.getElementById("search-bar");
  if (searchEl) searchEl.value = "";
  
  const availEl = document.getElementById("available-toggle");
  if (availEl) availEl.checked = false;

  document.querySelectorAll('.filters-sidebar input[type="checkbox"]').forEach(cb => cb.checked = false);
  
  applyFilters();
};

window.applyFilters = function() {
  const resultsGrid = document.getElementById("catalog-results-grid");
  if (!resultsGrid) return;

  // Show Skeleton loading transition
  resultsGrid.innerHTML = Array(3).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-box skeleton-img"></div>
      <div class="skeleton-box skeleton-title"></div>
      <div class="skeleton-box skeleton-text"></div>
      <div class="skeleton-box skeleton-btn"></div>
    </div>
  `).join("");

  setTimeout(() => {
    // Gather checked categories
    const checkedRoles = [];
    document.querySelectorAll('.filter-group input[type="checkbox"]:not([name="rating-filter"]):not(#available-toggle)').forEach(cb => {
      if (cb.checked) checkedRoles.push(cb.value);
    });

    let providers = DB.getProviders();

    // Filter by Search Query
    if (currentSearchQuery) {
      providers = providers.filter(p => 
        p.name.toLowerCase().includes(currentSearchQuery) || 
        p.bio.toLowerCase().includes(currentSearchQuery) ||
        p.role.toLowerCase().includes(currentSearchQuery)
      );
    }

    // Filter by checked roles
    if (checkedRoles.length > 0) {
      providers = providers.filter(p => checkedRoles.includes(p.role));
    }

    // Filter by Rating
    if (minRatingFilter > 0) {
      providers = providers.filter(p => p.rating >= minRatingFilter);
    }

    // Filter by Availability
    if (showOnlyAvailable) {
      providers = providers.filter(p => p.status === "Available");
    }

    // Apply Sorting
    const sortVal = document.getElementById("sort-select")?.value || "rating";
    if (sortVal === "rating") {
      providers.sort((a, b) => b.rating - a.rating);
    } else if (sortVal === "price-low") {
      providers.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (sortVal === "price-high") {
      providers.sort((a, b) => b.pricePerHour - a.pricePerHour);
    } else if (sortVal === "name") {
      providers.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Render results
    if (providers.length === 0) {
      resultsGrid.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <h3>No Providers Found</h3>
          <p>Try clearing some filters or searching for something else.</p>
        </div>
      `;
      return;
    }

    resultsGrid.innerHTML = providers.map(p => {
      const isAvailable = p.status === "Available";
      return `
        <div class="provider-card anim-slide-up">
          <div class="provider-img-box">
            ${getAvatarSVG(p.avatar)}
            <span class="provider-status ${isAvailable ? 'status-available' : 'status-booked'}">${p.status}</span>
          </div>
          <div class="provider-info">
            <span class="provider-role">${p.role}</span>
            <h3 class="provider-name">${p.name}</h3>
            <div class="provider-rating">
              <span class="stars">★</span>
              <span class="rating-value">${p.rating.toFixed(1)}</span>
              <span class="rating-count">(${p.reviewsCount} reviews)</span>
            </div>
            <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px;line-height:1.4;">${p.bio}</p>
            <div class="provider-meta">
              <div class="provider-price">$${p.pricePerHour}<span>/hr</span></div>
              <button class="btn btn-primary" onclick="openBookingModal('${p.id}')" ${!isAvailable ? 'disabled style="background:var(--text-muted);color:var(--bg-secondary);box-shadow:none;cursor:not-allowed;"' : ''}>
                ${isAvailable ? 'Book Now' : 'Booked'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }, 400);
};

// --- VIEW: DASHBOARD PORTAL ---
function renderDashboard() {
  const container = document.getElementById("sec-dashboard");
  if (!container) return;

  const user = DB.getCurrentUser();

  if (!user) {
    // Render Authentication Forms (Login / Signup)
    container.innerHTML = `
      <div class="container" style="max-width:480px;">
        <div class="card-panel anim-fade-in" id="auth-panel">
          <div class="section-header" style="margin-bottom:24px;">
            <h2 class="section-title" id="auth-title">Log In to QuickSeva</h2>
            <p class="section-subtitle" id="auth-subtitle">Manage bookings, update profile details and contact service providers.</p>
          </div>

          <form id="auth-form" onsubmit="handleAuthSubmit(event)">
            <input type="hidden" id="auth-mode" value="login">
            
            <div class="form-group" id="reg-name-group" style="display:none;">
              <label class="form-label" for="reg-name">Full Name</label>
              <input type="text" class="form-input" id="reg-name" placeholder="John Doe">
            </div>

            <div class="form-group">
              <label class="form-label" for="auth-email">Email Address</label>
              <input type="email" class="form-input" id="auth-email" required placeholder="name@example.com">
            </div>

            <div class="form-group">
              <label class="form-label" for="auth-password">Password</label>
              <input type="password" class="form-input" id="auth-password" required placeholder="••••••••">
            </div>

            <div class="form-group" id="reg-role-group" style="display:none;">
              <label class="form-label" for="reg-role">Register As</label>
              <select class="form-input" id="reg-role">
                <option value="customer">Customer (Hire Services)</option>
                <option value="provider">Service Provider (Offer Services)</option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;" id="auth-btn">Log In</button>
          </form>

          <p style="text-align:center;margin-top:20px;font-size:0.9rem;color:var(--text-secondary);">
            <span id="auth-toggle-msg">Don't have an account?</span>
            <button onclick="toggleAuthMode()" style="color:var(--color-accent);font-weight:600;cursor:pointer;margin-left:4px;" id="auth-toggle-btn">Sign Up</button>
          </p>
        </div>
      </div>
    `;
    return;
  }

  // If user is logged in, show user role dashboard
  if (user.role === "admin") {
    renderAdminDashboard(container, user);
  } else if (user.role === "customer") {
    renderCustomerDashboard(container, user);
  } else if (user.role === "provider") {
    renderProviderDashboard(container, user);
  }
}

// Toggle Auth Panel State (Login vs Register)
window.toggleAuthMode = function() {
  const modeEl = document.getElementById("auth-mode");
  const titleEl = document.getElementById("auth-title");
  const subtitleEl = document.getElementById("auth-subtitle");
  const btnEl = document.getElementById("auth-btn");
  const nameGrp = document.getElementById("reg-name-group");
  const roleGrp = document.getElementById("reg-role-group");
  const toggleMsg = document.getElementById("auth-toggle-msg");
  const toggleBtn = document.getElementById("auth-toggle-btn");
  const regName = document.getElementById("reg-name");

  if (modeEl.value === "login") {
    modeEl.value = "signup";
    titleEl.textContent = "Create an Account";
    subtitleEl.textContent = "Sign up today to book local professional service providers.";
    btnEl.textContent = "Create Account";
    nameGrp.style.display = "block";
    regName.required = true;
    roleGrp.style.display = "block";
    toggleMsg.textContent = "Already have an account?";
    toggleBtn.textContent = "Log In";
  } else {
    modeEl.value = "login";
    titleEl.textContent = "Log In to QuickSeva";
    subtitleEl.textContent = "Manage bookings, update profile details and contact service providers.";
    btnEl.textContent = "Log In";
    nameGrp.style.display = "none";
    regName.required = false;
    roleGrp.style.display = "none";
    toggleMsg.textContent = "Don't have an account?";
    toggleBtn.textContent = "Sign Up";
  }
};

// Form Authentication logic
window.handleAuthSubmit = function(e) {
  e.preventDefault();
  const mode = document.getElementById("auth-mode").value;
  const email = document.getElementById("auth-email").value.trim().toLowerCase();
  const password = document.getElementById("auth-password").value;

  const users = DB.getUsers();

  if (mode === "login") {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      showToast("Invalid email or password", "danger");
      return;
    }
    DB.setCurrentUser(user);
    DB.addAuditLog("User logged in successfully", user.email);
    showToast(`Welcome back, ${user.name}!`, "success");
    
    // Update navbar buttons
    updateNavbarPortal();
    renderDashboard();
  } else {
    // Signup flow
    const name = document.getElementById("reg-name").value.trim();
    const role = document.getElementById("reg-role").value;

    if (users.find(u => u.email === email)) {
      showToast("Email address already registered", "danger");
      return;
    }

    const newUser = { email, password, role, name };
    
    // If provider, create matching provider entry
    if (role === "provider") {
      const providers = DB.getProviders();
      const newProviderId = "p_" + Date.now();
      const newProvider = {
        id: newProviderId,
        name: name,
        role: "Electrician", // Default role
        phone: "+91 99999-00000",
        rating: 5.0,
        reviewsCount: 0,
        pricePerHour: 20,
        status: "Available",
        avatar: "EL",
        bio: "New independent service provider registered on QuickSeva."
      };
      providers.push(newProvider);
      DB.saveProviders(providers);
      
      newUser.providerId = newProviderId;
    }

    users.push(newUser);
    DB.saveUsers(users);
    
    DB.addAuditLog(`New user registered as ${role}`, email);
    showToast("Registration successful! Please log in.", "success");
    
    // Switch to login
    toggleAuthMode();
    document.getElementById("auth-email").value = email;
    document.getElementById("auth-password").value = password;
  }
};

window.handleLogout = function() {
  const user = DB.getCurrentUser();
  if (user) {
    DB.addAuditLog("User logged out", user.email);
  }
  DB.setCurrentUser(null);
  showToast("Logged out successfully", "success");
  updateNavbarPortal();
  
  // Go home
  window.location.hash = "#home";
};

// Update auth buttons in Navbar
function updateNavbarPortal() {
  const portal = document.getElementById("navbar-portal");
  if (!portal) return;

  const user = DB.getCurrentUser();
  if (user) {
    portal.innerHTML = `
      <span style="font-size:0.9rem;color:var(--text-secondary);font-weight:500;">Hello, <strong>${user.name.split(' ')[0]}</strong></span>
      <a href="#dashboard" class="btn btn-secondary">Dashboard</a>
      <button onclick="handleLogout()" class="btn btn-primary" style="background:#ef4444;color:white;box-shadow:none;">Logout</button>
    `;
  } else {
    portal.innerHTML = `
      <a href="#dashboard" class="btn btn-secondary">Login</a>
      <a href="#services" class="btn btn-primary">Book Now</a>
    `;
  }
}

// --- PORTAL SUBVIEW: CUSTOMER DASHBOARD ---
function renderCustomerDashboard(container, user) {
  const bookings = DB.getBookings().filter(b => b.customerEmail === user.email);
  
  container.innerHTML = `
    <div class="container">
      <div class="dashboard-wrapper">
        <aside class="dashboard-nav">
          <div class="dashboard-nav-item active">📋 My Bookings</div>
          <div class="dashboard-nav-item" onclick="showToast('Profile editing is simulated. All changes sync locally.', 'warning')">👤 Profile Details</div>
          <div class="dashboard-nav-item" onclick="handleLogout()">🚪 Sign Out</div>
        </aside>

        <section class="dashboard-content">
          <div class="section-header" style="text-align:left; margin-bottom:32px;">
            <h2 class="section-title">Customer Portal</h2>
            <p class="section-subtitle">Welcome back, ${user.name}. Manage your appointments and view history.</p>
          </div>

          <div class="metrics-grid">
            <div class="metric-card">
              <span class="metric-label">Total Services Hired</span>
              <span class="metric-value">${bookings.length}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Active Bookings</span>
              <span class="metric-value">${bookings.filter(b => b.status === "Active").length}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Completed Jobs</span>
              <span class="metric-value">${bookings.filter(b => b.status === "Completed").length}</span>
            </div>
          </div>

          <div class="card-panel">
            <div class="panel-header">
              <h3 class="panel-title">Active Booking Schedule</h3>
            </div>
            
            <div class="data-table-wrapper">
              ${bookings.length === 0 ? `
                <p style="color:var(--text-secondary);text-align:center;padding:24px 0;">You have no booking records yet. Visit our <a href="#services" style="color:var(--color-accent);text-decoration:underline;">services catalog</a> to hire a specialist.</p>
              ` : `
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Service Date / Time</th>
                      <th>Issue Description</th>
                      <th>Booking Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${bookings.map(b => `
                      <tr>
                        <td>
                          <strong>${b.providerName}</strong><br>
                          <span style="font-size:0.75rem;color:var(--text-muted);">${b.providerRole}</span>
                        </td>
                        <td>
                          <span>📅 ${b.date}</span><br>
                          <span style="font-size:0.8rem;color:var(--text-secondary);">⏰ ${b.time}</span>
                        </td>
                        <td><span style="font-size:0.85rem;color:var(--text-secondary);">${b.description}</span></td>
                        <td>
                          <span style="padding:4px 8px;border-radius:var(--radius-sm);font-size:0.75rem;font-weight:700;text-transform:uppercase;
                            ${b.status === 'Active' ? 'background:rgba(59,130,246,0.15);color:var(--color-info);' : ''}
                            ${b.status === 'Completed' ? 'background:rgba(16,185,129,0.15);color:var(--color-success);' : ''}
                            ${b.status === 'Cancelled' ? 'background:rgba(239,68,68,0.15);color:var(--color-danger);' : ''}
                          ">${b.status}</span>
                        </td>
                        <td>
                          ${b.status === 'Active' ? `
                            <button class="btn btn-secondary" style="padding:6px 12px;font-size:0.8rem;background:rgba(239,68,68,0.1);color:var(--color-danger);border-color:rgba(239,68,68,0.2);" onclick="cancelBooking('${b.id}')">Cancel Booking</button>
                          ` : ''}
                          ${b.status === 'Completed' ? `
                            <button class="btn btn-secondary" style="padding:6px 12px;font-size:0.8rem;color:var(--color-accent);border-color:rgba(212,175,55,0.2);" onclick="writeReview('${b.providerId}')">Review Pro</button>
                          ` : ''}
                          ${b.status === 'Cancelled' ? `
                            <span style="color:var(--text-muted);font-size:0.8rem;">None Available</span>
                          ` : ''}
                        </td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              `}
            </div>
          </div>
        </section>
      </div>
    </div>
  `;
}

// Cancel Booking
window.cancelBooking = function(bookingId) {
  if (!confirm("Are you sure you want to cancel this booking?")) return;

  const bookings = DB.getBookings();
  const booking = bookings.find(b => b.id === bookingId);
  
  if (booking) {
    booking.status = "Cancelled";
    DB.saveBookings(bookings);

    // Free the provider status
    const providers = DB.getProviders();
    const provider = providers.find(p => p.id === booking.providerId);
    if (provider) {
      provider.status = "Available";
      DB.saveProviders(providers);
    }

    const user = DB.getCurrentUser();
    DB.addAuditLog(`Cancelled booking for provider ${booking.providerName}`, user.email);
    showToast("Booking cancelled successfully", "success");
    
    // Refresh
    renderDashboard();
  }
};

window.writeReview = function(providerId) {
  const ratingStr = prompt("Rate this service provider from 1 to 5 stars:");
  const rating = parseFloat(ratingStr);
  
  if (isNaN(rating) || rating < 1 || rating > 5) {
    showToast("Please enter a valid rating between 1 and 5", "danger");
    return;
  }

  const providers = DB.getProviders();
  const provider = providers.find(p => p.id === providerId);
  if (provider) {
    // Recalculate average rating
    const totalRatingSum = (provider.rating * provider.reviewsCount) + rating;
    provider.reviewsCount += 1;
    provider.rating = totalRatingSum / provider.reviewsCount;
    
    DB.saveProviders(providers);
    showToast(`Thank you for rating ${provider.name} ${rating}★!`, "success");
  }
};

// --- PORTAL SUBVIEW: PROVIDER DASHBOARD ---
function renderProviderDashboard(container, user) {
  const providers = DB.getProviders();
  const provider = providers.find(p => p.id === user.providerId);
  const bookings = DB.getBookings().filter(b => b.providerId === user.providerId);

  if (!provider) {
    container.innerHTML = `<div class="container"><p>Error loading provider details. Profile association missing.</p></div>`;
    return;
  }

  container.innerHTML = `
    <div class="container">
      <div class="dashboard-wrapper">
        <aside class="dashboard-nav">
          <div class="dashboard-nav-item active">📋 Assigned Tasks</div>
          <div class="dashboard-nav-item" onclick="toggleProviderAvailability('${provider.id}')">
            ⚡ Availability: <strong style="color:${provider.status === 'Available' ? 'var(--color-success)' : 'var(--color-danger)'};">${provider.status}</strong>
          </div>
          <div class="dashboard-nav-item" onclick="handleLogout()">🚪 Sign Out</div>
        </aside>

        <section class="dashboard-content">
          <div class="section-header" style="text-align:left; margin-bottom:32px;">
            <h2 class="section-title">Service Provider Portal</h2>
            <p class="section-subtitle">Welcome, ${provider.name}. Manage your tasks, customer bookings, and availability settings.</p>
          </div>

          <div class="metrics-grid">
            <div class="metric-card">
              <span class="metric-label">Your Rating</span>
              <span class="metric-value">⭐ ${provider.rating.toFixed(1)}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Assigned Jobs</span>
              <span class="metric-value">${bookings.length}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Active Orders</span>
              <span class="metric-value">${bookings.filter(b => b.status === "Active").length}</span>
            </div>
          </div>

          <div class="card-panel">
            <div class="panel-header">
              <h3 class="panel-title">Assigned Customer Tasks</h3>
            </div>
            
            <div class="data-table-wrapper">
              ${bookings.length === 0 ? `
                <p style="color:var(--text-secondary);text-align:center;padding:24px 0;">No assigned jobs found. Toggle availability to 'Available' to receive bookings.</p>
              ` : `
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Contact Email</th>
                      <th>Date / Time</th>
                      <th>Job Description</th>
                      <th>Job Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${bookings.map(b => `
                      <tr>
                        <td><strong>${b.customerName}</strong></td>
                        <td><span style="font-size:0.85rem;">${b.customerEmail}</span></td>
                        <td>📅 ${b.date} &nbsp; ⏰ ${b.time}</td>
                        <td><span style="font-size:0.85rem;color:var(--text-secondary);">${b.description}</span></td>
                        <td>
                          <span style="padding:4px 8px;border-radius:var(--radius-sm);font-size:0.75rem;font-weight:700;text-transform:uppercase;
                            ${b.status === 'Active' ? 'background:rgba(59,130,246,0.15);color:var(--color-info);' : ''}
                            ${b.status === 'Completed' ? 'background:rgba(16,185,129,0.15);color:var(--color-success);' : ''}
                            ${b.status === 'Cancelled' ? 'background:rgba(239,68,68,0.15);color:var(--color-danger);' : ''}
                          ">${b.status}</span>
                        </td>
                        <td>
                          ${b.status === 'Active' ? `
                            <button class="btn btn-primary" style="padding:6px 12px;font-size:0.8rem;background:var(--color-success);color:white;box-shadow:none;" onclick="markJobComplete('${b.id}')">Complete</button>
                          ` : `
                            <span style="color:var(--text-muted);font-size:0.8rem;">Finished</span>
                          `}
                        </td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              `}
            </div>
          </div>
        </section>
      </div>
    </div>
  `;
}

window.toggleProviderAvailability = function(providerId) {
  const providers = DB.getProviders();
  const provider = providers.find(p => p.id === providerId);
  
  if (provider) {
    provider.status = provider.status === "Available" ? "Booked" : "Available";
    DB.saveProviders(providers);
    
    const user = DB.getCurrentUser();
    DB.addAuditLog(`Toggled availability to ${provider.status}`, user.email);
    showToast(`Status updated to ${provider.status}`, "success");
    renderDashboard();
  }
};

window.markJobComplete = function(bookingId) {
  const bookings = DB.getBookings();
  const booking = bookings.find(b => b.id === bookingId);
  
  if (booking) {
    booking.status = "Completed";
    DB.saveBookings(bookings);

    // Release provider
    const providers = DB.getProviders();
    const provider = providers.find(p => p.id === booking.providerId);
    if (provider) {
      provider.status = "Available";
      DB.saveProviders(providers);
    }

    const user = DB.getCurrentUser();
    DB.addAuditLog(`Completed job booking #${bookingId}`, user.email);
    showToast("Job marked as completed successfully!", "success");
    renderDashboard();
  }
};

// --- PORTAL SUBVIEW: ADMIN DASHBOARD ---
function renderAdminDashboard(container, user) {
  const providers = DB.getProviders();
  const bookings = DB.getBookings();
  const logs = DB.getAuditLogs();

  // Simple revenue calculation (pricePerHour * bookings count * 1.5 average hours)
  const estRevenue = bookings.filter(b => b.status === "Completed").reduce((sum, b) => {
    const prov = providers.find(p => p.id === b.providerId);
    return sum + (prov ? prov.pricePerHour * 2 : 30);
  }, 0);

  container.innerHTML = `
    <div class="container">
      <div class="dashboard-wrapper">
        <aside class="dashboard-nav">
          <div class="dashboard-nav-item active" id="admin-tab-pros" onclick="switchAdminTab('pros')">👷 Providers Database</div>
          <div class="dashboard-nav-item" id="admin-tab-logs" onclick="switchAdminTab('logs')">📋 Platform Audit Logs</div>
          <div class="dashboard-nav-item" onclick="handleLogout()">🚪 Sign Out</div>
        </aside>

        <section class="dashboard-content">
          <div class="section-header" style="text-align:left; margin-bottom:32px;">
            <h2 class="section-title">Admin Dashboard</h2>
            <p class="section-subtitle">System metrics, service provider management, and audit logs.</p>
          </div>

          <div class="metrics-grid">
            <div class="metric-card">
              <span class="metric-label">Total Listings</span>
              <span class="metric-value">${providers.length}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Platform Bookings</span>
              <span class="metric-value">${bookings.length}</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Completed Revenue</span>
              <span class="metric-value">$${estRevenue}</span>
            </div>
          </div>

          <!-- Section A: Providers Database Management -->
          <div class="card-panel admin-tab-content active" id="panel-admin-pros">
            <div class="panel-header">
              <h3 class="panel-title">Provider Registry</h3>
              <button class="btn btn-primary" onclick="openAddProviderModal()">Add Service Provider</button>
            </div>
            
            <div class="data-table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Specialty</th>
                    <th>Hourly Rate</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${providers.map(p => `
                    <tr>
                      <td style="width:50px;height:50px;padding:4px;">
                        <div style="width:40px;height:40px;border-radius:50%;overflow:hidden;">
                          ${getAvatarSVG(p.avatar)}
                        </div>
                      </td>
                      <td>
                        <strong>${p.name}</strong><br>
                        <span style="font-size:0.75rem;color:var(--text-muted);">${p.phone}</span>
                      </td>
                      <td><span style="padding:4px 8px;border-radius:var(--radius-sm);background:var(--bg-tertiary);font-size:0.8rem;font-weight:600;">${p.role}</span></td>
                      <td>$${p.pricePerHour}/hr</td>
                      <td>⭐ ${p.rating.toFixed(1)} (${p.reviewsCount})</td>
                      <td>
                        <span style="cursor:pointer;" onclick="adminToggleProviderStatus('${p.id}')" class="provider-status ${p.status === 'Available' ? 'status-available' : 'status-booked'}">${p.status}</span>
                      </td>
                      <td>
                        <button class="btn btn-secondary" style="padding:6px 12px;font-size:0.8rem;" onclick="adminEditProvider('${p.id}')">Edit</button>
                        <button class="btn btn-danger" style="padding:6px 12px;font-size:0.8rem;" onclick="adminDeleteProvider('${p.id}')">Delete</button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Section B: Audit Logs -->
          <div class="card-panel admin-tab-content" id="panel-admin-logs" style="display:none;">
            <div class="panel-header">
              <h3 class="panel-title">Platform Audit Logs</h3>
              <button class="btn btn-secondary" onclick="clearAuditLogs()">Clear Logs</button>
            </div>
            
            <div style="max-height: 400px; overflow-y: auto; background-color: var(--bg-tertiary); border-radius: var(--radius-md); padding: 16px;">
              <ul style="display:flex; flex-direction:column; gap:8px; font-family:monospace; font-size:0.85rem;">
                ${logs.map(log => `
                  <li style="border-bottom:1px solid var(--border-color); padding-bottom:8px; line-height:1.4;">
                    <span style="color:var(--text-muted);">[${log.timestamp}]</span>
                    <strong style="color:var(--color-accent);">${log.user}</strong>: 
                    <span style="color:var(--text-primary);">${log.action}</span>
                  </li>
                `).join("")}
              </ul>
            </div>
          </div>

        </section>
      </div>
    </div>
  `;
}

window.switchAdminTab = function(tabName) {
  document.querySelectorAll(".admin-tab-content").forEach(el => el.style.display = "none");
  document.querySelectorAll(".dashboard-nav-item").forEach(el => el.classList.remove("active"));
  
  if (tabName === 'pros') {
    document.getElementById("panel-admin-pros").style.display = "block";
    document.getElementById("admin-tab-pros").classList.add("active");
  } else {
    document.getElementById("panel-admin-logs").style.display = "block";
    document.getElementById("admin-tab-logs").classList.add("active");
  }
};

window.adminToggleProviderStatus = function(providerId) {
  const providers = DB.getProviders();
  const p = providers.find(p => p.id === providerId);
  if (p) {
    p.status = p.status === "Available" ? "Booked" : "Available";
    DB.saveProviders(providers);
    const admin = DB.getCurrentUser();
    DB.addAuditLog(`Manually toggled status for provider ${p.name} to ${p.status}`, admin.email);
    showToast(`Toggled ${p.name} to ${p.status}`, "success");
    renderDashboard();
  }
};

window.adminDeleteProvider = function(providerId) {
  if (!confirm("Are you sure you want to delete this provider?")) return;
  const providers = DB.getProviders();
  const filtered = providers.filter(p => p.id !== providerId);
  DB.saveProviders(filtered);
  
  const admin = DB.getCurrentUser();
  DB.addAuditLog(`Deleted provider entry id: ${providerId}`, admin.email);
  showToast("Provider deleted successfully", "success");
  renderDashboard();
};

window.clearAuditLogs = function() {
  if (!confirm("Clear all logs?")) return;
  localStorage.setItem("qs_audit_logs", JSON.stringify([]));
  renderDashboard();
  showToast("Audit logs cleared", "success");
};

// --- BOOKING WORKFLOW ---
let selectedProviderForBooking = null;

window.openBookingModal = function(providerId) {
  // Check if logged in. If not, redirect to Login
  const user = DB.getCurrentUser();
  if (!user) {
    showToast("Please log in to book a service.", "warning");
    window.location.hash = "#dashboard";
    return;
  }
  
  const providers = DB.getProviders();
  const provider = providers.find(p => p.id === providerId);
  if (!provider) return;

  selectedProviderForBooking = provider;
  
  // Set modal fields
  document.getElementById("booking-prov-name").textContent = provider.name;
  document.getElementById("booking-prov-role").textContent = provider.role;
  document.getElementById("booking-prov-rate").textContent = `$${provider.pricePerHour}/hr`;
  
  // Open modal
  const overlay = document.getElementById("booking-modal-overlay");
  overlay.classList.add("active");
  
  // Focus first input
  document.getElementById("booking-date").focus();
};

window.closeBookingModal = function() {
  const overlay = document.getElementById("booking-modal-overlay");
  overlay.classList.remove("active");
  selectedProviderForBooking = null;
};

// Handle booking confirmation
window.handleBookingSubmit = function(e) {
  e.preventDefault();
  
  const user = DB.getCurrentUser();
  if (!user || !selectedProviderForBooking) return;

  const date = document.getElementById("booking-date").value;
  const time = document.getElementById("booking-time").value;
  const desc = document.getElementById("booking-desc").value.trim();

  // Basic validation
  if (!date || !time || !desc) {
    showToast("Please fill in all booking details", "danger");
    return;
  }

  // Escape HTML inputs for security (XSS prevention)
  const escapedDesc = desc
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const bookings = DB.getBookings();
  const newBooking = {
    id: "b_" + Date.now(),
    providerId: selectedProviderForBooking.id,
    providerName: selectedProviderForBooking.name,
    providerRole: selectedProviderForBooking.role,
    customerName: user.name,
    customerEmail: user.email,
    date,
    time,
    description: escapedDesc,
    status: "Active"
  };

  bookings.push(newBooking);
  DB.saveBookings(bookings);

  // Update provider status to "Booked"
  const providers = DB.getProviders();
  const provider = providers.find(p => p.id === selectedProviderForBooking.id);
  if (provider) {
    provider.status = "Booked";
    DB.saveProviders(providers);
  }

  DB.addAuditLog(`Created booking with provider ${selectedProviderForBooking.name} for ${date}`, user.email);
  showToast(`Booking confirmed for ${selectedProviderForBooking.name}!`, "success");
  
  // Reset form
  e.target.reset();
  closeBookingModal();
  
  // Go to dashboard to view the booking
  window.location.hash = "#dashboard";
};

// --- ADD PROVIDER MODAL ---
window.openAddProviderModal = function() {
  const overlay = document.getElementById("admin-prov-modal-overlay");
  overlay.classList.add("active");
};

window.closeAddProviderModal = function() {
  const overlay = document.getElementById("admin-prov-modal-overlay");
  overlay.classList.remove("active");
};

window.handleAddProviderSubmit = function(e) {
  e.preventDefault();
  
  const name = document.getElementById("admin-prov-name").value.trim();
  const role = document.getElementById("admin-prov-role").value;
  const price = parseFloat(document.getElementById("admin-prov-price").value);
  const phone = document.getElementById("admin-prov-phone").value.trim();
  const bio = document.getElementById("admin-prov-bio").value.trim();

  if (!name || !price || !phone || !bio) {
    showToast("Please fill in all provider details", "danger");
    return;
  }

  const providers = DB.getProviders();
  
  // Short role code for avatar
  const initialsMap = {
    "Plumber": "PL",
    "Electrician": "EL",
    "Construction": "CN",
    "Hardware": "HW",
    "Painter": "PA"
  };

  const newProvider = {
    id: "p_" + Date.now(),
    name,
    role,
    pricePerHour: price,
    phone,
    bio,
    rating: 5.0,
    reviewsCount: 0,
    status: "Available",
    avatar: initialsMap[role] || "SP"
  };

  providers.push(newProvider);
  DB.saveProviders(providers);

  const admin = DB.getCurrentUser();
  DB.addAuditLog(`Added new service provider registry: ${name} (${role})`, admin.email);
  showToast("Provider registered successfully!", "success");
  
  e.target.reset();
  closeAddProviderModal();
  renderDashboard();
};

// --- ADMIN EDIT PROVIDER ---
window.adminEditProvider = function(providerId) {
  const providers = DB.getProviders();
  const provider = providers.find(p => p.id === providerId);
  if (!provider) return;

  const newPriceStr = prompt(`Update hourly price for ${provider.name} (Current: $${provider.pricePerHour}):`, provider.pricePerHour);
  const newPrice = parseFloat(newPriceStr);
  
  if (isNaN(newPrice) || newPrice <= 0) {
    showToast("Invalid price amount", "danger");
    return;
  }

  const newBio = prompt(`Update biography text:`, provider.bio);
  if (newBio !== null && newBio.trim() !== "") {
    provider.bio = newBio.trim();
  }

  provider.pricePerHour = newPrice;
  DB.saveProviders(providers);

  const admin = DB.getCurrentUser();
  DB.addAuditLog(`Updated profile details for provider: ${provider.name}`, admin.email);
  showToast("Provider profile updated", "success");
  renderDashboard();
};

// --- STATIC PAGES RENDERING ---
function renderAbout() {
  const container = document.getElementById("sec-about");
  if (!container) return;

  container.innerHTML = `
    <div class="container" style="max-width:800px;line-height:1.8;">
      <div class="section-header">
        <h2 class="section-title">About QuickSeva</h2>
        <p class="section-subtitle">Bridging the gap between expert local artisans and households.</p>
      </div>
      
      <div class="card-panel">
        <p style="margin-bottom:20px;"><strong>QuickSeva</strong> is a modern hyperlocal service platform. Our mission is to empower independent blue-collar service professionals (plumbers, carpenters, construction masons, and technicians) by providing a digital avenue to showcase their skills, maintain their schedule, and connect with customers seamlessly.</p>
        
        <h3 style="font-family:var(--font-heading);font-size:1.3rem;margin-bottom:12px;color:var(--color-accent);">Verified Professionals</h3>
        <p style="margin-bottom:20px;">Every service provider listed on QuickSeva undergoes a rigorous background and credentials check. We verify identification documents and check local trade history to ensure that you are welcoming verified, trustable experts into your home.</p>

        <h3 style="font-family:var(--font-heading);font-size:1.3rem;margin-bottom:12px;color:var(--color-accent);">Hyperlocal Matchmaking</h3>
        <p>By prioritizing matching search requests with providers operating in close neighborhood circles, we minimize travel times and get urgent issues resolved under record-breaking timeframes.</p>
      </div>
    </div>
  `;
}

function renderContact() {
  const container = document.getElementById("sec-contact");
  if (!container) return;

  container.innerHTML = `
    <div class="container" style="max-width:600px;">
      <div class="section-header">
        <h2 class="section-title">Contact Support</h2>
        <p class="section-subtitle">Have questions or feedback? Send us a message and our support team will get in touch.</p>
      </div>

      <div class="card-panel">
        <form onsubmit="handleContactSubmit(event)">
          <div class="form-group">
            <label class="form-label" for="contact-name">Full Name</label>
            <input type="text" class="form-input" id="contact-name" required placeholder="Jane Doe">
          </div>
          
          <div class="form-group">
            <label class="form-label" for="contact-email">Email Address</label>
            <input type="email" class="form-input" id="contact-email" required placeholder="jane@example.com">
          </div>

          <div class="form-group">
            <label class="form-label" for="contact-msg">Your Message</label>
            <textarea class="form-input" id="contact-msg" rows="5" required placeholder="Describe how we can help you..."></script></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Submit Message</button>
        </form>
      </div>
    </div>
  `;
}

window.handleContactSubmit = function(e) {
  e.preventDefault();
  showToast("Thank you! Your inquiry has been submitted. We will email you back shortly.", "success");
  e.target.reset();
};

// --- Initialization Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Database
  initDB();

  // Setup Routing
  window.addEventListener("hashchange", handleRouting);
  
  // Initial run
  handleRouting();
  updateNavbarPortal();

  // Mobile menu toggle
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
    
    // Close nav on click of link
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
      });
    });
  }

  // Theme switch listener
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    // Check saved theme
    if (localStorage.getItem("qs_theme") === "light") {
      document.body.classList.add("light-theme");
    }

    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      if (document.body.classList.contains("light-theme")) {
        localStorage.setItem("qs_theme", "light");
      } else {
        localStorage.setItem("qs_theme", "dark");
      }
    });
  }
});
