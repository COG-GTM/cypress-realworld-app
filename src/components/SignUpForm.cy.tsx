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
      user: {
        id: "t45AiwidW",
        uuid: "6383f84e-b511-44c5-a835-3ece1d781fa8",
        firstName: "Edgar",
        lastName: "Johns",
        username: "Katharina_Bernier",
        password: "hashed",
        email: "Norene39@yahoo.com",
        phoneNumber: "625-316-9882",
        avatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/t45AiwidW.svg",
        defaultPrivacyLevel: "public",
        balance: 168137,
        createdAt: "2019-08-27T23:47:05.637Z",
        modifiedAt: "2020-05-21T11:02:22.857Z",
      },
    }).as("signupPost");
  });

  it("validates the form and submits signup to backend", () => {
    cy.mount(
      <MemoryRouter>
        <SignUpForm authService={authService} />
      </MemoryRouter>
    );

    cy.get("[data-test=signup-title]").should("contain", "Sign Up");

    cy.get("[data-test=signup-password] input").type("s3cret");
    cy.get("[data-test=signup-confirmPassword] input").type("different").blur();
    cy.contains("Password does not match").should("exist");

    cy.get("[data-test=signup-first-name] input").type("Edgar");
    cy.get("[data-test=signup-last-name] input").type("Johns");
    cy.get("[data-test=signup-username] input").type("Katharina_Bernier");

    cy.get("[data-test=signup-confirmPassword] input").clear().type("s3cret").blur();
    cy.contains("Password does not match").should("not.exist");

    cy.get("[data-test=signup-submit]").should("not.be.disabled").click();
    cy.wait("@signupPost");
  });
});
