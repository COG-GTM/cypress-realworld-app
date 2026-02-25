import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("should not render when notificationCount is zero", () => {
    cy.mount(<NotificationBadge notificationCount={0} />);
    cy.get("[data-test='nav-top-notifications-count']").should("not.exist");
  });

  it("should display the correct count for 1 notification", () => {
    cy.mount(<NotificationBadge notificationCount={1} />);
    cy.get("[data-test='nav-top-notifications-count']").should("exist");
    cy.get(".MuiBadge-badge").should("have.text", "1");
  });

  it("should display the correct count for 5 notifications", () => {
    cy.mount(<NotificationBadge notificationCount={5} />);
    cy.get("[data-test='nav-top-notifications-count']").should("exist");
    cy.get(".MuiBadge-badge").should("have.text", "5");
  });

  it("should display the correct count for a large number of notifications", () => {
    cy.mount(<NotificationBadge notificationCount={99} />);
    cy.get("[data-test='nav-top-notifications-count']").should("exist");
    cy.get(".MuiBadge-badge").should("have.text", "99");
  });

  it("should show 99+ when count exceeds 99", () => {
    cy.mount(<NotificationBadge notificationCount={150} />);
    cy.get("[data-test='nav-top-notifications-count']").should("exist");
    cy.get(".MuiBadge-badge").should("have.text", "99+");
  });

  it("should render the notifications icon", () => {
    cy.mount(<NotificationBadge notificationCount={3} />);
    cy.get("[data-test='nav-top-notifications-count']")
      .find("svg[data-testid='NotificationsIcon']")
      .should("exist");
  });

  it("should apply custom badge styling", () => {
    cy.mount(<NotificationBadge notificationCount={3} />);
    cy.get(".MuiBadge-badge")
      .should("have.css", "background-color", "rgb(255, 0, 0)")
      .and("have.css", "color", "rgb(255, 255, 255)");
  });
});
