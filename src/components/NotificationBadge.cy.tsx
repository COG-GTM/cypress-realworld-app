import { MemoryRouter } from "react-router-dom";
import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("hides badge when count is 0", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge count={0} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-link]").should("exist");
    cy.get("[data-test=nav-top-notifications-count]")
      .find(".MuiBadge-badge")
      .should("have.class", "MuiBadge-invisible");
  });

  it("displays badge with count of 1", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge count={1} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-count]")
      .find(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "1");
  });

  it("displays badge with count of 5", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge count={5} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-count]")
      .find(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "5");
  });

  it("displays badge with count of 99", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge count={99} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-count]")
      .find(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "99");
  });

  it("links to notifications page", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge count={3} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-link]").should("have.attr", "href", "/notifications");
  });
});
