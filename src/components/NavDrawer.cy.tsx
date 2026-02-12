import { interpret, Machine, assign } from "xstate";
import { MemoryRouter } from "react-router-dom";
import NavDrawer from "./NavDrawer";

const authMachine = Machine({
  id: "testAuth",
  initial: "authorized",
  context: {
    user: {
      id: "user-1",
      uuid: "uuid-1",
      firstName: "Edgar",
      lastName: "Johns",
      username: "Katharina_Bernier",
      password: "hashed",
      email: "test@test.com",
      phoneNumber: "625-316-9882",
      avatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/t45AiwidW.svg",
      defaultPrivacyLevel: "public",
      balance: 168137,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  },
  states: {
    authorized: {
      on: {
        LOGOUT: "unauthorized",
      },
    },
    unauthorized: {},
  },
});

describe("NavDrawer", () => {
  let authService: any;

  beforeEach(() => {
    authService = interpret(authMachine);
    authService.start();
  });

  it("renders the drawer when open", () => {
    const toggleDrawer = cy.stub();
    const closeMobileDrawer = cy.stub();
    cy.mount(
      <MemoryRouter>
        <NavDrawer
          drawerOpen={true}
          toggleDrawer={toggleDrawer}
          closeMobileDrawer={closeMobileDrawer}
          authService={authService}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav]").should("be.visible");
  });

  it("renders user full name", () => {
    const toggleDrawer = cy.stub();
    const closeMobileDrawer = cy.stub();
    cy.mount(
      <MemoryRouter>
        <NavDrawer
          drawerOpen={true}
          toggleDrawer={toggleDrawer}
          closeMobileDrawer={closeMobileDrawer}
          authService={authService}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav-user-full-name]").should("be.visible");
  });

  it("renders username", () => {
    const toggleDrawer = cy.stub();
    const closeMobileDrawer = cy.stub();
    cy.mount(
      <MemoryRouter>
        <NavDrawer
          drawerOpen={true}
          toggleDrawer={toggleDrawer}
          closeMobileDrawer={closeMobileDrawer}
          authService={authService}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav-username]").should("contain", "@Katharina_Bernier");
  });

  it("renders user balance", () => {
    const toggleDrawer = cy.stub();
    const closeMobileDrawer = cy.stub();
    cy.mount(
      <MemoryRouter>
        <NavDrawer
          drawerOpen={true}
          toggleDrawer={toggleDrawer}
          closeMobileDrawer={closeMobileDrawer}
          authService={authService}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav-user-balance]").should("be.visible");
  });

  it("renders navigation links", () => {
    const toggleDrawer = cy.stub();
    const closeMobileDrawer = cy.stub();
    cy.mount(
      <MemoryRouter>
        <NavDrawer
          drawerOpen={true}
          toggleDrawer={toggleDrawer}
          closeMobileDrawer={closeMobileDrawer}
          authService={authService}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav-home]").should("be.visible");
    cy.get("[data-test=sidenav-user-settings]").should("be.visible");
    cy.get("[data-test=sidenav-bankaccounts]").should("be.visible");
    cy.get("[data-test=sidenav-notifications]").should("be.visible");
  });

  it("renders logout button", () => {
    const toggleDrawer = cy.stub();
    const closeMobileDrawer = cy.stub();
    cy.mount(
      <MemoryRouter>
        <NavDrawer
          drawerOpen={true}
          toggleDrawer={toggleDrawer}
          closeMobileDrawer={closeMobileDrawer}
          authService={authService}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav-signout]").should("be.visible").and("contain", "Logout");
  });
});
