const navToggle = document.querySelector(".nav-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");

if (navToggle && primaryNavigation) {
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

  // Toggle the mobile menu from its control button.
  navToggle.addEventListener("click", () => {
    const isOpen = !primaryNavigation.classList.contains("is-open");
    setMenuState(isOpen);
  });

  // Close the menu after any navigation choice is made.
  primaryNavigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Provide a keyboard-friendly way to dismiss the menu.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && primaryNavigation.classList.contains("is-open")) {
      closeMenu();
      navToggle.focus();
    }
  });

  // Clear mobile-only state when the desktop layout returns.
  desktopMediaQuery.addEventListener("change", (event) => {
    if (event.matches) {
      closeMenu();
    }
  });
}
