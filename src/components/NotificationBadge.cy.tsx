import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("should not render when notification count is zero", () => {
    cy.mount(<NotificationBadge notificationCount={0} />);
    cy.get("[data-test='nav-top-notifications-count']").should("not.exist");
  });

  it("should display the correct count for a single notification", () => {
    cy.mount(<NotificationBadge notificationCount={1} />);
    cy.get("[data-test='nav-top-notifications-count']").should("exist");
    cy.get(".MuiBadge-badge").should("contain", "1");
  });

  it("should display the correct count for multiple notifications", () => {
    cy.mount(<NotificationBadge notificationCount={5} />);
    cy.get("[data-test='nav-top-notifications-count']").should("exist");
    cy.get(".MuiBadge-badge").should("contain", "5");
  });

  it("should display the correct count for a large number of notifications", () => {
    cy.mount(<NotificationBadge notificationCount={99} />);
    cy.get("[data-test='nav-top-notifications-count']").should("exist");
    cy.get(".MuiBadge-badge").should("contain", "99");
  });

  it("should apply custom badge classes when provided", () => {
    const customClasses = { badge: "custom-badge-class" };
    cy.mount(<NotificationBadge notificationCount={3} classes={customClasses} />);
    cy.get(".MuiBadge-badge").should("have.class", "custom-badge-class");
  });

  it("should render the notifications icon when count is greater than zero", () => {
    cy.mount(<NotificationBadge notificationCount={2} />);
    cy.get("[data-test='nav-top-notifications-count']").find("svg").should("exist");
  });
});
