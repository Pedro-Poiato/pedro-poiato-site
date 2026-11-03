/* ==========================================================
   Pedro Poiato — Soluções Digitais · V2
   JavaScript puro. Animações respeitam prefers-reduced-motion
   e são desativadas em dispositivos sem hover fino.
   ========================================================== */
(function () {
  "use strict";

  var CONFIG = window.SITE_CONFIG || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Ano automático ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- WhatsApp: um único ponto de verdade (config.js) ---------- */
  var waNumber = String(CONFIG.whatsappNumber || "").replace(/\D+/g, "");
  if (waNumber.length >= 10) {
    var waUrl = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(CONFIG.whatsappMessage || "");
    $$("[data-whatsapp-link], .whatsapp-fab").forEach(function (a) {
      a.setAttribute("href", waUrl);
    });
  }

  /* ---------- Copiar e-mail ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
    }
    try {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return Promise.resolve(ok);
    } catch (e) { return Promise.resolve(false); }
  }

  $$("[data-copy]").forEach(function (btn) {
    var status = $("[data-copy-status]", btn);
    var timer;
    btn.addEventListener("click", function () {
      copyText(btn.getAttribute("data-copy")).then(function (ok) {
        if (status) status.textContent = ok ? "Copiado!" : "Não foi possível copiar";
        btn.classList.toggle("is-copied", ok);
        clearTimeout(timer);
        timer = setTimeout(function () {
          if (status) status.textContent = "Copiar";
          btn.classList.remove("is-copied");
        }, 2200);
      });
    });
  });

  /* ---------- Cabeçalho: estado ao rolar + barra de progresso ---------- */
  var header = $(".site-header");
  var progress = $(".scroll-progress");
  var heroBg = $(".hero-bg");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle("is-scrolled", y > 24);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    if (heroBg && !reduceMotion.matches && y < window.innerHeight * 1.2) {
      heroBg.style.transform = "translate3d(0," + (y * 0.25).toFixed(1) + "px,0)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var toggle = $(".menu-toggle");
  var mobileNav = $("#mobile-nav");

  function setMenu(open) {
    mobileNav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () {
    setMenu(!mobileNav.classList.contains("is-open"));
  });
  $$("a", mobileNav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileNav.classList.contains("is-open")) {
      setMenu(false); toggle.focus();
    }
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", function (e) {
    if (e.matches) setMenu(false);
  });

  /* ---------- Links internos com scroll suave e foco ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      var target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      history.replaceState(null, "", "#" + id);
    });
  });

  /* ---------- Navegação ativa (Intersection Observer) ---------- */
  var navLinks = $$("[data-nav]");
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Entrada do hero ---------- */
  var hero = $(".hero");
  function startHero() {
    requestAnimationFrame(function () {
      hero.classList.add("is-ready");
      $$(".hero .reveal").forEach(function (el) { el.classList.add("is-visible"); });
    });
  }
  if (reduceMotion.matches) { hero.classList.add("is-ready"); }
  else if (document.readyState === "complete") { startHero(); }
  else { window.addEventListener("load", startHero); }

  /* ---------- Reveal ao rolar (IntersectionObserver) ---------- */
  // Escalonamento: cada filho de .stagger recebe um atraso crescente.
  $$(".stagger").forEach(function (group) {
    $$(":scope > .reveal", group).forEach(function (el, i) {
      el.style.setProperty("--d", (i * 110) + "ms");
    });
  });

  var revealEls = $$(".reveal").filter(function (el) { return !el.closest(".hero"); });

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Prévias: fallback elegante se a imagem ainda não existir ---------- */
  var FALLBACK_TEXT = {
    gestao: "Poiato Gestão",
    crm: "Poiato CRM",
    garantias: "Poiato Garantias"
  };

  $$("img[data-fallback]").forEach(function (img) {
    var view = img.parentElement;
    var key = img.getAttribute("data-fallback");
    function showFallback() {
      if (view.classList.contains("is-fallback")) return;
      var box = document.createElement("div");
      box.className = "preview-fallback";
      box.setAttribute("aria-hidden", "true");
      box.innerHTML =
        '<span class="material-symbols-outlined">desktop_windows</span>' +
        "<strong>" + FALLBACK_TEXT[key] + "</strong>" +
        "<span>Prévia da demonstração</span>";
      view.appendChild(box);
      view.classList.add("is-fallback");
    }
    img.addEventListener("error", showFallback);
    if (img.complete && img.naturalWidth === 0) showFallback();
  });

  /* ---------- Efeitos de ponteiro (somente com mouse/trackpad) ---------- */
  if (canHover.matches && !reduceMotion.matches) {
    document.body.classList.add("has-cursor");

    /* Cursor glow */
    var glow = $(".cursor-glow");
    var gx = 0, gy = 0, tx = 0, ty = 0, glowRaf = null;
    function glowLoop() {
      gx += (tx - gx) * 0.15;
      gy += (ty - gy) * 0.15;
      glow.style.transform = "translate3d(" + gx.toFixed(1) + "px," + gy.toFixed(1) + "px,0)";
      if (Math.abs(tx - gx) > 0.3 || Math.abs(ty - gy) > 0.3) glowRaf = requestAnimationFrame(glowLoop);
      else glowRaf = null;
    }
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!glowRaf) glowRaf = requestAnimationFrame(glowLoop);
    }, { passive: true });

    /* Tilt 3D + spotlight nos cards */
    $$(".tilt").forEach(function (card) {
      var rect = null;
      var maxTilt = card.classList.contains("project-card") ? 5 : 7;

      card.addEventListener("pointerenter", function () { rect = card.getBoundingClientRect(); });
      card.addEventListener("pointermove", function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var ry = (px - 0.5) * maxTilt * 2;
        var rx = (0.5 - py) * maxTilt * 2;
        card.style.transform =
          "perspective(1100px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateZ(0)";
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      });
      card.addEventListener("pointerleave", function () {
        rect = null;
        card.style.transform = "";
      });
    });

    /* Botões magnéticos */
    $$(".magnetic").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * 0.22;
        var y = (e.clientY - (r.top + r.height / 2)) * 0.28;
        btn.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }
})();
