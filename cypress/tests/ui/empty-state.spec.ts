import { isMobile } from "../../support/utils";

const apiGraphQL = `${Cypress.env("apiUrl")}/graphql`;

describe("Empty State (yarn start:empty)", function () {
  const userInfo = {
    firstName: "Empty",
    lastName: "State",
    username: "EmptyStateUser",
    password: "s3cret",
  };

  beforeEach(function () {
    cy.task("db:seed:empty");

    cy.intercept("POST", "/users").as("signup");
    cy.intercept("GET", "/notifications").as("getNotifications");
    cy.intercept("GET", "/transactions/public*").as("publicTransactions");
    cy.intercept("GET", "/contacts*").as("contactsTransactions");
    cy.intercept("GET", "/transactions*").as("personalTransactions");
    cy.intercept("GET", "/users*").as("allUsers");
    cy.intercept("POST", apiGraphQL, (req) => {
      if (req.body?.operationName === "CreateBankAccount") {
        req.alias = "gqlCreateBankAccountMutation";
      }
      if (req.body?.operationName === "ListBankAccount") {
        req.alias = "gqlListBankAccountQuery";
      }
    });
  });

  after(function () {
    cy.task("db:seed");
  });

  it("does not allow signing in when no users exist", function () {
    cy.visit("/signin");
    cy.getBySel("signin-username").type("Katharina_Bernier");
    cy.getBySel("signin-password").type("s3cret");
    cy.getBySel("signin-submit").click();

    cy.getBySel("signin-error")
      .should("be.visible")
      .and("contain", "Username or password is invalid");
  });

  it("signs up the first user and renders empty states across the app", function () {
    cy.visit("/signup");
    cy.getBySel("signup-first-name").type(userInfo.firstName);
    cy.getBySel("signup-last-name").type(userInfo.lastName);
    cy.getBySel("signup-username").type(userInfo.username);
    cy.getBySel("signup-password").type(userInfo.password);
    cy.getBySel("signup-confirmPassword").type(userInfo.password);
    cy.getBySel("signup-submit").click();
    cy.wait("@signup");

    cy.login(userInfo.username, userInfo.password);

    // Onboarding is shown because the new user has no bank accounts
    cy.getBySel("user-onboarding-dialog").should("be.visible");
    cy.getBySel("user-onboarding-next").click();
    cy.getBySelLike("bankName-input").type("The Empty Bank");
    cy.getBySelLike("accountNumber-input").type("123456789");
    cy.getBySelLike("routingNumber-input").type("987654321");
    cy.getBySelLike("submit").click();
    cy.wait("@gqlCreateBankAccountMutation");
    cy.getBySel("user-onboarding-dialog-title").should("contain", "Finished");
    cy.getBySel("user-onboarding-next").click();

    // Transaction feeds are empty
    cy.getBySel("nav-public-tab").click();
    cy.wait("@publicTransactions");
    cy.getBySel("empty-list-header").should("contain", "No Transactions");
    cy.getBySelLike("empty-create-transaction-button").should(
      "have.attr",
      "href",
      "/transaction/new"
    );

    cy.getBySel("nav-contacts-tab").click();
    cy.getBySel("empty-list-header").should("contain", "No Transactions");

    cy.getBySel("nav-personal-tab").click();
    cy.getBySel("empty-list-header").should("contain", "No Transactions");

    // Balance starts at zero
    if (isMobile()) {
      cy.getBySel("sidenav-toggle").click();
    }
    cy.getBySel("sidenav-user-balance").should("contain", "$0.00");

    // No notifications yet
    cy.getBySel("sidenav-notifications").click();
    cy.location("pathname").should("equal", "/notifications");
    cy.getBySel("notification-list").should("not.exist");
    cy.getBySel("empty-list-header").should("contain", "No Notifications");
    cy.getBySel("nav-top-notifications-count").should("not.contain", "1");

    // Only the onboarding bank account exists
    cy.visit("/bankaccounts");
    cy.wait("@gqlListBankAccountQuery");
    cy.getBySelLike("bankaccount-list-item")
      .should("have.length", 1)
      .and("contain", "The Empty Bank");

    // The new transaction user list only contains the signed-in user
    cy.visit("/transaction/new");
    cy.wait("@allUsers");
    cy.getBySel("users-list").children().should("have.length.at.most", 1);
  });
});
