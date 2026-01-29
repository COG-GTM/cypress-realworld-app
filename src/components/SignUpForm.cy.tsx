import { interpret } from "xstate";
import { MemoryRouter } from "react-router-dom";
import SignUpForm from "./SignUpForm";
import { authMachine } from "../machines/authMachine";

describe("SignUpForm", () => {
  let authService;

  beforeEach(() => {
    authService = interpret(authMachine);
    authService.start();
    expect(authService.state.value).to.equal("unauthorized");
  });

  afterEach(() => {
    authService.stop();
  });

  it("renders the signup form with all fields", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signup-title']").should("contain", "Sign Up");
    cy.get("[data-test='signup-first-name']").should("be.visible");
    cy.get("[data-test='signup-last-name']").should("be.visible");
    cy.get("[data-test='signup-username']").should("be.visible");
    cy.get("[data-test='signup-password']").should("be.visible");
    cy.get("[data-test='signup-confirmPassword']").should("be.visible");
    cy.get("[data-test='signup-submit']").should("be.visible");
  });

  it("displays first name required error when field is cleared", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signup-first-name']").type("John");
    cy.get("[data-test='signup-first-name']").find("input").clear().blur();
    cy.get("#firstName-helper-text").should("be.visible").and("contain", "First Name is required");
  });

  it("displays last name required error when field is cleared", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signup-last-name']").type("Doe");
    cy.get("[data-test='signup-last-name']").find("input").clear().blur();
    cy.get("#lastName-helper-text").should("be.visible").and("contain", "Last Name is required");
  });

  it("displays username required error when field is cleared", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signup-username']").type("johndoe");
    cy.get("[data-test='signup-username']").find("input").clear().blur();
    cy.get("#username-helper-text").should("be.visible").and("contain", "Username is required");
  });

  it("displays password required error when field is cleared", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signup-password']").type("password123");
    cy.get("[data-test='signup-password']").find("input").clear().blur();
    cy.get("#password-helper-text").should("be.visible").and("contain", "Enter your password");
  });

  it("displays password minimum length error", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signup-password']").type("abc");
    cy.get("[data-test='signup-password']").find("input").blur();
    cy.get("#password-helper-text")
      .should("be.visible")
      .and("contain", "Password must contain at least 4 characters");
  });

  it("displays password mismatch error", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signup-password']").type("password123");
    cy.get("[data-test='signup-confirmPassword']").type("differentpassword");
    cy.get("[data-test='signup-confirmPassword']").find("input").blur();
    cy.get("#confirmPassword-helper-text")
      .should("be.visible")
      .and("contain", "Password does not match");
  });

  it("submit button is disabled when form has validation errors", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signup-submit']").should("be.disabled");

    cy.get("[data-test='signup-first-name']").type("John");
    cy.get("[data-test='signup-submit']").should("be.disabled");

    cy.get("[data-test='signup-last-name']").type("Doe");
    cy.get("[data-test='signup-submit']").should("be.disabled");

    cy.get("[data-test='signup-username']").type("johndoe");
    cy.get("[data-test='signup-submit']").should("be.disabled");

    cy.get("[data-test='signup-password']").type("password123");
    cy.get("[data-test='signup-submit']").should("be.disabled");
  });

  it("submit button is enabled when all fields are valid", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signup-first-name']").type("John");
    cy.get("[data-test='signup-last-name']").type("Doe");
    cy.get("[data-test='signup-username']").type("johndoe");
    cy.get("[data-test='signup-password']").type("password123");
    cy.get("[data-test='signup-confirmPassword']").type("password123");

    cy.get("[data-test='signup-submit']").should("not.be.disabled");
  });

  it("submits the form with valid data", () => {
    cy.intercept("POST", "http://localhost:3001/users", {
      statusCode: 201,
      body: {
        user: {
          id: "test-user-id",
          firstName: "John",
          lastName: "Doe",
          username: "johndoe",
        },
      },
    }).as("signupPost");

    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signup-first-name']").type("John");
    cy.get("[data-test='signup-last-name']").type("Doe");
    cy.get("[data-test='signup-username']").type("johndoe");
    cy.get("[data-test='signup-password']").type("password123");
    cy.get("[data-test='signup-confirmPassword']").type("password123");
    cy.get("[data-test='signup-submit']").click();

    cy.wait("@signupPost");
  });

  it("has link to sign in page", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );

    cy.contains("Have an account? Sign In").should("be.visible");
  });
});
