import { interpret } from "xstate";
import { authMachine } from "./authMachine";

describe("AuthMachine State Transitions", () => {
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

  it("transitions to loading state on LOGIN event", () => {
    authService.send({ type: "LOGIN", username: "test", password: "test" });
    expect(authService.state.value).to.equal("loading");
  });

  it("transitions to signup state on SIGNUP event", () => {
    authService.send({
      type: "SIGNUP",
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      password: "password",
    });
    expect(authService.state.value).to.equal("signup");
  });

  it("transitions to google state on GOOGLE event with user data", () => {
    authService.send({
      type: "GOOGLE",
      user: {
        googleId: "google-123",
        email: "user@gmail.com",
        givenName: "Test",
        familyName: "User",
        imageUrl: "https://example.com/avatar.png",
      },
    });
    expect(authService.state.value).to.equal("google");
  });

  it("transitions to auth0 state on AUTH0 event with user data", () => {
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

  it("transitions to okta state on OKTA event with user data", () => {
    authService.send({
      type: "OKTA",
      user: {
        sub: "okta-123",
        email: "user@example.com",
        given_name: "Test",
        family_name: "User",
        preferred_username: "testuser",
      },
      token: "mock-okta-token",
    });
    expect(authService.state.value).to.equal("okta");
  });

  it("transitions to cognito state on COGNITO event", () => {
    authService.send({ type: "COGNITO" });
    expect(authService.state.value).to.equal("cognito");
  });

  it("has undefined user in initial context", () => {
    expect(authService.state.context.user).to.be.undefined;
  });

  it("has undefined message in initial context", () => {
    expect(authService.state.context.message).to.be.undefined;
  });

  describe("Login Flow", () => {
    it("transitions to authorized on successful login", () => {
      cy.intercept("POST", "http://localhost:3001/login", {
        statusCode: 200,
        body: {
          user: {
            id: "test-id",
            firstName: "Test",
            lastName: "User",
            username: "testuser",
          },
        },
      }).as("loginRequest");

      authService.send({ type: "LOGIN", username: "testuser", password: "password" });

      cy.wait("@loginRequest").then(() => {
        cy.wrap(authService.state.value).should("equal", "authorized");
      });
    });

    it("transitions back to unauthorized on login error", () => {
      cy.intercept("POST", "http://localhost:3001/login", {
        statusCode: 401,
        body: { message: "Invalid credentials" },
      }).as("loginRequest");

      authService.send({ type: "LOGIN", username: "invalid", password: "invalid" });

      cy.wait("@loginRequest").then(() => {
        cy.wrap(authService.state.value).should("equal", "unauthorized");
      });
    });
  });

  describe("Signup Flow", () => {
    it("transitions back to unauthorized after successful signup", () => {
      cy.intercept("POST", "http://localhost:3001/users", {
        statusCode: 201,
        body: {
          user: {
            id: "new-user-id",
            firstName: "New",
            lastName: "User",
            username: "newuser",
          },
        },
      }).as("signupRequest");

      authService.send({
        type: "SIGNUP",
        firstName: "New",
        lastName: "User",
        username: "newuser",
        password: "password",
      });

      cy.wait("@signupRequest").then(() => {
        cy.wrap(authService.state.value).should("equal", "unauthorized");
      });
    });
  });

  describe("Logout Flow", () => {
    it("transitions from authorized to logout on LOGOUT event", () => {
      cy.intercept("POST", "http://localhost:3001/login", {
        statusCode: 200,
        body: {
          user: {
            id: "test-id",
            firstName: "Test",
            lastName: "User",
            username: "testuser",
          },
        },
      }).as("loginRequest");

      cy.intercept("POST", "http://localhost:3001/logout", {
        statusCode: 200,
      }).as("logoutRequest");

      authService.send({ type: "LOGIN", username: "testuser", password: "password" });

      cy.wait("@loginRequest").then(() => {
        authService.send({ type: "LOGOUT" });
        expect(authService.state.value).to.equal("logout");
      });
    });
  });
});
