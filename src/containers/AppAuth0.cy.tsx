import { interpret } from "xstate";
import { MemoryRouter } from "react-router-dom";
import { authMachine } from "../machines/authMachine";
import AlertBar from "../components/AlertBar";
import { snackbarMachine, Severities } from "../machines/snackbarMachine";

describe("Auth0 Provider Components", () => {
  describe("AlertBar with Auth0 context", () => {
    let snackbarService;

    beforeEach(() => {
      snackbarService = interpret(snackbarMachine);
      snackbarService.start();
    });

    afterEach(() => {
      snackbarService.stop();
    });

    it("displays success alert for Auth0 login", () => {
      snackbarService.send({
        type: "SHOW",
        severity: Severities.success,
        message: "Successfully logged in with Auth0",
      });

      cy.mount(<AlertBar snackbarService={snackbarService} />);

      cy.get("[data-test*='alert-bar']")
        .should("be.visible")
        .and("contain", "Successfully logged in with Auth0")
        .and("have.class", "MuiAlert-filledSuccess");
    });

    it("displays error alert for Auth0 authentication failure", () => {
      snackbarService.send({
        type: "SHOW",
        severity: Severities.error,
        message: "Auth0 authentication failed",
      });

      cy.mount(<AlertBar snackbarService={snackbarService} />);

      cy.get("[data-test*='alert-bar']")
        .should("be.visible")
        .and("contain", "Auth0 authentication failed")
        .and("have.class", "MuiAlert-filledError");
    });
  });

  describe("Auth0 Machine State", () => {
    let authService;

    beforeEach(() => {
      authService = interpret(authMachine);
      authService.start();
    });

    afterEach(() => {
      authService.stop();
    });

    it("starts in unauthorized state", () => {
      expect(authService.state.value).to.equal("unauthorized");
    });

    it("handles Auth0 user profile data and transitions to auth0 state", () => {
      authService.send({
        type: "AUTH0",
        user: {
          sub: "auth0|123456",
          email: "user@example.com",
          nickname: "testuser",
          picture: "https://example.com/avatar.png",
        },
        token: "mock-auth0-token",
      });

      expect(authService.state.value).to.equal("auth0");
    });
  });
});
