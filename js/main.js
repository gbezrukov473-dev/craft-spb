(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Mobile nav toggle */
  var navToggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  /* The lock goes on <html> only: overflow:hidden on body makes body its own
     scroll container and breaks position:sticky on the header. */
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
/* ============ Live haircut counter ============ */
/* The number stands at its real total and ticks one up every few seconds, the
   way a shop tally would: the units wheel turns over, and the wheels above it
   only move when it passes nine. Nothing animates on arrival — the figure is
   already correct when the section comes into view. */
(function () {
  "use strict";

  var el = document.querySelector(".odometer");
  if (!el) return;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  var TICK_MS = parseInt(el.getAttribute("data-tick"), 10) || 1500;   /* one haircut */
  var ROLL_MS = 620;                                                  /* the flip itself */
  var EASE = "cubic-bezier(0.45, 0.05, 0.25, 1.06)";                  /* settles with a nudge */

  var template = el.textContent;                 /* "23 985" — separators kept as typed */
  var digits = template.replace(/\D/g, "");
  var value = parseInt(digits, 10);
  if (!digits.length || !isFinite(value)) return;

  var limit = Math.pow(10, digits.length) - 1;   /* no room to grow a new column */

  /* Builds one reel per digit. Each reel runs 0–9 and then 0, 1 again: the
     first repeat lets nine roll on to zero without a seam, the second gives the
     easing something to show when it overshoots before settling. */
  function build() {
    var frag = document.createDocumentFragment();
    var columns = [];

    for (var i = 0; i < template.length; i++) {
      var ch = template.charAt(i);

      if (!/\d/.test(ch)) {
        var gap = document.createElement("span");
        gap.className = "odometer__gap";
        gap.textContent = ch;
        frag.appendChild(gap);
        continue;
      }

      var cell = document.createElement("span");
      cell.className = "odometer__digit";

      var ghost = document.createElement("span");
      ghost.className = "odometer__ghost";
      ghost.textContent = ch;
      cell.appendChild(ghost);

      var mask = document.createElement("span");
      mask.className = "odometer__mask";

      var reel = document.createElement("span");
      reel.className = "odometer__reel";
      for (var k = 0; k <= 11; k++) {
        var face = document.createElement("span");
        face.textContent = String(k % 10);
        reel.appendChild(face);
      }

      mask.appendChild(reel);
      cell.appendChild(mask);
      frag.appendChild(cell);

      var digit = Number(ch);
      reel.style.transform = "translateY(" + (-digit * 100) + "%)";
      columns.push({ node: reel, digit: digit });
    }

    var sr = document.createElement("span");
    sr.className = "odometer__sr";
    sr.textContent = template;

    var reels = document.createElement("span");
    reels.className = "odometer__reels";
    reels.setAttribute("aria-hidden", "true");
    reels.appendChild(frag);

    el.textContent = "";
    el.appendChild(sr);
    el.appendChild(reels);

    return { columns: columns, sr: sr };
  }

  var counter = build();

  function format(n) {
    var padded = String(n);
    while (padded.length < digits.length) padded = "0" + padded;
    var out = "";
    var d = 0;
    for (var i = 0; i < template.length; i++) {
      var ch = template.charAt(i);
      out += /\d/.test(ch) ? padded.charAt(d++) : ch;
    }
    return out;
  }

  /* One tick: every wheel that changes moves up exactly one face, all of them
     together, so a carry (…989 → …990) turns as a single movement. */
  function tick() {
    var next = value + 1;
    var before = format(value).replace(/\D/g, "");
    var after = format(next).replace(/\D/g, "");
    var rolling = [];

    counter.columns.forEach(function (column, i) {
      if (before.charAt(i) === after.charAt(i)) return;
      column.node.style.transition = "transform " + ROLL_MS + "ms " + EASE;
      column.node.style.transform = "translateY(" + (-(column.digit + 1) * 100) + "%)";
      rolling.push(column);
    });

    value = next;
    counter.sr.textContent = format(value);

    /* Once a wheel has rolled past nine it is sitting on the repeated face;
       drop it back to the real one with the transition off, so the next tick
       starts from a sane position. */
    window.setTimeout(function () {
      rolling.forEach(function (column) {
        column.digit = (column.digit + 1) % 10;
        if (column.digit !== 0) return;
        column.node.style.transition = "none";
        column.node.style.transform = "translateY(0%)";
        column.node.getBoundingClientRect();      /* flush, or the reset animates */
      });
    }, ROLL_MS + 40);
  }

  /* Runs only while the number is on screen and the tab is in front: nobody
     should come back to a tally that ran off on its own. */
  var timer = null;
  var onScreen = false;

  function sync() {
    var shouldRun = onScreen && !document.hidden && value < limit;
    if (shouldRun && !timer) {
      timer = window.setInterval(tick, TICK_MS);
    } else if (!shouldRun && timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  new IntersectionObserver(function (entries) {
    onScreen = entries[0].isIntersecting;
    sync();
  }, { threshold: 0.6 }).observe(el);

  document.addEventListener("visibilitychange", sync);
})();

/* ============ Scroll progress hairline ============ */
(function () {
  "use strict";

  var bar = document.getElementById("scroll-progress-bar");
  if (!bar) return;

  var ticking = false;

  function update() {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
    bar.style.transform = "scaleX(" + progress + ")";
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });

  window.addEventListener("resize", update);
  update();
})();
