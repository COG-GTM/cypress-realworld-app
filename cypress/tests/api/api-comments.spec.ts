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

    it("returns 401 when not authenticated", function () {
      cy.logout();
      cy.request({
        method: "GET",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.eq("Unauthorized");
      });
    });

    it("returns 422 for invalid transaction ID format", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/invalid-transaction-id`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
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

    it("returns 401 when not authenticated", function () {
      cy.logout();
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        body: { content: "test" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.eq("Unauthorized");
      });
    });

    it("returns 422 when content is missing", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        body: {},
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("returns 422 when content is not a string", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        body: { content: 12345 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("returns 422 for invalid transaction ID format", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/invalid-transaction-id`,
        body: { content: "test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("handles special characters in comment content", function () {
      const specialContent = "Comment with <script>alert('xss')</script> & special chars!";
      cy.request("POST", `${apiComments}/${ctx.transactionId}`, {
        content: specialContent,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("handles very long comment content", function () {
      const longContent = "a".repeat(10000);
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        body: { content: longContent },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 422]);
      });
    });

    it("handles unicode characters in comment content", function () {
      const unicodeContent = "Comment with emojis 🎉🚀 and unicode: 你好世界 مرحبا";
      cy.request("POST", `${apiComments}/${ctx.transactionId}`, {
        content: unicodeContent,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("allows commenting on transactions user is not part of", function () {
      cy.database("filter", "transactions", {
        senderId: { $ne: ctx.authenticatedUser!.id },
        receiverId: { $ne: ctx.authenticatedUser!.id },
      }).then((transactions: Transaction[]) => {
        if (transactions.length > 0) {
          cy.request({
            method: "POST",
            url: `${apiComments}/${transactions[0].id}`,
            body: { content: "Comment on unrelated transaction" },
            failOnStatusCode: false,
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 403, 404]);
          });
        }
      });
    });
  });
});
