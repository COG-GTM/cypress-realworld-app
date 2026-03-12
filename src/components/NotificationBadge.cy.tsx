import { MemoryRouter } from "react-router-dom";
import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("hides badge when there are zero notifications", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notifications={[]} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-count]").should("exist");
    cy.get("[data-test=nav-top-notifications-count] .MuiBadge-badge").should(
      "have.class",
      "MuiBadge-invisible"
    );
  });

  it("hides badge when notifications is undefined", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-count]").should("exist");
    cy.get("[data-test=nav-top-notifications-count] .MuiBadge-badge").should(
      "have.class",
      "MuiBadge-invisible"
    );
  });

  it("displays correct count for 1 notification", () => {
    const notifications = [{ id: "1", message: "test" }];
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notifications={notifications} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-count] .MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "1");
  });

  it("displays correct count for multiple notifications", () => {
    const notifications = [
      { id: "1", message: "test1" },
      { id: "2", message: "test2" },
      { id: "3", message: "test3" },
      { id: "4", message: "test4" },
      { id: "5", message: "test5" },
    ];
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notifications={notifications} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-count] .MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "5");
  });

  it("renders notifications icon", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notifications={[]} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-link]").should("exist");
    cy.get("[data-test=nav-top-notifications-link] svg").should("exist");
  });

  it("links to /notifications route", () => {
    cy.mount(
      <MemoryRouter>
        <NotificationBadge notifications={[]} />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-link]").should("have.attr", "href", "/notifications");
  });
});
