import * as React from "react";
import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("should hide the badge when count is 0", () => {
    cy.mount(<NotificationBadge count={0} />);
    cy.get("[data-test='nav-top-notifications-count']").should("exist");
    cy.get(".MuiBadge-badge").should("have.class", "MuiBadge-invisible");
  });

  it("should display the badge when count is greater than 0", () => {
    cy.mount(<NotificationBadge count={5} />);
    cy.get("[data-test='nav-top-notifications-count']").should("exist");
    cy.get(".MuiBadge-badge").should("not.have.class", "MuiBadge-invisible").and("contain", "5");
  });

  it("should display the correct count for 1 notification", () => {
    cy.mount(<NotificationBadge count={1} />);
    cy.get(".MuiBadge-badge").should("not.have.class", "MuiBadge-invisible").and("contain", "1");
  });

  it("should display the correct count for large numbers", () => {
    cy.mount(<NotificationBadge count={99} />);
    cy.get(".MuiBadge-badge").should("not.have.class", "MuiBadge-invisible").and("contain", "99");
  });

  it("should display 99+ for counts over 99", () => {
    cy.mount(<NotificationBadge count={100} />);
    cy.get(".MuiBadge-badge").should("not.have.class", "MuiBadge-invisible").and("contain", "99+");
  });

  it("should have the notification icon", () => {
    cy.mount(<NotificationBadge count={3} />);
    cy.get("[data-testid='NotificationsIcon']").should("exist");
  });
});
