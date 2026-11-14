describe("Console page", () => {
  const BotApiEndpoint = Cypress.expose("api");

  beforeEach(() => {
    cy.visit("/");

    // The site adds ?lang= to bot requests
    cy.intercept({ method: "GET", url: `${BotApiEndpoint}/text?*` }).as("getCommands");

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
    cy.wait("@getCommands").then(({ error, response }) => {
      expect(error, "bot API request error").to.be.undefined;
      expect(response.statusCode, "bot API status").to.eq(200);
    });

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

  it("help groups commands by category and hides easter eggs", () => {
    cy.getCy("console-input").type("help{enter}");

    cy.getCy("console-output")
      .should("contain.text", "[Files]")
      .should("contain.text", "vim")
      .should("contain.text", "kill")
      // English descriptions contain "information", so match the hidden command as a whole word
      .invoke("text")
      .should("not.match", /\bformat\b/);
  });

  it("history recall puts the caret at the end and skips empty input", () => {
    cy.getCy("console-input").type("echo test{enter}");
    cy.getCy("console-input").type("{enter}");
    cy.getCy("console-input").type("{uparrow}");

    cy.getCy("console-input")
      .should("have.value", "echo test")
      .and(($input) => expect($input[0].selectionStart).to.eq("echo test".length));
  });

  it("rm without sudo asks for sudo", () => {
    cy.getCy("console-input").type("rm -rf /{enter}");

    cy.getCy("console-output").should("contain.text", "Permission denied").and("contain.text", "sudo rm -rf /");
  });

  it("vim only lets you out with :q!", () => {
    cy.getCy("console-input").type("vim{enter}");
    cy.get(".vim").should("be.visible");

    cy.get(".vim-input").type(":q{enter}");
    cy.get(".vim-status").should("contain.text", "E37");

    cy.get(".vim-input").type(":q!{enter}");
    cy.get(".vim").should("not.exist");
  });

  it("kill removes clicked elements until Esc", () => {
    cy.getCy("console-input").type("echo victim{enter}");
    cy.getCy("console-input").type("kill{enter}");
    cy.getCy("console-output").should("have.length", 2);

    cy.getCy("console-output")
      .first()
      .then(($output) => {
        const rect = $output[0].getBoundingClientRect();
        cy.get(".effect-kill").click(rect.left + 5, rect.top + rect.height / 2);
      });
    cy.getCy("console-output").first().should("have.css", "visibility", "hidden");

    cy.document().trigger("keydown", { key: "Escape" });
    cy.get(".effect-kill").should("not.exist");
  });

  it("ps lists people inside from the bot API", () => {
    cy.intercept("GET", `${BotApiEndpoint}/api/status`, {
      open: 1,
      dateChanged: Date.now(),
      changedBy: "tectonic",
      inside: [{ username: "tectonic", dateChanged: Date.now() }],
      planningToGo: [],
    });

    cy.getCy("console-input").type("ps{enter}");

    cy.getCy("console-output").should("contain.text", "PID").and("contain.text", "tectonic");
  });

  it("shows a spinner while a slow command runs", () => {
    cy.intercept("GET", `${BotApiEndpoint}/api/printers`, { delay: 1000, body: [{ name: "anette", state: "standby" }] });

    cy.getCy("console-input").type("lpq{enter}");

    cy.getCy("console-busy").should("be.visible").and("contain.text", "lpq");
    cy.getCy("console-busy").should("not.exist");
    cy.getCy("console-output").should("contain.text", "anette");
    cy.getCy("console-input").should("have.focus");
  });
});
