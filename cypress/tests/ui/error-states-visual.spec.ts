import { User } from "../../../src/models";
import { isMobile } from "../../support/utils";

describe("Error States and Loading Indicators Visual Tests", function () {
  beforeEach(function () {
    cy.task("db:seed");

    cy.intercept("GET", "/notifications").as("getNotifications");
    cy.intercept("GET", "/transactions/public*").as("publicTransactions");
    cy.intercept("GET", "/transactions*").as("personalTransactions");
  });

  describe("Loading States", function () {
    it("displays loading skeleton on transaction list", function () {
      cy.database("find", "users").then((user: User) => {
        cy.loginByXstate(user.username);
      });

      cy.visit("/");
      cy.getBySel("list-skeleton").should("exist");
      cy.visualSnapshot("Transaction List Loading Skeleton State");

      cy.wait("@publicTransactions");
      cy.getBySel("list-skeleton").should("not.exist");
      cy.visualSnapshot("Transaction List Loaded State");
    });

    it("displays loading state when switching tabs", function () {
      cy.database("find", "users").then((user: User) => {
        cy.loginByXstate(user.username);
      });

      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");
      cy.getBySel("list-skeleton").should("not.exist");

      cy.getBySel("nav-personal-tab").click();
      cy.visualSnapshot("Personal Tab Loading State");

      cy.wait("@personalTransactions");
      cy.getBySel("list-skeleton").should("not.exist");
      cy.visualSnapshot("Personal Tab Loaded State");
    });
  });

  describe("Empty States", function () {
    it("displays empty state for notifications", function () {
      cy.intercept("GET", "/notifications", []).as("emptyNotifications");

      cy.database("find", "users").then((user: User) => {
        cy.loginByXstate(user.username);
      });

      cy.wait("@emptyNotifications");

      if (isMobile()) {
        cy.getBySel("sidenav-toggle").click();
      }
      cy.getBySel("sidenav-notifications").click();

      cy.location("pathname").should("equal", "/notifications");
      cy.getBySel("empty-list-header").should("contain", "No Notifications");
      cy.visualSnapshot("Empty Notifications State");
    });

    it("displays empty state for transactions with no results", function () {
      cy.intercept("GET", "/transactions/public*", {
        results: [],
        pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
      }).as("emptyPublicTransactions");

      cy.database("find", "users").then((user: User) => {
        cy.loginByXstate(user.username);
      });

      cy.wait("@emptyPublicTransactions");

      cy.getBySel("empty-list-header").should("contain", "No Transactions");
      cy.visualSnapshot("Empty Transactions State");
    });

    it("displays empty bank accounts state", function () {
      const apiGraphQL = `${Cypress.env("apiUrl")}/graphql`;

      cy.intercept("POST", apiGraphQL, (req) => {
        const { body } = req;
        if (body.hasOwnProperty("operationName") && body.operationName === "ListBankAccount") {
          req.alias = "gqlListBankAccountQuery";
          req.continue((res) => {
            res.body.data.listBankAccount = [];
          });
        }
      });

      cy.database("find", "users").then((user: User) => {
        cy.loginByXstate(user.username);
      });

      cy.visit("/bankaccounts");
      cy.wait("@gqlListBankAccountQuery");

      cy.getBySel("bankaccount-list").should("not.exist");
      cy.getBySel("empty-list-header").should("contain", "No Bank Accounts");
      cy.visualSnapshot("Empty Bank Accounts State");
    });
  });

  describe("Form Validation Error States", function () {
    it("displays sign in form validation errors", function () {
      cy.visit("/signin");

      cy.getBySel("signin-username").type("User");
      cy.getBySel("signin-username").find("input").clear();
      cy.getBySel("signin-username").find("input").blur();
      cy.get("#username-helper-text").should("be.visible").and("contain", "Username is required");
      cy.visualSnapshot("Sign In Username Required Error");

      cy.getBySel("signin-password").type("abc");
      cy.getBySel("signin-password").find("input").blur();
      cy.get("#password-helper-text")
        .should("be.visible")
        .and("contain", "Password must contain at least 4 characters");
      cy.visualSnapshot("Sign In Password Length Error");

      cy.getBySel("signin-submit").should("be.disabled");
      cy.visualSnapshot("Sign In Form All Validation Errors");
    });

    it("displays sign up form validation errors", function () {
      cy.visit("/signup");

      cy.getBySel("signup-first-name").type("First");
      cy.getBySel("signup-first-name").find("input").clear();
      cy.getBySel("signup-first-name").find("input").blur();
      cy.get("#firstName-helper-text")
        .should("be.visible")
        .and("contain", "First Name is required");
      cy.visualSnapshot("Sign Up First Name Required Error");

      cy.getBySel("signup-last-name").type("Last");
      cy.getBySel("signup-last-name").find("input").clear();
      cy.getBySel("signup-last-name").find("input").blur();
      cy.get("#lastName-helper-text").should("be.visible").and("contain", "Last Name is required");
      cy.visualSnapshot("Sign Up Last Name Required Error");

      cy.getBySel("signup-username").type("User");
      cy.getBySel("signup-username").find("input").clear();
      cy.getBySel("signup-username").find("input").blur();
      cy.get("#username-helper-text").should("be.visible").and("contain", "Username is required");
      cy.visualSnapshot("Sign Up Username Required Error");

      cy.getBySel("signup-password").type("password");
      cy.getBySel("signup-password").find("input").clear();
      cy.getBySel("signup-password").find("input").blur();
      cy.get("#password-helper-text").should("be.visible").and("contain", "Enter your password");
      cy.visualSnapshot("Sign Up Password Required Error");

      cy.getBySel("signup-password").type("password");
      cy.getBySel("signup-confirmPassword").type("DIFFERENT PASSWORD");
      cy.getBySel("signup-confirmPassword").find("input").blur();
      cy.get("#confirmPassword-helper-text")
        .should("be.visible")
        .and("contain", "Password does not match");
      cy.visualSnapshot("Sign Up Password Mismatch Error");

      cy.getBySel("signup-submit").should("be.disabled");
      cy.visualSnapshot("Sign Up Form All Validation Errors");
    });

    it("displays authentication error for invalid credentials", function () {
      cy.visit("/signin");

      cy.getBySel("signin-username").type("invalidUser");
      cy.getBySel("signin-password").type("invalidPassword");
      cy.getBySel("signin-submit").click();

      cy.getBySel("signin-error")
        .should("be.visible")
        .and("have.text", "Username or password is invalid");
      cy.visualSnapshot("Sign In Invalid Credentials Error");
    });
  });

  describe("Transaction Form Error States", function () {
    it("displays transaction amount and description errors", function () {
      cy.database("filter", "users").then((users: User[]) => {
        cy.loginByXstate(users[0].username);
      });

      cy.intercept("GET", "/users*").as("allUsers");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.getBySelLike("user-list-item").first().click({ force: true });

      cy.getBySelLike("amount-input").type("100");
      cy.getBySelLike("amount-input").find("input").clear();
      cy.getBySelLike("amount-input").find("input").blur();
      cy.get("#transaction-create-amount-input-helper-text")
        .should("be.visible")
        .and("contain", "Please enter a valid amount");
      cy.visualSnapshot("Transaction Amount Required Error");

      cy.getBySelLike("description-input").type("Test");
      cy.getBySelLike("description-input").find("input").clear();
      cy.getBySelLike("description-input").find("input").blur();
      cy.get("#transaction-create-description-input-helper-text")
        .should("be.visible")
        .and("contain", "Please enter a note");
      cy.visualSnapshot("Transaction Description Required Error");

      cy.getBySelLike("submit-request").should("be.disabled");
      cy.getBySelLike("submit-payment").should("be.disabled");
      cy.visualSnapshot("Transaction Form All Validation Errors");
    });
  });

  describe("Bank Account Form Error States", function () {
    it("displays bank account form validation errors", function () {
      cy.database("find", "users").then((user: User) => {
        cy.loginByXstate(user.username);
      });

      cy.visit("/bankaccounts/new");

      cy.getBySelLike("bankName-input").type("AB");
      cy.getBySelLike("bankName-input").find("input").blur();
      cy.get("#bankaccount-bankName-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain at least 5 characters");
      cy.visualSnapshot("Bank Name Min Length Error");

      cy.getBySelLike("routingNumber-input").type("12345678");
      cy.getBySelLike("routingNumber-input").find("input").blur();
      cy.get("#bankaccount-routingNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain a valid routing number");
      cy.visualSnapshot("Routing Number Invalid Error");

      cy.getBySelLike("accountNumber-input").type("12345678");
      cy.getBySelLike("accountNumber-input").find("input").blur();
      cy.get("#bankaccount-accountNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain at least 9 digits");
      cy.visualSnapshot("Account Number Min Length Error");

      cy.getBySel("bankaccount-submit").should("be.disabled");
      cy.visualSnapshot("Bank Account Form All Validation Errors");
    });
  });

  describe("User Settings Form Error States", function () {
    it("displays user settings form validation errors", function () {
      cy.database("find", "users").then((user: User) => {
        cy.loginByXstate(user.username);
      });

      if (isMobile()) {
        cy.getBySel("sidenav-toggle").click();
      }
      cy.getBySel("sidenav-user-settings").click();

      cy.getBySelLike("firstName-input").clear();
      cy.getBySelLike("firstName-input").blur();
      cy.get("#user-settings-firstName-input-helper-text")
        .should("be.visible")
        .and("contain", "Enter a first name");
      cy.visualSnapshot("User Settings First Name Required Error");

      cy.getBySelLike("lastName-input").clear();
      cy.getBySelLike("lastName-input").blur();
      cy.get("#user-settings-lastName-input-helper-text")
        .should("be.visible")
        .and("contain", "Enter a last name");
      cy.visualSnapshot("User Settings Last Name Required Error");

      cy.getBySelLike("email-input").clear();
      cy.getBySelLike("email-input").type("invalid-email");
      cy.getBySelLike("email-input").blur();
      cy.get("#user-settings-email-input-helper-text")
        .should("be.visible")
        .and("contain", "Must contain a valid email address");
      cy.visualSnapshot("User Settings Invalid Email Error");

      cy.getBySelLike("phoneNumber-input").clear();
      cy.getBySelLike("phoneNumber-input").type("123");
      cy.getBySelLike("phoneNumber-input").blur();
      cy.get("#user-settings-phoneNumber-input-helper-text")
        .should("be.visible")
        .and("contain", "Phone number is not valid");
      cy.visualSnapshot("User Settings Invalid Phone Error");

      cy.getBySelLike("submit").should("be.disabled");
      cy.visualSnapshot("User Settings Form All Validation Errors");
    });
  });
});
