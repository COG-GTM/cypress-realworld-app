import { MemoryRouter } from "react-router-dom";
import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("should not render when notification count is zero", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={0} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-link']").should("not.exist");
    cy.get("[data-test='nav-top-notifications-count']").should("not.exist");
  });

  it("should display the correct count for a single notification", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={1} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-link']").should("exist");
    cy.get("[data-test='nav-top-notifications-count']").should("exist").and("contain", "1");
  });

  it("should display the correct count for multiple notifications", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={5} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-count']").should("exist").and("contain", "5");
  });

  it("should display a large notification count", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={99} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-count']").should("exist").and("contain", "99");
  });

  it("should link to the notifications page", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={3} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-link']").should(
      "have.attr",
      "href",
      "/notifications"
    );
  });

  it("should apply custom badge styling", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={7} />
      </MemoryRouter>
    );
    cy.get(".MuiBadge-badge")
      .should("have.css", "background-color", "rgb(255, 0, 0)")
      .and("have.css", "color", "rgb(255, 255, 255)");
  });
});
