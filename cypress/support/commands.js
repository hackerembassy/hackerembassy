Cypress.Commands.add("getCy", (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});
