// check this file using TypeScript if available
// @ts-check

import { User, Comment, Transaction } from "../../../src/models";

const apiComments = `${Cypress.env("apiUrl")}/comments`;

type TestCommentsCtx = {
  authenticatedUser?: User;
  transactionId?: string;
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
  });

  context("Negative Tests - Transaction Error Handling", function () {
    it("returns 404 when getting comments for non-existent transaction", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/invalid-transaction-id`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("returns 404 when posting comment to non-existent transaction", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/invalid-transaction-id`,
        body: { content: "test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("handles malformed transaction IDs", function () {
      const malformedIds = ["", " ", "123", "abc-def"];

      malformedIds.forEach((id) => {
        cy.request({
          method: "GET",
          url: `${apiComments}/${id}`,
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.be.oneOf([400, 404, 422]);
        });
      });
    });

    it("prevents commenting on transactions user is not part of", function () {
      // Find a transaction where current user is neither sender nor receiver
      cy.database("find", "transactions", {
        senderId: { $ne: ctx.authenticatedUser!.id },
        receiverId: { $ne: ctx.authenticatedUser!.id },
      }).then((transaction: Transaction) => {
        if (transaction) {
          cy.request({
            method: "POST",
            url: `${apiComments}/${transaction.id}`,
            body: { content: "should not work" },
            failOnStatusCode: false,
          }).then((response) => {
            expect(response.status).to.be.oneOf([403, 404]);
          });
        }
      });
    });

    it("respects transaction privacy levels", function () {
      // Find a private transaction the user shouldn't access
      cy.database("find", "transactions", {
        privacyLevel: "private",
        senderId: { $ne: ctx.authenticatedUser!.id },
        receiverId: { $ne: ctx.authenticatedUser!.id },
      }).then((transaction: Transaction) => {
        if (transaction) {
          cy.request({
            method: "GET",
            url: `${apiComments}/${transaction.id}`,
            failOnStatusCode: false,
          }).then((response) => {
            expect(response.status).to.be.oneOf([403, 404]);
          });
        }
      });
    });
  });
});
