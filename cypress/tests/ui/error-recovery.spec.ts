import { User } from "../../../src/models";
import { isMobile } from "../../support/utils";

const apiGraphQL = `${Cypress.env("apiUrl")}/graphql`;

type ErrorRecoveryTestCtx = {
  user?: User;
  contact?: User;
};

describe("Error Recovery Flows", function () {
  const ctx: ErrorRecoveryTestCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.intercept("GET", "/notifications").as("getNotifications");
    cy.intercept("GET", "/transactions/public*").as("publicTransactions");
    cy.intercept("GET", "/transactions*").as("personalTransactions");
    cy.intercept("POST", "/transactions").as("createTransaction");
    cy.intercept("GET", "/users*").as("allUsers");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.user = users[0];
      ctx.contact = users[1];
      return cy.loginByXstate(ctx.user.username);
    });
  });

  describe("network failure scenarios", function () {
    it("should handle network failure on transaction list fetch", function () {
      cy.intercept("GET", "/transactions/public*", {
        statusCode: 500,
        body: { error: "Internal Server Error" },
      }).as("failedPublicTransactions");

      cy.visit("/");
      cy.wait("@failedPublicTransactions");

      cy.getBySel("transaction-list").should("not.exist");
    });

    it("should handle network failure on notifications fetch", function () {
      cy.intercept("GET", "/notifications", {
        statusCode: 500,
        body: { error: "Internal Server Error" },
      }).as("failedNotifications");

      cy.visit("/");
      cy.wait("@failedNotifications");

      cy.getBySel("transaction-list").should("be.visible");
    });

    it("should handle network failure on user search", function () {
      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.intercept("GET", "/users/search*", {
        statusCode: 500,
        body: { error: "Internal Server Error" },
      }).as("failedUserSearch");

      cy.getBySel("user-list-search-input").type("test", { force: true });
      cy.wait("@failedUserSearch");
    });

    it("should handle network failure on transaction creation", function () {
      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

      cy.getBySelLike("amount-input").type("50");
      cy.getBySelLike("description-input").type("Test payment");

      cy.intercept("POST", "/transactions", {
        statusCode: 500,
        body: { error: "Transaction failed" },
      }).as("failedTransaction");

      cy.getBySelLike("submit-payment").click();
      cy.wait("@failedTransaction");
    });

    it("should handle network failure on bank account creation", function () {
      cy.wait("@getNotifications");

      if (isMobile()) {
        cy.getBySel("sidenav-toggle").click();
      }
      cy.getBySel("sidenav-bankaccounts").click();

      cy.getBySel("bankaccount-new").click();

      cy.getBySelLike("bankName-input").type("Test Bank");
      cy.getBySelLike("routingNumber-input").type("123456789");
      cy.getBySelLike("accountNumber-input").type("987654321");

      cy.intercept("POST", apiGraphQL, {
        statusCode: 500,
        body: { errors: [{ message: "GraphQL Error" }] },
      }).as("failedBankAccountCreation");

      cy.getBySelLike("submit").click();
      cy.wait("@failedBankAccountCreation");
    });
  });

  describe("timeout scenarios", function () {
    it("should handle slow transaction list response", function () {
      cy.intercept("GET", "/transactions/public*", (req) => {
        req.on("response", (res) => {
          res.setDelay(3000);
        });
      }).as("slowPublicTransactions");

      cy.visit("/");
      cy.getBySel("list-skeleton").should("be.visible");
      cy.wait("@slowPublicTransactions");
      cy.getBySel("list-skeleton").should("not.exist");
      cy.getBySel("transaction-list").should("be.visible");
    });

    it("should handle slow user search response", function () {
      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.intercept("GET", "/users/search*", (req) => {
        req.on("response", (res) => {
          res.setDelay(2000);
        });
      }).as("slowUserSearch");

      cy.getBySel("user-list-search-input").type(ctx.contact!.firstName, { force: true });
      cy.wait("@slowUserSearch");

      cy.getBySelLike("user-list-item").should("have.length.greaterThan", 0);
    });

    it("should handle slow notification response", function () {
      cy.intercept("GET", "/notifications", (req) => {
        req.on("response", (res) => {
          res.setDelay(2000);
        });
      }).as("slowNotifications");

      cy.visit("/");
      cy.wait("@slowNotifications");
      cy.getBySel("transaction-list").should("be.visible");
    });
  });

  describe("HTTP error status codes", function () {
    it("should handle 401 unauthorized response", function () {
      cy.intercept("GET", "/transactions/public*", {
        statusCode: 401,
        body: { error: "Unauthorized" },
      }).as("unauthorizedTransactions");

      cy.visit("/");
      cy.wait("@unauthorizedTransactions");
    });

    it("should handle 403 forbidden response", function () {
      cy.intercept("GET", "/transactions/public*", {
        statusCode: 403,
        body: { error: "Forbidden" },
      }).as("forbiddenTransactions");

      cy.visit("/");
      cy.wait("@forbiddenTransactions");
    });

    it("should handle 404 not found response", function () {
      cy.intercept("GET", "/transactions/public*", {
        statusCode: 404,
        body: { error: "Not Found" },
      }).as("notFoundTransactions");

      cy.visit("/");
      cy.wait("@notFoundTransactions");
    });

    it("should handle 503 service unavailable response", function () {
      cy.intercept("GET", "/transactions/public*", {
        statusCode: 503,
        body: { error: "Service Unavailable" },
      }).as("serviceUnavailableTransactions");

      cy.visit("/");
      cy.wait("@serviceUnavailableTransactions");
    });
  });

  describe("network recovery scenarios", function () {
    it("should recover after network failure on page reload", function () {
      cy.intercept("GET", "/transactions/public*", {
        statusCode: 500,
        body: { error: "Internal Server Error" },
      }).as("failedPublicTransactions");

      cy.visit("/");
      cy.wait("@failedPublicTransactions");

      cy.intercept("GET", "/transactions/public*").as("recoveredPublicTransactions");

      cy.reload();
      cy.wait("@recoveredPublicTransactions");
      cy.getBySel("transaction-list").should("be.visible");
    });

    it("should handle intermittent network failures", function () {
      let requestCount = 0;

      cy.intercept("GET", "/transactions/public*", (req) => {
        requestCount++;
        if (requestCount === 1) {
          req.reply({
            statusCode: 500,
            body: { error: "Internal Server Error" },
          });
        } else {
          req.continue();
        }
      }).as("intermittentTransactions");

      cy.visit("/");
      cy.wait("@intermittentTransactions");

      cy.reload();
      cy.wait("@intermittentTransactions");
      cy.getBySel("transaction-list").should("be.visible");
    });
  });

  describe("empty response scenarios", function () {
    it("should handle empty transaction list response", function () {
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
    });

    it("should handle empty notifications response", function () {
      cy.intercept("GET", "/notifications", {
        statusCode: 200,
        body: [],
      }).as("emptyNotifications");

      cy.visit("/");
      cy.wait("@emptyNotifications");

      cy.getBySel("transaction-list").should("be.visible");
    });

    it("should handle empty user search results", function () {
      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.intercept("GET", "/users/search*", {
        statusCode: 200,
        body: { results: [] },
      }).as("emptyUserSearch");

      cy.getBySel("user-list-search-input").type("nonexistentuser12345", { force: true });
      cy.wait("@emptyUserSearch");

      cy.getBySel("users-list").should("be.empty");
    });
  });

  describe("malformed response scenarios", function () {
    it("should handle malformed JSON response", function () {
      cy.intercept("GET", "/transactions/public*", {
        statusCode: 200,
        body: "invalid json",
        headers: { "content-type": "application/json" },
      }).as("malformedTransactions");

      cy.visit("/");
      cy.wait("@malformedTransactions");
    });

    it("should handle missing required fields in response", function () {
      cy.intercept("GET", "/transactions/public*", {
        statusCode: 200,
        body: { pageData: null, results: null },
      }).as("incompleteTransactions");

      cy.visit("/");
      cy.wait("@incompleteTransactions");
    });
  });

  describe("GraphQL error scenarios", function () {
    it("should handle GraphQL query errors", function () {
      cy.wait("@getNotifications");

      if (isMobile()) {
        cy.getBySel("sidenav-toggle").click();
      }
      cy.getBySel("sidenav-bankaccounts").click();

      cy.intercept("POST", apiGraphQL, {
        statusCode: 200,
        body: {
          errors: [{ message: "GraphQL validation error" }],
          data: null,
        },
      }).as("graphqlError");

      cy.wait("@graphqlError");
    });

    it("should handle GraphQL partial data with errors", function () {
      cy.wait("@getNotifications");

      if (isMobile()) {
        cy.getBySel("sidenav-toggle").click();
      }
      cy.getBySel("sidenav-bankaccounts").click();

      cy.intercept("POST", apiGraphQL, {
        statusCode: 200,
        body: {
          errors: [{ message: "Partial error" }],
          data: { listBankAccount: [] },
        },
      }).as("graphqlPartialError");

      cy.wait("@graphqlPartialError");
    });
  });
});
