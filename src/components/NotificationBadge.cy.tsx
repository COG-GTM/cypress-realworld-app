import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("hides the badge when notification count is zero", () => {
    cy.mount(<NotificationBadge notificationCount={0} />);
    cy.get("[data-test='nav-top-notifications-count']")
      .find(".MuiBadge-badge")
      .should("have.class", "MuiBadge-invisible");
  });

  it("displays the correct count for a single notification", () => {
    cy.mount(<NotificationBadge notificationCount={1} />);
    cy.get("[data-test='nav-top-notifications-count']")
      .find(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("have.text", "1");
  });

  it("displays the correct count for multiple notifications", () => {
    cy.mount(<NotificationBadge notificationCount={5} />);
    cy.get("[data-test='nav-top-notifications-count']")
      .find(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("have.text", "5");
  });

  it("displays a large notification count correctly", () => {
    cy.mount(<NotificationBadge notificationCount={99} />);
    cy.get("[data-test='nav-top-notifications-count']")
      .find(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("have.text", "99");
  });

  it("applies the custom red badge styling", () => {
    cy.mount(<NotificationBadge notificationCount={3} />);
    cy.get("[data-test='nav-top-notifications-count']")
      .find(".MuiBadge-badge")
      .should("have.css", "background-color", "rgb(255, 0, 0)")
      .and("have.css", "color", "rgb(255, 255, 255)");
  });

  it("renders the NotificationsIcon", () => {
    cy.mount(<NotificationBadge notificationCount={0} />);
    cy.get("[data-test='nav-top-notifications-count']")
      .find("svg[data-testid='NotificationsIcon']")
      .should("exist");
  });
});
