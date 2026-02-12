import { MemoryRouter } from "react-router-dom";
import { Machine, interpret } from "xstate";

import NavBar from "./NavBar";

describe("NavBar", () => {
  it("renders and toggles the drawer", () => {
    const toggleDrawer = cy.spy().as("toggleDrawer");

    const notificationsService = interpret(
      Machine({
        id: "notifications",
        initial: "idle",
        context: {
          results: [{ id: "n1" }, { id: "n2" }],
        },
        states: {
          idle: {},
        },
      })
    ).start();

    cy.mount(
      <MemoryRouter initialEntries={["/"]}>
        <NavBar drawerOpen={false} toggleDrawer={toggleDrawer} notificationsService={notificationsService as any} />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav-toggle]").click();
    cy.get("@toggleDrawer").should("have.been.calledOnce");

    cy.get("[data-test=nav-top-new-transaction]").should("exist");
    cy.get("[data-test=nav-top-notifications-link]").should("exist");
    cy.get("[data-test=nav-top-notifications-count]").should("contain", "2");

    cy.get("[data-test=nav-transaction-tabs]").should("exist");

    notificationsService.stop();
  });

  it("does not render transaction tabs on non-transaction routes", () => {
    const toggleDrawer = cy.spy().as("toggleDrawer");

    const notificationsService = interpret(
      Machine({
        id: "notifications",
        initial: "idle",
        context: {
          results: [],
        },
        states: {
          idle: {},
        },
      })
    ).start();

    cy.mount(
      <MemoryRouter initialEntries={["/notifications"]}>
        <NavBar drawerOpen={false} toggleDrawer={toggleDrawer} notificationsService={notificationsService as any} />
      </MemoryRouter>
    );

    cy.get("[data-test=nav-transaction-tabs]").should("not.exist");

    notificationsService.stop();
  });
});
