// check this file using TypeScript if available
// @ts-check

import { faker } from "@faker-js/faker";
import { User, BankAccount } from "../../../src/models";

const apiBankAccounts = `${Cypress.env("apiUrl")}/bankAccounts`;
const apiGraphQL = `${Cypress.env("apiUrl")}/graphql`;

type TestBankAccountsCtx = {
  allUsers?: User[];
  authenticatedUser?: User;
  bankAccounts?: BankAccount[];
};

describe("Bank Accounts API", function () {
  let ctx: TestBankAccountsCtx = {};

  before(() => {
    // Hacky workaround to have the e2e tests pass when cy.visit('http://localhost:3000') is called
    cy.request("GET", "/");
  });

  beforeEach(function () {
    cy.task("db:seed");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.authenticatedUser = users[0];
      ctx.allUsers = users;

      return cy.loginByApi(ctx.authenticatedUser.username);
    });

    cy.database("filter", "bankaccounts").then((bankAccounts: BankAccount[]) => {
      ctx.bankAccounts = bankAccounts;
    });
  });

  context("GET /bankAccounts", function () {
    it("gets a list of bank accounts for user", function () {
      const { id: userId } = ctx.authenticatedUser!;
      cy.request("GET", `${apiBankAccounts}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results[0].userId).to.eq(userId);
      });
    });
  });

  context("GET /bankAccounts/:bankAccountId", function () {
    it("gets a bank account", function () {
      const { id: userId } = ctx.authenticatedUser!;
      const { id: bankAccountId } = ctx.bankAccounts![0];
      cy.request("GET", `${apiBankAccounts}/${bankAccountId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.account.userId).to.eq(userId);
      });
    });

    it("errors when invalid bankAccountId", function () {
      cy.request({
        method: "GET",
        url: `${apiBankAccounts}/invalid-id`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.eq(1);
      });
    });
  });

  context("POST /bankAccounts", function () {
    it("creates a new bank account", function () {
      const { id: userId } = ctx.authenticatedUser!;

      cy.request("POST", `${apiBankAccounts}`, {
        bankName: `${faker.company.companyName()} Bank`,
        accountNumber: faker.finance.account(10),
        routingNumber: faker.finance.account(9),
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.account.id).to.be.a("string");
        expect(response.body.account.userId).to.eq(userId);
      });
    });

    it("errors when missing required fields", function () {
      cy.request({
        method: "POST",
        url: `${apiBankAccounts}`,
        failOnStatusCode: false,
        body: {
          bankName: "Test Bank",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });
  });

  context("DELETE /bankAccounts/:bankAccountId", function () {
    it("deletes a bank account", function () {
      const { id: bankAccountId } = ctx.bankAccounts![0];
      cy.request("DELETE", `${apiBankAccounts}/${bankAccountId}`).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("errors when invalid bankAccountId", function () {
      cy.request({
        method: "DELETE",
        url: `${apiBankAccounts}/invalid-id`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.eq(1);
      });
    });
  });

  context("/graphql", function () {
    it("gets a list of bank accounts for user", function () {
      const { id: userId } = ctx.authenticatedUser!;
      cy.request("POST", `${apiGraphQL}`, {
        query: `query {
           listBankAccount {
            id
            uuid
            userId
            bankName
            accountNumber
            routingNumber
            isDeleted
            createdAt
            modifiedAt
           }
          }`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(JSON.stringify(response.body.errors || "notThere")).to.eq('"notThere"');
        expect(response.body.data.listBankAccount[0].userId).to.eq(userId);
      });
    });
    it("creates a new bank account", function () {
      const { id: userId } = ctx.authenticatedUser!;
      cy.request("POST", `${apiGraphQL}`, {
        query: `mutation createBankAccount ($bankName: String!, $accountNumber: String!,  $routingNumber: String!) {
          createBankAccount(
            bankName: $bankName,
            accountNumber: $accountNumber,
            routingNumber: $routingNumber
          ) {
            id
            uuid
            userId
            bankName
            accountNumber
            routingNumber
            isDeleted
            createdAt
          }
        }`,
        variables: {
          bankName: `${faker.company.companyName()} Bank`,
          accountNumber: faker.finance.account(10),
          routingNumber: faker.finance.account(9),
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.createBankAccount.userId).to.eq(userId);
      });
    });
    it("deletes a bank account", function () {
      const { id: bankAccountId } = ctx.bankAccounts![0];
      cy.request("POST", `${apiGraphQL}`, {
        query: `mutation deleteBankAccount ($id: ID!) {
          deleteBankAccount(id: $id)
        }`,
        variables: { id: bankAccountId },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("errors when creating bank account with missing fields", function () {
      cy.request("POST", `${apiGraphQL}`, {
        query: `mutation createBankAccount ($bankName: String!, $accountNumber: String!,  $routingNumber: String!) {
          createBankAccount(
            bankName: $bankName,
            accountNumber: $accountNumber,
            routingNumber: $routingNumber
          ) {
            id
          }
        }`,
        variables: {
          bankName: "Test Bank",
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it("handles invalid GraphQL query syntax", function () {
      cy.request({
        method: "POST",
        url: `${apiGraphQL}`,
        failOnStatusCode: false,
        body: {
          query: `invalid query syntax {`,
        },
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });
});
