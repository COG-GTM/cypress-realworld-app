import { User } from "../../../src/models";

const apiUrl = Cypress.env("apiUrl");

type TestAuthCtx = {
  authenticatedUser?: User;
};

describe("Auth API", function () {
  let ctx: TestAuthCtx = {};

  before(() => {
    cy.request("GET", "/");
  });

  beforeEach(function () {
    cy.task("db:seed");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.authenticatedUser = users[0];
    });
  });

  context("GET /checkAuth", function () {
    it("returns user when authenticated", function () {
      cy.loginByApi(ctx.authenticatedUser!.username).then(() => {
        cy.request("GET", `${apiUrl}/checkAuth`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.user).to.have.property("id");
          expect(response.body.user).to.have.property("username");
        });
      });
    });

    it("returns 401 when not authenticated", function () {
      cy.request({
        method: "GET",
        url: `${apiUrl}/checkAuth`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.eq("User is unauthorized");
      });
    });
  });

  context("POST /logout", function () {
    it("logs out a user", function () {
      cy.loginByApi(ctx.authenticatedUser!.username).then(() => {
        cy.request("POST", `${apiUrl}/logout`).then((response) => {
          expect(response.status).to.eq(200);
        });
      });
    });

    it("invalidates session after logout", function () {
      cy.loginByApi(ctx.authenticatedUser!.username).then(() => {
        cy.request("POST", `${apiUrl}/logout`).then(() => {
          cy.request({
            method: "GET",
            url: `${apiUrl}/checkAuth`,
            failOnStatusCode: false,
          }).then((response) => {
            expect(response.status).to.eq(401);
          });
        });
      });
    });
  });

  context("POST /login", function () {
    it("returns 401 for invalid credentials", function () {
      cy.request({
        method: "POST",
        url: `${apiUrl}/login`,
        failOnStatusCode: false,
        body: {
          username: ctx.authenticatedUser!.username,
          password: "wrongpassword",
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("returns 401 for non-existent user", function () {
      cy.request({
        method: "POST",
        url: `${apiUrl}/login`,
        failOnStatusCode: false,
        body: {
          username: "nonexistentuser",
          password: "anypassword",
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  context("Unauthenticated access to protected routes", function () {
    it("returns 401 for GET /users without authentication", function () {
      cy.request({
        method: "GET",
        url: `${apiUrl}/users`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("returns 401 for GET /bankAccounts without authentication", function () {
      cy.request({
        method: "GET",
        url: `${apiUrl}/bankAccounts`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("returns 401 for GET /transactions without authentication", function () {
      cy.request({
        method: "GET",
        url: `${apiUrl}/transactions`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("returns 401 for GET /notifications without authentication", function () {
      cy.request({
        method: "GET",
        url: `${apiUrl}/notifications`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("returns 401 for POST /transactions without authentication", function () {
      cy.request({
        method: "POST",
        url: `${apiUrl}/transactions`,
        failOnStatusCode: false,
        body: {
          transactionType: "payment",
          source: "test",
          receiverId: "test",
          description: "test",
          amount: 100,
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("returns 401 for GraphQL queries without authentication", function () {
      cy.request({
        method: "POST",
        url: `${apiUrl}/graphql`,
        failOnStatusCode: false,
        body: {
          query: `query { listBankAccount { id } }`,
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });
});
