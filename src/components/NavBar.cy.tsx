import { interpret } from "xstate";
import { MemoryRouter } from "react-router-dom";
import NavBar from "./NavBar";
import { dataMachine } from "../machines/dataMachine";

describe("NavBar", () => {
  let notificationsService: any;

  beforeEach(() => {
    notificationsService = interpret(
      dataMachine("notifications").withContext({
        results: [],
        pageData: {},
        message: undefined,
      })
    );
    notificationsService.start();
  });

  it("renders navigation links", () => {
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
    cy.get("[data-test=nav-top-new-transaction]").should("exist");
    cy.get("[data-test=nav-top-notifications-link]").should("exist");
    cy.get("[data-test=app-name-logo]").should("exist");
  });

  it("shows sidenav toggle button", () => {
    const toggleDrawer = cy.stub();
    cy.mount(
      <MemoryRouter initialEntries={["/"]}>
        <NavBar
          drawerOpen={false}
          toggleDrawer={toggleDrawer}
          notificationsService={notificationsService}
        />
      </MemoryRouter>
    );
    cy.get("[data-test=sidenav-toggle]")
      .click()
      .then(() => {
        expect(toggleDrawer).to.have.been.calledOnce;
      });
  });

  it("shows notification badge count", () => {
    const notificationsWithData = interpret(
      dataMachine("notifications").withConfig(
        {},
        {
          results: [{ id: "1" }, { id: "2" }, { id: "3" }],
          pageData: {},
          message: undefined,
        }
      )
    );
    notificationsWithData.start();

    const toggleDrawer = cy.stub();
    cy.mount(
      <MemoryRouter initialEntries={["/"]}>
        <NavBar
          drawerOpen={true}
          toggleDrawer={toggleDrawer}
          notificationsService={notificationsWithData}
        />
      </MemoryRouter>
    );
    cy.get("[data-test=nav-top-notifications-count]").should("contain", "3");
  });

  it("shows transaction nav tabs on home route", () => {
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
    cy.get("[data-test=nav-transaction-tabs]").should("exist");
  });
});
