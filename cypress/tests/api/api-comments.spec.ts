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

    it("returns 404 for non-existent transaction ID", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/non-existent-id`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
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

    it("returns 404 when posting to non-existent transaction", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/non-existent-id`,
        body: { content: "test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("rejects empty comment content", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: "" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.exist;
      });
    });

    it("rejects missing comment content", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: {},
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
      });
    });

    it("handles very long comment content", function () {
      const longContent = "a".repeat(10000);
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: longContent },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 422]);
      });
    });

    it("handles special characters in comments", function () {
      const specialContent = "<script>alert('xss')</script> & special chars";
      const transactionId = ctx.transactionId!;
      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: specialContent,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});

describe("Comments API - Unauthorized Access", function () {
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

  it("requires authentication to get comments", function () {
    cy.request({
      method: "GET",
      url: `${apiComments}/${ctx.transactionId}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it("requires authentication to post comments", function () {
    cy.request({
      method: "POST",
      url: `${apiComments}/${ctx.transactionId}`,
      body: { content: "test" },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
