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

    cy.database("find", "comments").then((comment: Comment) => {
      ctx.transactionId = comment.transactionId;
    });
  });

  context("GET /comments/:transactionId", function () {
    beforeEach(function () {
      cy.database("filter", "users").then((users: User[]) => {
        ctx.authenticatedUser = users[0];
        return cy.loginByApi(ctx.authenticatedUser.username);
      });
    });

    it("gets a list of comments for a transaction", function () {
      const transactionId = ctx.transactionId!;
      cy.request("GET", `${apiComments}/${transactionId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comments).to.be.an("array").that.has.length(1);
      });
    });

    it("errors with malformed transactionId", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/not-a-valid-shortid!!!`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array").and.not.be.empty;
      });
    });
  });

  context("POST /comments/:transactionId", function () {
    beforeEach(function () {
      cy.database("filter", "users").then((users: User[]) => {
        ctx.authenticatedUser = users[0];
        return cy.loginByApi(ctx.authenticatedUser.username);
      });
    });

    it("creates a new comment for a transaction", function () {
      const transactionId = ctx.transactionId!;
      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: "This is my comment",
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("errors with malformed transactionId", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/not-a-valid-shortid!!!`,
        failOnStatusCode: false,
        body: {
          content: "This is my comment",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array").and.not.be.empty;
      });
    });
  });

  context("POST /comments/:transactionId - invalid body", function () {
    beforeEach(function () {
      cy.database("filter", "users").then((users: User[]) => {
        ctx.authenticatedUser = users[0];
        return cy.loginByApi(ctx.authenticatedUser.username);
      });
    });

    it("errors when POST body is empty", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {},
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array").and.not.be.empty;
        expect(response.body.errors[0]).to.have.property("path", "content");
      });
    });

    it("errors when content is non-string", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: { content: 12345 },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array").and.not.be.empty;
      });
    });

    it("errors when unknown field sent without content", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: { notACommentField: "foo" },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array").and.not.be.empty;
      });
    });
  });

  context("Unauthenticated", function () {
    it("rejects GET /comments/:transactionId without auth", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.eq("Unauthorized");
      });
    });

    it("rejects POST /comments/:transactionId without auth", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: { content: "This is my comment" },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });
});
