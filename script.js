document.documentElement.classList.add("has-js");

const topbar = document.querySelector("[data-topbar]");
const navLinks = [...document.querySelectorAll(".nav a")];
const revealNodes = [...document.querySelectorAll("[data-reveal]")];
const sectionIds = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const updateTopbar = () => {
  if (!topbar) return;
  topbar.classList.toggle("is-scrolled", window.scrollY > 12);
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18
  }
);

revealNodes.forEach((node) => revealObserver.observe(node));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${visible.target.id}`;
      if (isCurrent) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  },
  {
    rootMargin: "-25% 0px -55% 0px",
    threshold: [0.2, 0.4, 0.6]
  }
);

sectionIds.forEach((section) => sectionObserver.observe(section));

window.addEventListener("scroll", updateTopbar, { passive: true });
updateTopbar();

