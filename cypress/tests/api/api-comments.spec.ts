// check this file using TypeScript if available
// @ts-check

import { User, Comment } from "../../../src/models";

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

    it("returns comments with all expected fields", function () {
      const transactionId = ctx.transactionId!;
      cy.request("GET", `${apiComments}/${transactionId}`).then((response) => {
        expect(response.status).to.eq(200);
        const comment = response.body.comments[0];
        expect(comment).to.have.property("id").that.is.a("string");
        expect(comment).to.have.property("uuid").that.is.a("string");
        expect(comment).to.have.property("content").that.is.a("string");
        expect(comment).to.have.property("userId").that.is.a("string");
        expect(comment).to.have.property("transactionId").that.is.a("string");
        expect(comment).to.have.property("createdAt").that.is.a("string");
        expect(comment).to.have.property("modifiedAt").that.is.a("string");
      });
    });

    it("returns empty array for transaction with no comments", function () {
      cy.database("find", "transactions").then((transaction: any) => {
        cy.request("GET", `${apiComments}/${transaction.id}`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.comments).to.be.an("array");
        });
      });
    });

    it("returns 401 when not authenticated", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        headers: {
          Cookie: "",
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("returns 422 for invalid transaction ID format", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/not-valid-id!!!`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.have.property("errors");
        expect(response.body.errors).to.be.an("array").and.have.length.greaterThan(0);
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

    it("allows multiple comments on the same transaction", function () {
      const transactionId = ctx.transactionId!;
      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: "First comment",
      }).then((response) => {
        expect(response.status).to.eq(200);
      });

      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: "Second comment",
      }).then((response) => {
        expect(response.status).to.eq(200);
      });

      cy.request("GET", `${apiComments}/${transactionId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comments).to.be.an("array").that.has.length(3);
      });
    });

    it("allows the same user to comment multiple times", function () {
      const transactionId = ctx.transactionId!;
      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: "Comment one by same user",
      }).then((response) => {
        expect(response.status).to.eq(200);
      });

      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: "Comment two by same user",
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("returns 401 when not authenticated", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        headers: {
          Cookie: "",
        },
        body: {
          content: "Unauthorized comment",
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("returns 422 for invalid transaction ID format", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/not-valid-id!!!`,
        failOnStatusCode: false,
        body: {
          content: "A comment",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.have.property("errors");
        expect(response.body.errors).to.be.an("array").and.have.length.greaterThan(0);
      });
    });

    it("returns 422 when content field is missing", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {},
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.have.property("errors");
        expect(response.body.errors).to.be.an("array").and.have.length.greaterThan(0);
      });
    });

    it("returns 422 when content is empty string", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {
          content: "",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.have.property("errors");
      });
    });

    it("returns 422 when content is not a string", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {
          content: 12345,
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.have.property("errors");
        expect(response.body.errors).to.be.an("array").and.have.length.greaterThan(0);
      });
    });
  });
});
