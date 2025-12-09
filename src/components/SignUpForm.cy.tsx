import { interpret } from "xstate";
import { MemoryRouter } from "react-router-dom";
import SignUpForm from "./SignUpForm";
import { authMachine } from "../machines/authMachine";

describe("SignUpForm", () => {
  let authService: ReturnType<typeof interpret<typeof authMachine>>;

  beforeEach(() => {
    authService = interpret(authMachine);
    authService.start();

    expect(authService.state.value).to.equal("unauthorized");
  });

  afterEach(() => {
    authService.stop();
  });

  describe("Form Validation", () => {
    it("displays validation errors for required fields", () => {
      cy.mount(
        <MemoryRouter>
          <SignUpForm authService={authService} />
        </MemoryRouter>
      );

      cy.getBySel("signup-first-name").find("input").type("a").clear().blur();
      cy.get("#firstName-helper-text").should("contain", "First Name is required");

      cy.getBySel("signup-last-name").find("input").type("a").clear().blur();
      cy.get("#lastName-helper-text").should("contain", "Last Name is required");

      cy.getBySel("signup-username").find("input").type("a").clear().blur();
      cy.get("#username-helper-text").should("contain", "Username is required");

      cy.getBySel("signup-password").find("input").type("a").clear().blur();
      cy.get("#password-helper-text").should("contain", "Enter your password");

      cy.getBySel("signup-confirmPassword").find("input").type("a").clear().blur();
      cy.get("#confirmPassword-helper-text").should("contain", "Confirm your password");

      cy.getBySel("signup-submit").should("be.disabled");
    });

    it("displays validation error for password minimum length", () => {
      cy.mount(
        <MemoryRouter>
          <SignUpForm authService={authService} />
        </MemoryRouter>
      );

      cy.getBySel("signup-password").find("input").type("abc").blur();
      cy.get("#password-helper-text").should(
        "contain",
        "Password must contain at least 4 characters"
      );

      cy.getBySel("signup-submit").should("be.disabled");
    });

    it("displays validation error when passwords do not match", () => {
      cy.mount(
        <MemoryRouter>
          <SignUpForm authService={authService} />
        </MemoryRouter>
      );

      cy.getBySel("signup-password").find("input").type("password123");
      cy.getBySel("signup-confirmPassword").find("input").type("differentpassword").blur();
      cy.get("#confirmPassword-helper-text").should("contain", "Password does not match");

      cy.getBySel("signup-submit").should("be.disabled");
    });
  });

  describe("Form State Management", () => {
    it("has submit button disabled when form is invalid", () => {
      cy.mount(
        <MemoryRouter>
          <SignUpForm authService={authService} />
        </MemoryRouter>
      );

      cy.getBySel("signup-first-name").find("input").type("John");
      cy.getBySel("signup-submit").should("be.disabled");
    });

    it("enables submit button when form is valid", () => {
      cy.mount(
        <MemoryRouter>
          <SignUpForm authService={authService} />
        </MemoryRouter>
      );

      cy.getBySel("signup-first-name").find("input").type("John");
      cy.getBySel("signup-last-name").find("input").type("Doe");
      cy.getBySel("signup-username").find("input").type("johndoe");
      cy.getBySel("signup-password").find("input").type("password123");
      cy.getBySel("signup-confirmPassword").find("input").type("password123");

      cy.getBySel("signup-submit").should("be.enabled");
    });
  });

  describe("State Machine Integration", () => {
    it("sends SIGNUP event to auth machine with correct payload", () => {
      const signupData = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        password: "password123",
      };

      cy.intercept("POST", "http://localhost:3001/users", {
        statusCode: 201,
        body: {
          user: {
            id: "test-user-id",
            uuid: "test-uuid",
            ...signupData,
          },
        },
      }).as("signupPost");

      let signupEventPayload: Record<string, unknown> | null = null;
      authService.onEvent((event) => {
        if (event.type === "SIGNUP") {
          signupEventPayload = event;
        }
      });

      cy.mount(
        <MemoryRouter>
          <SignUpForm authService={authService} />
        </MemoryRouter>
      );

      cy.getBySel("signup-first-name").find("input").type(signupData.firstName);
      cy.getBySel("signup-last-name").find("input").type(signupData.lastName);
      cy.getBySel("signup-username").find("input").type(signupData.username);
      cy.getBySel("signup-password").find("input").type(signupData.password);
      cy.getBySel("signup-confirmPassword").find("input").type(signupData.password);

      cy.getBySel("signup-submit").click();

      cy.wrap(null).should(() => {
        expect(signupEventPayload).to.not.be.null;
        expect(signupEventPayload).to.have.property("type", "SIGNUP");
        expect(signupEventPayload).to.have.property("firstName", signupData.firstName);
        expect(signupEventPayload).to.have.property("lastName", signupData.lastName);
        expect(signupEventPayload).to.have.property("username", signupData.username);
        expect(signupEventPayload).to.have.property("password", signupData.password);
      });
    });
  });
});
