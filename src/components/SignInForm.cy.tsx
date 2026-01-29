import { interpret } from "xstate";
import { MemoryRouter } from "react-router-dom";
import SignInForm from "./SignInForm";
import { authMachine } from "../machines/authMachine";

describe("SignInForm", () => {
  let authService;

  beforeEach(() => {
    authService = interpret(authMachine);
    authService.start();
    expect(authService.state.value).to.equal("unauthorized");
  });

  afterEach(() => {
    authService.stop();
  });

  it("renders the sign in form with all fields", () => {
    cy.mount(
      <MemoryRouter>
        <SignInForm authService={authService} />
      </MemoryRouter>
    );

    cy.contains("Sign in").should("be.visible");
    cy.get("[data-test='signin-username']").should("be.visible");
    cy.get("[data-test='signin-password']").should("be.visible");
    cy.get("[data-test='signin-remember-me']").should("be.visible");
    cy.get("[data-test='signin-submit']").should("be.visible");
  });

  it("displays username required error when field is cleared", () => {
    cy.mount(
      <MemoryRouter>
        <SignInForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signin-username']").type("testuser");
    cy.get("[data-test='signin-username']").find("input").clear().blur();
    cy.get("#username-helper-text").should("be.visible").and("contain", "Username is required");
  });

  it("displays password required error when field is cleared", () => {
    cy.mount(
      <MemoryRouter>
        <SignInForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signin-password']").type("password");
    cy.get("[data-test='signin-password']").find("input").clear().blur();
    cy.get("#password-helper-text").should("be.visible").and("contain", "Enter your password");
  });

  it("displays password minimum length error", () => {
    cy.mount(
      <MemoryRouter>
        <SignInForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signin-password']").type("abc");
    cy.get("[data-test='signin-password']").find("input").blur();
    cy.get("#password-helper-text")
      .should("be.visible")
      .and("contain", "Password must contain at least 4 characters");
  });

  it("submit button is disabled when form is empty", () => {
    cy.mount(
      <MemoryRouter>
        <SignInForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signin-submit']").should("be.disabled");
  });

  it("submit button is disabled when only username is filled", () => {
    cy.mount(
      <MemoryRouter>
        <SignInForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signin-username']").type("testuser");
    cy.get("[data-test='signin-submit']").should("be.disabled");
  });

  it("submit button is disabled when password is too short", () => {
    cy.mount(
      <MemoryRouter>
        <SignInForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signin-username']").type("testuser");
    cy.get("[data-test='signin-password']").type("abc");
    cy.get("[data-test='signin-submit']").should("be.disabled");
  });

  it("submit button is enabled when form is valid", () => {
    cy.mount(
      <MemoryRouter>
        <SignInForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signin-username']").type("testuser");
    cy.get("[data-test='signin-password']").type("password123");
    cy.get("[data-test='signin-submit']").should("not.be.disabled");
  });

  it("submits the username and password to the backend", () => {
    cy.intercept("POST", "http://localhost:3001/login", {
      user: {
        id: "t45AiwidW",
        uuid: "6383f84e-b511-44c5-a835-3ece1d781fa8",
        firstName: "Edgar",
        lastName: "Johns",
        username: "Katharina_Bernier",
        password: "$2a$10$5PXHGtcsckWtAprT5/JmluhR13f16BL8SIGhvAKNP.Dhxkt69FfzW",
        email: "Norene39@yahoo.com",
        phoneNumber: "625-316-9882",
        avatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/t45AiwidW.svg",
        defaultPrivacyLevel: "public",
        balance: 168137,
        createdAt: "2019-08-27T23:47:05.637Z",
        modifiedAt: "2020-05-21T11:02:22.857Z",
      },
    }).as("loginPost");

    cy.mount(
      <MemoryRouter>
        <SignInForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signin-username']").type("Katharina_Bernier");
    cy.get("[data-test='signin-password']").type("s3cret");
    cy.get("[data-test='signin-submit']").click();

    cy.wait("@loginPost");
    cy.get("[data-test='signin-error']").should("not.exist");
  });

  it("displays error message on invalid credentials", () => {
    cy.intercept("POST", "http://localhost:3001/login", {
      statusCode: 401,
      body: { message: "Username or password is invalid" },
    }).as("loginPostFail");

    const authServiceWithError = interpret(
      authMachine.withContext({
        user: undefined,
        message: "Username or password is invalid",
      })
    );
    authServiceWithError.start();

    cy.mount(
      <MemoryRouter>
        <SignInForm authService={authServiceWithError} />
      </MemoryRouter>
    );

    cy.get("[data-test='signin-error']")
      .should("be.visible")
      .and("contain", "Username or password is invalid");

    authServiceWithError.stop();
  });

  it("allows checking remember me checkbox", () => {
    cy.mount(
      <MemoryRouter>
        <SignInForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signin-remember-me']").click();
    cy.get("[data-test='signin-remember-me']").find("input").should("be.checked");
  });

  it("has link to sign up page", () => {
    cy.mount(
      <MemoryRouter>
        <SignInForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signup']")
      .should("be.visible")
      .and("contain", "Don't have an account? Sign Up");
  });

  it("displays multiple validation errors simultaneously", () => {
    cy.mount(
      <MemoryRouter>
        <SignInForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test='signin-username']").type("user").find("input").clear().blur();
    cy.get("[data-test='signin-password']").type("abc").find("input").blur();

    cy.get("#username-helper-text").should("be.visible").and("contain", "Username is required");
    cy.get("#password-helper-text")
      .should("be.visible")
      .and("contain", "Password must contain at least 4 characters");
    cy.get("[data-test='signin-submit']").should("be.disabled");
  });
});
