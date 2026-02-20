import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("hides when notification count is zero", () => {
    cy.mount(<NotificationBadge notificationCount={0} />);
    cy.get("[data-test='nav-top-notifications-count']").should("not.exist");
  });

  it("displays the correct count for a single notification", () => {
    cy.mount(<NotificationBadge notificationCount={1} />);
    cy.get("[data-test='nav-top-notifications-count']").should("exist");
    cy.get(".MuiBadge-badge").should("have.text", "1");
  });

  it("displays the correct count for multiple notifications", () => {
    cy.mount(<NotificationBadge notificationCount={5} />);
    cy.get("[data-test='nav-top-notifications-count']").should("exist");
    cy.get(".MuiBadge-badge").should("have.text", "5");
  });

  it("displays the correct count for a large number of notifications", () => {
    cy.mount(<NotificationBadge notificationCount={99} />);
    cy.get("[data-test='nav-top-notifications-count']").should("exist");
    cy.get(".MuiBadge-badge").should("have.text", "99");
  });
});
