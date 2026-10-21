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
  });

  context("GET /testData/:entity errors", function () {
    it("errors when the entity is unknown", function () {
      cy.request({
        method: "GET",
        url: `${apiTestData}/not-an-entity`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors[0]).to.include({ param: "entity", value: "not-an-entity" });
      });
    });
  });

  context("POST /testData/seed", function () {
    afterEach(function () {
      cy.task("db:seed");
    });

    it("seeds the database with the default seed data", function () {
      cy.request("POST", `${apiTestData}/seed`, { seed: "default" }).then((response) => {
        expect(response.status).to.eq(200);
      });

      cy.request("GET", `${apiTestData}/users`)
        .its("body.results")
        .should("have.length.greaterThan", 1);
    });

    it("seeds an empty database", function () {
      cy.task("db:seed:empty");
      // the session user no longer exists once the database is emptied
      cy.clearCookies();

      Cypress._.each(["users", "transactions", "bankaccounts", "notifications"], (entity) => {
        cy.request("GET", `${apiTestData}/${entity}`).its("body.results").should("be.empty");
      });
    });

    it("errors when the seed name is unknown and leaves the data unchanged", function () {
      cy.request({
        method: "POST",
        url: `${apiTestData}/seed`,
        body: { seed: "does-not-exist" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.have.length(1);
        expect(response.body.errors[0]).to.include({
          param: "seed",
          msg: "seed must be one of: default, empty",
        });
      });

      cy.request("GET", `${apiTestData}/users`)
        .its("body.results")
        .should("have.length.greaterThan", 1);
    });

    it("errors when the seed name is not a string", function () {
      cy.request({
        method: "POST",
        url: `${apiTestData}/seed`,
        body: { seed: 42 },
        failOnStatusCode: false,
      })
        .its("status")
        .should("eq", 422);
    });
  });
});
