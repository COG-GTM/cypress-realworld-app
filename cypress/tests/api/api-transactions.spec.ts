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

  context("GET /transactions/export", function () {
    const csvHeader = "date,description,sender,receiver,amount,status";

    it("streams a CSV of the user's transactions", function () {
      cy.request("GET", `${apiTransactions}`).then(({ body: { pageData } }) => {
        cy.request("GET", `${apiTransactions}/export`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.headers["content-type"]).to.include("text/csv");
          expect(response.headers["content-disposition"]).to.eq(
            'attachment; filename="transactions_all-dates.csv"'
          );

          const lines = (response.body as string).trim().split("\r\n");
          expect(lines[0]).to.eq(csvHeader);
          expect(lines.length - 1).to.be.greaterThan(Number(pageData.limit));
        });
      });
    });

    it("exports only transactions within the date and amount range", function () {
      const qs = {
        dateRangeStart: "2018-01-01T00:00:00.000Z",
        dateRangeEnd: "2030-12-05T23:59:59.999Z",
        amountMin: 5000,
        amountMax: 30000,
      };

      cy.request({ url: `${apiTransactions}`, qs }).then(({ body: { pageData } }) => {
        cy.request({ url: `${apiTransactions}/export`, qs }).then((response) => {
          expect(response.headers["content-disposition"]).to.include(
            "transactions_2018-01-01_to_2030-12-05.csv"
          );

          const rows = (response.body as string).trim().split("\r\n").slice(1);
          const { limit, totalPages } = pageData;
          expect(rows.length).to.be.within(limit * (totalPages - 1) + 1, limit * totalPages);

          rows.forEach((row) => {
            const createdAt = new Date(row.split(",")[0]).getTime();
            expect(createdAt).to.be.within(
              new Date(qs.dateRangeStart).getTime(),
              new Date(qs.dateRangeEnd).getTime()
            );
            const amount = Number(row.match(/,(\d+\.\d{2}),[a-z]+$/)![1]) * 100;
            expect(amount).to.be.within(qs.amountMin, qs.amountMax);
          });
        });
      });
    });

    it("escapes commas and quotes in descriptions", function () {
      const description = 'Dinner, drinks and "dessert"';

      cy.request("POST", `${apiTransactions}`, {
        transactionType: "payment",
        source: ctx.bankAccountId,
        receiverId: ctx.receiver!.id,
        description,
        amount: 1234,
        privacyLevel: "public",
      });

      cy.request("GET", `${apiTransactions}/export`).then((response) => {
        expect(response.body).to.include('"Dinner, drinks and ""dessert"""');
        expect(response.body).to.include(",1234.00,");
      });
    });

    it("requires authentication", function () {
      cy.clearAllCookies();
      cy.request({ url: `${apiTransactions}/export`, failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(401);
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
});
