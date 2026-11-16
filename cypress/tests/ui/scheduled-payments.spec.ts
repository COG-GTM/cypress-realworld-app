import Dinero from "dinero.js";
import { addDays, format as formatDate } from "date-fns";
import { User, Transaction } from "../../../src/models";
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

const openNotifications = () => {
  if (isMobile()) {
    cy.getBySel("sidenav-toggle").click();
  }
  cy.getBySel("sidenav-notifications").click();
  cy.location("pathname").should("eq", "/notifications");
};

type UiSchedule = {
  receiver: User;
  amount: string;
  description: string;
  frequency: "once" | "monthly";
};

// Schedules through the new-transaction form, starting tomorrow (the form's default start date)
const scheduleViaUi = ({ receiver, amount, description, frequency }: UiSchedule) => {
  cy.getBySelLike("new-transaction").click();
  cy.wait("@allUsers");
  cy.getBySel("user-list-search-input").type(receiver.firstName, { force: true });
  cy.wait("@usersSearch");
  cy.getBySelLike("user-list-item").contains(receiver.firstName).click({ force: true });

  cy.getBySelLike("amount-input").type(amount);
  cy.getBySelLike("description-input").type(description);
  cy.getBySel("transaction-create-submit-schedule").click();
  cy.getBySel("transaction-create-start-date-input").should("have.value", isoDate(1));
  if (frequency !== "once") {
    cy.getBySel("transaction-create-frequency-select").click();
    cy.getBySel(`transaction-create-frequency-${frequency}`).click();
  }
  cy.getBySel("transaction-create-submit-schedule").should("be.enabled").click();

  return cy.wait("@createScheduledPayment").then(({ response }) => {
    expect(response!.statusCode).to.equal(200);
    cy.getBySel("new-transaction-schedule-confirmation").should("be.visible");
    cy.getBySel("new-transaction-return-to-transactions").click();
    return cy.wrap<string>(response!.body.scheduledPayment.id);
  });
};

describe("Scheduled Payments", function () {
  const ctx = {} as ScheduledPaymentsCtx;
  const apiScheduledPayments = `${Cypress.env("apiUrl")}/scheduledPayments`;

  beforeEach(function () {
    cy.task("db:seed");

    cy.intercept("GET", "/notifications").as("notifications");
    cy.intercept("GET", "/scheduledPayments").as("getScheduledPayments");
    cy.intercept("PATCH", "/scheduledPayments/*").as("cancelScheduledPayment");
    cy.intercept("POST", "/scheduledPayments").as("createScheduledPayment");
    cy.intercept("GET", "/users*").as("allUsers");
    cy.intercept("GET", "/users/search*").as("usersSearch");
    cy.intercept("GET", "/transactions").as("personalTransactions");

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

  it("schedules payments in the UI, cancels one and runs the other into the feed, balances and notifications", function () {
    const amount = 3000;
    const formattedAmount = Dinero({ amount }).toFormat();
    cy.wait("@notifications");

    scheduleViaUi({
      receiver: ctx.userB,
      amount: "30",
      description: "Movie night",
      frequency: "once",
    }).as("oneTimeId");
    scheduleViaUi({
      receiver: ctx.userC,
      amount: "45",
      description: "Gym share",
      frequency: "monthly",
    }).as("monthlyId");

    // Scheduling alone moves no money
    cy.database("find", "users", { id: ctx.userA.id })
      .its("balance")
      .should("equal", ctx.userA.balance);

    openScheduledPayments();
    cy.wait("@getScheduledPayments");
    cy.getBySelLike("scheduled-payment-list-item").should("have.length", 2);
    cy.get<string>("@monthlyId").then((monthlyId) => {
      const row = `[data-test=scheduled-payment-list-item-${monthlyId}]`;
      cy.get(row).should("contain", "Gym share").and("contain", "Monthly");
      cy.get(row).find("[data-test=scheduled-payment-cancel]").click();
      cy.getBySel("scheduled-payment-cancel-confirm").click();
      cy.wait("@cancelScheduledPayment");
      cy.get(row).find("[data-test=scheduled-payment-status]").should("contain", "Canceled");
    });
    cy.get<string>("@oneTimeId").then((oneTimeId) => {
      cy.get(`[data-test=scheduled-payment-list-item-${oneTimeId}]`)
        .should("contain", "Movie night")
        .and("contain", `Next ${formatDate(addDays(new Date(), 1), "MMM d, yyyy")}`)
        .and("contain", "Active");
    });

    // Tomorrow comes: only the active one-time schedule runs
    cy.runScheduledPayments(`${isoDate(1)}T12:00:00`).then((results: Transaction[]) => {
      expect(results).to.have.length(1);
      cy.get<string>("@oneTimeId").then((oneTimeId) => {
        expect(results[0]).to.include({
          scheduledPaymentId: oneTimeId,
          senderId: ctx.userA.id,
          receiverId: ctx.userB.id,
          amount,
          description: "Movie night",
        });
      });
      cy.wrap(results[0].id).as("paymentId");
    });
    cy.database("filter", "transactions", { description: "Gym share" }).should("have.length", 0);
    cy.database("find", "users", { id: ctx.userA.id })
      .its("balance")
      .should("equal", ctx.userA.balance - amount);
    cy.database("find", "users", { id: ctx.userB.id })
      .its("balance")
      .should("equal", ctx.userB.balance + amount);

    // The app loads the balance at sign-in, so sign in again to see it
    cy.switchUserByXstate(ctx.userA.username);
    if (!isMobile()) {
      cy.getBySel("sidenav-user-balance").should(
        "contain",
        Dinero({ amount: ctx.userA.balance - amount }).toFormat()
      );
    }

    cy.getBySel("nav-personal-tab").click();
    cy.wait("@personalTransactions");
    cy.get<string>("@paymentId").then((paymentId) => {
      cy.getBySel(`transaction-item-${paymentId}`)
        .should("contain", "Movie night")
        .and("contain", formattedAmount)
        .find("[data-test=transaction-scheduled-badge]")
        .should("contain", "Scheduled");
    });

    openScheduledPayments();
    cy.wait("@getScheduledPayments");
    cy.get<string>("@oneTimeId").then((oneTimeId) => {
      cy.get(`[data-test=scheduled-payment-list-item-${oneTimeId}]`)
        .should("contain", "No upcoming run")
        .and("contain", "Completed");
    });

    openNotifications();
    cy.getBySelLike("notification-list-item").should(
      "contain",
      `Your scheduled payment to ${ctx.userB.firstName} ${ctx.userB.lastName} was sent.`
    );
    cy.visualSnapshot("Scheduled Payment Sent Notification");

    cy.switchUserByXstate(ctx.userB.username);
    if (!isMobile()) {
      cy.getBySel("sidenav-user-balance").should(
        "contain",
        Dinero({ amount: ctx.userB.balance + amount }).toFormat()
      );
    }
    openNotifications();
    cy.getBySelLike("notification-list-item").should(
      "contain",
      `${ctx.userA.firstName} ${ctx.userA.lastName} received payment.`
    );
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
    cy.runScheduledPayments(`${isoDate(1)}T12:00:00`);
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

  it("reports a cancel as done when only the refresh after it fails", function () {
    cy.wait("@notifications");
    cy.request("POST", apiScheduledPayments, {
      receiverId: ctx.userB.id,
      amount: 500,
      description: "Coffee fund",
      frequency: "weekly",
      startDate: isoDate(1),
    }).then(({ body }) => {
      const { id } = body.scheduledPayment;

      openScheduledPayments();
      cy.wait("@getScheduledPayments");
      cy.intercept(
        { method: "GET", url: "/scheduledPayments", times: 1 },
        { statusCode: 500, body: {} }
      ).as("failedRefresh");
      cy.getBySel("scheduled-payment-cancel").click();
      cy.getBySel("scheduled-payment-cancel-confirm").click();
      cy.wait("@cancelScheduledPayment");
      cy.wait("@failedRefresh");

      cy.getBySel("alert-bar-success").should("contain", "Scheduled payment canceled");
      cy.getBySel("scheduled-payments-load-error").should("be.visible");
      cy.database("find", "scheduledpayments", { id }).its("status").should("equal", "canceled");
    });
  });

  it("shows a retryable error instead of the empty state when loading fails", function () {
    cy.wait("@notifications");
    cy.request("POST", apiScheduledPayments, {
      receiverId: ctx.userB.id,
      amount: 500,
      description: "Coffee fund",
      frequency: "weekly",
      startDate: isoDate(1),
    });
    cy.intercept(
      { method: "GET", url: "/scheduledPayments", times: 1 },
      { statusCode: 500, body: {} }
    ).as("failedLoad");

    openScheduledPayments();
    cy.wait("@failedLoad");
    cy.getBySel("scheduled-payments-load-error").should("be.visible");
    cy.getBySel("empty-list-header").should("not.exist");

    cy.intercept("GET", "/scheduledPayments").as("retryLoad");
    cy.getBySel("scheduled-payments-retry").click();
    cy.wait("@retryLoad");
    cy.getBySel("scheduled-payments-load-error").should("not.exist");
    cy.getBySelLike("scheduled-payment-list-item").should("have.length", 1);
  });
});
