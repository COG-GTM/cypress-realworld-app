import { MemoryRouter } from "react-router-dom";
import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("hides the badge when count is zero", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge count={0} />
      </MemoryRouter>
    );

    cy.get("[data-test=nav-top-notifications-link]").should("exist");
    cy.get(".MuiBadge-badge").should("have.class", "MuiBadge-invisible");
  });

  it("hides the badge when count is undefined", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge />
      </MemoryRouter>
    );

    cy.get("[data-test=nav-top-notifications-link]").should("exist");
    cy.get(".MuiBadge-badge").should("have.class", "MuiBadge-invisible");
  });

  it("displays the correct count when there are notifications", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge count={5} />
      </MemoryRouter>
    );

    cy.get("[data-test=nav-top-notifications-link]").should("exist");
    cy.get(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "5");
  });

  it("displays the correct count for larger numbers", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge count={42} />
      </MemoryRouter>
    );

    cy.get(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "42");
  });

  it("caps the count at 99+ for very large numbers", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge count={150} />
      </MemoryRouter>
    );

    cy.get(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "99+");
  });

  it("applies custom badge class when provided", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge count={3} badgeClassName="custom-badge-class" />
      </MemoryRouter>
    );

    cy.get(".MuiBadge-badge")
      .should("have.class", "custom-badge-class")
      .and("contain", "3");
  });

  it("links to the notifications page", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge count={1} />
      </MemoryRouter>
    );

    cy.get("[data-test=nav-top-notifications-link]")
      .should("have.attr", "href", "/notifications");
  });
});
