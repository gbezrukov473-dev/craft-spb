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
    /* The button is the only control for the panel, so its name has to say
       which way it goes; "Открыть меню" on an open panel is simply wrong. */
    navToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    mobileNav.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("nav-open", open);
  }

  function closeNav(returnFocus) {
    if (navToggle.getAttribute("aria-expanded") !== "true") return;
    setNavOpen(false);
    /* Only when the panel was dismissed deliberately. Following a link out of
       it must not yank focus back to a button the visitor has left behind. */
    if (returnFocus) navToggle.focus();
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
      if (open) {
        /* The panel covers the page; leaving focus on the button behind it
           means the next Tab walks the hidden document underneath. */
        var first = mobileNav.querySelector("a");
        if (first) first.focus();
      }
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { closeNav(false); });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav(true);
    });

    /* Focus trap. The panel is a full-screen overlay: everything behind it is
       inert to the eye but not to the Tab key, so the cycle is closed here. */
    mobileNav.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusable = mobileNav.querySelectorAll("a[href], button:not([disabled])");
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    /* A resize past the desktop breakpoint hides the panel but left the lock on. */
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900) closeNav(false);
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

/* ============ Haircut tally ============ */
/* 23 985 is the shop's running total to date, and it is a fixed historical
   figure — so it is shown as one. The reels roll it into place the first time
   the section scrolls into view and then stop: an odometer settling on a
   number, not a number that keeps climbing while the page is open.
   The previous version incremented every 1.5s, which implied a haircut every
   ninety seconds around the clock and made a real number look invented. */
(function () {
  "use strict";

  var el = document.querySelector(".odometer");
  if (!el) return;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  var ROLL_MS = 1100;                                   /* the slowest column */
  var STAGGER = 90;                                     /* per column, left to right */
  var EASE = "cubic-bezier(0.22, 1, 0.28, 1)";          /* long glide, soft stop */
  var SPIN = 10;                                        /* one full turn before landing */

  var template = el.textContent;                        /* "23 985" — separators kept as typed */
  var digits = template.replace(/\D/g, "");
  if (!digits.length) return;

  /* One reel per digit. Faces run 0–9 twice plus a landing row, so a column can
     turn a full revolution before it settles instead of sliding straight there. */
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

      /* Hidden copy of the final digit: holds the cell's width and baseline so
         the absolutely positioned reel cannot shift the line. */
      var ghost = document.createElement("span");
      ghost.className = "odometer__ghost";
      ghost.textContent = ch;
      cell.appendChild(ghost);

      var mask = document.createElement("span");
      mask.className = "odometer__mask";

      var reel = document.createElement("span");
      reel.className = "odometer__reel";
      var digit = Number(ch);
      for (var k = 0; k <= SPIN + digit; k++) {
        var face = document.createElement("span");
        face.textContent = String(k % 10);
        reel.appendChild(face);
      }

      mask.appendChild(reel);
      cell.appendChild(mask);
      frag.appendChild(cell);

      columns.push({ node: reel, digit: digit });
    }

    /* The number itself, for anything that reads rather than looks. The reels
       are decoration over it and are hidden from the accessibility tree. */
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

    return columns;
  }

  var columns = build();

  /* Highest column settles first and the units last, the way a mechanical
     counter comes to rest. */
  function roll() {
    columns.forEach(function (column, i) {
      var duration = ROLL_MS - (columns.length - 1 - i) * STAGGER;
      column.node.style.transition = "transform " + duration + "ms " + EASE;
      column.node.style.transform = "translateY(" + (-(SPIN + column.digit) * 100) + "%)";
    });
  }

  new IntersectionObserver(function (entries, obs) {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();          /* once, on first sight */
    roll();
  }, { threshold: 0.6 }).observe(el);
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

/* ============ Sticky CTA height ============ */
/* --sticky-cta-h was a hand-picked 4.25rem, and the real bar renders taller
   than that once the button's own padding and the safe-area inset are in it.
   Everything that has to clear the bar — the page's bottom padding, the
   consent banner, the back-to-top button — was reading a number 12px short of
   the truth, so the banner sat on the booking button. Measured once and on
   resize; the CSS value stays as the pre-script fallback. */
(function () {
  "use strict";

  var bar = document.querySelector(".sticky-cta");
  if (!bar) return;

  var frame = null;

  function measure() {
    frame = null;
    /* Zero means the bar is display:none at this width — leave the token at
       its declared value rather than collapsing everything that reads it. */
    var h = bar.offsetHeight;
    if (h > 0) document.documentElement.style.setProperty("--sticky-cta-h", h + "px");
    else document.documentElement.style.removeProperty("--sticky-cta-h");
  }

  measure();
  window.addEventListener("resize", function () {
    if (frame) return;
    frame = window.requestAnimationFrame(measure);
  });
})();

/* ============ Cookie consent ============ */
/* One decision, stored once, that everything with a third-party footprint
   waits on. Nothing here is a dark pattern: "Отклонить" is the same size and
   the same distance from the text as "Принять", and declining is a real state
   the page respects rather than a dialog that reappears next visit.
   Exposed as window.craftConsent so anything added later — Метрика first —
   can hook the same gate instead of inventing a second one. */
(function () {
  "use strict";

  var KEY = "craft:cookie-consent";
  var banner = document.getElementById("cookie-banner");
  var accept = document.getElementById("cookie-accept");
  var decline = document.getElementById("cookie-decline");

  var grantCallbacks = [];
  var granted = false;

  /* localStorage throws outright in some privacy modes rather than failing
     soft, and a thrown exception here would take the rest of the file with
     it. No storage means no stored decision, which is the safe reading. */
  function read() {
    try {
      return window.localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function write(value) {
    try {
      window.localStorage.setItem(KEY, value);
    } catch (e) {
      /* The decision still holds for this page view. */
    }
  }

  function runGrantCallbacks() {
    granted = true;
    while (grantCallbacks.length) grantCallbacks.shift()();
  }

  /* Publishes the banner's real height and flags the page as awaiting a
     decision, so the hero can lift its own content clear of the overlay (see
     .consent-pending in the stylesheet) instead of being covered by it. */
  function measureBanner() {
    if (!banner || banner.hidden) return;
    document.documentElement.style.setProperty("--cookie-banner-h", banner.offsetHeight + "px");
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove("is-visible");
    document.documentElement.classList.remove("consent-pending");
    document.documentElement.style.removeProperty("--cookie-banner-h");
    /* Kept in the DOM until the slide-out finishes, then taken out of the tab
       order for good. */
    window.setTimeout(function () { banner.hidden = true; }, 400);
  }

  function grant() {
    write("accepted");
    hideBanner();
    runGrantCallbacks();
  }

  function refuse() {
    write("declined");
    hideBanner();
  }

  window.craftConsent = {
    granted: function () { return granted; },
    /* Runs cb immediately if consent is already in hand, otherwise the moment
       it is given. Never runs after a refusal. */
    onGrant: function (cb) {
      if (granted) cb();
      else grantCallbacks.push(cb);
    },
    grant: grant
  };

  var stored = read();

  if (stored === "accepted") {
    runGrantCallbacks();
  } else if (stored !== "declined" && banner) {
    banner.hidden = false;
    document.documentElement.classList.add("consent-pending");
    measureBanner();
    /* Two frames: the element has to be laid out at translateY(100%) before
       the class change can be a transition rather than a jump. */
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { banner.classList.add("is-visible"); });
    });

    /* The banner's copy reflows at other widths, and the lift has to follow it. */
    var frame = null;
    window.addEventListener("resize", function () {
      if (frame) return;
      frame = window.requestAnimationFrame(function () {
        frame = null;
        measureBanner();
      });
    });
  }

  if (accept) accept.addEventListener("click", grant);
  if (decline) decline.addEventListener("click", refuse);
})();

/* ============ Map, once cookies are accepted ============ */
/* The Yandex widget is roughly a megabyte of third-party script and sets its
   own cookies the moment it is in the DOM, so it is exactly the thing the
   consent gate exists for. With consent it builds itself, no click needed;
   without it the frame keeps the address and offers the one action that fills
   it. Nothing is requested from Yandex before that. */
(function () {
  "use strict";

  var frame = document.getElementById("map-frame");
  var button = document.getElementById("map-load");
  if (!frame) return;

  var built = false;

  function build() {
    if (built) return;
    built = true;

    var iframe = document.createElement("iframe");
    iframe.className = "map-frame__embed";
    iframe.src = frame.getAttribute("data-map-src");
    iframe.title = frame.getAttribute("data-map-title");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("loading", "lazy");
    /* Same frame the stub was in: the widget replaces it, address and all. */
    frame.textContent = "";
    frame.appendChild(iframe);
  }

  if (window.craftConsent) window.craftConsent.onGrant(build);

  /* For anyone who declined, or dismissed nothing yet and scrolled straight
     here: this button is the consent, not a bypass of it. */
  if (button) {
    button.addEventListener("click", function () {
      if (window.craftConsent) window.craftConsent.grant();
      else build();
    });
  }
})();

/* ============ Conversion goals ============ */
/* Every outbound path that counts as a booking attempt, reported by the href
   it uses rather than by markup hooks, so adding another CTA needs no wiring.
   Метрика is not installed yet (see the commented block in index.html and the
   consent note in privacy.html) — until it is, window.ym is undefined and each
   call below is a no-op. Turning analytics on is then one edit, not a hunt for
   every button on the page. */
(function () {
  "use strict";

  var GOALS = [
    { test: /n234517\.yclients\.com/, goal: "booking_click" },
    { test: /^tel:/,                  goal: "phone_click" },
    { test: /wa\.me/,                 goal: "whatsapp_click" },
    { test: /t\.me/,                  goal: "telegram_click" },
    { test: /vk\.ru/,                 goal: "vk_click" }
  ];

  document.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest("a[href]") : null;
    if (!link) return;

    var href = link.getAttribute("href") || "";
    for (var i = 0; i < GOALS.length; i++) {
      if (!GOALS[i].test.test(href)) continue;
      if (typeof window.ym === "function" && window.craftMetrikaId) {
        window.ym(window.craftMetrikaId, "reachGoal", GOALS[i].goal);
      }
      return;
    }
  });
})();
