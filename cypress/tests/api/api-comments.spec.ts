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

  context("Unauthenticated", function () {
    it("should return 401 for GET /comments/:transactionId when unauthenticated", function () {
      cy.request("POST", "/logout");
      cy.request({
        method: "GET",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("should return 401 for POST /comments/:transactionId when unauthenticated", function () {
      cy.request("POST", "/logout");
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        body: { content: "test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  context("GET /comments/:transactionId - validation errors", function () {
    it("should return 422 when transactionId is not a valid shortid", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/invalid-id-format!!!`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.have.property("errors");
        expect(response.body.errors).to.be.an("array").and.not.be.empty;
      });
    });
  });

  context("POST /comments/:transactionId - validation errors", function () {
    it("should return 422 when transactionId is not a valid shortid", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/invalid-id-format!!!`,
        body: { content: "valid content" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.have.property("errors");
        expect(response.body.errors).to.be.an("array").and.not.be.empty;
      });
    });

    it("should return 422 when content is missing from the request body", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: {},
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.have.property("errors");
        expect(response.body.errors).to.be.an("array").and.not.be.empty;
      });
    });

    it("should return 422 when content is not a string", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: 12345 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.have.property("errors");
        expect(response.body.errors).to.be.an("array").and.not.be.empty;
      });
    });
  });
});
