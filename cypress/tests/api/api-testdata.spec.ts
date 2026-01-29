// check this file using TypeScript if available
// @ts-check

import { User } from "../../../src/models";

const apiTestData = `${Cypress.env("apiUrl")}/testData`;

type TestDataCtx = {
  authenticatedUser?: User;
};

describe("Test Data API", function () {
  let ctx: TestDataCtx = {};

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
  });

  context("POST /testData/seed", function () {
    it("seeds the database", function () {
      cy.request("POST", `${apiTestData}/seed`).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  context("GET /testData/:entity", function () {
    Cypress._.each(
      [
        "users",
        "contacts",
        "bankaccounts",
        "notifications",
        "transactions",
        "likes",
        "comments",
        "banktransfers",
      ],
      (entity) => {
        it(`gets remote mock data for ${entity}`, function () {
          cy.request("GET", `${apiTestData}/${entity}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.results.length).to.be.greaterThan(1);
          });
        });
      }
    );

    it("errors when invalid entity", function () {
      cy.request({
        method: "GET",
        url: `${apiTestData}/invalid-entity`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });
  });
});
