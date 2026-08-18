(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Mobile nav toggle */
  var navToggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  /* The lock goes on <html>, not <body>: overflow:hidden on body makes body its
     own scroll container and breaks position:sticky on the header. */
  function setNavOpen(open) {
    navToggle.setAttribute("aria-expanded", String(open));
    mobileNav.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("nav-open", open);
  }

  function closeNav() {
    setNavOpen(false);
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    /* A resize past the desktop breakpoint hides the panel but left the lock on. */
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900) closeNav();
    });
  }

  /* Scroll-triggered reveal */
  var revealTargets = document.querySelectorAll(".reveal-fade, .reveal-line");

  if ("IntersectionObserver" in window && revealTargets.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Hero always reveals immediately, no scroll wait */
  window.requestAnimationFrame(function () {
    document.querySelectorAll(".hero .reveal-fade, .hero .reveal-line").forEach(function (el) {
      el.classList.add("is-visible");
    });
  });

  /* Back to top */
  var backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    var toggleBackToTop = function () {
      backToTop.classList.toggle("is-visible", window.scrollY > window.innerHeight);
    };
    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    toggleBackToTop();

    backToTop.addEventListener("click", function () {
      var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();
