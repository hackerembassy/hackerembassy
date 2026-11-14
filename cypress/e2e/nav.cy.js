describe("Nav overflow menu", () => {
  it("keeps everything on one row on wide screens", () => {
    cy.viewport(1280, 800);
    cy.visit("/");

    cy.getCy("nav-more").should("not.be.visible");
    cy.getCy("console-button").should("be.visible");
  });

  it("moves links that don't fit into the > menu on phones", () => {
    cy.viewport(375, 667);
    cy.visit("/");

    // One row only
    cy.get("#nav-list > li:not([hidden])").then(($items) => {
      const tops = new Set([...$items].map((item) => Math.round(item.getBoundingClientRect().top)));
      expect(tops.size).to.eq(1);
    });

    cy.getCy("console-button").should("not.be.visible");

    // ">" lines up with the close button above it
    cy.document().then((doc) => {
      const range = doc.createRange();
      range.selectNodeContents(doc.getElementById("nav-more-button"));
      const close = doc.getElementById("close").getBoundingClientRect();
      expect(range.getBoundingClientRect().right).to.be.closeTo(close.right, 1);
    });

    cy.getCy("nav-more").should("be.visible").and("have.attr", "aria-expanded", "false").click();
    cy.getCy("nav-more").should("have.attr", "aria-expanded", "true");

    // Picking a link from the menu works and closes it
    cy.getCy("console-button").should("be.visible").click();
    cy.getCy("console-wrapper").should("be.visible");
    cy.get("#nav-more-list").should("not.be.visible");
  });

  it("closes the menu with Esc or a click elsewhere", () => {
    cy.viewport(375, 667);
    cy.visit("/");

    cy.getCy("nav-more").click();
    cy.get("#nav-more-list").should("be.visible");
    cy.get("body").type("{esc}");
    cy.get("#nav-more-list").should("not.be.visible");

    cy.getCy("nav-more").click();
    cy.get("#promo").click();
    cy.get("#nav-more-list").should("not.be.visible");
  });

  it("brings links back when the screen gets wider", () => {
    cy.viewport(375, 667);
    cy.visit("/");
    cy.getCy("nav-more").should("be.visible");

    cy.viewport(1280, 800);
    cy.getCy("nav-more").should("not.be.visible");
    cy.get("#nav-list > li > a").should("have.length", 6);
  });
});
