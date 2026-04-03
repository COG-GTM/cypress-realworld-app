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

  context("Error Paths", function () {
    // Unauthenticated access
    it("should return 401 when not authenticated for GET /transactions", function () {
      cy.request({
        method: "GET",
        url: `${apiTransactions}`,
        failOnStatusCode: false,
        headers: { Cookie: "" },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("should return 401 when not authenticated for POST /transactions", function () {
      cy.request({
        method: "POST",
        url: `${apiTransactions}`,
        failOnStatusCode: false,
        headers: { Cookie: "" },
        body: {
          transactionType: "payment",
          receiverId: "test",
          description: "test",
          amount: 100,
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("should return 401 when not authenticated for PATCH /transactions/:id", function () {
      cy.request({
        method: "PATCH",
        url: `${apiTransactions}/test-id`,
        failOnStatusCode: false,
        headers: { Cookie: "" },
        body: {
          requestStatus: "rejected",
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    // Invalid transaction creation payloads
    it("should return 422 when creating a payment with missing receiverId", function () {
      cy.request({
        method: "POST",
        url: `${apiTransactions}`,
        failOnStatusCode: false,
        body: {
          transactionType: "payment",
          description: "Test payment",
          amount: 100,
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });

    it("should return 422 when creating a payment with missing amount", function () {
      cy.request({
        method: "POST",
        url: `${apiTransactions}`,
        failOnStatusCode: false,
        body: {
          transactionType: "payment",
          receiverId: ctx.receiver!.id,
          description: "Test payment",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });

    it("should return 422 when creating a payment with invalid transactionType", function () {
      cy.request({
        method: "POST",
        url: `${apiTransactions}`,
        failOnStatusCode: false,
        body: {
          transactionType: "invalid",
          receiverId: ctx.receiver!.id,
          description: "Test payment",
          amount: 100,
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });

    it("should return 422 when creating a payment with non-numeric amount", function () {
      cy.request({
        method: "POST",
        url: `${apiTransactions}`,
        failOnStatusCode: false,
        body: {
          transactionType: "payment",
          receiverId: ctx.receiver!.id,
          description: "Test payment",
          amount: "not-a-number",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });

    it("should return 422 when creating a payment with missing description", function () {
      cy.request({
        method: "POST",
        url: `${apiTransactions}`,
        failOnStatusCode: false,
        body: {
          transactionType: "payment",
          receiverId: ctx.receiver!.id,
          amount: 100,
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });

    // Invalid IDs
    it("should return 422 when transactionId is not a valid shortid for GET", function () {
      cy.request({
        method: "GET",
        url: `${apiTransactions}/invalid-id-format!!!`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });

    it("should return 422 when transactionId is not a valid shortid for PATCH", function () {
      cy.request({
        method: "PATCH",
        url: `${apiTransactions}/invalid-id-format!!!`,
        failOnStatusCode: false,
        body: {
          requestStatus: "rejected",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });

    // Invalid PATCH body
    it("should return 422 when patching with invalid requestStatus", function () {
      cy.request({
        method: "PATCH",
        url: `${apiTransactions}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {
          requestStatus: "invalid-status",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });
  });
});
