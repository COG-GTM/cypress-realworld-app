import * as React from "react";
import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("hides badge when count is zero", () => {
    cy.mount(<NotificationBadge count={0} />);
    cy.get("[data-test=nav-top-notifications-count]").should("exist");
    cy.get(".MuiBadge-badge").should("not.be.visible");
  });

  it("displays badge with correct count when count is greater than zero", () => {
    cy.mount(<NotificationBadge count={5} />);
    cy.get("[data-test=nav-top-notifications-count]").should("exist");
    cy.get(".MuiBadge-badge").should("be.visible").and("contain", "5");
  });

  it("displays badge with count of 1", () => {
    cy.mount(<NotificationBadge count={1} />);
    cy.get(".MuiBadge-badge").should("be.visible").and("contain", "1");
  });

  it("displays badge with large count", () => {
    cy.mount(<NotificationBadge count={99} />);
    cy.get(".MuiBadge-badge").should("be.visible").and("contain", "99");
  });

  it("applies custom badge class when provided", () => {
    cy.mount(<NotificationBadge count={3} badgeClassName="custom-badge-class" />);
    cy.get(".MuiBadge-badge").should("have.class", "custom-badge-class");
  });

  it("renders NotificationsIcon inside the badge", () => {
    cy.mount(<NotificationBadge count={0} />);
    cy.get("[data-testid=NotificationsIcon]").should("exist");
  });
});
