// Loaded in <head> as a classic (blocking) script, so it runs before anything is painted.
// If the visitor is going to get ru/hy, it hides the English markup until Scripts/I18n.js has translated it
// and starts downloading the translation right away instead of waiting for i18next from the CDN.
// Detection mirrors the i18next detector order in Scripts/I18n.js: ?lng= → saved choice → browser languages.
(() => {
  const SupportedLanguages = new Set(["en", "ru", "hy"]);
  const DefaultLanguage = "en";
  const QueryParameter = "lng";
  const StorageKey = "i18nextLng";
  const PendingClass = "i18n-pending";
  // Safety net: show the page even if translations never arrive
  const MaxHiddenMs = 3000;

  const readSavedLanguage = () => {
    try {
      return localStorage.getItem(StorageKey);
    } catch {
      // Storage can be blocked (private mode, disabled cookies)
      return null;
    }
  };

  const candidates = [
    new URLSearchParams(window.location.search).get(QueryParameter),
    readSavedLanguage(),
    ...(navigator.languages ?? [navigator.language]),
  ];

  const language =
    candidates
      .map((candidate) => candidate?.toLowerCase().split("-")[0])
      .find((candidate) => SupportedLanguages.has(candidate)) ?? DefaultLanguage;

  // The markup is already English
  if (language === DefaultLanguage) return;

  const root = document.documentElement;
  root.classList.add(PendingClass);
  setTimeout(() => root.classList.remove(PendingClass), MaxHiddenMs);

  const preload = Object.assign(document.createElement("link"), {
    rel: "preload",
    as: "fetch",
    // Must match how i18next-http-backend fetches the file, or the preload is wasted
    crossOrigin: "anonymous",
    href: `/locales/${language}/translation.json`,
  });
  document.head.append(preload);
})();
