document.getElementById("year").textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Smooth scroll (Lenis) ----------
if (!prefersReducedMotion && window.Lenis) {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  if (window.gsap && window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}

// ---------- Scroll reveals (GSAP ScrollTrigger) ----------
document.documentElement.classList.add("reveal-ready");

if (!prefersReducedMotion && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll("[data-reveal]").forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      delay: (i % 4) * 0.06,
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none reverse",
      },
    });
  });
} else {
  // No animation library or reduced motion requested: show everything immediately.
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    el.style.opacity = 1;
    el.style.transform = "none";
  });
}

// ---------- Lightbox ----------
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");
let lightboxVideo = null;

function stopLightboxVideo() {
  if (lightboxVideo) {
    lightboxVideo.pause();
    lightboxVideo.remove();
    lightboxVideo = null;
  }
}

function openLightbox(src, alt) {
  lightboxImg.style.display = "";
  lightboxImg.src = src;
  lightboxImg.alt = alt || "";
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
}

function openLightboxVideo(src, poster) {
  stopLightboxVideo();
  lightboxImg.style.display = "none";
  lightboxVideo = document.createElement("video");
  lightboxVideo.src = src;
  lightboxVideo.poster = poster;
  lightboxVideo.controls = true;
  lightboxVideo.autoplay = true;
  lightboxVideo.playsInline = true;
  lightboxVideo.className = "lightbox-video";
  lightbox.insertBefore(lightboxVideo, lightboxClose.nextSibling);
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
  stopLightboxVideo();
}

document.querySelectorAll(".gallery-item, .hero-watch").forEach((btn) => {
  btn.addEventListener("click", () => {
    const video = btn.getAttribute("data-video");
    const full = btn.getAttribute("data-full");
    const alt = btn.querySelector("img")?.getAttribute("alt");
    if (video) {
      openLightboxVideo(video, full);
    } else {
      openLightbox(full, alt);
    }
  });
});

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});
