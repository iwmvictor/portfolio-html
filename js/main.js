// Theme Management
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem("theme") || "dark";
    this.init();
  }

  init() {
    this.applyTheme();
    this.createThemeToggle();
  }

  applyTheme() {
    document.documentElement.setAttribute("data-theme", this.theme);
    localStorage.setItem("theme", this.theme);
  }

  toggleTheme() {
    this.theme = this.theme === "dark" ? "light" : "dark";
    this.applyTheme();
  }

  createThemeToggle() {
    const header = document.querySelector(".header .menu");
    if (!header) return;

    const themeToggle = document.createElement("button");
    themeToggle.className = "theme-toggle";
    themeToggle.innerHTML = `
      <span class="theme-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="sun-icon" d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" stroke-width="2"/>
          <path class="sun-icon" d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2"/>
          <path class="moon-icon" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="2"/>
        </svg>
      </span>
    `;

    themeToggle.addEventListener("click", () => this.toggleTheme());
    header.insertBefore(themeToggle, header.lastElementChild);
  }
}

// Projects Manager
class ProjectsManager {
  constructor() {
    this.projects = [];
    this.currentPage = 0;
    this.projectsPerPage = 4;
    this.currentFilter = "All";
    this.init();
  }

  async init() {
    await this.loadProjects();
    this.setupFilters();
    this.renderProjects();
    this.setupPagination();
  }

  async loadProjects() {
    try {
      const response = await fetch("/data/projects.json");
      this.projects = await response.json();
    } catch (error) {
      console.error("Error loading projects:", error);
      this.projects = [];
    }
  }

  getFilteredProjects() {
    if (this.currentFilter === "All") {
      return this.projects;
    }
    return this.projects.filter((project) =>
      project.tags.some((tag) =>
        tag.toLowerCase().includes(this.currentFilter.toLowerCase())
      )
    );
  }

  renderProjects() {
    const container = document.querySelector(".project-cards");
    if (!container) return;

    const filteredProjects = this.getFilteredProjects();
    const startIndex = this.currentPage * this.projectsPerPage;
    const endIndex = startIndex + this.projectsPerPage;
    const projectsToShow = filteredProjects.slice(startIndex, endIndex);

    container.innerHTML = "";

    projectsToShow.forEach((project) => {
      const projectCard = this.createProjectCard(project);
      container.appendChild(projectCard);
    });

    // Add skeleton loaders if needed
    const remainingSlots = this.projectsPerPage - projectsToShow.length;
    for (let i = 0; i < remainingSlots && this.currentPage === 0; i++) {
      const skeleton = this.createSkeletonCard();
      container.appendChild(skeleton);
    }

    this.updatePagination(filteredProjects.length);
  }

  createProjectCard(project) {
    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <a href="/project.html?id=${project.id}" class="img">
        <img src="${project.media.thumbnail}" alt="${
      project.title
    }" loading="lazy" />
        <button class="like" data-project-id="${project.id}">
          <span>
            <img src="/assets/icons/like.svg" loading="lazy" />
          </span>
        </button>
      </a>
      <div class="descr">
        <div class="brand-metrics">
          <div class="company">
            <a href="/project.html?id=${project.id}">
              <img src="${project.client.logo}" alt="${project.client.name}" />
            </a>
            <div>
              <h3>${project.client.name}</h3>
            </div>
          </div>
          <div class="project-metrics">
            <div class="likes">
              <div><img src="/assets/icons/like.svg" alt="likes" /></div>
              <div><span>${project.likes}</span></div>
            </div>
            <div class="views">
              <div><img src="/assets/icons/view.svg" alt="views" /></div>
              <div><span>${project.views}</span></div>
            </div>
          </div>
        </div>
        <div class="project-info">
          <p>${project.bio}</p>
          <div class="project-tags">
            ${project.tags.map((tag) => `<span>${tag}</span>`).join("")}
            <div class="glow-animation"></div>
          </div>
        </div>
      </div>
    `;

    // Add like functionality
    const likeBtn = card.querySelector(".like");
    likeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleLike(project.id, likeBtn);
    });

    return card;
  }

  createSkeletonCard() {
    const skeleton = document.createElement("div");
    skeleton.className = "project-card skeleton";
    skeleton.innerHTML = `
      <div class="img">
        <div class="skeleton-box image-placeholder"></div>
      </div>
      <div class="descr">
        <div class="brand-metrics">
          <div class="company">
            <div class="skeleton-box avatar-placeholder"></div>
            <div class="skeleton-box name-placeholder"></div>
          </div>
          <div class="project-metrics">
            <div class="skeleton-box small-icon-placeholder"></div>
            <div class="skeleton-box small-icon-placeholder"></div>
          </div>
        </div>
        <div class="project-info">
          <div class="skeleton-box text-line"></div>
          <div class="skeleton-box text-line short"></div>
          <div class="project-tags">
            <div class="skeleton-box tag-placeholder"></div>
            <div class="skeleton-box tag-placeholder small"></div>
          </div>
        </div>
      </div>
    `;
    return skeleton;
  }

  setupFilters() {
    const tabs = document.querySelectorAll(".project-tabs .tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Remove active class from all tabs
        tabs.forEach((t) => t.classList.remove("active"));
        // Add active class to clicked tab
        tab.classList.add("active");

        this.currentFilter = tab.textContent.trim();
        this.currentPage = 0;
        this.renderProjects();
      });
    });
  }

  setupPagination() {
    const paginationContainer = document.querySelector(".projects .pagination");
    if (!paginationContainer) {
      // Create pagination container
      const container = document.createElement("div");
      container.className = "pagination-container";
      container.innerHTML = '<div class="pagination"></div>';
      document.querySelector(".projects-list").appendChild(container);
    }
  }

  updatePagination(totalProjects) {
    const totalPages = Math.ceil(totalProjects / this.projectsPerPage);
    const paginationContainer =
      document.querySelector(".projects .pagination") ||
      document.querySelector(".pagination-container .pagination");

    if (!paginationContainer || totalPages <= 1) {
      if (paginationContainer) paginationContainer.style.display = "none";
      return;
    }

    paginationContainer.style.display = "flex";
    paginationContainer.innerHTML = "";

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement("span");
      dot.className = `dot ${i === this.currentPage ? "active" : ""}`;
      dot.addEventListener("click", () => {
        this.currentPage = i;
        this.renderProjects();
      });
      paginationContainer.appendChild(dot);
    }
  }

  toggleLike(projectId, button) {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) return;

    const isLiked = button.classList.contains("active");
    if (isLiked) {
      project.likes--;
      button.classList.remove("active");
    } else {
      project.likes++;
      button.classList.add("active");
    }

    // Update the likes count in the UI
    const likesSpan = button
      .closest(".project-card")
      .querySelector(".likes span");
    if (likesSpan) {
      likesSpan.textContent = project.likes;
    }
  }
}

// Testimonials Manager
class TestimonialsManager {
  constructor() {
    this.testimonials = [];
    this.currentPage = 0;
    this.testimonialsPerPage = 2;
    this.init();
  }

  async init() {
    await this.loadTestimonials();
    this.renderTestimonials();
    this.setupPagination();
  }

  async loadTestimonials() {
    try {
      const response = await fetch("/data/testimonials.json");
      this.testimonials = await response.json();
    } catch (error) {
      console.error("Error loading testimonials:", error);
      this.testimonials = [];
    }
  }

  renderTestimonials() {
    const container = document.querySelector(".testimonials .cards-list");
    if (!container) return;

    const startIndex = this.currentPage * this.testimonialsPerPage;
    const endIndex = startIndex + this.testimonialsPerPage;
    const testimonialsToShow = this.testimonials.slice(startIndex, endIndex);

    container.innerHTML = "";

    testimonialsToShow.forEach((testimonial) => {
      const card = this.createTestimonialCard(testimonial);
      container.appendChild(card);
    });

    this.updatePagination();
  }

  createTestimonialCard(testimonial) {
    const card = document.createElement("div");
    card.className = "card";

    const stars = Array.from(
      { length: 5 },
      (_, i) =>
        `<div class="${i < testimonial.rating ? "active" : ""}">
        <img src="/assets/icons/star.svg" loading="lazy" />
      </div>`
    ).join("");

    card.innerHTML = `
      <div class="user">
        <div>
          <div class="stars">${stars}</div>
          <div class="name">
            <h3>${testimonial.name}</h3>
          </div>
        </div>
        <div class="img">
          <img src="${testimonial.avatar}" alt="${testimonial.name}" />
        </div>
      </div>
      <div class="text">
        <p>${testimonial.text}</p>
      </div>
      <div>
        <div class="work">
          <span>${testimonial.service}</span>
        </div>
      </div>
    `;

    return card;
  }

  setupPagination() {
    let paginationContainer = document.querySelector(
      ".testimonials .pagination"
    );
    if (!paginationContainer) {
      paginationContainer = document.createElement("div");
      paginationContainer.className = "pagination";
      document
        .querySelector(".testimonials .main")
        .appendChild(paginationContainer);
    }
  }

  updatePagination() {
    const totalPages = Math.ceil(
      this.testimonials.length / this.testimonialsPerPage
    );
    const paginationContainer = document.querySelector(
      ".testimonials .pagination"
    );

    if (!paginationContainer || totalPages <= 1) return;

    paginationContainer.innerHTML = "";

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement("span");
      dot.className = `dot ${i === this.currentPage ? "active" : ""}`;
      dot.addEventListener("click", () => {
        this.currentPage = i;
        this.renderTestimonials();
      });
      paginationContainer.appendChild(dot);
    }
  }
}

// FAQ Manager
class FAQManager {
  constructor() {
    this.init();
  }

  init() {
    const faqCards = document.querySelectorAll(".faq .card");
    faqCards.forEach((card) => {
      card.addEventListener("click", () => this.toggleFAQ(card));
    });
  }

  toggleFAQ(card) {
    const isActive = card.classList.contains("active");

    // Close all other FAQ cards
    document.querySelectorAll(".faq .card").forEach((c) => {
      if (c !== card) {
        c.classList.remove("active");
      }
    });

    // Toggle current card
    if (isActive) {
      card.classList.remove("active");
    } else {
      card.classList.add("active");
    }
  }
}

// Project Page Manager
class ProjectPageManager {
  constructor() {
    this.projectId = this.getProjectIdFromURL();
    if (this.projectId) {
      this.init();
    }
  }

  getProjectIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  async init() {
    const project = await this.loadProject();
    if (project) {
      this.renderProject(project);
    } else {
      this.showNotFound();
    }
  }

  async loadProject() {
    try {
      const response = await fetch("/data/projects.json");
      const projects = await response.json();
      return projects.find((p) => p.id === this.projectId);
    } catch (error) {
      console.error("Error loading project:", error);
      return null;
    }
  }

  renderProject(project) {
    // Update page title
    document.title = `${project.title} — Iwmvictor/Portfolio`;

    // Update hero section
    const heroImg = document.querySelector(".hero img");
    const heroTitle = document.querySelector(".hero h2");
    const previewLink = document.querySelector(".sample a");
    const serviceText = document.querySelector(".sample p");
    const toolsText = document.querySelectorAll(".sample p")[1];
    const timelineText = document.querySelectorAll(".sample p")[2];

    if (heroImg) heroImg.src = project.media.hero || project.media.thumbnail;
    if (heroTitle) heroTitle.textContent = project.title;
    if (previewLink) previewLink.href = project.preview_link;
    if (serviceText) serviceText.textContent = project.service;
    if (toolsText)
      toolsText.innerHTML = project.tools
        .map((tool) => `<span>${tool}</span>`)
        .join("");
    if (timelineText) timelineText.textContent = project.timeline;

    // Update description
    const aboutText = document.querySelector(".description .about p");
    if (aboutText) aboutText.textContent = project.about;

    // Update gallery
    if (project.media.gallery && project.media.gallery.length > 0) {
      const largeImg = document.querySelector(".media .large img");
      const otherImages = document.querySelector(".media .others");

      if (largeImg) largeImg.src = project.media.gallery[0];

      if (otherImages && project.media.gallery.length > 0) {
        otherImages.innerHTML = "";
        project.media.gallery.slice(0).forEach((imgSrc) => {
          const imgDiv = document.createElement("div");
          imgDiv.className = "image";
          imgDiv.innerHTML = `<img src="${imgSrc}" alt="${project.title}" />`;
          otherImages.appendChild(imgDiv);
        });
      }
    }
  }

  showNotFound() {
    document.body.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">404</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Project not found</p>
        <a href="/index.html" style="padding: 1rem 2rem; background: var(--accent-color); color: white; text-decoration: none; border-radius: 0.5rem;">Go Home</a>
      </div>
    `;
  }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize theme manager
  new ThemeManager();

  // Initialize based on current page
  if (window.location.pathname.includes("project.html")) {
    new ProjectPageManager();
  } else {
    // Homepage functionality
    new ProjectsManager();
    new TestimonialsManager();
    new FAQManager();
  }
});
