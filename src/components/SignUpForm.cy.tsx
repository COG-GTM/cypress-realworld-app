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
    cy.intercept("POST", "http://localhost:3001/users", {
      statusCode: 201,
      body: { user: { id: "new-user-id", username: "TestUser" } },
    }).as("signupPost");
  });

  it("renders the sign up form", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-title]").should("contain", "Sign Up");
    cy.get("[data-test=signup-first-name]").should("be.visible");
    cy.get("[data-test=signup-last-name]").should("be.visible");
    cy.get("[data-test=signup-username]").should("be.visible");
    cy.get("[data-test=signup-password]").should("be.visible");
    cy.get("[data-test=signup-confirmPassword]").should("be.visible");
    cy.get("[data-test=signup-submit]").should("be.visible");
  });

  it("validates required fields", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-first-name]").find("input").focus().blur();
    cy.get("[data-test=signup-first-name]").find("p").should("contain", "First Name is required");

    cy.get("[data-test=signup-last-name]").find("input").focus().blur();
    cy.get("[data-test=signup-last-name]").find("p").should("contain", "Last Name is required");

    cy.get("[data-test=signup-username]").find("input").focus().blur();
    cy.get("[data-test=signup-username]").find("p").should("contain", "Username is required");

    cy.get("[data-test=signup-password]").find("input").focus().blur();
    cy.get("[data-test=signup-password]").find("p").should("contain", "Enter your password");

    cy.get("[data-test=signup-confirmPassword]").find("input").focus().blur();
    cy.get("[data-test=signup-confirmPassword]")
      .find("p")
      .should("contain", "Confirm your password");
  });

  it("shows error for short password", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-password]").find("input").type("abc");
    cy.get("[data-test=signup-confirmPassword]").find("input").focus();
    cy.get("[data-test=signup-password]")
      .find("p")
      .should("contain", "Password must contain at least 4 characters");
  });

  it("shows error for mismatched passwords", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-password]").find("input").type("s3cret");
    cy.get("[data-test=signup-confirmPassword]").find("input").type("different");
    cy.get("[data-test=signup-password]").find("input").focus();
    cy.get("[data-test=signup-confirmPassword]")
      .find("p")
      .should("contain", "Password does not match");
  });

  it("submits the form with valid data", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-first-name]").find("input").type("Edgar");
    cy.get("[data-test=signup-last-name]").find("input").type("Johns");
    cy.get("[data-test=signup-username]").find("input").type("Katharina_Bernier");
    cy.get("[data-test=signup-password]").find("input").type("s3cret");
    cy.get("[data-test=signup-confirmPassword]").find("input").type("s3cret");
    cy.get("[data-test=signup-submit]").should("not.be.disabled").click();
    cy.wait("@signupPost");
  });
});
