(() => {
  "use strict";

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scrollCallbacks = new Set();
  let scrollFramePending = false;

  const runScrollCallbacks = () => {
    scrollCallbacks.forEach((callback) => callback());
    scrollFramePending = false;
  };

  const scheduleScrollUpdate = () => {
    if (!scrollFramePending) {
      scrollFramePending = true;
      window.requestAnimationFrame(runScrollCallbacks);
    }
  };

  const registerScrollCallback = (callback) => {
    scrollCallbacks.add(callback);
    callback();

    if (scrollCallbacks.size === 1) {
      window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
      window.addEventListener("resize", scheduleScrollUpdate, { passive: true });
    }
  };

  const initMobileNavigation = () => {
    const navToggle = document.querySelector(".nav-toggle");
    const primaryNavigation = document.querySelector("#primary-navigation");

    if (!navToggle || !primaryNavigation) {
      return;
    }

    const desktopMediaQuery = window.matchMedia("(min-width: 901px)");

    const setMenuState = (isOpen) => {
      navToggle.classList.toggle("is-active", isOpen);
      primaryNavigation.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
    };

    const closeMenu = () => setMenuState(false);

    navToggle.addEventListener("click", () => {
      setMenuState(!primaryNavigation.classList.contains("is-open"));
    });

    primaryNavigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && primaryNavigation.classList.contains("is-open")) {
        closeMenu();
        navToggle.focus();
      }
    });

    desktopMediaQuery.addEventListener("change", (event) => {
      if (event.matches) {
        closeMenu();
      }
    });
  };

  const initHeaderScrollState = () => {
    const siteHeader = document.querySelector(".site-header");

    if (!siteHeader) {
      return;
    }

    registerScrollCallback(() => {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 48);
    });
  };

  const initActiveNavigation = () => {
    if (!("IntersectionObserver" in window)) {
      return;
    }

    const sectionIds = ["home", "about", "menu", "experience", "contact"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const navigationLinks = Array.from(
      document.querySelectorAll('.nav-list a[href^="#"], .footer-links a[href^="#"]')
    );

    if (!sections.length || !navigationLinks.length) {
      return;
    }

    const visibleSections = new Map();

    const setCurrentSection = (sectionId) => {
      navigationLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${sectionId}`;
        link.classList.toggle("is-current", isCurrent);

        if (isCurrent) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    setCurrentSection("home");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });

        if (visibleSections.size) {
          const [currentSection] = Array.from(visibleSections.entries()).sort(
            (first, second) => second[1] - first[1]
          )[0];
          setCurrentSection(currentSection);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      }
    );

    sections.forEach((section) => observer.observe(section));
  };

  const initScrollReveal = () => {
    const revealTargets = Array.from(document.querySelectorAll("[data-reveal]"));

    if (
      !revealTargets.length ||
      reducedMotionQuery.matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    revealTargets.forEach((target) => {
      const requestedDelay = Number.parseInt(target.dataset.revealDelay || "0", 10);
      const revealDelay = Number.isFinite(requestedDelay)
        ? Math.min(Math.max(requestedDelay, 0), 400)
        : 0;

      target.classList.add("reveal-ready");
      target.style.setProperty("--reveal-delay", `${revealDelay}ms`);
    });

    document.documentElement.classList.add("has-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    revealTargets.forEach((target) => observer.observe(target));
  };

  const initGalleryLightbox = () => {
    const gallery = document.querySelector(".experience-grid");
    const dialog = document.querySelector("#gallery-lightbox");
    const closeButton = dialog?.querySelector(".lightbox-close");
    const lightboxSource = dialog?.querySelector("#lightbox-source");
    const lightboxImage = dialog?.querySelector("#lightbox-image");
    const lightboxCaption = dialog?.querySelector("#lightbox-caption");

    if (
      !gallery ||
      !dialog ||
      !closeButton ||
      !lightboxSource ||
      !lightboxImage ||
      !lightboxCaption ||
      typeof dialog.showModal !== "function"
    ) {
      return;
    }

    let openingTrigger = null;
    document.documentElement.classList.add("has-lightbox");

    gallery.addEventListener("click", (event) => {
      const trigger = event.target.closest(".lightbox-trigger");

      if (!trigger || !gallery.contains(trigger)) {
        return;
      }

      const source = trigger.querySelector('source[type="image/webp"]');
      const image = trigger.querySelector("img");
      const caption = trigger.closest("figure")?.querySelector("figcaption");

      if (!image || !caption) {
        return;
      }

      event.preventDefault();
      openingTrigger = trigger;
      lightboxSource.srcset = source?.srcset || "";
      lightboxImage.src = trigger.getAttribute("href");
      lightboxImage.alt = image.alt;
      lightboxCaption.textContent = caption.textContent.trim();
      dialog.showModal();
      closeButton.focus();
    });

    closeButton.addEventListener("click", () => dialog.close());

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });

    dialog.addEventListener("close", () => {
      openingTrigger?.focus();
      openingTrigger = null;
    });
  };

  const initBackToTop = () => {
    const backToTopButton = document.querySelector(".back-to-top");

    if (!backToTopButton) {
      return;
    }

    registerScrollCallback(() => {
      const isVisible = window.scrollY > Math.max(600, window.innerHeight * 0.8);
      backToTopButton.classList.toggle("is-visible", isVisible);
      backToTopButton.setAttribute("aria-hidden", String(!isVisible));
      backToTopButton.tabIndex = isVisible ? 0 : -1;
    });

    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reducedMotionQuery.matches ? "auto" : "smooth",
      });
    });
  };

  const initReservationForm = () => {
    const reservationForm = document.querySelector(".reservation-form");
    const preferredDate = reservationForm?.querySelector("#preferred-date");
    const formStatus = reservationForm?.querySelector(".form-status");

    if (!reservationForm || !preferredDate || !formStatus) {
      return;
    }

    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
    preferredDate.min = localToday;

    const renderUnavailableMessage = () => {
      const message = document.createElement("p");
      const actions = document.createElement("div");
      const phoneLink = document.createElement("a");
      const whatsAppLink = document.createElement("a");

      message.className = "form-status-message";
      message.textContent =
        "Online booking is not active yet. Please call or contact us on WhatsApp to complete your reservation.";

      actions.className = "form-status-actions";
      phoneLink.className = "form-status-action";
      phoneLink.href = "tel:+93765083224";
      phoneLink.textContent = "Call Namak";

      whatsAppLink.className = "form-status-action";
      whatsAppLink.href = "https://wa.me/93765083224";
      whatsAppLink.target = "_blank";
      whatsAppLink.rel = "noopener noreferrer";
      whatsAppLink.textContent = "WhatsApp Us";

      actions.append(phoneLink, whatsAppLink);
      formStatus.replaceChildren(message, actions);
    };

    reservationForm.addEventListener("submit", (event) => {
      if (!reservationForm.checkValidity()) {
        event.preventDefault();
        reservationForm.querySelector(":invalid")?.focus();
        reservationForm.reportValidity();
        return;
      }

      event.preventDefault();
      renderUnavailableMessage();
    });
  };

  const initApplication = () => {
    initMobileNavigation();
    initHeaderScrollState();
    initActiveNavigation();
    initScrollReveal();
    initGalleryLightbox();
    initBackToTop();
    initReservationForm();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApplication, { once: true });
  } else {
    initApplication();
  }
})();
