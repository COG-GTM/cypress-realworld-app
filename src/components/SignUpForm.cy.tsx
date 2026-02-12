import { interpret } from "xstate";
import { MemoryRouter } from "react-router-dom";
import SignUpForm from "./SignUpForm";
import { authMachine } from "../machines/authMachine";

describe("SignUpForm", () => {
  let authService;
  beforeEach(() => {
    authService = interpret(authMachine);
    authService.start();

    cy.intercept("POST", "http://localhost:3001/signup", {
      user: {
        id: "new-user",
        uuid: "new-uuid",
        firstName: "Jane",
        lastName: "Doe",
        username: "janedoe",
      },
    }).as("signupPost");
  });

  it("renders the sign up form fields", () => {
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

  it("enables submit when all fields are valid", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-first-name]").type("Jane");
    cy.get("[data-test=signup-last-name]").type("Doe");
    cy.get("[data-test=signup-username]").type("janedoe");
    cy.get("[data-test=signup-password]").type("s3cret");
    cy.get("[data-test=signup-confirmPassword]").type("s3cret");
    cy.get("[data-test=signup-submit]").should("not.be.disabled");
  });

  it("shows link to sign in page", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.contains("Have an account? Sign In").should("be.visible");
  });
});
