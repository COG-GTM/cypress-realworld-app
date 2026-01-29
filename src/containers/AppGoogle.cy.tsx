import { interpret } from "xstate";
import { authMachine } from "../machines/authMachine";
import AlertBar from "../components/AlertBar";
import { snackbarMachine, Severities } from "../machines/snackbarMachine";

describe("Google Provider Components", () => {
  describe("AlertBar with Google context", () => {
    let snackbarService;

    beforeEach(() => {
      snackbarService = interpret(snackbarMachine);
      snackbarService.start();
    });

    afterEach(() => {
      snackbarService.stop();
    });

    it("displays success alert for Google login", () => {
      snackbarService.send({
        type: "SHOW",
        severity: Severities.success,
        message: "Successfully logged in with Google",
      });

      cy.mount(<AlertBar snackbarService={snackbarService} />);

      cy.get("[data-test*='alert-bar']")
        .should("be.visible")
        .and("contain", "Successfully logged in with Google")
        .and("have.class", "MuiAlert-filledSuccess");
    });

    it("displays error alert for Google authentication failure", () => {
      snackbarService.send({
        type: "SHOW",
        severity: Severities.error,
        message: "Google authentication failed",
      });

      cy.mount(<AlertBar snackbarService={snackbarService} />);

      cy.get("[data-test*='alert-bar']")
        .should("be.visible")
        .and("contain", "Google authentication failed")
        .and("have.class", "MuiAlert-filledError");
    });

    it("displays warning alert for Google account not found", () => {
      snackbarService.send({
        type: "SHOW",
        severity: Severities.warning,
        message: "Google account not linked",
      });

      cy.mount(<AlertBar snackbarService={snackbarService} />);

      cy.get("[data-test*='alert-bar']")
        .should("be.visible")
        .and("contain", "Google account not linked")
        .and("have.class", "MuiAlert-filledWarning");
    });
  });

  describe("Google Machine State", () => {
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

    it("handles Google user profile data and transitions to google state", () => {
      authService.send({
        type: "GOOGLE",
        user: {
          googleId: "google-user-123",
          email: "user@gmail.com",
          givenName: "Test",
          familyName: "User",
          imageUrl: "https://lh3.googleusercontent.com/avatar.png",
        },
        token: "mock-google-token",
      });

      expect(authService.state.value).to.equal("google");
    });

    it("can logout from google state", () => {
      cy.intercept("POST", "http://localhost:3001/logout", {
        statusCode: 200,
      }).as("logoutRequest");

      authService.send({
        type: "GOOGLE",
        user: {
          googleId: "google-user-123",
          email: "user@gmail.com",
          givenName: "Test",
          familyName: "User",
          imageUrl: "https://lh3.googleusercontent.com/avatar.png",
        },
        token: "mock-google-token",
      });

      authService.send({ type: "LOGOUT" });
      expect(authService.state.value).to.equal("logout");
    });
  });
});
