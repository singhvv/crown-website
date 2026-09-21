/* ===========================================================
   Crown Collision
   Animation and behaviour. Built on anime.js v4.
   =========================================================== */
(function () {
  "use strict";

  var A = window.anime || {};
  var animate = A.animate;
  var stagger = A.stagger;
  var createTimeline = A.createTimeline;
  var svg = A.svg;

  var CFG = window.CROWN_CONFIG || {};
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* -------------------------------------------------------
     Intro
     ------------------------------------------------------- */
  function runIntro(done) {
    var intro = $("#intro");
    if (!intro || REDUCED || !animate) {
      if (intro) intro.classList.add("is-gone");
      done();
      return;
    }

    var tl = createTimeline({ defaults: { ease: "outQuad" } });

    if (svg && svg.createDrawable) {
      tl.add(svg.createDrawable("#introCrown1, #introCrown2"), {
        draw: ["0 0", "0 1"],
        duration: 700,
        delay: stagger(110)
      }, 0);
    }

    tl.add("#intro .intro__bar i", { width: ["0%", "100%"], duration: 620 }, 180)
      .add("#intro", {
        opacity: [1, 0],
        duration: 480,
        ease: "inQuad",
        onComplete: function () { intro.classList.add("is-gone"); done(); }
      }, "+=120");
  }

  /* -------------------------------------------------------
     Hero
     ------------------------------------------------------- */
  var heroShown = false;

  function showHeroNow() {
    heroShown = true;
    $$(".hero__h1 .line > span").forEach(function (l) { l.style.transform = "none"; });
    $$(".hero .reveal-up").forEach(function (e) {
      e.style.opacity = 1;
      e.style.transform = "none";
    });
  }

  function runHero() {
    if (heroShown) return;
    heroShown = true;
    var lines = $$(".hero__h1 .line > span");

    if (REDUCED || !animate) {
      showHeroNow();
      return;
    }

    var tl = createTimeline();

    tl.add(lines, {
      y: ["105%", "0%"],
      duration: 1100,
      ease: "out(4)",
      delay: stagger(110)
    }, 0);

    tl.add(".hero .reveal-up", {
      opacity: [0, 1],
      y: [26, 0],
      duration: 880,
      ease: "out(3)",
      delay: stagger(95)
    }, 260);
  }

  /* -------------------------------------------------------
     Scroll reveals
     ------------------------------------------------------- */
  function initReveals() {
    var items = $$(".reveal-up").filter(function (el) { return !el.closest(".hero"); });

    if (REDUCED || !animate || !("IntersectionObserver" in window)) {
      items.forEach(function (e) { e.style.opacity = 1; e.style.transform = "none"; });
      return;
    }

    var queue = [];
    var flushing = false;

    function flush() {
      if (!queue.length) { flushing = false; return; }
      var batch = queue.splice(0, queue.length);
      animate(batch, {
        opacity: [0, 1],
        y: [26, 0],
        duration: 820,
        ease: "out(3)",
        delay: stagger(75)
      });
      flushing = false;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        queue.push(en.target);
        if (!flushing) { flushing = true; requestAnimationFrame(flush); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------------
     Counters
     ------------------------------------------------------- */
  function initCounters() {
    var nums = $$(".num");
    if (!nums.length) return;

    function paint(el, value) {
      var suffix = el.getAttribute("data-suffix") || "";
      el.textContent = Math.round(value).toLocaleString("en-CA") + suffix;
    }

    if (REDUCED || !animate || !("IntersectionObserver" in window)) {
      nums.forEach(function (el) { paint(el, parseFloat(el.getAttribute("data-count")) || 0); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target;
        var target = parseFloat(el.getAttribute("data-count")) || 0;
        var box = { v: 0 };
        animate(box, {
          v: target,
          duration: 1700,
          ease: "out(4)",
          onUpdate: function () { paint(el, box.v); },
          onComplete: function () { paint(el, target); }
        });
      });
    }, { threshold: 0.5 });

    nums.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------------
     Marquee
     ------------------------------------------------------- */
  function initMarquee() {
    var track = $("#marqueeTrack");
    if (!track) return;

    track.innerHTML += track.innerHTML;

    if (REDUCED || !animate) return;
    animate(track, {
      x: ["0%", "-50%"],
      duration: 26000,
      ease: "linear",
      loop: true
    });
  }

  /* -------------------------------------------------------
     Process rail, drawn as you scroll
     ------------------------------------------------------- */
  function initRail() {
    var rail = $("#railDraw");
    var wrapEl = $("#steps");
    if (!rail || !wrapEl) return;

    var len = 1000;
    rail.style.strokeDasharray = len;
    rail.style.strokeDashoffset = REDUCED ? 0 : len;
    if (REDUCED) return;

    var ticking = false;
    function update() {
      ticking = false;
      var r = wrapEl.getBoundingClientRect();
      var vh = window.innerHeight;
      var span = r.height + vh * 0.5;
      var p = (vh * 0.75 - r.top) / span;
      p = Math.max(0, Math.min(1, p));
      rail.style.strokeDashoffset = String(len - len * p);
    }
    function onScrollEvt() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    window.addEventListener("scroll", onScrollEvt, { passive: true });
    window.addEventListener("resize", onScrollEvt, { passive: true });
    update();
  }

  /* -------------------------------------------------------
     Header, progress bar, mobile menu
     ------------------------------------------------------- */
  function initHeader() {
    var hdr = $("#hdr");
    var bar = $("#scrollProgress");
    var nav = $("#nav");
    var burger = $("#burger");
    var last = 0;
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
      if (!hdr) return;

      hdr.classList.toggle("is-stuck", y > 40);
      var open = nav && nav.classList.contains("is-open");
      hdr.classList.toggle("is-hidden", y > 480 && y > last && !open);
      last = y;
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();

    if (burger && nav) {
      burger.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", String(open));
        burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
      $$("a", nav).forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
          burger.setAttribute("aria-label", "Open menu");
        });
      });
    }
  }

  /* -------------------------------------------------------
     Anchor scrolling that clears the fixed header
     ------------------------------------------------------- */
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var hdr = $("#hdr");
      var offset = (hdr ? hdr.getBoundingClientRect().height : 80) + 16;
      var top = t.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: REDUCED ? "auto" : "smooth" });
      if (history.replaceState) history.replaceState(null, "", id);
    });
  }

  /* -------------------------------------------------------
     Magnetic buttons
     ------------------------------------------------------- */
  function initMagnetic() {
    if (REDUCED || !animate) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    $$(".magnetic").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.34;
        animate(el, { x: dx, y: dy, duration: 420, ease: "out(3)" });
      });
      el.addEventListener("pointerleave", function () {
        animate(el, { x: 0, y: 0, duration: 700, ease: "outElastic(1, .5)" });
      });
    });
  }

  /* -------------------------------------------------------
     Before / after slider
     ------------------------------------------------------- */
  function initBeforeAfter() {
    var root = $("#ba");
    var clip = $("#baClip");
    var handle = $("#baHandle");
    if (!root || !clip || !handle) return;

    var pct = 50;
    var dragging = false;

    function apply(p) {
      pct = Math.max(0, Math.min(100, p));
      clip.style.clipPath = "inset(0 " + (100 - pct) + "% 0 0)";
      handle.style.left = pct + "%";
      handle.setAttribute("aria-valuenow", String(Math.round(pct)));
    }

    function fromEvent(e) {
      var r = root.getBoundingClientRect();
      apply(((e.clientX - r.left) / r.width) * 100);
    }

    root.addEventListener("pointerdown", function (e) {
      dragging = true;
      root.setPointerCapture(e.pointerId);
      fromEvent(e);
    });
    root.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    root.addEventListener("pointerup", function (e) {
      dragging = false;
      if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
    });
    root.addEventListener("pointercancel", function () { dragging = false; });

    handle.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 10 : 3;
      if (e.key === "ArrowLeft") { apply(pct - step); e.preventDefault(); }
      if (e.key === "ArrowRight") { apply(pct + step); e.preventDefault(); }
      if (e.key === "Home") { apply(0); e.preventDefault(); }
      if (e.key === "End") { apply(100); e.preventDefault(); }
    });

    apply(50);

    if (REDUCED || !animate || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var box = { v: 82 };
        apply(82);
        animate(box, {
          v: 50,
          duration: 1500,
          delay: 260,
          ease: "inOut(3)",
          onUpdate: function () { if (!dragging) apply(box.v); }
        });
      });
    }, { threshold: 0.4 });
    io.observe(root);
  }

  /* -------------------------------------------------------
     Booking form
     ------------------------------------------------------- */
  function initForm() {
    var form = $("#bookForm");
    if (!form) return;

    var status = $("#formStatus");
    var btn = $("#submitBtn");
    var insure = $("#insureFields");
    var openedAt = Date.now();

    /* Show insurer fields only when the job is a claim. */
    $$('input[name="job_type"]', form).forEach(function (r) {
      r.addEventListener("change", function () {
        var show = r.checked && r.value === "Insurance claim";
        if (insure) insure.hidden = !show;
      });
    });

    function say(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = "form__status" + (kind ? " " + kind : "");
    }

    function markInvalid(field, bad) {
      if (!field) return;
      if (bad) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    }

    function validate() {
      var bad = [];
      ["name", "phone"].forEach(function (n) {
        var f = form.elements[n];
        var ok = f && String(f.value).trim().length > 1;
        markInvalid(f, !ok);
        if (!ok) bad.push(f);
      });

      var email = form.elements.email;
      if (email && email.value.trim()) {
        var okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
        markInvalid(email, !okMail);
        if (!okMail) bad.push(email);
      } else {
        markInvalid(email, false);
      }

      var typed = $$('input[name="job_type"]', form).some(function (r) { return r.checked; });
      if (!typed) bad.push($('input[name="job_type"]', form));

      return bad;
    }

    function shake(el) {
      if (!el || REDUCED || !animate) return;
      animate(el, { x: [0, -7, 6, -4, 0], duration: 380, ease: "inOut(2)" });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      /* Spam traps: hidden field filled, or submitted impossibly fast. */
      if (form.elements.company && form.elements.company.value) return;
      if (Date.now() - openedAt < 2500) {
        say("Take a moment to fill this in properly.", "err");
        return;
      }

      var bad = validate();
      if (bad.length) {
        say("Please check the highlighted fields.", "err");
        shake(bad[0] && bad[0].closest ? bad[0].closest(".f") : null);
        if (bad[0] && bad[0].focus) bad[0].focus();
        return;
      }

      var data = {};
      new FormData(form).forEach(function (v, k) {
        if (k !== "company") data[k] = typeof v === "string" ? v.trim() : v;
      });
      data.page_url = location.href;
      data.submitted_at = new Date().toISOString();

      var endpoint = CFG.formEndpoint || "";

      btn.classList.add("is-busy");
      say("Sending.", "");

      /* No endpoint configured yet: validate only, send nothing. */
      if (!endpoint) {
        setTimeout(function () {
          btn.classList.remove("is-busy");
          say("Demo mode. Add your Google Script URL in assets/js/config.js to start receiving these.", "ok");
        }, 550);
        return;
      }

      function succeed() {
        btn.classList.remove("is-busy");
        form.reset();
        if (insure) insure.hidden = true;
        openedAt = Date.now();
        say(CFG.successMessage || "Thanks. We will be in touch.", "ok");
        if (!REDUCED && animate) {
          animate(form, { scale: [1, 1.012, 1], duration: 520, ease: "out(3)" });
        }
      }

      /* text/plain keeps this a simple request, so the browser
         does not send a CORS preflight that Apps Script cannot answer. */
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().catch(function () { return { result: "ok" }; }); })
        .then(function (res) {
          if (res && res.result === "error") throw new Error(res.message || "rejected");
          succeed();
        })
        .catch(function () {
          /* Some networks block reading the response even though the
             request lands. Retry opaquely so the lead is not lost. */
          fetch(endpoint, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(data)
          })
            .then(succeed)
            .catch(function () {
              btn.classList.remove("is-busy");
              say(CFG.errorMessage || "That did not go through. Please call the shop.", "err");
            });
        });
    });

    form.addEventListener("input", function (e) {
      if (e.target && e.target.hasAttribute("aria-invalid")) markInvalid(e.target, false);
    });
  }

  /* -------------------------------------------------------
     Swap in whatever config.js points at.

     The placeholder paths stay in index.html so the page still
     shows something with JavaScript off. Anything named in
     config.images overrides them here, which means the shop can
     change every picture from one file without touching markup.
     ------------------------------------------------------- */
  function applyConfigMedia() {
    var imgs = CFG.images || {};

    $$("[data-img]").forEach(function (el) {
      var entry = imgs[el.getAttribute("data-img")];
      if (!entry) return;

      var src = typeof entry === "string" ? entry : entry.src;
      var alt = typeof entry === "string" ? null : entry.alt;

      if (src) {
        if (el.tagName === "VIDEO") el.setAttribute("poster", src);
        else el.setAttribute("src", src);
      }
      if (alt !== null && alt !== undefined && el.tagName === "IMG") {
        el.setAttribute("alt", alt);
      }
    });

    var video = $("#heroVideo");
    var source = $("#heroSource");
    if (!video || !source) return;

    /* An empty video path means the shop wants the poster only. */
    if (CFG.video === "") {
      video.removeAttribute("autoplay");
      source.removeAttribute("src");
      video.load();
    } else if (CFG.video && CFG.video !== source.getAttribute("src")) {
      source.setAttribute("src", CFG.video);
      video.load();
    }
  }

  /* -------------------------------------------------------
     Odds and ends
     ------------------------------------------------------- */
  function initMisc() {
    var yr = $("#yr");
    if (yr) yr.textContent = String(new Date().getFullYear());

    /* A video element keeps showing its poster when the source
       fails, so a missing hero.mp4 still looks intentional. Do not
       hide the element on error: that hides the poster with it. */
    var v = $("#heroVideo");
    if (v) {
      var play = v.play();
      if (play && play.catch) play.catch(function () {});
    }
  }

  /* -------------------------------------------------------
     Boot
     ------------------------------------------------------- */
  function boot() {
    document.body.classList.add("is-ready");
    applyConfigMedia();
    initHeader();
    initAnchors();
    initReveals();
    initCounters();
    initMarquee();
    initRail();
    initMagnetic();
    initBeforeAfter();
    initForm();
    initMisc();
    runIntro(runHero);

    /* If the intro never finishes, for instance because the tab was
       opened in the background and frames were never drawn, the hero
       must not stay invisible. Force it after a beat. */
    setTimeout(function () {
      var intro = $("#intro");
      if (intro) intro.classList.add("is-gone");
      if (!heroShown) showHeroNow();
    }, 4500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
