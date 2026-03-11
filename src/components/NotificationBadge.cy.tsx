import { MemoryRouter } from "react-router-dom";
import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("shows the bell icon but hides the badge count when notification count is zero", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={0} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-link]").should("exist");
    cy.get("[data-test=nav-top-notifications-count]").should("exist");
    cy.get(".MuiBadge-badge").should("not.be.visible");
  });

  it("displays the correct count for a single notification", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={1} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-link]").should("exist");
    cy.get("[data-test=nav-top-notifications-count]").should("exist").and("contain", "1");
  });

  it("displays the correct count for multiple notifications", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={5} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-count]").should("exist").and("contain", "5");
  });

  it("displays a large notification count", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={99} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-count]").should("exist").and("contain", "99");
  });

  it("links to the notifications page", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={3} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-link]").should("have.attr", "href", "/notifications");
  });
});
