import { MemoryRouter } from "react-router-dom";
import { interpret, State } from "xstate";
import NavDrawer from "./NavDrawer";
import { authMachine } from "../machines/authMachine";

const testUser = {
  id: "t45AiwidW",
  uuid: "6383f84e-b511-44c5-a835-3ece1d781fa8",
  firstName: "Edgar",
  lastName: "Johns",
  username: "Katharina_Bernier",
  password: "$2a$10$5PXHGtcsckWtAprT5/JmluhR13f16BL8SIGhvAKNP.Dhxkt69FfzW",
  email: "Norene39@yahoo.com",
  phoneNumber: "625-316-9882",
  avatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/t45AiwidW.svg",
  defaultPrivacyLevel: "public" as const,
  balance: 168137,
  createdAt: new Date("2019-08-27T23:47:05.637Z"),
  modifiedAt: new Date("2020-05-21T11:02:22.857Z"),
};

describe("NavDrawer", () => {
  const getAuthService = () => {
    const authorizedState = State.from("authorized", {
      user: testUser,
      message: undefined,
    });
    // @ts-ignore
    const resolvedState = authMachine.resolveState(authorizedState);
    const authService = interpret(authMachine).start(resolvedState);
    return authService;
  };

  it("renders menu items when drawer is open", () => {
    const authService = getAuthService();
    cy.mount(
      <MemoryRouter>
        <NavDrawer
          drawerOpen={true}
          toggleDrawer={cy.stub()}
          closeMobileDrawer={cy.stub()}
          authService={authService as any}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav]").should("exist");
    cy.get("[data-test=sidenav-home]").should("contain", "Home");
    cy.get("[data-test=sidenav-user-settings]").should("contain", "My Account");
    cy.get("[data-test=sidenav-bankaccounts]").should("contain", "Bank Accounts");
    cy.get("[data-test=sidenav-notifications]").should("contain", "Notifications");
    cy.get("[data-test=sidenav-signout]").should("contain", "Logout");
  });

  it("shows user info when drawer is open", () => {
    const authService = getAuthService();
    cy.mount(
      <MemoryRouter>
        <NavDrawer
          drawerOpen={true}
          toggleDrawer={cy.stub()}
          closeMobileDrawer={cy.stub()}
          authService={authService as any}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav-user-full-name]").should("contain", "Edgar");
    cy.get("[data-test=sidenav-username]").should("contain", "@Katharina_Bernier");
    cy.get("[data-test=sidenav-user-balance]").should("exist");
  });

  it("hides user profile when drawer is closed", () => {
    const authService = getAuthService();
    cy.mount(
      <MemoryRouter>
        <NavDrawer
          drawerOpen={false}
          toggleDrawer={cy.stub()}
          closeMobileDrawer={cy.stub()}
          authService={authService as any}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=sidenav-user-full-name]").should("not.exist");
    cy.get("[data-test=sidenav-username]").should("not.exist");
  });
});
