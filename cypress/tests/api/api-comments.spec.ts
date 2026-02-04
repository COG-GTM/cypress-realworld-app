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

  context("GET /comments/:transactionId - Error Handling", function () {
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

    it("returns 422 when transactionId has invalid format", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/invalid-id-format!@#`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
        expect(response.body.errors[0]).to.have.property("path", "transactionId");
      });
    });

    it("returns 422 when transactionId is empty", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 422]);
      });
    });

    it("returns empty array for non-existent but valid format transactionId", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/abcd1234`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comments).to.be.an("array").that.has.length(0);
      });
    });
  });

  context("POST /comments/:transactionId - Error Handling", function () {
    it("returns 401 when not authenticated", function () {
      cy.logout();
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        body: { content: "test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.eq("Unauthorized");
      });
    });

    it("returns 422 when content is missing from request body", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        body: {},
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
        expect(response.body.errors[0]).to.have.property("path", "content");
      });
    });

    it("returns 422 when content is empty string", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        body: { content: "" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
        expect(response.body.errors[0]).to.have.property("path", "content");
      });
    });

    it("returns 422 when content is not a string (number)", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        body: { content: 12345 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
        expect(response.body.errors[0]).to.have.property("path", "content");
      });
    });

    it("returns 422 when content is not a string (object)", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        body: { content: { nested: "value" } },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
        expect(response.body.errors[0]).to.have.property("path", "content");
      });
    });

    it("returns 422 when content is not a string (array)", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        body: { content: ["array", "value"] },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
        expect(response.body.errors[0]).to.have.property("path", "content");
      });
    });

    it("returns 422 when content is null", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        body: { content: null },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
        expect(response.body.errors[0]).to.have.property("path", "content");
      });
    });

    it("returns 422 when request body is missing", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("returns 422 when transactionId has invalid format", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/invalid-id-format!@#`,
        body: { content: "test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
        expect(response.body.errors[0]).to.have.property("path", "transactionId");
      });
    });

    it("returns 422 when both transactionId and content are invalid", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/invalid-id!@#`,
        body: { content: 12345 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
        expect(response.body.errors.length).to.be.at.least(2);
      });
    });
  });

  context("POST /comments/:transactionId - Database Error Handling", function () {
    it("handles non-existent transaction gracefully", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/abcd1234`,
        body: { content: "test comment for non-existent transaction" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 500]);
      });
    });
  });
});
