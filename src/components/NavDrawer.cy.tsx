import React from "react";
import { interpret } from "xstate";
import { MemoryRouter } from "react-router-dom";
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
  let authService: any;

  beforeEach(() => {
    authService = interpret(
      authMachine.withConfig({
        services: {
          performLogin: async () => ({ user: testUser }),
          performLogout: async () => ({}),
          performSignup: async () => ({}),
          getUserProfile: async () => ({ user: testUser }),
          getGoogleUserProfile: async () => ({ user: testUser }),
          getAuth0UserProfile: async () => ({ user: testUser }),
          getOktaUserProfile: async () => ({ user: testUser }),
          getCognitoUserProfile: async () => ({ user: testUser }),
          updateProfile: async () => ({}),
        },
        actions: {
          redirectHomeAfterLogin: () => {},
        },
      })
    );
    authService.start();
    authService.send("LOGIN");
    cy.wrap(authService, { timeout: 5000 }).should((service: any) => {
      expect(service.state.value).to.equal("authorized");
    });
  });

  it("renders menu items when drawer is open", () => {
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
    cy.get("[data-test=sidenav]").should("exist");
    cy.get("[data-test=sidenav-home]").should("contain", "Home");
    cy.get("[data-test=sidenav-user-settings]").should("contain", "My Account");
    cy.get("[data-test=sidenav-bankaccounts]").should("contain", "Bank Accounts");
    cy.get("[data-test=sidenav-notifications]").should("contain", "Notifications");
    cy.get("[data-test=sidenav-signout]").should("contain", "Logout");
  });

  it("displays user info when drawer is open", () => {
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
    cy.get("[data-test=sidenav-user-full-name]").should("contain", "Edgar");
    cy.get("[data-test=sidenav-username]").should("contain", "@Katharina_Bernier");
    cy.get("[data-test=sidenav-user-balance]").should("exist");
  });

  it("hides user profile when drawer is closed", () => {
    function DrawerWrapper() {
      const [open, setOpen] = React.useState(true);
      return (
        <MemoryRouter>
          <button data-test="close-drawer-btn" onClick={() => setOpen(false)}>
            Close
          </button>
          <NavDrawer
            drawerOpen={open}
            toggleDrawer={() => setOpen(false)}
            closeMobileDrawer={() => setOpen(false)}
            authService={authService}
          />
        </MemoryRouter>
      );
    }
    cy.mount(<DrawerWrapper />);
    cy.get("[data-test=sidenav-user-full-name]").should("be.visible");
    cy.get("[data-test=close-drawer-btn]").click({ force: true });
    cy.get("[data-test=sidenav-user-full-name]").should("not.be.visible");
  });
});
