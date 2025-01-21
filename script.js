document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(
    'button[aria-controls="mobile-menu"]'
  );
  const mobileMenu = document.getElementById("mobile-menu");

  // Add click event listener to the menu button
  menuButton.addEventListener("click", () => {
    const isExpanded =
      menuButton.getAttribute("aria-expanded") === "true" || false;

    // Toggle the 'hidden' class for the mobile menu
    mobileMenu.classList.toggle("hidden");

    // Update the aria-expanded attribute
    menuButton.setAttribute("aria-expanded", !isExpanded);

    // Toggle the visibility of the menu icons
    const openIcon = menuButton.querySelector("svg:not(.hidden)");
    const closeIcon = menuButton.querySelector("svg.hidden");
    openIcon.classList.toggle("hidden");
    closeIcon.classList.toggle("hidden");
  });
});
