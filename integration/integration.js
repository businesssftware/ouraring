// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth",
        });
    });
});

// Add hover effect to cards
const cards = document.querySelectorAll(".app-card, .integration-card");
cards.forEach((card) => {
    card.addEventListener("mouseover", () => {
        card.style.transform = "scale(1.05)";
    });
    card.addEventListener("mouseout", () => {
        card.style.transform = "scale(1)";
    });
});

// Dynamic current time display
function updateTime() {
    const now = new Date();
    const options = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Singapore",
    };
    const timeString = now.toLocaleTimeString("en-US", options);
    console.log(`Current time: ${timeString}`); // For debugging, can be replaced with a UI element if needed
}
setInterval(updateTime, 1000);
// Simple animation for fade-in effect
document.addEventListener("DOMContentLoaded", () => {
    const upgradeContent = document.querySelector(".upgrade-content");
    upgradeContent.style.opacity = "0";
    setTimeout(() => {
        upgradeContent.style.transition = "opacity 1s";
        upgradeContent.style.opacity = "1";
    }, 100);
});
