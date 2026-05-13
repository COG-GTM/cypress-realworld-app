import { interpret } from "xstate";
import { MemoryRouter } from "react-router-dom";
import SignUpForm from "./SignUpForm";
import { authMachine } from "../machines/authMachine";

describe("SignUpForm", () => {
  let authService: ReturnType<typeof interpret>;

  beforeEach(() => {
    authService = interpret(authMachine);
    authService.start();

    expect(authService.state.value).to.equal("unauthorized");
    cy.intercept("POST", "http://localhost:3001/login", { user: {} }).as("loginPost");
  });

  it("renders Sign Up title", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-title]").should("contain", "Sign Up");
  });

  it("submit disabled when fields have validation errors", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-first-name] input").type("a").clear().blur();
    cy.get("[data-test=signup-submit]").should("be.disabled");
  });

  it("password minimum 4 characters validation", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-password] input").type("abc").blur();
    cy.contains("Password must contain at least 4 characters").should("be.visible");
  });

  it("confirmPassword must match password", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-password] input").type("password123");
    cy.get("[data-test=signup-confirmPassword] input").type("different").blur();
    cy.contains("Password does not match").should("be.visible");
  });

  it("all required fields show validation errors", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-first-name] input").focus().blur();
    cy.get("[data-test=signup-last-name] input").focus().blur();
    cy.get("[data-test=signup-username] input").focus().blur();
    cy.get("[data-test=signup-password] input").focus().blur();
    cy.get("[data-test=signup-confirmPassword] input").focus().blur();
    cy.contains("First Name is required").should("be.visible");
    cy.contains("Last Name is required").should("be.visible");
    cy.contains("Username is required").should("be.visible");
    cy.contains("Enter your password").should("be.visible");
    cy.contains("Confirm your password").should("be.visible");
  });

  it("valid submission sends SIGNUP event to authService", () => {
    const sendSpy = cy.spy(authService, "send");

    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-first-name] input").type("John");
    cy.get("[data-test=signup-last-name] input").type("Doe");
    cy.get("[data-test=signup-username] input").type("johndoe");
    cy.get("[data-test=signup-password] input").type("password123");
    cy.get("[data-test=signup-confirmPassword] input").type("password123");
    cy.get("[data-test=signup-submit]").click();
    cy.wrap(sendSpy).should(
      "be.calledWithMatch",
      Cypress.sinon.match({ type: "SIGNUP" })
    );
  });

  it("Have an account? Sign In link renders and points to /signin", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.contains("Have an account? Sign In")
      .should("be.visible")
      .and("have.attr", "href", "/signin");
  });
});
