import { interpret, Machine, assign } from "xstate";
import { MemoryRouter } from "react-router-dom";
import NavBar from "./NavBar";

const notificationsMachine = Machine({
  id: "testNotifications",
  initial: "idle",
  context: {
    results: [],
  },
  states: {
    idle: {
      on: {
        FETCH: "idle",
      },
    },
  },
});

describe("NavBar", () => {
  let notificationsService: any;

  beforeEach(() => {
    notificationsService = interpret(notificationsMachine);
    notificationsService.start();
  });

  it("renders the app logo", () => {
    const toggleDrawer = cy.stub();
    cy.mount(
      <MemoryRouter initialEntries={["/"]}>
        <NavBar
          drawerOpen={true}
          toggleDrawer={toggleDrawer}
          notificationsService={notificationsService}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=app-name-logo]").should("be.visible");
  });

  it("renders the new transaction button", () => {
    const toggleDrawer = cy.stub();
    cy.mount(
      <MemoryRouter initialEntries={["/"]}>
        <NavBar
          drawerOpen={true}
          toggleDrawer={toggleDrawer}
          notificationsService={notificationsService}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=nav-top-new-transaction]").should("be.visible").and("contain", "New");
  });

  it("renders the notifications link", () => {
    const toggleDrawer = cy.stub();
    cy.mount(
      <MemoryRouter initialEntries={["/"]}>
        <NavBar
          drawerOpen={true}
          toggleDrawer={toggleDrawer}
          notificationsService={notificationsService}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=nav-top-notifications-link]").should("be.visible");
  });

  it("renders the sidenav toggle button", () => {
    const toggleDrawer = cy.stub();
    cy.mount(
      <MemoryRouter initialEntries={["/"]}>
        <NavBar
          drawerOpen={true}
          toggleDrawer={toggleDrawer}
          notificationsService={notificationsService}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav-toggle]").should("be.visible");
  });

  it("calls toggleDrawer when sidenav toggle is clicked", () => {
    const toggleDrawer = cy.stub();
    cy.mount(
      <MemoryRouter initialEntries={["/"]}>
        <NavBar
          drawerOpen={true}
          toggleDrawer={toggleDrawer}
          notificationsService={notificationsService}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav-toggle]").click();
    cy.wrap(toggleDrawer).should("have.been.calledOnce");
  });
});
