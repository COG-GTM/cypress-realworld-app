import { MemoryRouter } from "react-router-dom";
import { Machine, interpret } from "xstate";

import NavDrawer from "./NavDrawer";

describe("NavDrawer", () => {
  it("renders user info and navigation links", () => {
    const toggleDrawer = cy.spy().as("toggleDrawer");
    const closeMobileDrawer = cy.spy().as("closeMobileDrawer");

    const authService = interpret(
      Machine({
        id: "auth",
        initial: "authorized",
        context: {
          user: {
            id: "u1",
            firstName: "Alice",
            lastName: "Doe",
            username: "alice",
            avatar: "https://example.com/a.png",
            balance: 10000,
          },
        },
        states: {
          authorized: { on: { LOGOUT: "unauthorized" } },
          unauthorized: {},
        },
      })
    ).start();

    cy.mount(
      <MemoryRouter>
        <NavDrawer
          drawerOpen={true}
          toggleDrawer={toggleDrawer}
          closeMobileDrawer={closeMobileDrawer}
          authService={authService as any}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav]").should("exist");
    cy.get("[data-test=sidenav-user-full-name]").should("contain", "Alice D");
    cy.get("[data-test=sidenav-username]").should("contain", "@alice");
    cy.get("[data-test=sidenav-user-balance]").should("contain", "$100.00");

    cy.get("[data-test=sidenav-home]").should("exist");
    cy.get("[data-test=sidenav-user-settings]").should("exist");
    cy.get("[data-test=sidenav-bankaccounts]").should("exist");
    cy.get("[data-test=sidenav-notifications]").should("exist");

    cy.spy(authService, "send").as("authSend");

    cy.get("[data-test=sidenav-signout]").click();
    cy.get("@authSend").should("have.been.calledWith", "LOGOUT");

    authService.stop();
  });

  it("calls toggleDrawer when in mobile viewport", () => {
    cy.viewport(320, 700);

    const toggleDrawer = cy.spy().as("toggleDrawer");
    const closeMobileDrawer = cy.spy().as("closeMobileDrawer");

    const authService = interpret(
      Machine({
        id: "auth",
        initial: "authorized",
        context: {
          user: {
            id: "u1",
            firstName: "Alice",
            lastName: "Doe",
            username: "alice",
            avatar: "https://example.com/a.png",
            balance: 10000,
          },
        },
        states: {
          authorized: {},
        },
      })
    ).start();

    cy.mount(
      <MemoryRouter>
        <NavDrawer
          drawerOpen={true}
          toggleDrawer={toggleDrawer}
          closeMobileDrawer={closeMobileDrawer}
          authService={authService as any}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav-home]").click();
    cy.get("@toggleDrawer").should("have.been.calledOnce");

    authService.stop();
  });
});
