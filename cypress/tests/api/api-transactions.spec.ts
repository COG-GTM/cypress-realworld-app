import { faker } from "@faker-js/faker";
import { isEqual } from "lodash/fp";
import { User, NotificationType, Transaction, BankAccount } from "../../../src/models";

type TestTransactionsCtx = {
  receiver?: User;
  authenticatedUser?: User;
  transactionId?: string;
  notificationId?: string;
  bankAccountId?: string;
};

const getFakeAmount = () => parseInt(faker.finance.amount(), 10);
const apiTransactions = `${Cypress.env("apiUrl")}/transactions`;

describe("Transactions API", function () {
  let ctx: TestTransactionsCtx = {};

  before(() => {
    // Hacky workaround to have the e2e tests pass when cy.visit('http://localhost:3000') is called
    cy.request("GET", "/");
  });

  const isSenderOrReceiver = ({ senderId, receiverId }: Transaction) =>
    isEqual(senderId, ctx.authenticatedUser!.id) || isEqual(receiverId, ctx.authenticatedUser!.id);

  beforeEach(function () {
    cy.task("db:seed");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.authenticatedUser = users[0];
      ctx.receiver = users[1];

      return cy.loginByApi(ctx.authenticatedUser.username);
    });

    cy.database("find", "transactions").then((transaction: Transaction) => {
      ctx.transactionId = transaction.id;
    });

    cy.database("find", "notifications").then((notification: NotificationType) => {
      ctx.notificationId = notification.id;
    });

    cy.database("find", "bankaccounts").then((bankaccount: BankAccount) => {
      ctx.bankAccountId = bankaccount.id;
    });
  });

  context("GET /transactions", function () {
    it("gets a list of transactions for user (default)", function () {
      cy.request("GET", `${apiTransactions}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results[0]).to.satisfy(isSenderOrReceiver);
      });
    });

    it("gets a list of pending request transactions for user", function () {
      cy.request({
        method: "GET",
        url: `${apiTransactions}`,
        qs: {
          requestStatus: "pending",
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results[0]).to.satisfy(isSenderOrReceiver);
      });
    });

    it("gets a list of pending request transactions for user between a time range", function () {
      cy.request({
        method: "GET",
        url: `${apiTransactions}`,
        qs: {
          requestStatus: "pending",
          dateRangeStart: new Date("Jan 01 2018"),
          dateRangeEnd: new Date("Dec 05 2030"),
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results[0]).to.satisfy(isSenderOrReceiver);
      });
    });
  });

  context("GET /transactions/contacts", function () {
    it("gets a list of transactions for users list of contacts, page one", function () {
      cy.request("GET", `${apiTransactions}/contacts`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results).length.to.be.greaterThan(1);
      });
    });

    it("gets a list of transactions for users list of contacts, page two", function () {
      cy.request("GET", `${apiTransactions}/contacts?page=2`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results).length.to.be.greaterThan(1);
      });
    });
  });

  context("GET /transactions/public", function () {
    it("gets a list of public transactions", function () {
      cy.request("GET", `${apiTransactions}/public`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results).length.to.be.greaterThan(1);
      });
    });

    it("gets public transactions with pagination", function () {
      cy.request("GET", `${apiTransactions}/public?page=1`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pageData).to.have.property("page");
        expect(response.body.pageData).to.have.property("limit");
        expect(response.body.pageData).to.have.property("hasNextPages");
        expect(response.body.pageData).to.have.property("totalPages");
        expect(response.body.pageData.page).to.eq(1);
      });
    });
  });

  context("GET /transactions/:transactionId", function () {
    it("gets a transaction by id", function () {
      cy.request("GET", `${apiTransactions}/${ctx.transactionId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.transaction).to.have.property("id");
        expect(response.body.transaction.id).to.eq(ctx.transactionId);
      });
    });

    it("errors when invalid transactionId", function () {
      cy.request({
        method: "GET",
        url: `${apiTransactions}/1234`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.eq(1);
      });
    });
  });

  context("POST /transactions", function () {
    it("creates a new payment", function () {
      cy.request("POST", `${apiTransactions}`, {
        transactionType: "payment",
        source: ctx.bankAccountId,
        receiverId: ctx.receiver!.id,
        description: `Payment: ${ctx.authenticatedUser!.id} to ${ctx.receiver!.id}`,
        amount: getFakeAmount(),
        privacyLevel: "public",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.transaction.id).to.be.a("string");
        expect(response.body.transaction.status).to.eq("complete");
        expect(response.body.transaction.requestStatus).to.eq(undefined);
      });
    });

    it("creates a new request", function () {
      cy.request("POST", `${apiTransactions}`, {
        transactionType: "request",
        source: ctx.bankAccountId,
        receiverId: ctx.receiver!.id,
        description: `Request: ${ctx.authenticatedUser!.id} from ${ctx.receiver!.id}`,
        amount: getFakeAmount(),
        privacyLevel: "public",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.transaction.id).to.be.a("string");
        expect(response.body.transaction.status).to.eq("pending");
        expect(response.body.transaction.requestStatus).to.eq("pending");
      });
    });

    it("errors when invalid transactionType", function () {
      cy.request({
        method: "POST",
        url: `${apiTransactions}`,
        failOnStatusCode: false,
        body: {
          transactionType: "invalid",
          source: ctx.bankAccountId,
          receiverId: ctx.receiver!.id,
          description: "Test",
          amount: 100,
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });

    it("errors when missing required fields", function () {
      cy.request({
        method: "POST",
        url: `${apiTransactions}`,
        failOnStatusCode: false,
        body: {
          transactionType: "payment",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });
  });

  context("PATCH /transactions/:transactionId", function () {
    it("updates a transaction", function () {
      cy.request("PATCH", `${apiTransactions}/${ctx.transactionId}`, {
        requestStatus: "rejected",
      }).then((response) => {
        expect(response.status).to.eq(204);
      });
    });

    it("errors when an invalid field sent", function () {
      cy.request({
        method: "PATCH",
        url: `${apiTransactions}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {
          notATransactionField: "not a transaction field",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.eq(1);
      });
    });
  });
});
