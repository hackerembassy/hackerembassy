import english from "../locales/en/translation.js";

// Thin wrapper around i18next (loaded as UMD globals from the CDN in index.html)
const { i18next, i18nextBrowserLanguageDetector, i18nextHttpBackend } = window;

class I18n {
  static SupportedLanguages = ["ru", "hy", "en"];
  static FallbackLanguage = "en";
  static QueryParameter = "lng";

  static #resolveReady;
  static #ready = false;
  static #callbacks = [];
  // Settles once init is over, whether translations loaded or not
  static ready = new Promise((resolve) => (this.#resolveReady = resolve));

  static get language() {
    return (this.isReady && i18next.resolvedLanguage) || this.FallbackLanguage;
  }

  // True when i18next is up; otherwise everything falls back to the bundled English
  static get isReady() {
    return this.#ready;
  }

  /**
   * Picks the language (?lng= → localStorage → browser languages → English) and loads its translations.
   * English is bundled, ru/hy are fetched from /locales. Never rejects: on failure the page stays English.
   * @returns {Promise<void>}
   */
  static async init() {
    try {
      // Without the CDN scripts the page keeps its English markup and the bundled strings
      if (!i18next) return;

      // languageChanged also fires inside init, before translations are loaded; that one is covered below
      i18next.on("languageChanged", () => {
        if (this.isReady) this.#notify();
      });

      await i18next
        .use(i18nextHttpBackend)
        .use(i18nextBrowserLanguageDetector)
        .init({
          supportedLngs: this.SupportedLanguages,
          fallbackLng: this.FallbackLanguage,
          nonExplicitSupportedLngs: true,
          load: "languageOnly",
          resources: { en: { translation: english } },
          // Bundled English plus the other languages from the backend
          partialBundledLanguages: true,
          // A failed ru/hy file means English; don't make the console wait for many retries
          maxRetries: 2,
          // Translations are our own static files and may contain markup
          interpolation: { escapeValue: false },
          backend: { loadPath: "/locales/{{lng}}/translation.json" },
          detection: {
            order: ["querystring", "localStorage", "navigator", "htmlTag"],
            lookupQuerystring: this.QueryParameter,
            caches: ["localStorage"],
          },
        });

      // If ru/hy failed to load, i18next falls back to the English strings, so raw keys never show up
      this.#ready = true;
      this.#notify();
    } catch (error) {
      console.error(error);
    } finally {
      // Armenian shows up in the system font and then switches to the web font; let the page appear in it
      // right away (it is preloaded by LanguageBoot.js, the wait is capped so a slow font can't hide the page)
      if (this.language === "hy" && document.fonts)
        await Promise.race([
          document.fonts.load('16px "Iosevka Charon Mono"', "Ա").catch(() => {}),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
      // Set by Scripts/LanguageBoot.js while ru/hy text is on its way
      document.documentElement.classList.remove("i18n-pending");
      this.#resolveReady();
    }
  }

  // Static markup first, so callbacks (e.g. typers) pick up the translated text
  static #notify() {
    this.updateUrl();
    this.localize();
    for (const callback of this.#callbacks) callback(this.language);
  }

  /**
   * Translates the key; before i18next is ready (or without it) uses the bundled English
   * @param {string} key
   * @param {{returnObjects?: boolean, defaultValue?: string, [name: string]: any}} [options]
   */
  static t(key, options = {}) {
    if (this.isReady) return i18next.t(key, options);

    const value = key.split(".").reduce((node, part) => node?.[part], english);
    if (value === undefined) return options.defaultValue ?? key;
    if (typeof value !== "string") return options.returnObjects ? value : key;

    return value.replaceAll(/{{\s*(\w+)\s*}}/g, (match, name) => String(options[name] ?? match));
  }

  /**
   * @param {string} language
   * @returns {boolean} false if the language can't be switched in place (i18next is not loaded)
   */
  static changeLanguage(language) {
    if (!this.isReady) return false;

    i18next.changeLanguage(language).catch(console.error);
    return true;
  }

  /**
   * Runs the callback now (if translations are loaded) and after every language change
   * @param {(language: string) => void} callback
   */
  static onChange(callback) {
    this.#callbacks.push(callback);
    if (this.isReady) callback(this.language);
  }

  /**
   * Search engines get a URL per language (/ for English, ?lng=ru, ?lng=hy, see hreflang links in index.html)
   * and the canonical link points to the shown one. Visitors get a clean address bar: ?lng= is dropped once
   * applied, the choice lives in localStorage.
   */
  static updateUrl() {
    const language = this.language;
    const url = new URL(window.location.href);
    if (url.searchParams.has(this.QueryParameter)) {
      url.searchParams.delete(this.QueryParameter);
      window.history.replaceState(window.history.state, "", url);
    }

    const alternate = document.querySelector(`link[rel="alternate"][hreflang="${language}"]`);
    if (!alternate) return;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = alternate.href;
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", alternate.href);
  }

  /**
   * Applies translations to elements marked with:
   *  data-i18n="key" (text) or data-i18n="[html]key" (markup)
   *  data-i18n-attr="title:key;alt:key"
   *  data-i18n-list="key" (array → <li> children)
   *  data-i18n-type="key" (array → data-type for TyperDOM)
   */
  static localize(root = document) {
    if (!this.isReady) return;

    document.documentElement.lang = this.language;
    document.title = this.t("meta.title");

    for (const element of root.querySelectorAll("[data-i18n]")) {
      const key = element.dataset.i18n;
      if (key.startsWith("[html]")) element.innerHTML = this.t(key.slice(6));
      else element.textContent = this.t(key);
    }

    for (const element of root.querySelectorAll("[data-i18n-attr]")) {
      for (const pair of element.dataset.i18nAttr.split(";")) {
        const [attribute, key] = pair.split(":").map((part) => part.trim());
        element.setAttribute(attribute, this.t(key));
      }
    }

    for (const element of root.querySelectorAll("[data-i18n-list]")) {
      const items = this.t(element.dataset.i18nList, { returnObjects: true });
      if (!Array.isArray(items)) continue;

      element.replaceChildren(
        ...items.map((text) => {
          const item = document.createElement("li");
          item.innerHTML = text;
          return item;
        }),
      );
    }

    for (const element of root.querySelectorAll("[data-i18n-type]")) {
      const lines = this.t(element.dataset.i18nType, { returnObjects: true });
      if (Array.isArray(lines)) element.dataset.type = JSON.stringify(lines);
    }
  }
}

export default I18n;
