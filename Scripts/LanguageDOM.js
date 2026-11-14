import I18n from "./I18n.js";

// RU / HY / EN switch at the right end of the nav bar
class LanguageDOM {
  static links = document.querySelectorAll("#lang-list a[data-lng]");

  static markActive(language) {
    for (const link of this.links) {
      const active = link.dataset.lng === language;
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  }

  static init() {
    for (const link of this.links) {
      // Switches in place when i18next is up; otherwise the plain ?lng=xx link does its job
      link.addEventListener("click", (event) => {
        if (I18n.changeLanguage(link.dataset.lng)) event.preventDefault();
      });
    }

    // Nothing is marked until the language is known, so a Russian visitor doesn't see [EN] jump to [RU].
    // Brackets keep their space either way, so the row doesn't move
    I18n.onChange((language) => this.markActive(language));
    I18n.ready.then(() => {
      // Without i18next the page stays English
      if (!I18n.isReady) this.markActive(I18n.language);
    });
  }
}

export default LanguageDOM;
