import { User } from "../../../src/models";

const apiUrl = Cypress.env("apiUrl");
const paginationPageSize = Cypress.env("paginationPageSize");

type TestPaginationCtx = {
  authenticatedUser?: User;
};

describe("Pagination API", function () {
  let ctx: TestPaginationCtx = {};

  before(() => {
    cy.request("GET", "/");
  });

  beforeEach(function () {
    cy.task("db:seed");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.authenticatedUser = users[0];

      return cy.loginByApi(ctx.authenticatedUser.username);
    });
  });

  context("GET /transactions pagination", function () {
    it("returns correct pagination metadata", function () {
      cy.request("GET", `${apiUrl}/transactions`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pageData).to.have.property("page");
        expect(response.body.pageData).to.have.property("limit");
        expect(response.body.pageData).to.have.property("hasNextPages");
        expect(response.body.pageData).to.have.property("totalPages");
      });
    });

    it("respects page parameter", function () {
      cy.request("GET", `${apiUrl}/transactions?page=1`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pageData.page).to.eq(1);
      });
    });

    it("respects limit parameter", function () {
      const customLimit = 5;
      cy.request("GET", `${apiUrl}/transactions?limit=${customLimit}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pageData.limit).to.eq(customLimit);
        expect(response.body.results.length).to.be.at.most(customLimit);
      });
    });

    it("returns hasNextPages correctly when more pages exist", function () {
      cy.request("GET", `${apiUrl}/transactions?page=1&limit=1`).then((response) => {
        expect(response.status).to.eq(200);
        if (response.body.pageData.totalPages > 1) {
          expect(response.body.pageData.hasNextPages).to.eq(true);
        }
      });
    });

    it("returns hasNextPages false on last page", function () {
      cy.request("GET", `${apiUrl}/transactions?page=1&limit=1`).then((firstResponse) => {
        const totalPages = firstResponse.body.pageData.totalPages;
        if (totalPages > 0) {
          cy.request("GET", `${apiUrl}/transactions?page=${totalPages}&limit=1`).then(
            (response) => {
              expect(response.status).to.eq(200);
              expect(response.body.pageData.hasNextPages).to.eq(false);
            }
          );
        }
      });
    });

    it("returns different results for different pages", function () {
      cy.request("GET", `${apiUrl}/transactions?page=1&limit=2`).then((firstPageResponse) => {
        if (firstPageResponse.body.pageData.totalPages > 1) {
          cy.request("GET", `${apiUrl}/transactions?page=2&limit=2`).then((secondPageResponse) => {
            expect(secondPageResponse.status).to.eq(200);
            if (
              firstPageResponse.body.results.length > 0 &&
              secondPageResponse.body.results.length > 0
            ) {
              expect(firstPageResponse.body.results[0].id).to.not.eq(
                secondPageResponse.body.results[0].id
              );
            }
          });
        }
      });
    });
  });

  context("GET /transactions/contacts pagination", function () {
    it("returns correct pagination metadata", function () {
      cy.request("GET", `${apiUrl}/transactions/contacts`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pageData).to.have.property("page");
        expect(response.body.pageData).to.have.property("limit");
        expect(response.body.pageData).to.have.property("hasNextPages");
        expect(response.body.pageData).to.have.property("totalPages");
      });
    });

    it("respects page and limit parameters", function () {
      cy.request("GET", `${apiUrl}/transactions/contacts?page=1&limit=3`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pageData.page).to.eq(1);
        expect(response.body.pageData.limit).to.eq(3);
      });
    });
  });

  context("GET /transactions/public pagination", function () {
    it("returns correct pagination metadata", function () {
      cy.request("GET", `${apiUrl}/transactions/public`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pageData).to.have.property("page");
        expect(response.body.pageData).to.have.property("limit");
        expect(response.body.pageData).to.have.property("hasNextPages");
        expect(response.body.pageData).to.have.property("totalPages");
      });
    });

    it("respects page and limit parameters", function () {
      cy.request("GET", `${apiUrl}/transactions/public?page=1&limit=5`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pageData.page).to.eq(1);
        expect(response.body.pageData.limit).to.eq(5);
      });
    });

    it("calculates totalPages correctly based on limit", function () {
      cy.request("GET", `${apiUrl}/transactions/public?page=1&limit=1`).then(
        (smallLimitResponse) => {
          cy.request("GET", `${apiUrl}/transactions/public?page=1&limit=100`).then(
            (largeLimitResponse) => {
              expect(smallLimitResponse.body.pageData.totalPages).to.be.at.least(
                largeLimitResponse.body.pageData.totalPages
              );
            }
          );
        }
      );
    });
  });

  context("Default pagination behavior", function () {
    it("uses default page size from environment when not specified", function () {
      cy.request("GET", `${apiUrl}/transactions`).then((response) => {
        expect(response.status).to.eq(200);
        if (paginationPageSize) {
          expect(response.body.pageData.limit).to.eq(parseInt(paginationPageSize, 10));
        }
      });
    });

    it("defaults to page 1 when page not specified", function () {
      cy.request("GET", `${apiUrl}/transactions`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pageData.page).to.eq(1);
      });
    });
  });
});
