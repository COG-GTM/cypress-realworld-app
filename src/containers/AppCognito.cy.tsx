import { interpret } from "xstate";
import { authMachine } from "../machines/authMachine";
import AlertBar from "../components/AlertBar";
import { snackbarMachine, Severities } from "../machines/snackbarMachine";

describe("Cognito Provider Components", () => {
  describe("AlertBar with Cognito context", () => {
    let snackbarService;

    beforeEach(() => {
      snackbarService = interpret(snackbarMachine);
      snackbarService.start();
    });

    afterEach(() => {
      snackbarService.stop();
    });

    it("displays success alert for Cognito login", () => {
      snackbarService.send({
        type: "SHOW",
        severity: Severities.success,
        message: "Successfully logged in with AWS Cognito",
      });

      cy.mount(<AlertBar snackbarService={snackbarService} />);

      cy.get("[data-test*='alert-bar']")
        .should("be.visible")
        .and("contain", "Successfully logged in with AWS Cognito")
        .and("have.class", "MuiAlert-filledSuccess");
    });

    it("displays error alert for Cognito authentication failure", () => {
      snackbarService.send({
        type: "SHOW",
        severity: Severities.error,
        message: "Cognito authentication failed",
      });

      cy.mount(<AlertBar snackbarService={snackbarService} />);

      cy.get("[data-test*='alert-bar']")
        .should("be.visible")
        .and("contain", "Cognito authentication failed")
        .and("have.class", "MuiAlert-filledError");
    });

    it("displays info alert for Cognito redirect", () => {
      snackbarService.send({
        type: "SHOW",
        severity: Severities.info,
        message: "Redirecting to Cognito login...",
      });

      cy.mount(<AlertBar snackbarService={snackbarService} />);

      cy.get("[data-test*='alert-bar']")
        .should("be.visible")
        .and("contain", "Redirecting to Cognito login...")
        .and("have.class", "MuiAlert-filledInfo");
    });
  });

  describe("Cognito Machine State", () => {
    let authService;

    beforeEach(() => {
      authService = interpret(authMachine);
      authService.start();
    });

    afterEach(() => {
      authService.stop();
    });

    it("transitions to cognito state on COGNITO event", () => {
      authService.send({ type: "COGNITO" });
      expect(authService.state.value).to.equal("cognito");
    });

    it("handles Cognito user profile data", () => {
      authService.send({
        type: "COGNITO",
        userSub: "cognito-user-sub-123",
        email: "user@example.com",
        accessTokenJwtString: "mock-cognito-jwt-token",
      });

      expect(authService.state.value).to.equal("cognito");
    });

    it("can logout from cognito state", () => {
      cy.intercept("POST", "http://localhost:3001/logout", {
        statusCode: 200,
      }).as("logoutRequest");

      authService.send({
        type: "COGNITO",
        userSub: "cognito-user-sub-123",
        email: "user@example.com",
        accessTokenJwtString: "mock-cognito-jwt-token",
      });

      authService.send({ type: "LOGOUT" });
      expect(authService.state.value).to.equal("logout");
    });
  });
});
