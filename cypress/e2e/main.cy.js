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

  it("has a map with a marker", () => {
    cy.get("#ofm").within(() => {
      cy.get("canvas.maplibregl-canvas").should("exist");
      cy.get(".maplibregl-marker").should("exist");
    });
  });

  it("has one carousel indicator per photo", () => {
    cy.getCy("scroll-list")
      .find(".scroll-item-outer")
      .its("length")
      .then((slides) => {
        cy.getCy("indicators-list").find(".indicator-button").should("have.length", slides);
      });
    cy.get("#scroll-indicator-secret").should("exist");
  });

  it("keeps the carousel in place while the photo caption types", () => {
    cy.viewport(390, 844);
    cy.getCy("indicators-list").find(".indicator-button").eq(4).click();
    cy.getCy("scroll-list")
      .parent()
      .then(($frame) => {
        const top = $frame[0].getBoundingClientRect().top;
        cy.get("#scroll-name-placement").should("contain.text", "open_doors.png");
        cy.getCy("scroll-list")
          .parent()
          .should(($after) => {
            expect($after[0].getBoundingClientRect().top).to.equal(top);
          });
      });
  });

  it("keeps the selected carousel photo aligned after rotation", () => {
    const expectSlideAligned = (index) => {
      cy.getCy("scroll-list").should(($list) => {
        const frame = $list[0].parentElement;
        const slide = $list[0].querySelectorAll(".scroll-item-outer")[index];
        const offset =
          slide.getBoundingClientRect().top - frame.getBoundingClientRect().top;
        expect(Math.abs(offset)).to.be.lessThan(1);
      });
    };

    cy.viewport(390, 844);
    cy.getCy("indicators-list").find(".indicator-button").eq(3).click();
    expectSlideAligned(3);

    cy.viewport(844, 390);
    expectSlideAligned(3);

    cy.viewport(390, 844);
    expectSlideAligned(3);

    cy.viewport(1280, 800);
    cy.getCy("indicators-list").find(".indicator-button").eq(6).click();
    expectSlideAligned(6);
  });
});
