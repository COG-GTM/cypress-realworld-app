import { interpret } from "xstate";
import { authMachine } from "../machines/authMachine";
import AlertBar from "../components/AlertBar";
import { snackbarMachine, Severities } from "../machines/snackbarMachine";

describe("Okta Provider Components", () => {
  describe("AlertBar with Okta context", () => {
    let snackbarService;

    beforeEach(() => {
      snackbarService = interpret(snackbarMachine);
      snackbarService.start();
    });

    afterEach(() => {
      snackbarService.stop();
    });

    it("displays success alert for Okta login", () => {
      snackbarService.send({
        type: "SHOW",
        severity: Severities.success,
        message: "Successfully logged in with Okta",
      });

      cy.mount(<AlertBar snackbarService={snackbarService} />);

      cy.get("[data-test*='alert-bar']")
        .should("be.visible")
        .and("contain", "Successfully logged in with Okta")
        .and("have.class", "MuiAlert-filledSuccess");
    });

    it("displays error alert for Okta authentication failure", () => {
      snackbarService.send({
        type: "SHOW",
        severity: Severities.error,
        message: "Okta authentication failed",
      });

      cy.mount(<AlertBar snackbarService={snackbarService} />);

      cy.get("[data-test*='alert-bar']")
        .should("be.visible")
        .and("contain", "Okta authentication failed")
        .and("have.class", "MuiAlert-filledError");
    });

    it("displays warning alert for Okta session expiry", () => {
      snackbarService.send({
        type: "SHOW",
        severity: Severities.warning,
        message: "Okta session is about to expire",
      });

      cy.mount(<AlertBar snackbarService={snackbarService} />);

      cy.get("[data-test*='alert-bar']")
        .should("be.visible")
        .and("contain", "Okta session is about to expire")
        .and("have.class", "MuiAlert-filledWarning");
    });
  });

  describe("Okta Machine State", () => {
    let authService;

    beforeEach(() => {
      authService = interpret(authMachine);
      authService.start();
    });

    afterEach(() => {
      authService.stop();
    });

    it("transitions to okta state on OKTA event", () => {
      authService.send({ type: "OKTA" });
      expect(authService.state.value).to.equal("okta");
    });

    it("handles Okta user profile data", () => {
      authService.send({
        type: "OKTA",
        user: {
          sub: "okta-user-123",
          email: "user@example.com",
          given_name: "Test",
          family_name: "User",
          preferred_username: "testuser",
        },
        token: "mock-okta-token",
      });

      expect(authService.state.value).to.equal("okta");
    });

    it("can logout from okta state", () => {
      cy.intercept("POST", "http://localhost:3001/logout", {
        statusCode: 200,
      }).as("logoutRequest");

      authService.send({
        type: "OKTA",
        user: {
          sub: "okta-user-123",
          email: "user@example.com",
          given_name: "Test",
          family_name: "User",
          preferred_username: "testuser",
        },
        token: "mock-okta-token",
      });

      authService.send({ type: "LOGOUT" });
      expect(authService.state.value).to.equal("logout");
    });
  });
});
