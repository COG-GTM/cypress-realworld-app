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

      cy.getBySel("signup-first-name").type("a").clear().blur();
      cy.get("#firstName-helper-text").should("contain", "First Name is required");

      cy.getBySel("signup-last-name").type("a").clear().blur();
      cy.get("#lastName-helper-text").should("contain", "Last Name is required");

      cy.getBySel("signup-username").type("a").clear().blur();
      cy.get("#username-helper-text").should("contain", "Username is required");

      cy.getBySel("signup-password").type("a").clear().blur();
      cy.get("#password-helper-text").should("contain", "Enter your password");

      cy.getBySel("signup-confirmPassword").type("a").clear().blur();
      cy.get("#confirmPassword-helper-text").should("contain", "Confirm your password");

      cy.getBySel("signup-submit").should("be.disabled");
    });

    it("displays validation error for password minimum length", () => {
      cy.mount(
        <MemoryRouter>
          <SignUpForm authService={authService} />
        </MemoryRouter>
      );

      cy.getBySel("signup-password").type("abc").blur();
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

      cy.getBySel("signup-password").type("password123");
      cy.getBySel("signup-confirmPassword").type("differentpassword").blur();
      cy.get("#confirmPassword-helper-text").should("contain", "Password does not match");

      cy.getBySel("signup-submit").should("be.disabled");
    });
  });

  describe("Form State Management", () => {
    it("has submit button disabled initially", () => {
      cy.mount(
        <MemoryRouter>
          <SignUpForm authService={authService} />
        </MemoryRouter>
      );

      cy.getBySel("signup-submit").should("be.disabled");
    });

    it("enables submit button when form is valid", () => {
      cy.mount(
        <MemoryRouter>
          <SignUpForm authService={authService} />
        </MemoryRouter>
      );

      cy.getBySel("signup-first-name").type("John");
      cy.getBySel("signup-last-name").type("Doe");
      cy.getBySel("signup-username").type("johndoe");
      cy.getBySel("signup-password").type("password123");
      cy.getBySel("signup-confirmPassword").type("password123");

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

      cy.getBySel("signup-first-name").type(signupData.firstName);
      cy.getBySel("signup-last-name").type(signupData.lastName);
      cy.getBySel("signup-username").type(signupData.username);
      cy.getBySel("signup-password").type(signupData.password);
      cy.getBySel("signup-confirmPassword").type(signupData.password);

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
