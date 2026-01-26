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
  });

  context("POST /comments/:transactionId - Invalid Transaction ID", function () {
    it("returns error for non-existent transaction ID with valid shortid format", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/invalid-id`,
        body: { content: "Test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(500);
      });
    });

    it("returns 422 for transaction ID with special characters", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/!@#$%^&*()`,
        body: { content: "Test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.have.property("errors");
      });
    });

    it("returns 404 for empty transaction ID path", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/`,
        body: { content: "Test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("returns error for non-existent transaction ID", function () {
      const nonExistentId = "nonExistent123";
      cy.request({
        method: "POST",
        url: `${apiComments}/${nonExistentId}`,
        body: { content: "Test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.not.eq(200);
      });
    });
  });

  context("GET /comments/:transactionId - Invalid Transaction ID", function () {
    it("returns empty array for non-existent transaction ID with valid shortid format", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/invalid-id`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comments).to.be.an("array").that.has.length(0);
      });
    });

    it("returns 422 for transaction ID with special characters", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/!@#$%^&*()`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.have.property("errors");
      });
    });
  });

  context("POST /comments/:transactionId - Content Validation", function () {
    it("accepts empty comment content (no server-side length validation)", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: "" },
        failOnStatusCode: false,
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
        expect(response.body).to.have.property("errors");
      });
    });

    it("returns 422 for null content", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: null },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.have.property("errors");
      });
    });

    it("handles extremely long content", function () {
      const transactionId = ctx.transactionId!;
      const longContent = "a".repeat(10000);
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: longContent },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 413, 422]);
      });
    });

    it("returns 422 for non-string content type", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: 12345 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.have.property("errors");
      });
    });
  });

  context("Authentication & Authorization", function () {
    it("returns 401 for unauthenticated POST request", function () {
      const transactionId = ctx.transactionId!;
      cy.clearCookies();
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: "Test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("returns 401 for unauthenticated GET request", function () {
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

  context("Database Constraint Tests", function () {
    it("allows posting the same comment content twice", function () {
      const transactionId = ctx.transactionId!;
      const commentContent = "Duplicate comment test";

      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: commentContent,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });

      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: commentContent,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("handles rapid sequential comment posts", function () {
      const transactionId = ctx.transactionId!;

      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: "Rapid comment 1",
      }).then((response) => {
        expect(response.status).to.eq(200);
      });

      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: "Rapid comment 2",
      }).then((response) => {
        expect(response.status).to.eq(200);
      });

      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: "Rapid comment 3",
      }).then((response) => {
        expect(response.status).to.eq(200);
      });

      cy.request("GET", `${apiComments}/${transactionId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comments.length).to.be.at.least(4);
      });
    });
  });
});
