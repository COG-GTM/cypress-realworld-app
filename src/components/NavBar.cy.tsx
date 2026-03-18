import { interpret } from "xstate";
import { MemoryRouter } from "react-router-dom";
import NavBar from "./NavBar";
import { dataMachine } from "../machines/dataMachine";

describe("NavBar Airbnb Redesign", () => {
  let notificationsService: any;

  beforeEach(() => {
    notificationsService = interpret(dataMachine);
    notificationsService.start();
  });

  it("renders with Airbnb-style white background and pink branding", () => {
    cy.mount(
      <MemoryRouter>
        <NavBar
          toggleDrawer={() => {}}
          drawerOpen={true}
          notificationsService={notificationsService}
        />
      </MemoryRouter>
    );

    // Verify white background AppBar
    cy.get("[data-test=sidenav-toggle]").should("be.visible");

    // Verify the app title with Airbnb pink color
    cy.get("[data-test=app-name-logo]")
      .should("contain", "Real World App")
      .and("have.css", "color", "rgb(255, 56, 92)");

    // Verify the New Transaction button has pink styling
    cy.get("[data-test=nav-top-new-transaction]")
      .should("be.visible")
      .and("have.css", "background-color", "rgb(255, 56, 92)")
      .and("have.css", "border-radius", "24px");
  });

  it("renders notification bell icon", () => {
    cy.mount(
      <MemoryRouter>
        <NavBar
          toggleDrawer={() => {}}
          drawerOpen={true}
          notificationsService={notificationsService}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=nav-top-notifications-link]").should("be.visible");
  });

  it("has Nunito font family on branding elements", () => {
    cy.mount(
      <MemoryRouter>
        <NavBar
          toggleDrawer={() => {}}
          drawerOpen={true}
          notificationsService={notificationsService}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=app-name-logo]")
      .should("have.css", "font-family")
      .and("include", "Nunito");
  });
});
