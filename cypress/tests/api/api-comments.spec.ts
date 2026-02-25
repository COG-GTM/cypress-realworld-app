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

  context("GET /comments/:transactionId - edge cases", function () {
    it("returns an empty array for a transaction with no comments", function () {
      cy.database("find", "transactions").then((transaction: Transaction) => {
        cy.request("GET", `${apiComments}/${transaction.id}`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.comments).to.be.an("array").that.has.length(0);
        });
      });
    });

    it("returns an empty array or 404 for a non-existent transactionId", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/nonexistent-transaction-id`,
        failOnStatusCode: false,
      }).then((response) => {
        expect([200, 404]).to.include(response.status);
        if (response.status === 200) {
          expect(response.body.comments).to.be.an("array").that.has.length(0);
        }
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

    it("creates a new comment and verifies it exists via GET", function () {
      const transactionId = ctx.transactionId!;
      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: "This is my comment",
      }).then((response) => {
        expect(response.status).to.eq(200);
      });

      // Verify the comment was created by fetching comments for the transaction
      cy.request("GET", `${apiComments}/${transactionId}`).then((response) => {
        expect(response.status).to.eq(200);
        const comments = response.body.comments;
        expect(comments).to.be.an("array").that.has.length.greaterThan(0);
        const lastComment = comments[comments.length - 1];
        expect(lastComment).to.have.property("id");
        expect(lastComment).to.have.property("content", "This is my comment");
        expect(lastComment).to.have.property("userId");
        expect(lastComment).to.have.property("transactionId", transactionId);
        expect(lastComment).to.have.property("createdAt");
        expect(lastComment).to.have.property("modifiedAt");
      });
    });
  });

  context("POST /comments/:transactionId - validation errors", function () {
    it("returns 422 when content field is missing", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        failOnStatusCode: false,
        body: {},
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array").that.has.length.greaterThan(0);
      });
    });

    it("accepts an empty string as content (validator only checks isString)", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        failOnStatusCode: false,
        body: { content: "" },
      }).then((response) => {
        // The backend validator uses body("content").isString().trim()
        // which does not reject empty strings, so 200 is expected
        expect(response.status).to.eq(200);
      });
    });

    it("returns 422 when only an invalid field is sent", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        failOnStatusCode: false,
        body: { notACommentField: "some value" },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.eq(1);
      });
    });
  });

  context("POST /comments/:transactionId - unauthenticated", function () {
    it("returns 401 when not authenticated", function () {
      const transactionId = ctx.transactionId!;
      cy.clearCookies();
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  context("GET /comments/:transactionId - unauthenticated", function () {
    it("returns 401 when not authenticated", function () {
      const transactionId = ctx.transactionId!;
      cy.clearCookies();
      cy.request({
        method: "GET",
        url: `${apiComments}/${transactionId}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });
});
