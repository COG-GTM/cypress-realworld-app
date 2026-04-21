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

    it("errors when an invalid transactionId is sent", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/not-a-valid-id`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
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

    it("persists the created comment", function () {
      const transactionId = ctx.transactionId!;
      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: "Persistence check comment",
      }).then((response) => {
        expect(response.status).to.eq(200);
      });

      cy.request("GET", `${apiComments}/${transactionId}`).then((response) => {
        expect(response.status).to.eq(200);
        const comments = response.body.comments;
        const found = comments.find((c: Comment) => c.content === "Persistence check comment");
        expect(found).to.not.be.undefined;
        expect(found.transactionId).to.eq(transactionId);
      });
    });

    it("errors when an invalid transactionId is sent", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/not-a-valid-id`,
        failOnStatusCode: false,
        body: { content: "some comment" },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });

    it("errors when content is missing from the body", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        failOnStatusCode: false,
        body: {},
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });

    it("errors when content is not a string", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        failOnStatusCode: false,
        body: { content: 12345 },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });
  });

  context("Unauthenticated", function () {
    it("GET /comments/:transactionId returns 401 when not authenticated", function () {
      const transactionId = ctx.transactionId!;
      cy.clearCookies();
      cy.request({
        method: "GET",
        url: `${apiComments}/${transactionId}`,
        failOnStatusCode: false,
        headers: { Cookie: "" },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("POST /comments/:transactionId returns 401 when not authenticated", function () {
      const transactionId = ctx.transactionId!;
      cy.clearCookies();
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        failOnStatusCode: false,
        headers: { Cookie: "" },
        body: { content: "This is my comment" },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });
});
