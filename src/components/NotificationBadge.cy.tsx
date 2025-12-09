import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("hides badge when count is zero", () => {
    cy.mount(<NotificationBadge count={0} />);
    cy.get("[data-test=nav-top-notifications-count]").should("exist");
    cy.get("[data-test=nav-top-notifications-count] .MuiBadge-badge").should(
      "have.class",
      "MuiBadge-invisible"
    );
  });

  it("hides badge when count is undefined", () => {
    cy.mount(<NotificationBadge />);
    cy.get("[data-test=nav-top-notifications-count]").should("exist");
    cy.get("[data-test=nav-top-notifications-count] .MuiBadge-badge").should(
      "have.class",
      "MuiBadge-invisible"
    );
  });

  it("displays count of 1 correctly", () => {
    cy.mount(<NotificationBadge count={1} />);
    cy.get("[data-test=nav-top-notifications-count] .MuiBadge-badge")
      .should("be.visible")
      .and("contain", "1");
  });

  it("displays count of 5 correctly", () => {
    cy.mount(<NotificationBadge count={5} />);
    cy.get("[data-test=nav-top-notifications-count] .MuiBadge-badge")
      .should("be.visible")
      .and("contain", "5");
  });

  it("displays large count correctly", () => {
    cy.mount(<NotificationBadge count={99} />);
    cy.get("[data-test=nav-top-notifications-count] .MuiBadge-badge")
      .should("be.visible")
      .and("contain", "99");
  });

  it("applies custom badge class when provided", () => {
    cy.mount(<NotificationBadge count={5} badgeClassName="custom-test-badge" />);
    cy.get("[data-test=nav-top-notifications-count] .MuiBadge-badge").should(
      "have.class",
      "custom-test-badge"
    );
  });

  it("renders NotificationsIcon", () => {
    cy.mount(<NotificationBadge count={1} />);
    cy.get("[data-test=nav-top-notifications-count]")
      .find("svg")
      .should("exist")
      .and("have.attr", "data-testid", "NotificationsIcon");
  });
});
