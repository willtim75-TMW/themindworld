/**
 * The Mind World — site interactions
 * Mobile nav, scroll state, form feedback, reveal animations
 */
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const brandLogo = document.getElementById("brand-logo");
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const form = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const yearEl = document.getElementById("year");

  /* Footer year */
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Header logo: original full logos (rotate desktop; static full mark on mobile).
     Footer keeps the cropped text logo (assets/themindworldtxt.jpg). */
  const logoMobileOnly = "assets/allwithcircutiry.png";
  const logoFrames = [
    "assets/themindworldtxt-full.jpg",
    "assets/ringandtxt.jpg",
    "assets/allwithcircutiry.png",
  ];
  const logoIntervalMs = 3500;
  const logoFadeMs = 600;
  const logoDesktopQuery = window.matchMedia("(min-width: 721px)");
  let logoIndex = 0;
  let logoTimer = null;
  let logoFadeTimer = null;
  let logoPreloaded = false;

  function clearLogoTimers() {
    if (logoTimer) {
      window.clearInterval(logoTimer);
      logoTimer = null;
    }
    if (logoFadeTimer) {
      window.clearTimeout(logoFadeTimer);
      logoFadeTimer = null;
    }
    if (brandLogo) {
      brandLogo.classList.remove("is-fading");
    }
  }

  function preloadDesktopLogos() {
    if (logoPreloaded) return;
    logoPreloaded = true;
    logoFrames.forEach(function (src) {
      if (src === logoMobileOnly) return;
      const img = new Image();
      img.src = src;
    });
  }

  function startDesktopLogoRotation() {
    if (!brandLogo || logoFrames.length < 2) return;
    clearLogoTimers();
    preloadDesktopLogos();
    logoIndex = 0;
    brandLogo.src = logoFrames[logoIndex];

    logoTimer = window.setInterval(function () {
      brandLogo.classList.add("is-fading");

      logoFadeTimer = window.setTimeout(function () {
        logoIndex = (logoIndex + 1) % logoFrames.length;
        brandLogo.src = logoFrames[logoIndex];
        brandLogo.classList.remove("is-fading");
        logoFadeTimer = null;
      }, logoFadeMs);
    }, logoIntervalMs);
  }

  function setMobileLogoStatic() {
    if (!brandLogo) return;
    clearLogoTimers();
    brandLogo.src = logoMobileOnly;
  }

  function applyLogoMode() {
    if (!brandLogo) return;
    if (logoDesktopQuery.matches) {
      startDesktopLogoRotation();
    } else {
      setMobileLogoStatic();
    }
  }

  applyLogoMode();

  if (typeof logoDesktopQuery.addEventListener === "function") {
    logoDesktopQuery.addEventListener("change", applyLogoMode);
  } else if (typeof logoDesktopQuery.addListener === "function") {
    logoDesktopQuery.addListener(applyLogoMode);
  }

  /* Result rings (image + statement): desktop uses fixed .site-rings on every
     page (one at a time, shuffled cycles). Mobile uses hero-flow rings (all
     visible). Timing matches the logo rotation. */
  let resultRings = [];
  let ringRevealTimer = null;
  let ringCycleOrder = [];
  let ringCycleIndex = 0;
  let activeRing = null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function getRingElements() {
    /* Desktop: site-wide fixed rings. Mobile: hero-embedded rings. */
    const selector = logoDesktopQuery.matches
      ? ".site-rings .result-ring"
      : ".hero-rings .result-ring";
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function shuffleList(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function clearRingRevealTimer() {
    if (ringRevealTimer) {
      window.clearTimeout(ringRevealTimer);
      ringRevealTimer = null;
    }
  }

  function hideAllRings() {
    resultRings.forEach(function (el) {
      el.classList.remove("is-visible");
    });
    activeRing = null;
  }

  function showAllRings() {
    clearRingRevealTimer();
    resultRings.forEach(function (el) {
      el.classList.add("is-visible");
    });
    activeRing = null;
  }

  function nextRingInCycle() {
    if (!ringCycleOrder.length || ringCycleIndex >= ringCycleOrder.length) {
      ringCycleOrder = shuffleList(resultRings);
      ringCycleIndex = 0;
    }
    const ring = ringCycleOrder[ringCycleIndex];
    ringCycleIndex += 1;
    return ring;
  }

  function startDesktopRingReveal() {
    resultRings = getRingElements();
    if (!resultRings.length) return;
    clearRingRevealTimer();

    if (prefersReducedMotion.matches) {
      showAllRings();
      return;
    }

    hideAllRings();
    ringCycleOrder = shuffleList(resultRings);
    ringCycleIndex = 0;

    function showNextRing() {
      /* Fade out the currently visible ring (only one at a time) */
      if (activeRing) {
        activeRing.classList.remove("is-visible");
      }

      /* After fade-out completes, fade in the next ring in this cycle */
      ringRevealTimer = window.setTimeout(function () {
        const ring = nextRingInCycle();
        activeRing = ring;
        ring.classList.add("is-visible");

        /* Hold for the logo interval, then advance */
        ringRevealTimer = window.setTimeout(showNextRing, logoIntervalMs);
      }, activeRing ? logoFadeMs : 0);
    }

    /* First ring appears on the same cadence as the logo’s first swap */
    ringRevealTimer = window.setTimeout(showNextRing, logoIntervalMs);
  }

  function applyRingRevealMode() {
    clearRingRevealTimer();
    activeRing = null;
    /* Clear visibility on both sets when switching modes */
    document.querySelectorAll(".result-ring").forEach(function (el) {
      el.classList.remove("is-visible");
    });

    resultRings = getRingElements();

    if (logoDesktopQuery.matches) {
      startDesktopRingReveal();
    } else {
      /* Mobile: always show hero rings (CSS does not hide them) */
      showAllRings();
    }
  }

  applyRingRevealMode();

  if (typeof logoDesktopQuery.addEventListener === "function") {
    logoDesktopQuery.addEventListener("change", applyRingRevealMode);
  } else if (typeof logoDesktopQuery.addListener === "function") {
    logoDesktopQuery.addListener(applyRingRevealMode);
  }

  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", applyRingRevealMode);
  } else if (typeof prefersReducedMotion.addListener === "function") {
    prefersReducedMotion.addListener(applyRingRevealMode);
  }

  /* Header scroll state */
  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* Mobile navigation */
  function setNavOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNavOpen(false);
    });

    window.addEventListener(
      "resize",
      function () {
        if (window.innerWidth > 720) setNavOpen(false);
      },
      { passive: true }
    );
  }

  /* Services brain (desktop hover / keyboard) */
  const servicesBrain = document.querySelector("[data-services-brain]");
  if (servicesBrain) {
    const serviceData = {
      ai: {
        title: "AI",
        desc:
          "Bring Fortune 1000-level AI to your local business—without needing to be technical. We create custom agents, chatbots, assistants, and productivity tools using frontier models and secure local LLMs. Handle customer questions, draft content, analyze data, and automate busywork so you focus on your business growth.",
      },
      automations: {
        title: "Automations",
        desc:
          "Bring enterprise workflow automation to your local business. We set up software tools, CRM, sales & marketing, invoicing, and bookkeeping automations that eliminate repetitive busywork and time-consuming tasks so you can focus on your customers.",
      },
      web: {
        title: "Web Development",
        desc:
          "Clean, fast websites with clear messaging and structure. Optimized for search engines and AI LLMs so local customers can easily find you online and you can focus on helping them.",
      },
      marketing: {
        title: "Marketing",
        desc:
          "Lead generation, online & social marketing strategies tailored for local businesses. Capture, nurture, and re-engage customers with better branding and steady presence—measurable results so you can focus on the work.",
      },
      consulting: {
        title: "Consulting",
        desc:
          "Clear guidance on tools, systems, and growth priorities—enterprise-level thinking explained simply. If you don’t see exactly what you need, let us know and we’ll create custom consulting to fit. We handle the hows so you can focus on the whys.",
      },
    };

    const segments = servicesBrain.querySelectorAll(".brain-segment");
    const labels = servicesBrain.querySelectorAll(".brain-label");
    const panel = servicesBrain.querySelector("[data-service-panel]");
    const panelBody = panel ? panel.querySelector(".service-panel-body") : null;
    const panelTitle = panel ? panel.querySelector(".service-panel-title") : null;
    const panelDesc = panel ? panel.querySelector(".service-panel-desc") : null;
    let lockedKey = "ai";
    let hoverKey = null;

    function displayKey() {
      return hoverKey || lockedKey;
    }

    function updateUI() {
      const key = displayKey();

      segments.forEach(function (seg) {
        const k = seg.getAttribute("data-service");
        seg.classList.toggle("is-active", k === lockedKey);
        seg.classList.toggle("is-hover", hoverKey !== null && k === hoverKey);
      });
      labels.forEach(function (label) {
        const k = label.getAttribute("data-service");
        label.classList.toggle("is-active", k === lockedKey);
        label.classList.toggle("is-hover", hoverKey !== null && k === hoverKey);
      });

      const data = key ? serviceData[key] : null;
      if (!panel || !panelBody || !panelTitle || !panelDesc) return;

      if (data) {
        panelTitle.textContent = data.title;
        panelDesc.textContent = data.desc;
        panelBody.hidden = false;
        panel.classList.add("is-open");
      }
    }

    function lockKey(key) {
      lockedKey = key;
      updateUI();
    }

    function setHover(key) {
      hoverKey = key;
      updateUI();
    }

    segments.forEach(function (seg) {
      const key = seg.getAttribute("data-service");

      seg.addEventListener("mouseenter", function () {
        setHover(key);
      });

      seg.addEventListener("mouseleave", function () {
        setHover(null);
      });

      /* Click locks the panel until another segment is selected */
      seg.addEventListener("click", function () {
        lockKey(key);
      });

      seg.addEventListener("focus", function () {
        setHover(key);
      });

      seg.addEventListener("blur", function () {
        setHover(null);
      });

      seg.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          lockKey(key);
        }
      });
    });

    labels.forEach(function (label) {
      const key = label.getAttribute("data-service");

      label.addEventListener("mouseenter", function () {
        setHover(key);
      });

      label.addEventListener("mouseleave", function () {
        setHover(null);
      });

      label.addEventListener("click", function () {
        lockKey(key);
      });
    });

    /* Default to AI offering on load */
    updateUI();
  }

  /* Scroll reveal */
  const revealTargets = document.querySelectorAll(
    ".value-item, .services-brain, .service-list-item, .about-visual, .about-copy, .case-card, .contact-copy, .contact-form, .section-header"
  );

  revealTargets.forEach(function (el) {
    el.classList.add("reveal");
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /*
   * Contact form → email via Google Apps Script (no live business site needed)
   *
   * ONE-TIME SETUP (~3 minutes) while logged into willtim75@gmail.com:
   *
   * 1. Open https://script.google.com → New project
   * 2. Delete any sample code and paste everything from
   *    js/contact-mail.gs (in this project)
   * 3. Click Deploy → New deployment
   *    - Type: Web app
   *    - Execute as: Me
   *    - Who has access: Anyone
   * 4. Deploy → Authorize with Google → Allow
   * 5. Copy the Web app URL and paste it into GOOGLE_SCRIPT_URL below
   *
   * When Google Workspace is ready, open the same script and change
   * CONTACT_TO in contact-mail.gs, then Deploy → Manage deployments → Edit → New version.
   */
  const CONTACT_EMAIL = "willtim75@gmail.com";
  const CONTACT_SUBJECT = "The Mind World Request";
  /* Paste your Google Apps Script web app URL here after deploying: */
  const GOOGLE_SCRIPT_URL = "";
  const contactSubmit = document.getElementById("contact-submit");

  if (form && formStatus) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      formStatus.classList.remove("is-success", "is-error");

      const name = form.elements.namedItem("name");
      const email = form.elements.namedItem("email");
      const business = form.elements.namedItem("business");
      const message = form.elements.namedItem("message");

      const nameVal = name && "value" in name ? String(name.value).trim() : "";
      const emailVal = email && "value" in email ? String(email.value).trim() : "";
      const businessVal =
        business && "value" in business ? String(business.value).trim() : "";
      const messageVal = message && "value" in message ? String(message.value).trim() : "";

      if (!nameVal || !emailVal || !messageVal) {
        formStatus.textContent = "Please fill in name, email, and message.";
        formStatus.classList.add("is-error");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        formStatus.textContent = "Please enter a valid email address.";
        formStatus.classList.add("is-error");
        return;
      }

      const bodyLines = [
        "The Mind World — new website request",
        "",
        "Name: " + nameVal,
        "Email: " + emailVal,
        "Business: " + (businessVal || "(not provided)"),
        "",
        "Message:",
        messageVal,
      ];
      const bodyText = bodyLines.join("\n");

      function openMailtoFallback(reason) {
        const mailto =
          "mailto:" +
          encodeURIComponent(CONTACT_EMAIL) +
          "?subject=" +
          encodeURIComponent(CONTACT_SUBJECT) +
          "&body=" +
          encodeURIComponent(bodyText);
        formStatus.textContent =
          reason ||
          "Could not send automatically. Opening your email app as a backup…";
        formStatus.classList.add("is-error");
        window.location.href = mailto;
      }

      if (!GOOGLE_SCRIPT_URL) {
        openMailtoFallback(
          "Contact form is not connected yet (add GOOGLE_SCRIPT_URL in js/main.js after deploying the Google Apps Script). Opening your email app…"
        );
        return;
      }

      if (contactSubmit) {
        contactSubmit.disabled = true;
        contactSubmit.textContent = "Sending…";
      }
      formStatus.textContent = "Sending your message…";

      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          subject: CONTACT_SUBJECT,
          name: nameVal,
          email: emailVal,
          business: businessVal || "(not provided)",
          message: messageVal,
          details: bodyText,
        }),
      })
        .then(function () {
          /*
           * no-cors cannot read the response, but a successful network send
           * means Apps Script received the payload and will email you.
           */
          formStatus.textContent =
            "Thank you. Your message was sent — we’ll be in touch soon.";
          formStatus.classList.add("is-success");
          form.reset();
        })
        .catch(function () {
          openMailtoFallback(
            "We couldn’t send automatically. Opening your email app as a backup…"
          );
        })
        .finally(function () {
          if (contactSubmit) {
            contactSubmit.disabled = false;
            contactSubmit.textContent = "Send message";
          }
        });
    });
  }
})();
