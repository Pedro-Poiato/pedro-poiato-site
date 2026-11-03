/* ==========================================================
   Pedro Poiato — Soluções Digitais
   JavaScript puro: contatos configuráveis, menu, navegação.
   ========================================================== */
(function () {
  "use strict";

  var CONFIG = window.SITE_CONFIG || {};
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Ano automático no rodapé ---------- */
  $$("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Utilidades ---------- */
  function digitsOnly(value) {
    return String(value || "").replace(/\D+/g, "");
  }

  function setDisabled(el, disabled) {
    if (!el) return;
    el.setAttribute("aria-disabled", disabled ? "true" : "false");
    el.classList.toggle("is-disabled", disabled);
  }

  /* ---------- Configuração do WhatsApp ---------- */
  var whatsappNumber = digitsOnly(CONFIG.whatsappNumber);
  var hasWhatsApp = whatsappNumber.length >= 10;
  var whatsappUrl = hasWhatsApp
    ? "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(CONFIG.whatsappMessage || "")
    : "";

  $$("[data-cta-whatsapp]").forEach(function (el) {
    // Botões do cabeçalho e do hero: se o WhatsApp estiver configurado, abrem a conversa;
    // caso contrário, levam à seção de contato.
    if (hasWhatsApp) {
      el.setAttribute("href", whatsappUrl);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  });

  var ctaMain = $("[data-cta-whatsapp-main]");
  var ctaText = $("[data-cta-whatsapp-text]");
  var ctaNote = $("[data-cta-note] span:last-child");

  if (hasWhatsApp) {
    ctaMain.setAttribute("href", whatsappUrl);
    setDisabled(ctaMain, false);
    if (ctaNote) ctaNote.textContent = "Resposta em horário comercial";
  } else {
    ctaMain.setAttribute("href", "#contato");
    ctaMain.addEventListener("click", function (e) { e.preventDefault(); });
    setDisabled(ctaMain, true);
    if (ctaText) ctaText.textContent = "WhatsApp em configuração";
    if (ctaNote) ctaNote.textContent = "Contato em configuração";
  }

  var whatsappCard = $("[data-whatsapp-card]");
  var whatsappHint = $("[data-whatsapp-hint]");
  if (hasWhatsApp) {
    whatsappCard.setAttribute("href", whatsappUrl);
    whatsappCard.setAttribute("aria-disabled", "false");
    whatsappCard.classList.remove("is-disabled");
    if (whatsappHint) {
      whatsappHint.textContent = "Abrir conversa";
      whatsappHint.classList.add("ok");
    }
  } else {
    whatsappCard.addEventListener("click", function (e) { e.preventDefault(); });
    whatsappCard.classList.add("is-disabled");
    whatsappCard.setAttribute("aria-disabled", "true");
  }

  /* ---------- E-mail ---------- */
  var email = String(CONFIG.email || "").trim();
  var hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  var emailCard = $("[data-email-card]");
  var emailValue = $("[data-email-value]");
  var emailHint = $("[data-email-hint]");
  var emailQuick = $("[data-email-quick]");
  var emailQuickText = $("[data-email-quick-text]");
  var emailSep = $("[data-email-sep]");

  if (hasEmail) {
    emailValue.textContent = email;
    emailHint.textContent = "Clique para copiar";
    emailHint.classList.add("ok");
    emailCard.addEventListener("click", function () {
      copyText(email).then(function (ok) {
        emailHint.textContent = ok ? "Copiado!" : "Não foi possível copiar";
        emailHint.classList.add("ok");
        setTimeout(function () {
          emailHint.textContent = "Clique para copiar";
        }, 2000);
      });
    });
    if (emailQuick) {
      emailQuick.setAttribute("href", "mailto:" + email);
      emailQuick.hidden = false;
      if (emailQuickText) emailQuickText.textContent = email;
    }
    if (emailSep) emailSep.hidden = false;
  } else {
    emailCard.disabled = true;
    emailCard.classList.add("is-disabled");
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
    }
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return Promise.resolve(ok);
    } catch (err) {
      return Promise.resolve(false);
    }
  }

  /* ---------- LinkedIn ---------- */
  var linkedin = String(CONFIG.linkedin || "").trim();
  var hasLinkedIn = /^https?:\/\/(www\.)?linkedin\.com\//i.test(linkedin);
  var linkedinCard = $("[data-linkedin-card]");
  var linkedinHint = $("[data-linkedin-hint]");
  var linkedinQuick = $("[data-linkedin-quick]");
  var linkedinSep = $("[data-linkedin-sep]");

  if (hasLinkedIn) {
    linkedinCard.setAttribute("href", linkedin);
    linkedinCard.setAttribute("aria-disabled", "false");
    linkedinCard.classList.remove("is-disabled");
    if (linkedinHint) {
      linkedinHint.textContent = "Abrir perfil";
      linkedinHint.classList.add("ok");
    }
    if (linkedinQuick) {
      linkedinQuick.setAttribute("href", linkedin);
      linkedinQuick.setAttribute("target", "_blank");
      linkedinQuick.setAttribute("rel", "noopener noreferrer");
      linkedinQuick.hidden = false;
    }
    if (linkedinSep) linkedinSep.hidden = false;
  } else {
    linkedinCard.addEventListener("click", function (e) { e.preventDefault(); });
    linkedinCard.classList.add("is-disabled");
    linkedinCard.setAttribute("aria-disabled", "true");
  }

  /* ---------- Prévia de projetos: mensagem caso o GitHub esteja indisponível ---------- */
  $$(".card-preview").forEach(function (img) {
    img.addEventListener("error", function () { img.hidden = true; });
    if (img.complete && img.naturalWidth === 0) img.hidden = true;
  });

  /* ---------- Menu mobile ---------- */
  var toggle = $(".menu-toggle");
  var mobileNav = $("#mobile-nav");
  var toggleIcon = toggle.querySelector(".material-symbols-outlined");

  function setMenu(open) {
    mobileNav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    if (toggleIcon) toggleIcon.textContent = open ? "close" : "menu";
  }

  toggle.addEventListener("click", function () {
    setMenu(!mobileNav.classList.contains("open"));
  });

  $$("a", mobileNav).forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---------- Navegação ativa (scroll spy) ---------- */
  var navLinks = $$("[data-nav]");
  var sectionIds = navLinks.map(function (a) { return a.getAttribute("href").slice(1); });
  var sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (a) {
      var active = a.getAttribute("href") === "#" + id;
      a.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* Links internos: fecha menu e mantém a rolagem suave do CSS */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      var target = id && document.getElementById(id);
      if (!target) return;
      if (a.hasAttribute("aria-disabled") && a.getAttribute("aria-disabled") === "true") return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", "#" + id);
    });
  });
})();
