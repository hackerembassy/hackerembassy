describe("Languages", () => {
  const visitWithBrowserLanguages = (languages, url = "/") =>
    cy.visit(url, {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, "languages", { value: languages, configurable: true });
        Object.defineProperty(win.navigator, "language", { value: languages[0], configurable: true });
      },
    });

  it("falls back to English for unsupported browser languages", () => {
    visitWithBrowserLanguages(["de-DE"]);

    cy.get("html").should("have.attr", "lang", "en");
    cy.get("#nav-list a").eq(0).should("have.text", "About");
    cy.getCy("lang-list").find('a[data-lng="en"]').should("have.attr", "aria-current", "true");
  });

  it("picks the browser language when it is supported", () => {
    visitWithBrowserLanguages(["ru-RU", "en"]);

    cy.get("html").should("have.attr", "lang", "ru");
    cy.get("#nav-list a").eq(0).should("have.text", "О нас");
    cy.get("#achievements-stats").should("contain.text", "Найдено пасхалок");
  });

  it("takes the language from ?lng=, cleans the address bar and points search engines to the language URL", () => {
    visitWithBrowserLanguages(["en-US"], "/?lng=hy");

    cy.get("html").should("have.attr", "lang", "hy");
    cy.get("#nav-list a").eq(0).should("have.text", "Մեր մասին");
    cy.location("search").should("eq", "");
    cy.get('link[rel="canonical"]').should("have.attr", "href", "https://hackem.cc/?lng=hy");
    cy.get('link[rel="alternate"][hreflang]').should("have.length", 4);
    cy.get('meta[name="description"]').should("have.attr", "content").and("contain", "հաքսփեյս");
    cy.get('meta[property="og:locale"]').should("have.attr", "content", "hy_AM");
    cy.get('meta[property="og:url"]').should("have.attr", "content", "https://hackem.cc/?lng=hy");
  });

  it("uses the plain URL for English", () => {
    visitWithBrowserLanguages(["en-US"]);

    cy.get("html").should("have.attr", "lang", "en");
    cy.location("search").should("eq", "");
    cy.get('link[rel="canonical"]').should("have.attr", "href", "https://hackem.cc/");
  });

  it("switches the language from the nav bar and remembers it", () => {
    visitWithBrowserLanguages(["en-US"]);
    cy.get("html").should("have.attr", "lang", "en");

    cy.getCy("lang-list").contains("a", "RU").click();

    cy.get("html").should("have.attr", "lang", "ru");
    cy.get("#about h2").should("have.text", "О нас");
    cy.get("#about ul li").first().should("contain.text", "3D принтеры");
    cy.getCy("lang-list").find('a[data-lng="ru"]').should("have.attr", "aria-current", "true");
    cy.getCy("lang-list").find('a[data-lng="en"]').should("not.have.attr", "aria-current");
    cy.location("search").should("eq", "");
    cy.get('link[rel="canonical"]').should("have.attr", "href", "https://hackem.cc/?lng=ru");

    cy.reload();
    cy.get("html").should("have.attr", "lang", "ru");
  });

  it("asks the bot for command descriptions in the current language", () => {
    const descriptions = { en: "How to join us", ru: "Как присоединиться к нам" };
    cy.intercept({ method: "GET", url: `${Cypress.expose("api")}/text?*` }, (req) =>
      req.reply([{ command: "join", regex: "^join$", description: descriptions[req.query.lang] }]),
    );
    visitWithBrowserLanguages(["en-US"]);
    cy.get("html").should("have.attr", "lang", "en");

    cy.getCy("console-button").click();
    cy.getCy("console-input").type("help{enter}");
    cy.getCy("console-output").should("contain.text", "join How to join us");

    cy.getCy("lang-list").find('a[data-lng="ru"]').click();
    cy.get("html").should("have.attr", "lang", "ru");
    cy.getCy("console-input").type("clear{enter}");
    cy.getCy("console-input").type("help{enter}");
    cy.getCy("console-output").should("contain.text", "join Как присоединиться к нам");
  });

  it("hides the English text until a Russian page is translated", () => {
    cy.intercept("GET", "/locales/ru/translation.json", (req) => {
      req.headers["cache-control"] = "no-cache";
      req.on("response", (res) => res.setDelay(1000));
    });
    visitWithBrowserLanguages(["ru-RU"]);

    cy.get("html").should("have.class", "i18n-pending");
    cy.get("main").should("not.be.visible");

    cy.get("html").should("not.have.class", "i18n-pending").and("have.attr", "lang", "ru");
    cy.get("main").should("be.visible");
  });

  it("shows English pages right away", () => {
    visitWithBrowserLanguages(["en-US"]);

    cy.get("html").should("not.have.class", "i18n-pending");
    cy.get("main").should("be.visible");
  });

  it("stays English when the translation file fails to load", () => {
    // Failing fetch itself: an intercept alone misses responses the browser has cached from earlier tests
    cy.visit("/", {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, "languages", { value: ["ru-RU"], configurable: true });
        const originalFetch = win.fetch;
        win.fetch = (input, init) =>
          String(input).includes("/locales/ru/") ? Promise.reject(new TypeError("offline")) : originalFetch(input, init);
      },
    });

    cy.get("html").should("have.attr", "lang", "en");
    cy.get("#nav-list a").eq(0).should("have.text", "About");
    cy.get("#about ul li").first().should("contain.text", "3D printers");
    cy.get("#achievements-stats").should("contain.text", "Easter eggs found");

    cy.getCy("console-button").click();
    cy.getCy("console-input").type("help{enter}");
    cy.getCy("console-output").should("contain.text", "[Files]");
  });

  it("works without i18next when the CDN is down", () => {
    cy.intercept({ method: "GET", url: `${Cypress.expose("api")}/text?lang=en` }, [
      { command: "join", regex: "^join$", description: "How to join us" },
    ]);
    // Blocking the request isn't enough, the browser serves the script from its cache
    cy.visit("/", {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, "languages", { value: ["ru-RU"], configurable: true });
        Object.defineProperty(win, "i18next", { get: () => undefined, set: () => {} });
      },
    });

    cy.get("#nav-list a").eq(0).should("have.text", "About");
    cy.get("#achievements-stats").should("contain.text", "Easter eggs found");
    cy.getCy("lang-list").find('a[data-lng="en"]').should("have.attr", "aria-current", "true");

    cy.getCy("console-button").click();
    cy.getCy("console-input").type("whoami{enter}");
    cy.getCy("console-output").should("contain.text", "Type join");
    cy.getCy("console-input").type("help{enter}");
    cy.getCy("console-output").should("contain.text", "[Files]").and("contain.text", "join How to join us");

    // The switch falls back to a plain ?lng=ru link; the reloaded page has i18next again and applies it
    cy.getCy("lang-list").contains("a", "RU").click();
    cy.get("html").should("have.attr", "lang", "ru");
  });

  for (const [width, height] of [[390, 844], [1280, 800]]) {
    it(`fits the switch left of the window title at ${width}px`, () => {
      cy.viewport(width, height);
      visitWithBrowserLanguages(["ru-RU"]);
      cy.get("html").should("have.attr", "lang", "ru");

      cy.get("#topbar > a").then(($title) => {
        const title = $title[0].getBoundingClientRect();
        cy.getCy("lang-list").should(($list) => {
          const list = $list[0].getBoundingClientRect();
          expect(list.left).to.be.at.least(0);
          expect(list.right).to.be.lessThan(title.left);
          expect(list.bottom).to.be.at.most(title.bottom + 2);
        });
      });

      // Window buttons stay fully inside the title bar
      cy.get("#close").should(($close) => {
        const topbar = $close[0].closest("#topbar").getBoundingClientRect();
        expect($close[0].getBoundingClientRect().right).to.be.lessThan(topbar.right);
      });

      // The first language starts exactly where the nav link text starts
      cy.document().should((doc) => {
        const range = doc.createRange();
        range.selectNodeContents(doc.querySelector("#nav-list a"));
        const first = doc.querySelector("#lang-list a");
        expect(first.getBoundingClientRect().left).to.be.closeTo(range.getBoundingClientRect().left, 1);
      });
    });
  }

  it("translates the console help", () => {
    visitWithBrowserLanguages(["en-US"], "/?lng=hy");
    cy.get("html").should("have.attr", "lang", "hy");

    cy.getCy("console-button").click();
    cy.getCy("console-input").type("help{enter}");

    cy.getCy("console-output").should("contain.text", "[Ֆայլեր]").and("contain.text", "Օգնություն");
  });
});
