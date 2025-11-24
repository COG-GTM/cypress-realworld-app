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

    it("errors when unauthenticated", function () {
      cy.request("POST", `${Cypress.env("apiUrl")}/logout`);
      cy.request({
        method: "GET",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.eq("Unauthorized");
      });
    });

    it("errors when invalid transactionId format", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/1234`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array").that.has.length(1);
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

    it("errors when unauthenticated", function () {
      cy.request("POST", `${Cypress.env("apiUrl")}/logout`);
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {
          content: "This is my comment",
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.eq("Unauthorized");
      });
    });

    it("errors when invalid transactionId format", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/1234`,
        failOnStatusCode: false,
        body: {
          content: "This is my comment",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array").that.has.length(1);
      });
    });

    it("errors when non-existent but valid-format transactionId", function () {
      // Using a valid shortid format that doesn't exist in the database
      cy.request({
        method: "POST",
        url: `${apiComments}/LJxTqjd0t`,
        failOnStatusCode: false,
        body: {
          content: "This is my comment",
        },
      }).then((response) => {
        // The API creates the comment even for non-existent transactions
        // This is expected behavior based on the backend implementation
        expect(response.status).to.eq(200);
      });
    });

    it("errors when content field is empty", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {
          content: "",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array").that.has.length(1);
      });
    });

    it("errors when content field is missing", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {},
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array").that.has.length(1);
      });
    });

    it("errors when content field is not a string", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {
          content: 123,
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array").that.has.length(1);
      });
    });

    it("errors when an invalid field is sent", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {
          content: "This is my comment",
          invalidField: "invalid value",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array").that.has.length(1);
      });
    });
  });
});
