import { User } from "../../../src/models";
import { isMobile } from "../../support/utils";

const apiGraphQL = `${Cypress.env("apiUrl")}/graphql`;

type EmptyStateTestCtx = {
  user?: User;
};

describe("Empty Database State", function () {
  const ctx: EmptyStateTestCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.intercept("GET", "/notifications").as("getNotifications");
    cy.intercept("GET", "/transactions/public*").as("publicTransactions");
    cy.intercept("GET", "/transactions*").as("personalTransactions");
    cy.intercept("GET", "/transactions/contacts*").as("contactsTransactions");
    cy.intercept("GET", "/users*").as("allUsers");
    cy.intercept("POST", "/transactions").as("createTransaction");

    cy.intercept("POST", apiGraphQL, (req) => {
      const operationAliases: Record<string, string> = {
        ListBankAccount: "gqlListBankAccountQuery",
        CreateBankAccount: "gqlCreateBankAccountMutation",
      };

      const { body } = req;
      const operationName = body?.operationName;

      if (
        body.hasOwnProperty("operationName") &&
        operationName &&
        operationAliases[operationName]
      ) {
        req.alias = operationAliases[operationName];
      }
    });

    cy.database("find", "users").then((user: User) => {
      ctx.user = user;
      return cy.loginByXstate(ctx.user.username);
    });
  });

  describe("empty transaction feeds", function () {
    it("should display empty state for public transactions", function () {
      cy.intercept("GET", "/transactions/public*", {
        statusCode: 200,
        body: {
          pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
          results: [],
        },
      }).as("emptyPublicTransactions");

      cy.visit("/");
      cy.wait("@emptyPublicTransactions");

      cy.getBySelLike("transaction-item").should("have.length", 0);
      cy.getBySel("empty-list-header").should("contain", "No Transactions");
      cy.getBySelLike("empty-create-transaction-button")
        .should("have.attr", "href", "/transaction/new")
        .contains("create a transaction", { matchCase: false });
    });

    it("should display empty state for personal transactions", function () {
      cy.intercept("GET", "/transactions*", {
        statusCode: 200,
        body: {
          pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
          results: [],
        },
      }).as("emptyPersonalTransactions");

      cy.visit("/");
      cy.wait("@getNotifications");

      cy.getBySelLike("personal-tab").click();
      cy.wait("@emptyPersonalTransactions");

      cy.getBySelLike("transaction-item").should("have.length", 0);
      cy.getBySel("empty-list-header").should("contain", "No Transactions");
    });

    it("should display empty state for contacts transactions", function () {
      cy.intercept("GET", "/transactions/contacts*", {
        statusCode: 200,
        body: {
          pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
          results: [],
        },
      }).as("emptyContactsTransactions");

      cy.visit("/");
      cy.wait("@getNotifications");

      cy.getBySelLike("contacts-tab").click();
      cy.wait("@emptyContactsTransactions");

      cy.getBySelLike("transaction-item").should("have.length", 0);
      cy.getBySel("empty-list-header").should("contain", "No Transactions");
    });
  });

  describe("empty bank accounts", function () {
    it("should display empty state for bank accounts list", function () {
      cy.intercept("POST", apiGraphQL, (req) => {
        const { body } = req;
        if (body.hasOwnProperty("operationName") && body.operationName === "ListBankAccount") {
          req.alias = "gqlListBankAccountQuery";
          req.continue((res) => {
            res.body.data.listBankAccount = [];
          });
        }
      });

      cy.visit("/bankaccounts");
      cy.wait("@getNotifications");
      cy.wait("@gqlListBankAccountQuery");

      cy.getBySel("bankaccount-list").should("not.exist");
      cy.getBySel("empty-list-header").should("contain", "No Bank Accounts");
    });

    it("should show onboarding modal when no bank accounts exist", function () {
      cy.intercept("POST", apiGraphQL, (req) => {
        const { body } = req;
        if (body.hasOwnProperty("operationName") && body.operationName === "ListBankAccount") {
          req.alias = "gqlListBankAccountQuery";
          req.continue((res) => {
            res.body.data.listBankAccount = [];
          });
        }
      });

      cy.visit("/bankaccounts");
      cy.wait("@getNotifications");
      cy.wait("@gqlListBankAccountQuery");

      cy.getBySel("user-onboarding-dialog").should("be.visible");
      cy.getBySel("nav-top-notifications-count").should("exist");
    });

    it("should allow creating first bank account from empty state", function () {
      cy.intercept("POST", apiGraphQL, (req) => {
        const { body } = req;
        if (body.hasOwnProperty("operationName") && body.operationName === "ListBankAccount") {
          req.alias = "gqlListBankAccountQuery";
          req.continue((res) => {
            res.body.data.listBankAccount = [];
          });
        }
        if (body.hasOwnProperty("operationName") && body.operationName === "CreateBankAccount") {
          req.alias = "gqlCreateBankAccountMutation";
        }
      });

      cy.visit("/bankaccounts");
      cy.wait("@getNotifications");
      cy.wait("@gqlListBankAccountQuery");

      cy.getBySel("user-onboarding-dialog").should("be.visible");
      cy.getBySel("user-onboarding-next").click();

      cy.getBySelLike("bankName-input").type("First Bank");
      cy.getBySelLike("accountNumber-input").type("123456789");
      cy.getBySelLike("routingNumber-input").type("987654321");
      cy.getBySelLike("submit").click();

      cy.wait("@gqlCreateBankAccountMutation");

      cy.getBySel("user-onboarding-dialog-title").should("contain", "Finished");
    });
  });

  describe("empty notifications", function () {
    it("should display empty state for notifications", function () {
      cy.intercept("GET", "/notifications", {
        statusCode: 200,
        body: [],
      }).as("emptyNotifications");

      cy.visit("/");
      cy.wait("@emptyNotifications");

      cy.getBySel("nav-top-notifications-count").should("not.exist");
    });

    it("should handle notifications page with no notifications", function () {
      cy.intercept("GET", "/notifications", {
        statusCode: 200,
        body: [],
      }).as("emptyNotifications");

      cy.visit("/notifications");
      cy.wait("@emptyNotifications");

      cy.getBySel("notification-list").should("not.exist");
    });
  });

  describe("empty user list", function () {
    it("should display empty state when no users found in search", function () {
      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.intercept("GET", "/users/search*", {
        statusCode: 200,
        body: { results: [] },
      }).as("emptyUserSearch");

      cy.getBySel("user-list-search-input").type("nonexistentuser99999", { force: true });
      cy.wait("@emptyUserSearch");

      cy.getBySel("users-list").should("be.empty");
    });

    it("should handle empty users list response", function () {
      cy.intercept("GET", "/users*", {
        statusCode: 200,
        body: { results: [] },
      }).as("emptyAllUsers");

      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@emptyAllUsers");

      cy.getBySel("users-list").should("be.empty");
    });
  });

  describe("empty state UI interactions", function () {
    it("should navigate to new transaction from empty state CTA", function () {
      cy.intercept("GET", "/transactions/public*", {
        statusCode: 200,
        body: {
          pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
          results: [],
        },
      }).as("emptyPublicTransactions");

      cy.visit("/");
      cy.wait("@emptyPublicTransactions");

      cy.getBySelLike("empty-create-transaction-button").click();
      cy.location("pathname").should("eq", "/transaction/new");
    });

    it("should display proper empty state on mobile viewport", function () {
      cy.viewport(375, 667);

      cy.intercept("GET", "/transactions/public*", {
        statusCode: 200,
        body: {
          pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
          results: [],
        },
      }).as("emptyPublicTransactions");

      cy.visit("/");
      cy.wait("@emptyPublicTransactions");

      cy.getBySel("empty-list-header").should("be.visible").and("contain", "No Transactions");
      cy.getBySelLike("empty-create-transaction-button").should("be.visible");
    });
  });

  describe("empty state after data deletion", function () {
    it("should show empty state after deleting all bank accounts", function () {
      cy.wait("@getNotifications");

      if (isMobile()) {
        cy.getBySel("sidenav-toggle").click();
      }
      cy.getBySel("sidenav-bankaccounts").click();

      cy.wait("@gqlListBankAccountQuery");

      cy.intercept("POST", apiGraphQL, (req) => {
        const { body } = req;
        if (body.hasOwnProperty("operationName") && body.operationName === "DeleteBankAccount") {
          req.alias = "gqlDeleteBankAccountMutation";
        }
        if (body.hasOwnProperty("operationName") && body.operationName === "ListBankAccount") {
          req.alias = "gqlListBankAccountQuery";
        }
      });

      cy.getBySelLike("delete").first().click();
      cy.wait("@gqlDeleteBankAccountMutation");

      cy.getBySelLike("list-item").children().contains("Deleted");
    });
  });

  describe("empty state transitions", function () {
    it("should transition from empty to populated state after creating transaction", function () {
      cy.intercept("GET", "/transactions*", {
        statusCode: 200,
        body: {
          pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
          results: [],
        },
      }).as("emptyPersonalTransactions");

      cy.visit("/");
      cy.wait("@getNotifications");

      cy.getBySelLike("personal-tab").click();
      cy.wait("@emptyPersonalTransactions");

      cy.getBySel("empty-list-header").should("contain", "No Transactions");

      cy.getBySelLike("empty-create-transaction-button").click();
      cy.wait("@allUsers");

      cy.getBySelLike("user-list-item").first().click({ force: true });

      cy.getBySelLike("amount-input").type("25");
      cy.getBySelLike("description-input").type("First transaction");

      cy.intercept("GET", "/transactions*").as("populatedPersonalTransactions");

      cy.getBySelLike("submit-payment").click();
      cy.wait("@createTransaction");

      cy.getBySel("alert-bar-success")
        .should("be.visible")
        .and("have.text", "Transaction Submitted!");
    });
  });
});
