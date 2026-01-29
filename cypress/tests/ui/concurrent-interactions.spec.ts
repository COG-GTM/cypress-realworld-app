import { User } from "../../../src/models";
import { isMobile } from "../../support/utils";

type ConcurrentTestCtx = {
  allUsers?: User[];
  user?: User;
  contact?: User;
  secondContact?: User;
};

describe("Concurrent User Interactions and Race Conditions", function () {
  const ctx: ConcurrentTestCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.intercept("GET", "/notifications").as("getNotifications");
    cy.intercept("GET", "/transactions/public*").as("publicTransactions");
    cy.intercept("GET", "/transactions*").as("personalTransactions");
    cy.intercept("POST", "/transactions").as("createTransaction");
    cy.intercept("GET", "/users*").as("allUsers");
    cy.intercept("GET", "/users/search*").as("usersSearch");
    cy.intercept("PATCH", "/transactions/*").as("updateTransaction");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.allUsers = users;
      ctx.user = users[0];
      ctx.contact = users[1];
      ctx.secondContact = users[2];
      return cy.loginByXstate(ctx.user.username);
    });
  });

  describe("rapid user interactions", function () {
    it("should handle rapid tab switching without data corruption", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.getBySelLike("personal-tab").click();
      cy.getBySelLike("contacts-tab").click();
      cy.getBySelLike("public-tab").click();
      cy.getBySelLike("personal-tab").click();

      cy.wait("@personalTransactions");

      cy.getBySelLike("personal-tab").should("have.class", "Mui-selected");
      cy.getBySel("transaction-list").should("be.visible");
    });

    it("should handle rapid navigation clicks", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      if (isMobile()) {
        cy.getBySel("sidenav-toggle").click();
      }

      cy.getBySel("sidenav-home").click();

      if (isMobile()) {
        cy.getBySel("sidenav-toggle").click();
      }
      cy.getBySel("sidenav-bankaccounts").click();

      if (isMobile()) {
        cy.getBySel("sidenav-toggle").click();
      }
      cy.getBySel("sidenav-home").click();

      cy.location("pathname").should("eq", "/");
      cy.getBySel("transaction-list").should("be.visible");
    });

    it("should handle rapid search input changes", function () {
      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.getBySel("user-list-search-input").type("a", { force: true });
      cy.getBySel("user-list-search-input").clear({ force: true });
      cy.getBySel("user-list-search-input").type("b", { force: true });
      cy.getBySel("user-list-search-input").clear({ force: true });
      cy.getBySel("user-list-search-input").type(ctx.contact!.firstName, { force: true });

      cy.wait("@usersSearch");

      cy.getBySelLike("user-list-item").should("have.length.greaterThan", 0);
    });
  });

  describe("concurrent API requests", function () {
    it("should handle multiple simultaneous transaction fetches", function () {
      cy.intercept("GET", "/transactions/public*").as("publicTransactions1");
      cy.intercept("GET", "/transactions*").as("personalTransactions1");
      cy.intercept("GET", "/transactions/contacts*").as("contactsTransactions1");

      cy.visit("/");
      cy.wait("@getNotifications");

      cy.getBySelLike("public-tab").click();
      cy.getBySelLike("personal-tab").click();
      cy.getBySelLike("contacts-tab").click();

      cy.wait("@contactsTransactions1");

      cy.getBySelLike("contacts-tab").should("have.class", "Mui-selected");
    });

    it("should handle rapid pagination requests", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.getBySel("transaction-list").children().scrollTo("bottom");
      cy.wait("@publicTransactions");

      cy.getBySel("transaction-list").children().scrollTo("bottom");

      cy.getBySelLike("transaction-item").should("have.length.greaterThan", 0);
    });

    it("should handle concurrent user search requests", function () {
      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.getBySel("user-list-search-input").type("Jo", { force: true });
      cy.wait("@usersSearch");

      cy.getBySel("user-list-search-input").clear({ force: true });
      cy.getBySel("user-list-search-input").type("Ma", { force: true });
      cy.wait("@usersSearch");

      cy.getBySelLike("user-list-item").should("exist");
    });
  });

  describe("race condition scenarios", function () {
    it("should handle transaction creation during list refresh", function () {
      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

      cy.getBySelLike("amount-input").type("25");
      cy.getBySelLike("description-input").type("Race condition test");

      cy.getBySelLike("submit-payment").click();
      cy.wait("@createTransaction");

      cy.getBySel("alert-bar-success")
        .should("be.visible")
        .and("have.text", "Transaction Submitted!");
    });

    it("should handle user switching during transaction view", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.getBySelLike("transaction-item").first().click();
      cy.getBySel("transaction-detail-header").should("be.visible");

      cy.switchUserByXstate(ctx.contact!.username);

      cy.getBySel("transaction-list").should("be.visible");
    });

    it("should handle filter changes during data loading", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.getBySelLike("personal-tab").click();

      cy.getBySel("transaction-list-filter-amount-range-button").scrollIntoView();
      cy.getBySel("transaction-list-filter-amount-range-button").click({ force: true });

      cy.getBySelLike("personal-tab").should("have.class", "Mui-selected");
    });
  });

  describe("multi-user interaction scenarios", function () {
    it("should handle transaction request and acceptance flow", function () {
      const transactionPayload = {
        transactionType: "request",
        amount: 50,
        description: "Concurrent test request",
        sender: ctx.user,
        receiver: ctx.contact,
      };

      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.createTransaction(transactionPayload);
      cy.wait("@createTransaction");

      cy.getBySel("new-transaction-create-another-transaction").should("be.visible");

      cy.switchUserByXstate(ctx.contact!.username);

      cy.getBySelLike("personal-tab").click();
      cy.wait("@personalTransactions");

      cy.getBySelLike("transaction-item")
        .first()
        .should("contain", transactionPayload.description)
        .click({ force: true });

      cy.getBySelLike("accept-request").click();
      cy.wait("@updateTransaction").its("response.statusCode").should("eq", 204);
    });

    it("should handle multiple transactions to same user", function () {
      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

      cy.getBySelLike("amount-input").type("10");
      cy.getBySelLike("description-input").type("First payment");
      cy.getBySelLike("submit-payment").click();
      cy.wait("@createTransaction");

      cy.getBySel("alert-bar-success").should("be.visible");

      cy.getBySelLike("create-another-transaction").click();

      cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

      cy.getBySelLike("amount-input").type("20");
      cy.getBySelLike("description-input").type("Second payment");
      cy.getBySelLike("submit-payment").click();
      cy.wait("@createTransaction");

      cy.getBySel("alert-bar-success").should("be.visible");
    });

    it("should handle transactions to different users in sequence", function () {
      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

      cy.getBySelLike("amount-input").type("15");
      cy.getBySelLike("description-input").type("Payment to first contact");
      cy.getBySelLike("submit-payment").click();
      cy.wait("@createTransaction");

      cy.getBySel("alert-bar-success").should("be.visible");

      cy.getBySelLike("create-another-transaction").click();

      cy.getBySelLike("user-list-item")
        .contains(ctx.secondContact!.firstName)
        .click({ force: true });

      cy.getBySelLike("amount-input").type("25");
      cy.getBySelLike("description-input").type("Payment to second contact");
      cy.getBySelLike("submit-payment").click();
      cy.wait("@createTransaction");

      cy.getBySel("alert-bar-success").should("be.visible");
    });
  });

  describe("state consistency under concurrent operations", function () {
    it("should maintain balance consistency after rapid transactions", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      let initialBalance: string;
      if (!isMobile()) {
        cy.get("[data-test=sidenav-user-balance]")
          .invoke("text")
          .then((balance) => {
            initialBalance = balance;
            expect(initialBalance).to.match(/\$[\d,]+\.\d{2}/);
          });
      }

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

      cy.getBySelLike("amount-input").type("5");
      cy.getBySelLike("description-input").type("Balance test");
      cy.getBySelLike("submit-payment").click();
      cy.wait("@createTransaction");

      if (!isMobile()) {
        cy.get("[data-test=sidenav-user-balance]").should(($el) => {
          expect($el.text()).to.not.equal(initialBalance);
        });
      }
    });

    it("should handle notification updates during user actions", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.intercept("GET", "/notifications").as("refreshedNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

      cy.getBySelLike("amount-input").type("10");
      cy.getBySelLike("description-input").type("Notification test");
      cy.getBySelLike("submit-payment").click();
      cy.wait("@createTransaction");

      cy.getBySel("alert-bar-success").should("be.visible");
    });

    it("should handle session state during rapid page navigation", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.visit("/bankaccounts");
      cy.visit("/");
      cy.visit("/user/settings");
      cy.visit("/");

      cy.getBySel("transaction-list").should("be.visible");

      if (isMobile()) {
        cy.getBySel("sidenav-toggle").click();
      }
      cy.getBySel("sidenav-username").should("contain", ctx.user!.username);
    });
  });

  describe("form state under concurrent interactions", function () {
    it("should preserve form data during navigation interruption", function () {
      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

      cy.getBySelLike("amount-input").type("100");
      cy.getBySelLike("description-input").type("Preserved data test");

      cy.getBySelLike("amount-input").find("input").should("have.value", "100");
      cy.getBySelLike("description-input")
        .find("input")
        .should("have.value", "Preserved data test");
    });

    it("should handle rapid form field focus changes", function () {
      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

      cy.getBySelLike("amount-input").find("input").focus();
      cy.getBySelLike("description-input").find("input").focus();
      cy.getBySelLike("amount-input").find("input").focus();
      cy.getBySelLike("amount-input").type("50");

      cy.getBySelLike("description-input").find("input").focus();
      cy.getBySelLike("description-input").type("Focus test");

      cy.getBySelLike("amount-input").find("input").should("have.value", "50");
      cy.getBySelLike("description-input").find("input").should("have.value", "Focus test");
    });
  });
});
