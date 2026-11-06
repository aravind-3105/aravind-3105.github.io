const root = document.documentElement;
const THEME_KEY = "an-theme";

function preferredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "paper" || stored === "ink") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "paper" : "ink";
}

function setTheme(theme) {
  const next = theme === "paper" ? "paper" : "ink";
  root.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
  document.querySelectorAll("[data-theme-set]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.themeSet === next));
  });
  const color = next === "ink" ? "#0c0d0b" : "#f6f3ec";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", color);
}

setTheme(preferredTheme());

document.querySelectorAll("[data-theme-set]").forEach((btn) => {
  btn.addEventListener("click", () => setTheme(btn.dataset.themeSet));
});

const menuBtn = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("#mobile-nav");
if (menuBtn && mobileNav) {
  menuBtn.addEventListener("click", () => {
    const open = mobileNav.hasAttribute("hidden");
    mobileNav.toggleAttribute("hidden", !open);
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.setAttribute("hidden", "");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll("[data-abstract]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const paper = btn.closest(".paper");
    const open = paper.classList.toggle("is-open");
    btn.textContent = open ? "Close" : "Abstract";
  });
});

const papers = [...document.querySelectorAll(".paper")];
const filters = [...document.querySelectorAll("[data-filter]")];

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("is-on"));
    btn.classList.add("is-on");
    const key = btn.dataset.filter;
    papers.forEach((paper) => {
      const show =
        key === "all" ||
        paper.dataset.year === key ||
        paper.dataset.role === key ||
        paper.dataset.kind === key;
      paper.classList.toggle("is-hidden", !show);
    });
  });
});

const navLinks = [...document.querySelectorAll(".rail-nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function photoCaption(item) {
  return [item.title, item.place, item.year].filter(Boolean).join(" · ");
}

function renderPhotoCard(item, imgBase) {
  const card = document.createElement("a");
  card.className = "photo-card";
  card.href = imgBase + encodeURIComponent(item.file);
  card.dataset.lightbox = "true";
  card.innerHTML = `<img src="${imgBase}${encodeURIComponent(item.file)}" alt="${item.title || "Photograph"}" /><span>${photoCaption(item)}</span>`;
  return card;
}

function renderEmptySlots(target, count) {
  const labels = ["Places", "Light", "Roads", "Cities", "Quiet", "Field notes"];
  labels.slice(0, count).forEach((label) => {
    const slot = document.createElement("div");
    slot.className = "film-slot";
    slot.innerHTML = `<span>${label}</span>`;
    target.append(slot);
  });
}

async function mountPhotos() {
  const hosts = document.querySelectorAll("[data-photos]");
  for (const host of hosts) {
    try {
      const res = await fetch(host.dataset.photos);
      const items = await res.json();
      host.replaceChildren();
      if (!items.length) {
        renderEmptySlots(host, host.id === "gallery" ? 6 : 3);
        continue;
      }
      const imgBase = host.dataset.imgBase || "";
      const shown = host.id === "photo-strip" ? items.slice(0, 4) : items;
      shown.forEach((item) => host.append(renderPhotoCard(item, imgBase)));
    } catch {
      renderEmptySlots(host, 3);
    }
  }
}

function setupLightbox() {
  const box = document.querySelector("#lightbox");
  if (!box) return;
  const img = box.querySelector("img");
  const cap = box.querySelector(".lightbox-cap");
  const close = () => box.setAttribute("hidden", "");
  box.querySelector("[data-lightbox-close]").addEventListener("click", close);
  box.addEventListener("click", (event) => {
    if (event.target === box) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-lightbox]");
    if (!link) return;
    event.preventDefault();
    img.src = link.href;
    img.alt = link.querySelector("img")?.alt || "";
    cap.textContent = link.querySelector("span")?.textContent || "";
    box.removeAttribute("hidden");
  });
}

async function mountTalks() {
  const hosts = document.querySelectorAll("[data-talk]");
  if (!hosts.length) return;
  let talks = {};
  try {
    const res = await fetch("assets/talks.json");
    talks = await res.json();
  } catch {
    return;
  }
  hosts.forEach((host) => {
    const files = talks[host.dataset.talk] || [];
    if (!files.length) return;
    host.replaceChildren();
    files.forEach((item, index) => {
      const file = typeof item === "string" ? item : item.file;
      const caption = typeof item === "string" ? `Talk screenshot ${index + 1}` : item.caption;
      const link = document.createElement("a");
      const src = `assets/talks/${host.dataset.talk}/${encodeURIComponent(file)}`;
      link.href = src;
      link.dataset.lightbox = "true";
      link.innerHTML = `<img src="${src}" alt="${caption}" /><span>${caption}</span>`;
      host.append(link);
    });
    host.removeAttribute("hidden");
  });
}

mountPhotos();
mountTalks();
setupLightbox();

if (sections.length && "IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-35% 0px -50% 0px", threshold: 0.01 }
  );
  sections.forEach((section) => spy.observe(section));
}
