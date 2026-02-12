import { MemoryRouter } from "react-router-dom";
import { interpret } from "xstate";
import { dataMachine } from "../machines/dataMachine";
import NavBar from "./NavBar";

describe("NavBar", () => {
  it("renders navigation links", () => {
    const notificationsService = interpret(dataMachine("notifications"));
    notificationsService.start();

    cy.mount(
      <MemoryRouter initialEntries={["/"]}>
        <NavBar
          drawerOpen={true}
          toggleDrawer={cy.stub()}
          notificationsService={notificationsService as any}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=app-name-logo]").should("exist");
    cy.get("[data-test=nav-top-new-transaction]").should("contain", "New");
    cy.get("[data-test=nav-top-notifications-link]").should("exist");
  });

  it("shows notification badge count", () => {
    const notificationsService = interpret(
      dataMachine("notifications").withContext({
        results: [
          { id: "1", message: "notif1" },
          { id: "2", message: "notif2" },
          { id: "3", message: "notif3" },
        ],
      })
    );
    notificationsService.start();

    cy.mount(
      <MemoryRouter initialEntries={["/"]}>
        <NavBar
          drawerOpen={true}
          toggleDrawer={cy.stub()}
          notificationsService={notificationsService as any}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=nav-top-notifications-count]").should("contain", "3");
  });

  it("calls toggleDrawer when menu icon is clicked", () => {
    const notificationsService = interpret(dataMachine("notifications"));
    notificationsService.start();
    const toggleDrawer = cy.stub().as("toggleDrawer");

    cy.mount(
      <MemoryRouter initialEntries={["/"]}>
        <NavBar
          drawerOpen={false}
          toggleDrawer={toggleDrawer}
          notificationsService={notificationsService as any}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav-toggle]").click();
    cy.get("@toggleDrawer").should("have.been.calledOnce");
  });
});
