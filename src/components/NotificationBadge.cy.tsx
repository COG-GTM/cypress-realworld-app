import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("hides badge when count is zero", () => {
    cy.mount(<NotificationBadge count={0} />);
    cy.get("[data-test=nav-top-notifications-count]").should("exist");
    cy.get(".MuiBadge-badge").should("not.be.visible");
  });

  it("displays correct count when count is 1", () => {
    cy.mount(<NotificationBadge count={1} />);
    cy.get("[data-test=nav-top-notifications-count]").should("exist");
    cy.get(".MuiBadge-badge").should("be.visible").and("contain", "1");
  });

  it("displays correct count when count is 5", () => {
    cy.mount(<NotificationBadge count={5} />);
    cy.get("[data-test=nav-top-notifications-count]").should("exist");
    cy.get(".MuiBadge-badge").should("be.visible").and("contain", "5");
  });

  it("displays correct count when count is large (99)", () => {
    cy.mount(<NotificationBadge count={99} />);
    cy.get("[data-test=nav-top-notifications-count]").should("exist");
    cy.get(".MuiBadge-badge").should("be.visible").and("contain", "99");
  });

  it("displays 99+ when count exceeds 99", () => {
    cy.mount(<NotificationBadge count={150} />);
    cy.get("[data-test=nav-top-notifications-count]").should("exist");
    cy.get(".MuiBadge-badge").should("be.visible").and("contain", "99+");
  });

  it("has custom badge styling with red background", () => {
    cy.mount(<NotificationBadge count={5} />);
    cy.get(".MuiBadge-badge")
      .should("be.visible")
      .and("have.css", "background-color", "rgb(255, 0, 0)");
  });
});
