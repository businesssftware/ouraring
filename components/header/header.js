// Menu elements
const menuToggle = document.getElementById('menu-toggle');
const menuWrapper = document.getElementById('menu-wrapper');
const menuClose = document.getElementById('menu-close');
const overlay = document.getElementById('overlay');

// Open menu
function openMenu() {
  menuWrapper.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close menu
function closeMenu() {
  menuWrapper.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// Menu toggle events
menuToggle.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

// Close menu on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuWrapper.classList.contains('active')) {
    closeMenu();
  }
});

// Header scroll behavior
let lastScrollY = window.scrollY;
const header = document.querySelector(".site-header");
const navbar = document.querySelector(".navbar");
const lightSections = document.querySelectorAll(".light-navbar-section");

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  // Hide/show header on scroll
  if (Math.abs(currentScrollY - lastScrollY) > 100) {
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      header.classList.add("hide-header");
    } else {
      header.classList.remove("hide-header");
    }
    lastScrollY = currentScrollY;
  }

  // At top of page, remove background
  if (navbar) {
    if (window.scrollY === 0) {
      navbar.classList.remove("scrolled");
    } else {
      navbar.classList.add("scrolled");
    }
  }

  // Change navbar color if inside .light-navbar-section
  let shouldApplyLight = false;
  lightSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 0 && rect.bottom > 0) {
      shouldApplyLight = true;
    }
  });

  if (navbar) {
    if (shouldApplyLight) {
      navbar.classList.add("light");
    } else {
      navbar.classList.remove("light");
    }
  }

});

window.dispatchEvent(new Event("scroll"));