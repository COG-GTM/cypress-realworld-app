import * as React from "react";
import { MemoryRouter } from "react-router-dom";
import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  const mountWithRouter = (notificationCount: number) => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={notificationCount} />
      </MemoryRouter>
    );
  };

  it("hides the badge when notification count is zero", () => {
    mountWithRouter(0);

    cy.get("[data-test=nav-top-notifications-link]").should("exist");
    cy.get("[data-test=nav-top-notifications-count]")
      .find(".MuiBadge-badge")
      .should("have.class", "MuiBadge-invisible");
  });

  it("displays the correct count when there is one notification", () => {
    mountWithRouter(1);

    cy.get("[data-test=nav-top-notifications-count]")
      .find(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "1");
  });

  it("displays the correct count when there are multiple notifications", () => {
    mountWithRouter(5);

    cy.get("[data-test=nav-top-notifications-count]")
      .find(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "5");
  });

  it("displays the correct count for larger numbers", () => {
    mountWithRouter(99);

    cy.get("[data-test=nav-top-notifications-count]")
      .find(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "99");
  });

  it("renders the notifications icon", () => {
    mountWithRouter(3);

    cy.get("[data-test=nav-top-notifications-link]")
      .find("svg")
      .should("exist");
  });

  it("links to the notifications page", () => {
    mountWithRouter(3);

    cy.get("[data-test=nav-top-notifications-link]").should("have.attr", "href", "/notifications");
  });
});
