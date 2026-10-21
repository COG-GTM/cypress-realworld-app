// check this file using TypeScript if available
// @ts-check

import { User, Like } from "../../../src/models";

const apiLikes = `${Cypress.env("apiUrl")}/likes`;

type TestLikesCtx = {
  authenticatedUser?: User;
  transactionId?: string;
};

describe("Likes API", function () {
  let ctx: TestLikesCtx = {};

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

    cy.database("find", "likes").then((like: Like) => {
      ctx.transactionId = like.transactionId;
    });
  });

  context("GET /likes/:transactionId", function () {
    it("gets a list of likes for a transaction", function () {
      cy.request("GET", `${apiLikes}/${ctx.transactionId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.likes.length).to.eq(1);
      });
    });
  });

  context("POST /likes/:transactionId", function () {
    it("creates a new like for a transaction", function () {
      cy.request("POST", `${apiLikes}/${ctx.transactionId}`, {
        transactionId: ctx.transactionId,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  context("errors", function () {
    it("errors when the transactionId is invalid", function () {
      cy.request({
        method: "POST",
        url: `${apiLikes}/!invalid!`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors[0]).to.include({ param: "transactionId" });
      });
    });

    it("errors when the user is not authenticated", function () {
      cy.clearCookies();
      cy.request({
        method: "POST",
        url: `${apiLikes}/${ctx.transactionId}`,
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 401);
    });
  });
});
