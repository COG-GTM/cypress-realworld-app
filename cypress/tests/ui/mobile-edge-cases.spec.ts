import { User } from "../../../src/models";
import { isMobile } from "../../support/utils";

type MobileTestCtx = {
  user?: User;
};

describe("Mobile Viewport Edge Cases", { viewportWidth: 375, viewportHeight: 667 }, function () {
  const ctx: MobileTestCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.intercept("GET", "/notifications").as("getNotifications");
    cy.intercept("GET", "/transactions/public*").as("publicTransactions");
    cy.intercept("GET", "/transactions*").as("personalTransactions");
    cy.intercept("GET", "/users*").as("allUsers");

    cy.database("find", "users").then((user: User) => {
      ctx.user = user;
      return cy.loginByXstate(ctx.user.username);
    });
  });

  describe("mobile navigation edge cases", function () {
    it("should handle sidenav toggle and close via backdrop", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.getBySel("sidenav-toggle").click();
      cy.getBySel("sidenav-home").should("be.visible");

      cy.get(".MuiBackdrop-root").click({ force: true });
      cy.getBySel("sidenav-home").should("not.be.visible");

      cy.getBySel("sidenav-toggle").click();
      cy.getBySel("sidenav-home").should("be.visible");
    });

    it("should maintain navigation state after page refresh", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.getBySel("sidenav-toggle").click();
      cy.getBySel("sidenav-bankaccounts").click();

      cy.location("pathname").should("eq", "/bankaccounts");

      cy.reload();
      cy.wait("@getNotifications");

      cy.location("pathname").should("eq", "/bankaccounts");
      cy.getBySel("sidenav-home").should("not.exist");
    });

    it("should handle swipe-like interactions on transaction list", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.getBySel("transaction-list").should("be.visible");
      cy.getBySelLike("transaction-item").should("have.length.greaterThan", 0);

      cy.getBySel("transaction-list").children().scrollTo("bottom");
      cy.wait("@publicTransactions");

      cy.getBySel("transaction-list").children().scrollTo("top");
    });
  });

  describe("mobile form interactions", function () {
    it("should handle keyboard interactions on mobile forms", function () {
      cy.wait("@getNotifications");

      cy.getBySel("sidenav-toggle").click();
      cy.getBySel("sidenav-user-settings").click();

      cy.get("#user-settings-firstName-input").clear();
      cy.get("#user-settings-firstName-input").type("NewFirstName");
      cy.get("#user-settings-lastName-input").clear();
      cy.get("#user-settings-lastName-input").type("NewLastName");

      cy.get("#user-settings-firstName-input").should("have.value", "NewFirstName");
      cy.get("#user-settings-lastName-input").should("have.value", "NewLastName");
    });

    it("should handle touch interactions on new transaction form", function () {
      cy.wait("@getNotifications");

      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");

      cy.getBySelLike("user-list-item").first().click({ force: true });

      cy.getBySelLike("amount-input").type("50");
      cy.getBySelLike("description-input").type("Mobile test payment");

      cy.get("#amount").should("have.value", "$50");
      cy.get("#transaction-create-description-input").should("have.value", "Mobile test payment");
    });
  });

  describe("mobile viewport specific UI elements", function () {
    it("should not display user balance in sidenav on mobile", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      if (isMobile()) {
        cy.getBySel("sidenav-toggle").click();
        cy.getBySel("sidenav-user-balance").should("not.be.visible");
      }
    });

    it("should display mobile-optimized date range picker", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.getBySelLike("filter-date-range-button").click({ force: true });
      cy.get(".react-calendar").should("be.visible");

      cy.getBySel("date-range-filter-drawer-close").click();
      cy.get(".react-calendar").should("not.exist");
    });

    it("should handle orientation change simulation", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.viewport(667, 375);

      cy.getBySel("transaction-list").should("be.visible");
      cy.getBySelLike("transaction-item").should("have.length.greaterThan", 0);

      cy.viewport(375, 667);

      cy.getBySel("transaction-list").should("be.visible");
    });
  });

  describe("mobile touch gestures and scrolling", function () {
    it("should handle infinite scroll on transaction feed", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.getBySelLike("transaction-item").should("have.length.greaterThan", 0);

      cy.getBySel("transaction-list").children().scrollTo("bottom");
      cy.wait("@publicTransactions");

      cy.getBySelLike("transaction-item").should("have.length.greaterThan", 0);
    });

    it("should handle pull-to-refresh behavior simulation", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.reload();
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.getBySel("transaction-list").should("be.visible");
    });
  });

  describe("mobile-specific edge cases", function () {
    it("should handle small screen transaction details view", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.getBySelLike("transaction-item").first().click({ force: true });

      cy.getBySel("transaction-detail-header").should("be.visible");
      cy.getBySelLike("transaction-amount").should("be.visible");
      cy.getBySelLike("transaction-description").should("be.visible");
    });

    it("should handle notification badge on mobile", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.getBySel("nav-top-notifications-count").should("exist");
    });

    it("should handle tab switching on mobile", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");

      cy.getBySelLike("personal-tab").click();
      cy.getBySelLike("personal-tab").should("have.class", "Mui-selected");
      cy.wait("@personalTransactions");

      cy.getBySelLike("contacts-tab").click();
      cy.getBySelLike("contacts-tab").should("have.class", "Mui-selected");

      cy.getBySelLike("public-tab").click();
      cy.getBySelLike("public-tab").should("have.class", "Mui-selected");
    });
  });
});
