/* =========================================================================
   NAITIK SUSHIL WARJURKAR — PORTFOLIO
   script.js  (shared by index.html / exams.html / journey.html)
   ========================================================================= */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------- LOADER */
  var loader = $("#loader");
  function hideLoader() {
    if (!loader) return;
    loader.classList.add("done");
    setTimeout(function () {
      if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    }, 800);
  }
  window.addEventListener("load", function () { setTimeout(hideLoader, 350); });
  setTimeout(hideLoader, 2600); // safety net

  /* --------------------------------------------------------------- YEAR */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------------------------------------------------- THEME */
  var THEME_KEY = "nw-theme";
  var themeToggle = $("#themeToggle");
  var metaTheme = document.querySelector('meta[name="theme-color"]');

  function applyTheme(mode) {
    var chrome = mode === "chrome";
    document.body.classList.toggle("chrome", chrome);
    if (themeToggle) {
      themeToggle.textContent = chrome ? "🌙" : "☀️";
      themeToggle.setAttribute("aria-label", chrome ? "Switch to neon dark theme" : "Switch to chrome light theme");
    }
    if (metaTheme) metaTheme.setAttribute("content", chrome ? "#e9f0fa" : "#03060d");
  }

  var savedTheme = "dark";
  try { savedTheme = localStorage.getItem(THEME_KEY) || "dark"; } catch (e) { savedTheme = "dark"; }
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = document.body.classList.contains("chrome") ? "dark" : "chrome";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  /* --------------------------------------------------------- MOBILE MENU */
  var menuToggle = $("#menuToggle");
  var navLinks = $("#navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.textContent = open ? "✕" : "☰";
    });

    $$("a", navLinks).forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
      });
    });

    document.addEventListener("click", function (e) {
      if (!navLinks.classList.contains("open")) return;
      if (navLinks.contains(e.target) || menuToggle.contains(e.target)) return;
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  }

  /* ------------------------------------------------- ACTIVE NAV (pages) */
  var path = window.location.pathname.split("/").pop() || "index.html";
  $$(".nav-links a[data-page]").forEach(function (a) {
    var target = a.getAttribute("href");
    if (target === path) a.classList.add("active");
  });

  /* ------------------------------------------------------- PARTICLES FX */
  var canvas = $("#particles");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  var particles = [];
  var rafId = null;
  var mouse = { x: -9999, y: -9999 };

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildParticles();
  }

  function buildParticles() {
    if (!canvas) return;
    var count = Math.min(110, Math.floor((window.innerWidth * window.innerHeight) / 14000));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.7,
        vx: (Math.random() - 0.5) * 0.34,
        vy: (Math.random() - 0.5) * 0.34,
        a: Math.random() * 0.45 + 0.16
      });
    }
  }

  function drawParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var chrome = document.body.classList.contains("chrome");
    var dot = chrome ? "12, 90, 190" : "120, 225, 255";
    var line = chrome ? "20, 90, 170" : "90, 190, 255";

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // gentle attraction to cursor
      var mdx = mouse.x - p.x;
      var mdy = mouse.y - p.y;
      var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 190 && mdist > 0.1) {
        p.x += (mdx / mdist) * 0.55;
        p.y += (mdy / mdist) * 0.55;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + dot + ", " + p.a + ")";
      ctx.fill();

      for (var j = i + 1; j < particles.length; j++) {
        var q = particles[j];
        var dx = p.x - q.x;
        var dy = p.y - q.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 128) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = "rgba(" + line + ", " + (0.13 * (1 - d / 128)) + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(drawParticles);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  if (ctx && !reduceMotion) drawParticles();

  /* ------------------------------------------------------ CURSOR GLOW */
  var spotlight = $("#spotlight");
  var pointerFine = window.matchMedia("(pointer: fine)").matches;

  if (pointerFine && spotlight && !reduceMotion) {
    var sx = window.innerWidth / 2;
    var sy = window.innerHeight / 2;
    var tx = sx;
    var ty = sy;

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      document.body.classList.add("has-pointer");
    }, { passive: true });

    (function follow() {
      sx += (tx - sx) * 0.12;
      sy += (ty - sy) * 0.12;
      spotlight.style.transform = "translate3d(" + sx + "px," + sy + "px,0)";
      requestAnimationFrame(follow);
    })();
  }

  /* ------------------------------------------- NAV STATE + PROGRESS BAR */
  var nav = $("#mainNav");
  var progress = $("#scrollProgress");
  var toTop = $("#toTop");

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var pct = h > 0 ? (y / h) * 100 : 0;

    if (progress) progress.style.width = pct + "%";
    if (nav) nav.classList.toggle("scrolled", y > 12);
    if (toTop) toTop.classList.toggle("show", y > 460);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ------------------------------------------------------------- REVEAL */
  var revealEls = $$(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
        el.style.transitionDelay = Math.min(siblings * 70, 420) + "ms";
        el.classList.add("in");
        revealObs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* -------------------------------------------------------- SKILL BARS */
  var fills = $$(".fill");

  function fillBar(el) {
    var w = el.getAttribute("data-width") || "0";
    el.style.width = w + "%";
  }

  if ("IntersectionObserver" in window && !reduceMotion && fills.length) {
    var fillObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          fillBar(entry.target);
          fillObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    fills.forEach(function (f) { fillObs.observe(f); });
  } else {
    fills.forEach(fillBar);
  }

  /* ---------------------------------------------------------- COUNTERS */
  var counters = $$("[data-count]");

  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }

    var dur = 1500;
    var start = performance.now();

    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window && counters.length) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          countObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { countObs.observe(c); });
  } else {
    counters.forEach(runCounter);
  }

  /* ------------------------------------------------------ TYPING EFFECT */
  var typed = $("#typedText");
  if (typed) {
    var phrases = ["PCMB science", "MHT-CET prep", "daily revision", "trying new exams"];
    var pi = 0, ci = 0, deleting = false;

    (function loop() {
      var word = phrases[pi];

      if (!deleting) {
        ci++;
        typed.textContent = word.slice(0, ci);
        if (ci === word.length) {
          deleting = true;
          return setTimeout(loop, 1600);
        }
      } else {
        ci--;
        typed.textContent = word.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
        }
      }
      setTimeout(loop, deleting ? 38 : 78);
    })();
  }

  /* ------------------------------------------------------------- FAQ */
  $$(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      if (!item) return;
      var wasOpen = item.classList.contains("open");
      $$(".faq-item.open").forEach(function (o) { o.classList.remove("open"); });
      if (!wasOpen) item.classList.add("open");
    });
  });

  /* --------------------------------------------------------- TILT CARDS */
  if (pointerFine && !reduceMotion) {
    $$(".tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var rx = (0.5 - py) * 9;
        var ry = (px - 0.5) * 9;
        card.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
        card.style.setProperty("--mx", (px * 100) + "%");
        card.style.setProperty("--my", (py * 100) + "%");
      });

      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ------------------------------------------- CARD SPOTLIGHT (all cards) */
  if (pointerFine && !reduceMotion) {
    $$(".card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 100) + "%");
        card.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 100) + "%");
      });
    });
  }

  /* ------------------------------------------------------------- RIPPLE */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".btn, .f-link, .filter, .linkedin-btn") : null;
    if (!btn || reduceMotion) return;

    var r = btn.getBoundingClientRect();
    var size = Math.max(r.width, r.height);
    var span = document.createElement("span");
    span.className = "ripple";
    span.style.width = span.style.height = size + "px";
    span.style.left = (e.clientX - r.left - size / 2) + "px";
    span.style.top = (e.clientY - r.top - size / 2) + "px";

    if (getComputedStyle(btn).position === "static") btn.style.position = "relative";
    btn.appendChild(span);
    setTimeout(function () { if (span.parentNode) span.parentNode.removeChild(span); }, 700);
  });

  /* ------------------------------------------------------------ MARQUEE */
  var track = $("#marqueeTrack");
  if (track) {
    track.innerHTML = track.innerHTML + track.innerHTML;
  }

  /* ------------------------------------------------------------- FILTERS */
  var filters = $$(".filter");
  var grid = $("#projectGrid");

  if (filters.length && grid) {
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filters.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");

        var cat = btn.getAttribute("data-filter");
        $$(".project", grid).forEach(function (card, i) {
          var cats = (card.getAttribute("data-cat") || "").split(" ");
          var show = cat === "all" || cats.indexOf(cat) !== -1;

          if (show) {
            card.classList.remove("hide");
            card.style.animation = "none";
            void card.offsetWidth;
            card.style.animation = "filterIn 0.5s cubic-bezier(0.22,1,0.36,1) both";
            card.style.animationDelay = (i * 45) + "ms";
          } else {
            card.classList.add("hide");
          }
        });
      });
    });
  }

  /* -------------------------------------------------------- CONTACT FORM */
  var form = $("#contactForm");
  var status = $("#formStatus");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = $("#name");
      var email = $("#email");
      var subject = $("#subject");
      var message = $("#message");
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email.value || "").trim());

      if (!name.value.trim() || !message.value.trim() || !emailOk) {
        if (status) {
          status.classList.add("err");
          status.textContent = "Please add your name, a valid email and a message.";
        }
        return;
      }

      var subj = subject.value.trim() || ("Portfolio enquiry from " + name.value.trim());
      var body =
        "Name: " + name.value.trim() + "\n" +
        "Email: " + email.value.trim() + "\n\n" +
        message.value.trim();

      if (status) {
        status.classList.remove("err");
        status.textContent = "Opening your mail app…";
      }

      window.location.href =
        "mailto:naitikwarjurkar08@gmail.com" +
        "?subject=" + encodeURIComponent(subj) +
        "&body=" + encodeURIComponent(body);

      form.reset();
      setTimeout(function () { if (status) status.textContent = ""; }, 4500);
    });
  }

  /* ------------------------------------------------------------ COPY LINK */
  var copyBtn = $("#copyLink");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var url = window.location.href;
      var done = function () {
        copyBtn.textContent = "Copied!";
        setTimeout(function () { copyBtn.textContent = "Copy Link"; }, 1700);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function () { fallback(url, done); });
      } else {
        fallback(url, done);
      }
    });
  }

  function fallback(text, done) {
    var input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(input);
    done();
  }

  /* ---------------------------------------------------- PAGE TRANSITION */
  if (!reduceMotion) {
    $$('a[href]').forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var isInternal = href.indexOf(".html") !== -1 && href.indexOf("http") === -1 && !a.target;
      if (!isInternal) return;

      a.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        document.body.classList.add("leaving");
        setTimeout(function () { window.location.href = href; }, 280);
      });
    });
  }

  /* ------------------------------------------------ PAUSE WHEN HIDDEN */
  document.addEventListener("visibilitychange", function () {
    if (!ctx) return;
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
    } else if (!reduceMotion) {
      rafId = requestAnimationFrame(drawParticles);
    }
  });

})();
