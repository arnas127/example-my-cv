(() => {
  const SUPPORTED = ["en", "lt"];
  const FALLBACK = "en";

  function getByPath(obj, path) {
    if (!obj || !path) return undefined;
    return path.split(".").reduce((acc, key) => {
      if (acc === undefined || acc === null) return undefined;
      // numeric index
      if (/^\d+$/.test(key)) {
        const idx = Number(key);
        return Array.isArray(acc) ? acc[idx] : undefined;
      }
      return acc[key];
    }, obj);
  }

  function applyMetaTranslations(dict) {
    document.querySelectorAll("[data-i18n-meta]").forEach((el) => {
      const key = el.getAttribute("data-i18n-meta");
      const val = getByPath(dict, key);
      if (typeof val !== "string") return;

      if (el.tagName.toLowerCase() === "meta") {
        el.setAttribute("content", val);
      } else {
        el.textContent = val;
      }
    });
  }

  function applyTextTranslations(dict) {
    const year = String(new Date().getFullYear());
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      let val = getByPath(dict, key);
      if (typeof val !== "string") return;

      // Simple template replacement
      val = val.replaceAll("{year}", year);

      el.textContent = val;
    });

    // Update mailto/tel hrefs when values are translated
    const email = getByPath(dict, "hero.email");
    const phone = getByPath(dict, "hero.phone");

    const emailLink = document.getElementById("email-link");
    if (emailLink && typeof email === "string") {
      emailLink.href = `mailto:${email}`;
    }

    const phoneLink = document.getElementById("phone-link");
    if (phoneLink && typeof phone === "string") {
      const tel = phone.replace(/[^\d+]/g, "");
      phoneLink.href = `tel:${tel}`;
    }
  }

  function setActiveLangButtons(lang) {
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      const isActive = btn.getAttribute("data-lang") === lang;
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");

      // Tailwind utility classes toggling
      btn.classList.toggle("bg-white/20", isActive);
      btn.classList.toggle("bg-white/10", !isActive);
    });
  }

  function applyLanguage(lang) {
    const all = window.I18N || {};
    const chosen = all[lang] ? lang : FALLBACK;
    const dict = all[chosen] || {};

    document.documentElement.lang = chosen;

    applyMetaTranslations(dict);
    applyTextTranslations(dict);
    setActiveLangButtons(chosen);

    try {
      localStorage.setItem("lang", chosen);
    } catch (_) {
      // ignore
    }
  }

  function init() {
    let lang = FALLBACK;
    try {
      const saved = localStorage.getItem("lang");
      if (saved && SUPPORTED.includes(saved)) lang = saved;
    } catch (_) {
      // ignore
    }

    applyLanguage(lang);

    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => applyLanguage(btn.getAttribute("data-lang")));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
