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

  context("Error Handling", function () {
    it("returns 401 for missing authentication", function () {
      cy.clearCookies();
      cy.request({
        method: "GET",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.eq("Unauthorized");
      });
    });

    it("returns 401 for unauthenticated POST request", function () {
      cy.clearCookies();
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        body: {
          content: "Test comment",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.eq("Unauthorized");
      });
    });

    it("returns 422 for invalid transaction ID format", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/invalid-id-format!!!`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("returns 422 for missing comment content", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: {},
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("returns empty array for non-existent transaction", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/validShortId`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comments).to.be.an("array").that.is.empty;
      });
    });

    it("handles very long comment content", function () {
      const transactionId = ctx.transactionId!;
      const longContent = "A".repeat(10000);
      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: longContent,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("handles special characters in comments", function () {
      const transactionId = ctx.transactionId!;
      const specialContent =
        "Test <script>alert('xss')</script> & \"quotes\" 'apostrophes' émojis 🎉";
      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: specialContent,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
