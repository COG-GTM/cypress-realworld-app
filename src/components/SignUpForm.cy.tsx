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
      body: {
        user: {
          id: "newUser123",
          uuid: "aaaa-bbbb-cccc-dddd",
          firstName: "Jane",
          lastName: "Doe",
          username: "janedoe",
          password: "$2a$10$hashed",
          email: "",
          phoneNumber: "",
          avatar: "",
          defaultPrivacyLevel: "public",
          balance: 0,
          createdAt: "2024-01-01T00:00:00.000Z",
          modifiedAt: "2024-01-01T00:00:00.000Z",
        },
      },
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

  it("shows validation errors for required fields", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-first-name]").find("input").focus().blur();
    cy.get("[data-test=signup-first-name]").should("contain", "First Name is required");

    cy.get("[data-test=signup-last-name]").find("input").focus().blur();
    cy.get("[data-test=signup-last-name]").should("contain", "Last Name is required");

    cy.get("[data-test=signup-username]").find("input").focus().blur();
    cy.get("[data-test=signup-username]").should("contain", "Username is required");

    cy.get("[data-test=signup-password]").find("input").focus().blur();
    cy.get("[data-test=signup-password]").should("contain", "Enter your password");

    cy.get("[data-test=signup-confirmPassword]").find("input").focus().blur();
    cy.get("[data-test=signup-confirmPassword]").should("contain", "Confirm your password");
  });

  it("shows error for short password", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-password]").find("input").type("abc");
    cy.get("[data-test=signup-password]").find("input").blur();
    cy.get("[data-test=signup-password]").should(
      "contain",
      "Password must contain at least 4 characters"
    );
  });

  it("shows error when confirm password does not match", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-password]").find("input").type("s3cret");
    cy.get("[data-test=signup-confirmPassword]").find("input").type("different");
    cy.get("[data-test=signup-confirmPassword]").find("input").blur();
    cy.get("[data-test=signup-confirmPassword]").should("contain", "Password does not match");
  });

  it("submits the form with correct data", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );
    cy.get("[data-test=signup-first-name]").find("input").type("Jane");
    cy.get("[data-test=signup-last-name]").find("input").type("Doe");
    cy.get("[data-test=signup-username]").find("input").type("janedoe");
    cy.get("[data-test=signup-password]").find("input").type("s3cret");
    cy.get("[data-test=signup-confirmPassword]").find("input").type("s3cret");

    cy.get("[data-test=signup-submit]").should("not.be.disabled");
    cy.get("[data-test=signup-submit]").click();

    cy.wait("@signupPost");
  });
});
