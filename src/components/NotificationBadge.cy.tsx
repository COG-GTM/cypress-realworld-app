import React from "react";
import { MemoryRouter } from "react-router-dom";
import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("hides the badge when notification count is zero", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={0} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-count']").should("exist");
    cy.get("[data-test='nav-top-notifications-count'] .MuiBadge-badge").should(
      "have.class",
      "MuiBadge-invisible"
    );
  });

  it("displays the correct count for a single notification", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={1} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-count'] .MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "1");
  });

  it("displays the correct count for multiple notifications", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={5} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-count'] .MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "5");
  });

  it("displays a large notification count", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={99} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-count'] .MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "99");
  });

  it("renders the notifications icon", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={3} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-link']").should("exist");
    cy.get("[data-test='nav-top-notifications-link'] svg").should("exist");
  });

  it("links to the notifications page", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={3} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-link']")
      .should("have.attr", "href", "/notifications");
  });

  it("applies custom red badge styling", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={7} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-count'] .MuiBadge-badge")
      .should("have.css", "background-color", "rgb(255, 0, 0)");
  });
});
