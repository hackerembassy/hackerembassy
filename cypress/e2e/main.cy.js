describe("Main page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("has correct title", () => {
    cy.title().should("include", "Hacker Space Yerevan");
  });

  it("has a working navigation", () => {
    cy.get("#nav-list").within(() => {
      cy.get("li").should("have.length", 5);
      cy.get("a").eq(0).should("have.attr", "href", "#about");
      cy.get("a").eq(1).should("have.attr", "href", "#announces");
      cy.get("a").eq(2).should("have.attr", "href", "#contacts");
      cy.get("a").eq(3).should("have.attr", "href", "https://lore.hackem.cc/");
      cy.get("a").eq(3).should("have.attr", "target", "_blank");

      cy.get("#console-button").should("exist");
    });
  });

  it("has working topbar buttons", () => {
    cy.get("#topbuttons").within(() => {
      cy.get("img").should("have.length", 3);
      cy.get("#minimize").should("have.attr", "src", "/icons/minimize.svg");
      cy.get("#maximize").should("have.attr", "src", "/icons/maximize.svg");
      cy.get("#close").should("have.attr", "src", "/icons/close.svg");
    });
  });
});
