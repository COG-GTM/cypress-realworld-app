import { interpret } from "xstate";
import { MemoryRouter } from "react-router-dom";
import NavDrawer from "./NavDrawer";
import { authMachine } from "../machines/authMachine";

const user = {
  id: "t45AiwidW",
  firstName: "Edgar",
  lastName: "Johns",
  username: "Katharina_Bernier",
  avatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/t45AiwidW.svg",
  balance: 168137,
};

describe("NavDrawer", () => {
  let authService;

  const mountDrawer = (currentUser: object | null = user, drawerOpen = true) => {
    authService = interpret(authMachine);
    authService.start();
    if (currentUser) {
      cy.intercept("POST", "http://localhost:3001/login", { user: currentUser }).as("loginPost");
      cy.then(() =>
        authService.send({ type: "LOGIN", username: "Katharina_Bernier", password: "s3cret" })
      );
      cy.wait("@loginPost");
      cy.wrap(null).should(() => expect(authService.state.value).to.equal("authorized"));
    }
    cy.then(() =>
      cy.mount(
        <MemoryRouter>
          <NavDrawer
            drawerOpen={drawerOpen}
            toggleDrawer={cy.spy().as("toggleDrawer")}
            closeMobileDrawer={cy.spy().as("closeMobileDrawer")}
            authService={authService}
          />
        </MemoryRouter>
      )
    );
  };

  context("desktop", () => {
    beforeEach(() => {
      cy.viewport(1000, 660);
    });

    it("renders the current user profile and balance", () => {
      mountDrawer();

      cy.get("[data-test=sidenav-user-full-name]").should("contain", "Edgar J");
      cy.get("[data-test=sidenav-username]").should("contain", "@Katharina_Bernier");
      cy.get("[data-test=sidenav-user-balance]").should("contain", "$1,681.37");
    });

    it("renders a zero balance when the user has no balance", () => {
      mountDrawer({ ...user, balance: 0 });

      cy.get("[data-test=sidenav-user-balance]").should("contain", "$0.00");
    });

    it("renders navigation links without toggling the persistent drawer", () => {
      mountDrawer();

      cy.get("[data-test=sidenav-home]").should("have.attr", "href", "/");
      cy.get("[data-test=sidenav-user-settings]").should("have.attr", "href", "/user/settings");
      cy.get("[data-test=sidenav-bankaccounts]").should("have.attr", "href", "/bankaccounts");
      cy.get("[data-test=sidenav-notifications]").should("have.attr", "href", "/notifications");

      cy.get("[data-test=sidenav-bankaccounts]").click();
      cy.get("@toggleDrawer").should("not.have.been.called");
    });

    it("logs the user out", () => {
      cy.intercept("POST", "http://localhost:3001/logout", { statusCode: 200 }).as("logout");
      mountDrawer();

      cy.get("[data-test=sidenav-signout]").click();

      cy.wait("@logout");
      cy.wrap(null).should(() => {
        expect(authService.state.value).to.equal("unauthorized");
      });
    });

    it("hides the user profile when there is no user", () => {
      mountDrawer(null);

      cy.get("[data-test=sidenav-user-full-name]").should("not.exist");
      cy.get("[data-test=sidenav-user-balance]").should("not.exist");
      cy.get("[data-test=sidenav-signout]").should("exist");
    });
  });

  context("mobile", () => {
    beforeEach(() => {
      cy.viewport("iphone-6");
    });

    it("toggles the temporary drawer when a link is clicked", () => {
      mountDrawer();

      cy.get("[data-test=sidenav-home]").click();

      cy.get("@toggleDrawer").should("have.been.calledOnce");
    });

    it("closes the mobile drawer when the backdrop is clicked", () => {
      mountDrawer();

      cy.get(".MuiBackdrop-root").click({ force: true });

      cy.get("@closeMobileDrawer").should("have.been.called");
    });

    it("is not rendered when closed", () => {
      mountDrawer(user, false);

      cy.get("[data-test=sidenav-home]").should("not.exist");
    });
  });
});
