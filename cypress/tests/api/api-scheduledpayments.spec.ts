import { addDays, format } from "date-fns";
import { User, ScheduledPayment, Transaction } from "../../../src/models";

type TestScheduledPaymentsCtx = {
  authenticatedUser?: User;
  receiver?: User;
  otherUser?: User;
};

const apiScheduledPayments = `${Cypress.env("apiUrl")}/scheduledPayments`;
const apiRunScheduledPayments = `${Cypress.env("apiUrl")}/testData/scheduledPayments/run`;

const isoDateFromToday = (days: number) => format(addDays(new Date(), days), "yyyy-MM-dd");

describe("Scheduled Payments API", function () {
  let ctx: TestScheduledPaymentsCtx = {};

  const buildPayload = (overrides: Record<string, unknown> = {}) => ({
    receiverId: ctx.receiver!.id,
    amount: 2500,
    description: "Rent",
    frequency: "monthly",
    startDate: isoDateFromToday(1),
    ...overrides,
  });

  const createScheduledPayment = (overrides: Record<string, unknown> = {}) =>
    cy.request("POST", apiScheduledPayments, buildPayload(overrides)).its("body.scheduledPayment");

  const expectValidationError = (body: object, param: string) => {
    cy.request({
      method: "POST",
      url: apiScheduledPayments,
      failOnStatusCode: false,
      body,
    }).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body.errors.map((error: { param: string }) => error.param)).to.include(param);
    });
  };

  before(() => {
    // Hacky workaround to have the e2e tests pass when cy.visit('http://localhost:3000') is called
    cy.request("GET", "/");
  });

  beforeEach(function () {
    cy.task("db:seed");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.authenticatedUser = users[0];
      ctx.receiver = users[1];
      ctx.otherUser = users[2];

      return cy.loginByApi(ctx.authenticatedUser.username);
    });
  });

  context("GET /scheduledPayments", function () {
    it("requires authentication", function () {
      cy.request({
        method: "POST",
        url: `${Cypress.env("apiUrl")}/logout`,
        followRedirect: false,
      });
      cy.request({ method: "GET", url: apiScheduledPayments, failOnStatusCode: false })
        .its("status")
        .should("eq", 401);
    });

    it("returns an empty list when the user has no schedules", function () {
      cy.request("GET", apiScheduledPayments).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results).to.deep.eq([]);
        expect(response.headers["cache-control"]).to.eq("no-store");
      });
    });

    it("returns only the current user's schedules, enriched with receiver name and avatar", function () {
      createScheduledPayment({ startDate: isoDateFromToday(10) });
      createScheduledPayment({ startDate: isoDateFromToday(3), frequency: "weekly" });

      cy.loginByApi(ctx.otherUser!.username);
      createScheduledPayment();
      cy.loginByApi(ctx.authenticatedUser!.username);

      cy.request("GET", apiScheduledPayments).then((response) => {
        const { results } = response.body;
        expect(response.status).to.eq(200);
        expect(results).to.have.length(2);
        results.forEach((scheduledPayment: ScheduledPayment) => {
          expect(scheduledPayment.senderId).to.eq(ctx.authenticatedUser!.id);
        });
        expect(results[0].nextRunAt).to.eq(isoDateFromToday(3));
        expect(results[0].receiverName).to.eq(
          `${ctx.receiver!.firstName} ${ctx.receiver!.lastName}`
        );
        expect(results[0].receiverAvatar).to.eq(ctx.receiver!.avatar);
      });
    });
  });

  context("POST /scheduledPayments", function () {
    it("creates an active scheduled payment that first runs on startDate", function () {
      const startDate = isoDateFromToday(7);
      const endDate = isoDateFromToday(60);

      cy.request(
        "POST",
        apiScheduledPayments,
        buildPayload({ startDate, endDate, privacyLevel: "private" })
      ).then((response) => {
        const { scheduledPayment } = response.body;
        expect(response.status).to.eq(200);
        expect(scheduledPayment.id).to.be.a("string");
        expect(scheduledPayment.senderId).to.eq(ctx.authenticatedUser!.id);
        expect(scheduledPayment.receiverId).to.eq(ctx.receiver!.id);
        expect(scheduledPayment.amount).to.eq(2500);
        expect(scheduledPayment.frequency).to.eq("monthly");
        expect(scheduledPayment.startDate).to.eq(startDate);
        expect(scheduledPayment.endDate).to.eq(endDate);
        expect(scheduledPayment.nextRunAt).to.eq(startDate);
        expect(scheduledPayment.status).to.eq("active");
        expect(scheduledPayment.privacyLevel).to.eq("private");
      });
    });

    it("defaults privacyLevel to the sender's default", function () {
      createScheduledPayment({ frequency: "once" })
        .its("privacyLevel")
        .should("eq", ctx.authenticatedUser!.defaultPrivacyLevel);
    });

    it("rejects a missing or unknown receiverId", function () {
      expectValidationError(buildPayload({ receiverId: undefined }), "receiverId");
      expectValidationError(buildPayload({ receiverId: "unknownUser" }), "receiverId");
    });

    it("rejects scheduling a payment to yourself", function () {
      expectValidationError(buildPayload({ receiverId: ctx.authenticatedUser!.id }), "receiverId");
    });

    it("rejects a non-numeric or non-positive amount", function () {
      expectValidationError(buildPayload({ amount: "abc" }), "amount");
      expectValidationError(buildPayload({ amount: 0 }), "amount");
      expectValidationError(buildPayload({ amount: -100 }), "amount");
    });

    it("rejects fractional cents", function () {
      expectValidationError(buildPayload({ amount: 2500.5 }), "amount");
      expectValidationError(buildPayload({ amount: 0.5 }), "amount");
    });

    it("rejects array values for enum and date fields", function () {
      expectValidationError(
        buildPayload({ frequency: ["once"], endDate: isoDateFromToday(30) }),
        "frequency"
      );
      expectValidationError(buildPayload({ privacyLevel: ["private"] }), "privacyLevel");
      expectValidationError(buildPayload({ startDate: [isoDateFromToday(7)] }), "startDate");
    });

    it("rejects a missing description", function () {
      expectValidationError(buildPayload({ description: undefined }), "description");
    });

    it("rejects an unsupported frequency", function () {
      expectValidationError(buildPayload({ frequency: "daily" }), "frequency");
    });

    it("rejects a startDate that is not an ISO date or is before tomorrow", function () {
      expectValidationError(buildPayload({ startDate: "12/01/2030" }), "startDate");
      expectValidationError(buildPayload({ startDate: "2030-02-30" }), "startDate");
      expectValidationError(buildPayload({ startDate: isoDateFromToday(0) }), "startDate");
      expectValidationError(buildPayload({ startDate: isoDateFromToday(-1) }), "startDate");
    });

    it("rejects an endDate before startDate", function () {
      expectValidationError(
        buildPayload({ startDate: isoDateFromToday(10), endDate: isoDateFromToday(9) }),
        "endDate"
      );
    });

    it("rejects an endDate on a one-time schedule", function () {
      expectValidationError(
        buildPayload({ frequency: "once", endDate: isoDateFromToday(30) }),
        "endDate"
      );
    });

    it("rejects an invalid privacyLevel", function () {
      expectValidationError(buildPayload({ privacyLevel: "everyone" }), "privacyLevel");
    });
  });

  context("PATCH /scheduledPayments/:scheduledPaymentId", function () {
    it("cancels a scheduled payment and clears nextRunAt", function () {
      createScheduledPayment().then((scheduledPayment: ScheduledPayment) => {
        cy.request("PATCH", `${apiScheduledPayments}/${scheduledPayment.id}`, {
          status: "canceled",
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.scheduledPayment.status).to.eq("canceled");
          expect(response.body.scheduledPayment.nextRunAt).to.eq(null);
        });

        cy.database("find", "scheduledpayments", { id: scheduledPayment.id }).then(
          (stored: ScheduledPayment) => {
            expect(stored.status).to.eq("canceled");
            expect(stored.nextRunAt).to.eq(null);
          }
        );
      });
    });

    it("returns 422 when canceling an already canceled schedule", function () {
      createScheduledPayment().then((scheduledPayment: ScheduledPayment) => {
        const url = `${apiScheduledPayments}/${scheduledPayment.id}`;
        cy.request("PATCH", url, { status: "canceled" });
        cy.request({
          method: "PATCH",
          url,
          failOnStatusCode: false,
          body: { status: "canceled" },
        }).then((response) => {
          expect(response.status).to.eq(422);
          expect(response.body.errors).to.have.length(1);
        });
      });
    });

    it("returns 404 when the schedule belongs to another user", function () {
      cy.loginByApi(ctx.otherUser!.username);
      createScheduledPayment().then((scheduledPayment: ScheduledPayment) => {
        cy.loginByApi(ctx.authenticatedUser!.username);
        cy.request({
          method: "PATCH",
          url: `${apiScheduledPayments}/${scheduledPayment.id}`,
          failOnStatusCode: false,
          body: { status: "canceled" },
        })
          .its("status")
          .should("eq", 404);

        cy.database("find", "scheduledpayments", { id: scheduledPayment.id })
          .its("status")
          .should("eq", "active");
      });
    });

    it("returns 404 for an unknown schedule", function () {
      cy.request({
        method: "PATCH",
        url: `${apiScheduledPayments}/abc123XYZ`,
        failOnStatusCode: false,
        body: { status: "canceled" },
      })
        .its("status")
        .should("eq", 404);
    });

    it("returns 422 for a status other than canceled", function () {
      createScheduledPayment().then((scheduledPayment: ScheduledPayment) => {
        cy.request({
          method: "PATCH",
          url: `${apiScheduledPayments}/${scheduledPayment.id}`,
          failOnStatusCode: false,
          body: { status: "completed" },
        }).then((response) => {
          expect(response.status).to.eq(422);
          expect(response.body.errors[0].param).to.eq("status");
        });
      });
    });
  });

  context("POST /testData/scheduledPayments/run", function () {
    // Server local midday on the given date
    const nowOn = (isoDate: string) => `${isoDate}T12:00:00`;

    it("runs due schedules through the payment path and advances them", function () {
      const startDate = isoDateFromToday(1);

      cy.database("find", "users", { id: ctx.authenticatedUser!.id }).as("senderBefore");
      cy.database("find", "users", { id: ctx.receiver!.id }).as("receiverBefore");

      createScheduledPayment({ startDate, frequency: "weekly" }).then(
        (scheduledPayment: ScheduledPayment) => {
          cy.request("POST", apiRunScheduledPayments, { now: nowOn(startDate) }).then(
            (response) => {
              expect(response.status).to.eq(200);
              expect(response.headers["cache-control"]).to.eq("no-store");
              expect(response.body.results).to.have.length(1);
              expect(response.body.results[0]).to.include({
                scheduledPaymentId: scheduledPayment.id,
                senderId: ctx.authenticatedUser!.id,
                receiverId: ctx.receiver!.id,
                amount: 2500,
              });
              cy.wrap(response.body.results).as("runResults");
            }
          );

          cy.database("filter", "transactions", { scheduledPaymentId: scheduledPayment.id }).then(
            (transactions: Transaction[]) => {
              expect(transactions).to.have.length(1);
              expect(transactions[0].status).to.eq("complete");
            }
          );

          cy.get<Transaction[]>("@runResults").then(([transaction]) => {
            cy.database("find", "notifications", {
              userId: ctx.receiver!.id,
              transactionId: transaction.id,
              status: "received",
            }).should("exist");
            cy.database("find", "notifications", {
              userId: ctx.authenticatedUser!.id,
              transactionId: transaction.id,
              status: "scheduledSent",
            }).should("exist");

            cy.request("GET", `${Cypress.env("apiUrl")}/notifications`).then((response) => {
              const senderNotification = response.body.results.find(
                (notification: { transactionId: string }) =>
                  notification.transactionId === transaction.id
              );
              expect(senderNotification).to.include({
                status: "scheduledSent",
                userFullName: `${ctx.receiver!.firstName} ${ctx.receiver!.lastName}`,
              });
            });

            cy.request("GET", `${Cypress.env("apiUrl")}/transactions/${transaction.id}`)
              .its("body.transaction.scheduledPaymentId")
              .should("eq", scheduledPayment.id);
          });

          cy.request("GET", apiScheduledPayments)
            .its("body.results.0")
            .should("include", {
              status: "active",
              lastRunAt: startDate,
              nextRunAt: isoDateFromToday(8),
            });
        }
      );

      cy.get<User>("@senderBefore").then((senderBefore) => {
        cy.database("find", "users", { id: ctx.authenticatedUser!.id })
          .its("balance")
          .should("eq", Math.max(senderBefore.balance - 2500, 0));
      });
      cy.get<User>("@receiverBefore").then((receiverBefore) => {
        cy.database("find", "users", { id: ctx.receiver!.id })
          .its("balance")
          .should("eq", receiverBefore.balance + 2500);
      });
    });

    it("does not create a second payment when run again for the same day", function () {
      const startDate = isoDateFromToday(1);
      createScheduledPayment({ startDate, frequency: "once" });

      cy.request("POST", apiRunScheduledPayments, { now: nowOn(startDate) })
        .its("body.results")
        .should("have.length", 1);
      cy.request("POST", apiRunScheduledPayments, { now: nowOn(startDate) })
        .its("body.results")
        .should("have.length", 0);

      cy.request("GET", apiScheduledPayments)
        .its("body.results.0")
        .should("include", { status: "completed", nextRunAt: null });
    });

    it("skips canceled schedules", function () {
      const startDate = isoDateFromToday(1);
      createScheduledPayment({ startDate }).then((scheduledPayment: ScheduledPayment) => {
        cy.request("PATCH", `${apiScheduledPayments}/${scheduledPayment.id}`, {
          status: "canceled",
        });
      });

      cy.request("POST", apiRunScheduledPayments, { now: nowOn(startDate) })
        .its("body.results")
        .should("have.length", 0);
    });

    it("defaults now to the current time", function () {
      createScheduledPayment({ startDate: isoDateFromToday(1) });

      cy.request("POST", apiRunScheduledPayments).its("body.results").should("have.length", 0);
    });

    it("rejects a now that is not an ISO timestamp", function () {
      cy.request({
        method: "POST",
        url: apiRunScheduledPayments,
        failOnStatusCode: false,
        body: { now: "next tuesday" },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors[0].param).to.eq("now");
      });
    });
  });
});
