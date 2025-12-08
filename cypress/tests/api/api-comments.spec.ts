// check this file using TypeScript if available
// @ts-check

import { User, Comment, Transaction } from "../../../src/models";

const apiComments = `${Cypress.env("apiUrl")}/comments`;

type TestCommentsCtx = {
  authenticatedUser?: User;
  transactionId?: string;
  transactionWithNoComments?: Transaction;
};

describe("Comments API", function () {
  let ctx: TestCommentsCtx = {};

  before(() => {
    // Hacky workaround to have the e2e tests pass when cy.visit('http://localhost:3000') is called
    cy.request("GET", "/");
  });

  beforeEach(function () {
    cy.task("db:seed");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.authenticatedUser = users[0];

      return cy.loginByApi(ctx.authenticatedUser.username);
    });

    cy.database("find", "comments").then((comment: Comment) => {
      ctx.transactionId = comment.transactionId;
    });
  });

  context("GET /comments/:transactionId", function () {
    it("gets a list of comments for a transaction", function () {
      const transactionId = ctx.transactionId!;
      cy.request("GET", `${apiComments}/${transactionId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comments).to.be.an("array").that.has.length(1);
      });
    });

    it("returns 200 with empty array for transactions with no comments", function () {
      cy.database("filter", "transactions").then((transactions: Transaction[]) => {
        cy.database("filter", "comments").then((comments: Comment[]) => {
          const commentedTransactionIds = comments.map((c) => c.transactionId);
          const transactionWithNoComments = transactions.find(
            (t) => !commentedTransactionIds.includes(t.id)
          );

          if (transactionWithNoComments) {
            cy.request("GET", `${apiComments}/${transactionWithNoComments.id}`).then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body.comments).to.be.an("array").that.has.length(0);
            });
          }
        });
      });
    });

    it("returns 422 for invalid transaction ID format", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/invalid-id-format`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });
  });

  context("POST /comments/:transactionId", function () {
    it("creates a new comment for a transaction", function () {
      const transactionId = ctx.transactionId!;
      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: "This is my comment",
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("returns 422 for missing content field", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: {},
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });

    it("returns 422 for invalid transaction ID format", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/invalid-id-format`,
        body: { content: "Test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });

    it("creates notifications for transaction participants when commenting", function () {
      const transactionId = ctx.transactionId!;

      cy.database("filter", "notifications").then((notificationsBefore: any[]) => {
        const countBefore = notificationsBefore.length;

        cy.request("POST", `${apiComments}/${transactionId}`, {
          content: "Comment that should trigger notifications",
        }).then((response) => {
          expect(response.status).to.eq(200);

          cy.database("filter", "notifications").then((notificationsAfter: any[]) => {
            expect(notificationsAfter.length).to.be.greaterThan(countBefore);
          });
        });
      });
    });
  });

  context("Authentication Tests", function () {
    it("returns 401 for GET request without authentication", function () {
      cy.request("POST", `${Cypress.env("apiUrl")}/logout`).then(() => {
        cy.request({
          method: "GET",
          url: `${apiComments}/${ctx.transactionId}`,
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });

    it("returns 401 for POST request without authentication", function () {
      cy.request("POST", `${Cypress.env("apiUrl")}/logout`).then(() => {
        cy.request({
          method: "POST",
          url: `${apiComments}/${ctx.transactionId}`,
          body: { content: "Test comment" },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  });
});
