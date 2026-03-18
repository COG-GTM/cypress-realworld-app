import { User } from "../../../src/models";
import { isMobile } from "../../support/utils";

describe("Dashboard Airbnb Redesign", function () {
  beforeEach(function () {
    cy.task("db:seed");

    cy.intercept("GET", "/notifications").as("notifications");
    cy.intercept("GET", "/transactions/public*").as("publicTransactions");
    cy.intercept("GET", "/transactions/contacts*").as("contactsTransactions");
    cy.intercept("GET", "/transactions*").as("personalTransactions");

    cy.database("filter", "users").then((users: User[]) => {
      cy.loginByXstate(users[0].username);
    });
  });

  describe("NavBar Styling", () => {
    it("displays Airbnb-style white header with pink branding", () => {
      cy.wait("@publicTransactions");

      // App title should be pink (#FF385C = rgb(255, 56, 92))
      cy.getBySel("app-name-logo")
        .should("be.visible")
        .and("contain", "Real World App")
        .and("have.css", "color", "rgb(255, 56, 92)");

      // New Transaction button should have pink background
      cy.getBySel("nav-top-new-transaction")
        .should("be.visible")
        .and("have.css", "background-color", "rgb(255, 56, 92)");
    });

    it("uses Nunito font family throughout the navbar", () => {
      cy.wait("@publicTransactions");

      cy.getBySel("app-name-logo")
        .should("have.css", "font-family")
        .and("include", "Nunito");
    });
  });

  describe("Transaction Navigation Tabs", () => {
    it("renders three navigation tabs with icons", () => {
      cy.wait("@publicTransactions");

      cy.getBySel("nav-public-tab").should("be.visible").and("contain", "Everyone");
      cy.getBySel("nav-contacts-tab").should("be.visible").and("contain", "Friends");
      cy.getBySel("nav-personal-tab").should("be.visible").and("contain", "Mine");
    });

    it("switches between tabs correctly", () => {
      cy.wait("@publicTransactions");

      // Click Friends tab
      cy.getBySel("nav-contacts-tab").click();
      cy.getBySel("nav-contacts-tab").should("have.class", "Mui-selected");

      // Click Mine tab
      cy.getBySel("nav-personal-tab").click();
      cy.getBySel("nav-personal-tab").should("have.class", "Mui-selected");

      // Click Everyone tab
      cy.getBySel("nav-public-tab").click();
      cy.getBySel("nav-public-tab").should("have.class", "Mui-selected");
    });
  });

  describe("Transaction Cards", () => {
    it("displays transactions in card format with rounded corners", () => {
      cy.wait("@publicTransactions");

      cy.getBySelLike("transaction-item").first().within(() => {
        // Verify card has rounded corners
        cy.get(".MuiPaper-root")
          .should("have.css", "border-radius", "16px");

        // Verify sender and receiver names are displayed
        cy.getBySelLike("transaction-sender").should("be.visible");
        cy.getBySelLike("transaction-receiver").should("be.visible");

        // Verify social stats are displayed
        cy.get("[data-test=transaction-like-count]").should("be.visible");
        cy.get("[data-test=transaction-comment-count]").should("be.visible");
      });
    });

    it("displays transaction amounts with badge styling", () => {
      cy.wait("@publicTransactions");

      cy.getBySelLike("transaction-amount")
        .first()
        .should("have.css", "border-radius", "20px")
        .and("have.css", "font-weight", "800");
    });
  });

  describe("Navigation Drawer", () => {
    it("shows sidebar with navigation links", () => {
      cy.wait("@publicTransactions");

      if (!isMobile()) {
        cy.getBySel("sidenav-home").should("be.visible");
        cy.getBySel("sidenav-user-settings").should("be.visible");
        cy.getBySel("sidenav-bankaccounts").should("be.visible");
        cy.getBySel("sidenav-notifications").should("be.visible");
        cy.getBySel("sidenav-signout").should("be.visible");
      }
    });

    it("displays user info in the sidebar", () => {
      cy.wait("@publicTransactions");

      if (!isMobile()) {
        cy.getBySel("sidenav-user-full-name").should("be.visible");
        cy.getBySel("sidenav-username").should("be.visible");
      }
    });
  });

  describe("Filter Controls", () => {
    it("displays date and amount filter buttons", () => {
      cy.wait("@publicTransactions");

      cy.getBySelLike("filter-date-range-button").should("be.visible");
      cy.getBySelLike("filter-amount-range-text").should("be.visible");
    });
  });

  describe("Footer", () => {
    it("displays footer with Cypress branding in pink", () => {
      cy.wait("@publicTransactions");

      cy.contains("Built with care by").should("exist");
      cy.get("a[href='https://cypress.io']")
        .should("exist")
        .and("have.css", "color", "rgb(255, 56, 92)");
    });
  });
});
