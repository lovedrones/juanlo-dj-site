const hero = document.querySelector(".hero");
const heroBg = document.querySelector(".hero-bg");
const heroBgReveal = document.querySelector(".hero-bg-reveal");
const bioSection = document.querySelector(".bio");
const bioCard = document.querySelector(".bio-card");
const heroCopy = document.querySelector(".hero-copy");
const heroTitle = document.querySelector(".hero-title");
const heroSubtitle = document.querySelector(".hero-subtitle");

function applyHeroBlur() {
  if (!hero || !heroBg || !heroBgReveal || !bioSection || !heroCopy || !heroTitle || !heroSubtitle) return;

  const heroRect = hero.getBoundingClientRect();
  const bioRect = bioSection.getBoundingClientRect();

  // Start blur once bio begins entering the viewport.
  const revealStart = Math.max(0, window.innerHeight - bioRect.top);
  const revealRange = window.innerHeight * 0.95;
  const progress = Math.min(Math.max(revealStart / revealRange, 0), 1);

  const blurAmount = progress * 12;
  const brightness = 0.75 - progress * 0.18;
  heroBg.style.filter = `blur(${blurAmount}px) brightness(${brightness}) saturate(1.2)`;

  // Gently scale down as users move deeper into the page.
  const heroProgress = Math.min(Math.max(-heroRect.top / window.innerHeight, 0), 1);
  const scale = 1.02 - heroProgress * 0.03;
  heroBg.style.transform = `scale(${scale})`;

  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const pageProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

  // Crossfade into the reveal image toward the bottom of the page.
  const swapProgress = Math.min(Math.max((pageProgress - 0.62) / 0.32, 0), 1);
  heroBgReveal.style.opacity = `${swapProgress}`;

  // Fade out header + ticker as user scrolls down.
  const fadeProgress = Math.min(Math.max(window.scrollY / (window.innerHeight * 0.5), 0), 1);
  heroCopy.style.opacity = `${1 - fadeProgress}`;
}

function applyBioScroll() {
  if (!bioCard) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    bioCard.style.transform = "";
    bioCard.style.opacity = "";
    return;
  }

  const vh = window.innerHeight;
  const rect = bioCard.getBoundingClientRect();
  const slide = Math.min(340, vh * 0.32);

  const enterEnd = vh * 0.3;
  let translateX = 0;
  let opacity = 1;

  const easeOutCubic = (u) => 1 - Math.pow(1 - u, 3);
  const easeInCubic = (u) => u * u * u;

  if (rect.top > enterEnd) {
    const range = vh - enterEnd;
    const t = range > 0 ? Math.min(Math.max((vh - rect.top) / range, 0), 1) : 1;
    const te = easeOutCubic(t);
    translateX = -slide * (1 - te);
    opacity = te;
  } else if (rect.bottom < vh * 0.48) {
    const band = vh * 0.48;
    const t = band > 0 ? Math.min(Math.max(1 - rect.bottom / band, 0), 1) : 1;
    const tx = easeInCubic(t);
    translateX = slide * tx;
    opacity = 1 - tx;
  }

  bioCard.style.opacity = String(opacity);
  bioCard.style.transform = `translate3d(${translateX}px, 0, 0)`;
}

function onScroll() {
  applyHeroBlur();
  applyBioScroll();
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();

function initScrollReveals() {
  const revealAll = (root) => {
    root.querySelectorAll(".js-reveal").forEach((el) => el.classList.add("is-visible"));
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".js-reveal").forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        if (target.classList.contains("bio-card") || target.classList.contains("contact-section")) {
          revealAll(target);
        } else {
          target.classList.add("is-visible");
        }
        observer.unobserve(target);
      });
    },
    { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );

  const bioCard = document.querySelector(".bio-card");
  const contactSection = document.querySelector(".contact-section");
  if (bioCard) io.observe(bioCard);
  if (contactSection) io.observe(contactSection);
}

initScrollReveals();

document.querySelectorAll(".video-with-play").forEach((wrap) => {
  const video = wrap.querySelector(".video-with-play__media");
  const overlay = wrap.querySelector(".video-play-overlay");
  if (!video || !overlay) return;

  overlay.addEventListener("click", () => {
    video.play().catch(() => {});
  });

  video.addEventListener("play", () => overlay.classList.add("is-hidden"));

  const showOverlayIfStopped = () => {
    if (!video.paused) return;
    if (video.currentTime === 0 || video.ended) {
      overlay.classList.remove("is-hidden");
    }
  };

  video.addEventListener("pause", showOverlayIfStopped);
  video.addEventListener("ended", () => overlay.classList.remove("is-hidden"));
});
