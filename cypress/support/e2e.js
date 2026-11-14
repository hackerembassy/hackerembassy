import "./commands";

// The page picks its language from the browser, which follows the OS locale.
// Pin English so tests pass on any machine; a test can still set its own languages in onBeforeLoad.
Cypress.Commands.overwrite("visit", (originalVisit, url, options = {}) => {
  const onBeforeLoad = options.onBeforeLoad;

  return originalVisit(url, {
    ...options,
    onBeforeLoad(win) {
      Object.defineProperty(win.navigator, "languages", { value: ["en-US", "en"], configurable: true });
      Object.defineProperty(win.navigator, "language", { value: "en-US", configurable: true });
      onBeforeLoad?.(win);
    },
  });
});
