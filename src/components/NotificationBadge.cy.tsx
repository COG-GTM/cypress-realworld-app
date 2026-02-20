import { MemoryRouter } from "react-router-dom";
import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("hides the badge when notification count is zero", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={0} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-link']").should("be.visible");
    cy.get("[data-test='nav-top-notifications-count']")
      .find(".MuiBadge-badge")
      .should("have.class", "MuiBadge-invisible");
  });

  it("displays the correct count for a single notification", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={1} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-link']").should("be.visible");
    cy.get("[data-test='nav-top-notifications-count']")
      .find(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("have.text", "1");
  });

  it("displays the correct count for multiple notifications", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={5} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-count']")
      .find(".MuiBadge-badge")
      .should("have.text", "5");
  });

  it("displays the correct count for a large number of notifications", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={99} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-count']")
      .find(".MuiBadge-badge")
      .should("have.text", "99");
  });

  it("displays 99+ for counts exceeding 99", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notificationCount={150} />
      </MemoryRouter>
    );
    cy.get("[data-test='nav-top-notifications-count']")
      .find(".MuiBadge-badge")
      .should("have.text", "99+");
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
});
