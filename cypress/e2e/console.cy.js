describe("Console page", () => {
  const BotApiEndpoint = Cypress.env("api");

  beforeEach(() => {
    cy.visit("/");

    cy.intercept("GET", `${BotApiEndpoint}/text`).as("getCommands");

    cy.getCy("console-button").click();
  });

  it("has a console visible", () => {
    cy.getCy("console-wrapper").should("be.visible");
  });

  it("typing command saves the previous input", () => {
    cy.getCy("console-input").type("echo test{enter}");

    cy.getCy("console-old-input").should("contain.text", "test");
  });

  it("pressing up restores the previous input", () => {
    cy.getCy("console-input").type("echo test{enter}");
    cy.getCy("console-input").type("{uparrow}");

    cy.getCy("console-input").should("have.value", "echo test");
  });

  it("typing unknown suggests help", () => {
    cy.getCy("console-input").type("unknown{enter}");

    cy.getCy("console-output").should("contain.text", "help");
  });

  it("typing help shows help with default commands", () => {
    cy.getCy("console-input").type("help{enter}");

    cy.getCy("console-output")
      .should("contain.text", "help")
      .should("contain.text", "calendar")
      .should("contain.text", "eval")
      .should("contain.text", "echo")
      .should("contain.text", "pwd")
      .should("contain.text", "cd")
      .should("contain.text", "cat")
      .should("contain.text", "ls")
      .should("contain.text", "secret")
      .should("contain.text", "clear")
      .should("contain.text", "exit");
  });

  it("typing help shows help with bot commands if api call is successful", () => {
    cy.wait("@getCommands");

    cy.getCy("console-input").type("help{enter}");

    cy.getCy("console-output")
      .should("contain.text", "status")
      .should("contain.text", "join")
      .should("contain.text", "donate")
      .should("contain.text", "funds")
      .should("contain.text", "events")
      .should("contain.text", "upcoming")
      .should("contain.text", "today");
  });

  it("typing pwd prints the directory", () => {
    cy.getCy("console-input").type("pwd{enter}");

    cy.getCy("console-output").should("contain.text", "C:");
  });

  it("typing clear clears the console", () => {
    cy.getCy("console-input").type("clear{enter}");

    cy.getCy("console-output").should("not.exist");
  });

  it("typing exit closes the console", () => {
    cy.getCy("console-input").type("exit{enter}");

    cy.getCy("console-wrapper").should("not.be.visible");
  });
});
