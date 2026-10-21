import { interpret } from "xstate";
import { MemoryRouter } from "react-router-dom";
import SignUpForm from "./SignUpForm";
import { authMachine } from "../machines/authMachine";

describe("SignUpForm", () => {
  let authService;
  beforeEach(() => {
    authService = interpret(authMachine);
    authService.start();

    cy.intercept("POST", "http://localhost:3001/users", {
      statusCode: 201,
      body: { user: { id: "new-user", username: "Jane_Doe" } },
    }).as("signupPost");

    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
  });

  it("submits the new user details to the backend", () => {
    cy.get("[data-test=signup-title]").should("contain", "Sign Up");
    cy.get("[data-test=signup-first-name]").type("Jane");
    cy.get("[data-test=signup-last-name]").type("Doe");
    cy.get("[data-test=signup-username]").type("Jane_Doe");
    cy.get("[data-test=signup-password]").type("s3cret");
    cy.get("[data-test=signup-confirmPassword]").type("s3cret");
    cy.get("[data-test=signup-submit]").should("be.enabled").click();

    cy.wait("@signupPost").its("request.body").should("deep.include", {
      firstName: "Jane",
      lastName: "Doe",
      username: "Jane_Doe",
      password: "s3cret",
      confirmPassword: "s3cret",
    });
  });

  it("displays required field errors and disables submit", () => {
    ["first-name", "last-name", "username", "password", "confirmPassword"].forEach((field) => {
      cy.get(`[data-test=signup-${field}]`).find("input").focus().blur();
    });

    cy.get("#firstName-helper-text").should("contain", "First Name is required");
    cy.get("#lastName-helper-text").should("contain", "Last Name is required");
    cy.get("#username-helper-text").should("contain", "Username is required");
    cy.get("#password-helper-text").should("contain", "Enter your password");
    cy.get("#confirmPassword-helper-text").should("contain", "Confirm your password");
    cy.get("[data-test=signup-submit]").should("be.disabled");
  });

  it("validates password length and confirmation", () => {
    cy.get("[data-test=signup-password]").type("abc").find("input").blur();
    cy.get("#password-helper-text").should(
      "contain",
      "Password must contain at least 4 characters"
    );

    cy.get("[data-test=signup-confirmPassword]").type("abcd").find("input").blur();
    cy.get("#confirmPassword-helper-text").should("contain", "Password does not match");
    cy.get("[data-test=signup-submit]").should("be.disabled");
  });

  it("does not submit an invalid form", () => {
    cy.get("[data-test=signup-first-name]").type("Jane");
    cy.get("[data-test=signup-submit]").click({ force: true });

    cy.get("@signupPost.all").should("have.length", 0);
  });
});
