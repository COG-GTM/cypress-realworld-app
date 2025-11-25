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

    it("returns 422 when transactionId is invalid", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/1234`,
        failOnStatusCode: false,
        body: { content: "Test comment" },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array").that.has.length(1);
      });
    });

    it("handles non-existent transaction ID gracefully", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/nonexistent123`,
        failOnStatusCode: false,
        body: { content: "Test comment" },
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 422, 500]);
      });
    });

    it("returns 422 when comment content is empty", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        failOnStatusCode: false,
        body: { content: "" },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("returns 422 when content field is missing", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        failOnStatusCode: false,
        body: {},
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("returns 422 when invalid field is sent", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        failOnStatusCode: false,
        body: {
          content: "Valid content",
          invalidField: "should not be here",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("returns 400 when request body is malformed JSON", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        failOnStatusCode: false,
        headers: { "Content-Type": "application/json" },
        body: "{ invalid json }",
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });
  });
});

describe("Comments API - Authentication", function () {
  let ctx: TestCommentsCtx = {};

  before(() => {
    cy.request("GET", "/");
  });

  beforeEach(function () {
    cy.task("db:seed");

    cy.database("find", "comments").then((comment: Comment) => {
      ctx.transactionId = comment.transactionId;
    });
  });

  it("returns 401 when not authenticated", function () {
    const transactionId = ctx.transactionId!;

    cy.request({
      method: "POST",
      url: `${apiComments}/${transactionId}`,
      failOnStatusCode: false,
      body: { content: "Test comment" },
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.error).to.eq("Unauthorized");
    });
  });

  it("returns 401 for GET when not authenticated", function () {
    const transactionId = ctx.transactionId!;

    cy.request({
      method: "GET",
      url: `${apiComments}/${transactionId}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.error).to.eq("Unauthorized");
    });
  });
});
