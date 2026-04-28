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

        const comment = response.body.comments[0];
        expect(comment).to.have.property("id");
        expect(comment).to.have.property("uuid");
        expect(comment).to.have.property("content");
        expect(comment).to.have.property("userId");
        expect(comment).to.have.property("transactionId");
        expect(comment).to.have.property("createdAt");
        expect(comment).to.have.property("modifiedAt");
      });
    });

    it("errors when invalid transactionId", function () {
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

      // Verify persistence
      cy.request("GET", `${apiComments}/${ctx.transactionId}`).then((response) => {
        expect(response.status).to.eq(200);
        const contents = response.body.comments.map((c: Comment) => c.content);
        expect(contents).to.include("This is my comment");
      });
    });

    it("errors when content is missing from POST body", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {},
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("errors when invalid transactionId on POST", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/1234`,
        failOnStatusCode: false,
        body: { content: "test" },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });
  });

  context("Unauthenticated", function () {
    it("is unauthorized to GET comments without login", function () {
      cy.clearCookies();
      cy.request({
        method: "GET",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("is unauthorized to POST comments without login", function () {
      cy.clearCookies();
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
