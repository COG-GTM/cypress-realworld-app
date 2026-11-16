import { addDays, format as formatDate } from "date-fns";
import { User } from "../../../src/models";
import { isMobile } from "../../support/utils";

type ScheduledPaymentsCtx = {
  userA: User;
  userB: User;
  userC: User;
};

const isoDate = (daysFromNow: number) => formatDate(addDays(new Date(), daysFromNow), "yyyy-MM-dd");

const openScheduledPayments = () => {
  if (isMobile()) {
    cy.getBySel("sidenav-toggle").click();
  }
  cy.getBySel("sidenav-scheduled-payments").click();
  cy.location("pathname").should("eq", "/scheduled-payments");
};

describe("Scheduled Payments", function () {
  const ctx = {} as ScheduledPaymentsCtx;
  const apiScheduledPayments = `${Cypress.env("apiUrl")}/scheduledPayments`;

  beforeEach(function () {
    cy.task("db:seed");

    cy.intercept("GET", "/notifications").as("notifications");
    cy.intercept("GET", "/scheduledPayments").as("getScheduledPayments");
    cy.intercept("PATCH", "/scheduledPayments/*").as("cancelScheduledPayment");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.userA = users[0];
      ctx.userB = users[1];
      ctx.userC = users[2];

      return cy.loginByXstate(ctx.userA.username);
    });
  });

  it("shows an empty state with a link to schedule a payment", function () {
    cy.wait("@notifications");
    openScheduledPayments();
    cy.wait("@getScheduledPayments");

    cy.getBySel("empty-list-header").should("contain", "No Scheduled Payments");
    cy.getBySel("scheduled-payments-empty-create").click();
    cy.location("pathname").should("eq", "/transaction/new");
  });

  it("lists schedules active first and cancels one after confirming", function () {
    cy.wait("@notifications");

    // Completed: a one-time payment that has already run
    cy.request("POST", apiScheduledPayments, {
      receiverId: ctx.userC.id,
      amount: 1000,
      description: "Concert tickets",
      frequency: "once",
      startDate: isoDate(1),
    });
    cy.request("POST", `${Cypress.env("apiUrl")}/testData/scheduledPayments/run`, {
      now: `${isoDate(1)}T12:00:00`,
    });
    cy.request("POST", apiScheduledPayments, {
      receiverId: ctx.userB.id,
      amount: 2500,
      description: "Rent share",
      frequency: "monthly",
      startDate: isoDate(3),
    })
      .its("body.scheduledPayment.id")
      .as("monthlyId");
    cy.request("POST", apiScheduledPayments, {
      receiverId: ctx.userC.id,
      amount: 1500,
      description: "Weekly lunch",
      frequency: "weekly",
      startDate: isoDate(2),
    });

    openScheduledPayments();
    cy.wait("@getScheduledPayments");

    cy.getBySelLike("scheduled-payment-list-item").should("have.length", 3);
    cy.getBySelLike("scheduled-payment-list-item")
      .eq(0)
      .should("contain", `${ctx.userC.firstName} ${ctx.userC.lastName}`)
      .and("contain", "Weekly lunch")
      .and("contain", "$15.00")
      .and("contain", "Weekly")
      .and("contain", `Next ${formatDate(addDays(new Date(), 2), "MMM d, yyyy")}`)
      .and("contain", "Active");
    cy.getBySelLike("scheduled-payment-list-item")
      .eq(1)
      .should("contain", "Rent share")
      .and("contain", "$25.00")
      .and("contain", "Monthly")
      .and("contain", "Active");
    cy.getBySelLike("scheduled-payment-list-item")
      .eq(2)
      .should("contain", "Concert tickets")
      .and("contain", "One time")
      .and("contain", "No upcoming run")
      .and("contain", "Completed");
    cy.getBySelLike("scheduled-payment-list-item")
      .eq(2)
      .find("[data-test=scheduled-payment-cancel]")
      .should("not.exist");
    cy.visualSnapshot("Scheduled Payments List");

    cy.get<string>("@monthlyId").then((monthlyId) => {
      const row = `[data-test=scheduled-payment-list-item-${monthlyId}]`;

      cy.get(row).find("[data-test=scheduled-payment-cancel]").click();
      cy.getBySel("scheduled-payment-cancel-dialog")
        .should("be.visible")
        .and("contain", `$25.00 to ${ctx.userB.firstName} ${ctx.userB.lastName}`);
      cy.getBySel("scheduled-payment-cancel-dismiss").click();
      cy.getBySel("scheduled-payment-cancel-dialog").should("not.exist");
      cy.get(row).find("[data-test=scheduled-payment-status]").should("contain", "Active");

      cy.get(row).find("[data-test=scheduled-payment-cancel]").click();
      cy.getBySel("scheduled-payment-cancel-confirm").click();
      cy.wait("@cancelScheduledPayment")
        .its("request.body")
        .should("deep.equal", { status: "canceled" });

      cy.getBySel("alert-bar-success").should("contain", "Scheduled payment canceled");
      cy.get(row).find("[data-test=scheduled-payment-status]").should("contain", "Canceled");
      cy.get(row).find("[data-test=scheduled-payment-cancel]").should("not.exist");
      cy.getBySelLike("scheduled-payment-list-item")
        .eq(0)
        .should("contain", "Weekly lunch")
        .and("contain", "Active");
      cy.getBySelLike("scheduled-payment-list-item")
        .eq(0)
        .should("not.have.attr", "data-test", `scheduled-payment-list-item-${monthlyId}`);

      cy.database("find", "scheduledpayments", { id: monthlyId })
        .its("status")
        .should("equal", "canceled");
    });
    cy.visualSnapshot("Scheduled Payment Canceled");
  });

  it("shows an error when the cancel request fails", function () {
    cy.wait("@notifications");
    cy.request("POST", apiScheduledPayments, {
      receiverId: ctx.userB.id,
      amount: 500,
      description: "Coffee fund",
      frequency: "weekly",
      startDate: isoDate(1),
    });
    cy.intercept("PATCH", "/scheduledPayments/*", { statusCode: 500, body: {} }).as("failedCancel");

    openScheduledPayments();
    cy.wait("@getScheduledPayments");
    cy.getBySel("scheduled-payment-cancel").click();
    cy.getBySel("scheduled-payment-cancel-confirm").click();
    cy.wait("@failedCancel");

    cy.getBySel("alert-bar-error").should("contain", "Couldn't cancel the scheduled payment");
    cy.getBySel("scheduled-payment-status").should("contain", "Active");
  });
});
