import { User } from "../../../src/models";
import { isMobile } from "../../support/utils";

describe("Responsive Visual Tests", function () {
  beforeEach(function () {
    cy.task("db:seed");

    cy.intercept("GET", "/notifications").as("getNotifications");
    cy.intercept("GET", "/transactions/public*").as("publicTransactions");
    cy.intercept("GET", "/transactions*").as("personalTransactions");

    cy.database("find", "users").then((user: User) => {
      cy.loginByXstate(user.username);
    });
  });

  describe("Navigation and Layout", function () {
    it("displays appropriate navigation for current viewport", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");
      cy.getBySel("list-skeleton").should("not.exist");

      if (isMobile()) {
        cy.getBySel("sidenav-home").should("not.exist");
        cy.visualSnapshot("Mobile Layout - Navigation Hidden");

        cy.getBySel("sidenav-toggle").click();
        cy.getBySel("sidenav-home").should("be.visible");
        cy.visualSnapshot("Mobile Layout - Navigation Drawer Open");

        cy.get(".MuiBackdrop-root").click({ force: true });
        cy.getBySel("sidenav-home").should("not.exist");
        cy.visualSnapshot("Mobile Layout - Navigation Drawer Closed");
      } else {
        cy.getBySel("sidenav-home").should("be.visible");
        cy.visualSnapshot("Desktop Layout - Side Navigation Visible");

        cy.getBySel("sidenav-toggle").click();
        cy.getBySel("sidenav-home").should("not.be.visible");
        cy.visualSnapshot("Desktop Layout - Side Navigation Collapsed");

        cy.getBySel("sidenav-toggle").click();
        cy.getBySel("sidenav-home").should("be.visible");
        cy.visualSnapshot("Desktop Layout - Side Navigation Expanded");
      }
    });

    it("displays transaction list appropriately for viewport", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");
      cy.getBySel("list-skeleton").should("not.exist");

      cy.getBySelLike("transaction-item").should("have.length.at.least", 1);

      if (isMobile()) {
        cy.visualSnapshot("Mobile Layout - Transaction List");
      } else {
        cy.visualSnapshot("Desktop Layout - Transaction List");
      }
    });

    it("displays user balance in sidenav for desktop viewport", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");
      cy.getBySel("list-skeleton").should("not.exist");

      if (isMobile()) {
        cy.getBySel("sidenav-toggle").click();
        cy.getBySel("sidenav-user-balance").should("be.visible");
        cy.visualSnapshot("Mobile Layout - User Balance in Drawer");
      } else {
        cy.getBySel("sidenav-user-balance").should("be.visible");
        cy.visualSnapshot("Desktop Layout - User Balance in Sidenav");
      }
    });
  });

  describe("Transaction Tabs", function () {
    it("displays transaction feed tabs appropriately", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");
      cy.getBySel("list-skeleton").should("not.exist");

      cy.getBySel("nav-public-tab").should("be.visible");
      cy.getBySel("nav-contacts-tab").should("be.visible");
      cy.getBySel("nav-personal-tab").should("be.visible");

      if (isMobile()) {
        cy.visualSnapshot("Mobile Layout - Transaction Tabs");
      } else {
        cy.visualSnapshot("Desktop Layout - Transaction Tabs");
      }
    });

    it("switches between transaction tabs", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");
      cy.getBySel("list-skeleton").should("not.exist");

      cy.getBySel("nav-contacts-tab").click();
      cy.getBySel("nav-contacts-tab").should("have.class", "Mui-selected");
      if (isMobile()) {
        cy.visualSnapshot("Mobile Layout - Friends Tab Selected");
      } else {
        cy.visualSnapshot("Desktop Layout - Friends Tab Selected");
      }

      cy.getBySel("nav-personal-tab").click();
      cy.getBySel("nav-personal-tab").should("have.class", "Mui-selected");
      if (isMobile()) {
        cy.visualSnapshot("Mobile Layout - Mine Tab Selected");
      } else {
        cy.visualSnapshot("Desktop Layout - Mine Tab Selected");
      }
    });
  });

  describe("New Transaction Flow", function () {
    it("displays new transaction button appropriately", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");
      cy.getBySel("list-skeleton").should("not.exist");

      if (isMobile()) {
        cy.getBySel("bottom-nav-item-new").should("be.visible");
        cy.visualSnapshot("Mobile Layout - New Transaction Button");
      } else {
        cy.getBySel("nav-top-new-transaction").should("be.visible");
        cy.visualSnapshot("Desktop Layout - New Transaction Button");
      }
    });
  });

  describe("Filter Controls", function () {
    it("displays date range filter appropriately", function () {
      cy.wait("@getNotifications");
      cy.wait("@publicTransactions");
      cy.getBySel("list-skeleton").should("not.exist");

      cy.getBySelLike("filter-date-range-button").click({ force: true });
      cy.get(".react-calendar").should("be.visible");

      if (isMobile()) {
        cy.visualSnapshot("Mobile Layout - Date Range Picker Open");
        cy.getBySel("date-range-filter-drawer-close").click();
      } else {
        cy.visualSnapshot("Desktop Layout - Date Range Picker Open");
        cy.get("body").click(0, 0);
      }
    });
  });
});
