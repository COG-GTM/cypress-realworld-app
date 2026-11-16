import Dinero from "dinero.js";
import { addDays, format as formatDate } from "date-fns";
import { User, Transaction } from "../../../src/models";
import { isMobile } from "../../support/utils";

type NewTransactionTestCtx = {
  allUsers?: User[];
  user?: User;
  contact?: User;
};

describe("New Transaction", function () {
  const ctx: NewTransactionTestCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.intercept("GET", "/users*").as("allUsers");

    cy.intercept("GET", "/users/search*").as("usersSearch");

    cy.intercept("POST", "/transactions").as("createTransaction");
    cy.intercept("POST", "/scheduledPayments").as("createScheduledPayment");

    cy.intercept("GET", "/notifications").as("notifications");
    cy.intercept("GET", "/transactions/public").as("publicTransactions");
    cy.intercept("GET", "/transactions").as("personalTransactions");
    cy.intercept("PATCH", "/transactions/*").as("updateTransaction");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.allUsers = users;
      ctx.user = users[0];
      ctx.contact = users[1];

      return cy.loginByXstate(ctx.user.username);
    });
  });

  it("navigates to the new transaction form, selects a user and submits a transaction payment", function () {
    const payment = {
      amount: "35",
      description: "Sushi dinner 🍣",
    };

    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");

    cy.getBySel("user-list-search-input").type(ctx.contact!.firstName, { force: true });
    cy.wait("@usersSearch");
    cy.visualSnapshot("User Search First Name Input");

    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });
    cy.visualSnapshot("User Search First Name List Item");

    cy.getBySelLike("amount-input").type(payment.amount);
    cy.getBySelLike("description-input").type(payment.description);
    cy.visualSnapshot("Amount and Description Input");
    cy.getBySelLike("submit-payment").click();
    cy.wait(["@createTransaction", "@getUserProfile"]);
    cy.getBySel("alert-bar-success")
      .should("be.visible")
      .and("have.text", "Transaction Submitted!");

    const updatedAccountBalance = Dinero({
      amount: ctx.user!.balance - parseInt(payment.amount) * 100,
    }).toFormat();

    if (isMobile()) {
      cy.getBySel("sidenav-toggle").click();
    }

    cy.getBySelLike("user-balance").should("contain", updatedAccountBalance);
    cy.visualSnapshot("Updated User Balance");

    if (isMobile()) {
      cy.get(".MuiBackdrop-root").click({ force: true });
    }

    cy.getBySelLike("create-another-transaction").click();
    cy.getBySel("app-name-logo").find("a").click();
    cy.getBySelLike("personal-tab").click();
    cy.getBySelLike("personal-tab").should("have.class", "Mui-selected");
    cy.wait("@personalTransactions");

    cy.getBySel("transaction-list").first().should("contain", payment.description);

    cy.database("find", "users", { id: ctx.contact!.id })
      .its("balance")
      .should("equal", ctx.contact!.balance + parseInt(payment.amount) * 100);
    cy.getBySel("alert-bar-success").should("not.exist");
    cy.visualSnapshot("Personal List Validate Transaction in List");
  });

  it("schedules a monthly payment without debiting the balance", function () {
    const isoDate = (days: number) => formatDate(addDays(new Date(), days), "yyyy-MM-dd");
    const startDate = isoDate(14);
    const endDate = isoDate(120);

    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");
    cy.getBySel("user-list-search-input").type(ctx.contact!.firstName, { force: true });
    cy.wait("@usersSearch");
    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

    cy.getBySelLike("amount-input").type("25");
    cy.getBySelLike("description-input").type("Rent share");

    cy.getBySel("transaction-create-schedule-fields").should("not.exist");
    cy.getBySel("transaction-create-submit-schedule").click();
    cy.getBySel("transaction-create-schedule-fields").should("be.visible");
    cy.getBySel("transaction-create-form").should("be.visible");
    cy.getBySel("alert-bar-success").should("not.exist");
    cy.getBySel("transaction-create-start-date-input").should("have.value", isoDate(1));
    cy.getBySel("transaction-create-end-date-input").should("not.exist");

    cy.getBySel("transaction-create-start-date-input").clear();

    cy.getBySel("transaction-create-start-date-input").type(startDate);
    cy.getBySel("transaction-create-frequency-select").click();
    cy.getBySel("transaction-create-frequency-monthly").click();
    cy.getBySel("transaction-create-end-date-input").clear();
    cy.getBySel("transaction-create-end-date-input").type(endDate);

    cy.getBySel("transaction-create-submit-schedule").should("be.enabled").click();
    cy.wait("@createScheduledPayment").then(({ request, response }) => {
      expect(request.body).to.deep.equal({
        receiverId: ctx.contact!.id,
        amount: 2500,
        description: "Rent share",
        frequency: "monthly",
        startDate,
        endDate,
      });
      expect(response!.statusCode).to.equal(200);
    });
    cy.getBySel("alert-bar-success").should("be.visible").and("have.text", "Payment Scheduled!");

    cy.getBySel("new-transaction-schedule-confirmation").should(
      "have.text",
      `Scheduled $25.00 to ${ctx.contact!.firstName} ${ctx.contact!.lastName}, monthly starting ${formatDate(
        addDays(new Date(), 14),
        "MMM d"
      )}`
    );
    cy.getBySel("new-transaction-view-scheduled-payments").should(
      "have.attr",
      "href",
      "/scheduled-payments"
    );

    cy.database("find", "users", { id: ctx.user!.id })
      .its("balance")
      .should("equal", ctx.user!.balance);
    cy.database("filter", "transactions", {
      senderId: ctx.user!.id,
      description: "Rent share",
    }).then((transactions: Transaction[]) => expect(transactions).to.have.length(0));
    cy.database("find", "scheduledpayments", {
      senderId: ctx.user!.id,
      description: "Rent share",
    }).should("deep.include", { amount: 2500, frequency: "monthly", startDate, endDate });
  });

  it("validates the schedule fields before enabling Schedule", function () {
    const isoDate = (days: number) => formatDate(addDays(new Date(), days), "yyyy-MM-dd");

    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");
    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

    cy.getBySel("transaction-create-submit-schedule").click();
    cy.getBySel("transaction-create-submit-schedule").should("be.disabled");

    cy.getBySelLike("amount-input").type("10.505");
    cy.getBySelLike("description-input").type("Coffee");
    cy.getBySel("transaction-create-submit-schedule").should("be.disabled");
    cy.getBySelLike("amount-input").clear();
    cy.getBySelLike("amount-input").type("10.50");
    cy.getBySel("transaction-create-submit-schedule").should("be.enabled");

    cy.getBySel("transaction-create-start-date-input").clear();

    cy.getBySel("transaction-create-start-date-input").type(isoDate(0));
    cy.getBySel("transaction-create-schedule-fields").should(
      "contain",
      "Start date must be tomorrow or later"
    );
    cy.getBySel("transaction-create-submit-schedule").should("be.disabled");

    cy.getBySel("transaction-create-start-date-input").clear();

    cy.getBySel("transaction-create-start-date-input").type(isoDate(10));
    cy.getBySel("transaction-create-frequency-select").click();
    cy.getBySel("transaction-create-frequency-weekly").click();
    cy.getBySel("transaction-create-end-date-input").clear();
    cy.getBySel("transaction-create-end-date-input").type(isoDate(5));
    cy.getBySel("transaction-create-schedule-fields").should(
      "contain",
      "End date must be on or after the start date"
    );
    cy.getBySel("transaction-create-submit-schedule").should("be.disabled");

    cy.getBySel("transaction-create-frequency-select").click();
    cy.getBySel("transaction-create-frequency-once").click();
    cy.getBySel("transaction-create-end-date-input").should("not.exist");
    cy.getBySel("transaction-create-submit-schedule").should("be.enabled");
    cy.getBySel("transaction-create-submit-payment").should("be.enabled");
  });

  it("pays immediately even when the open schedule fields are invalid", function () {
    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");
    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

    cy.getBySelLike("amount-input").type("12");
    cy.getBySelLike("description-input").type("Lunch now");
    cy.getBySel("transaction-create-submit-schedule").click();
    cy.getBySel("transaction-create-start-date-input").clear();
    cy.getBySel("transaction-create-submit-schedule").should("be.disabled");

    cy.getBySelLike("submit-payment").click();
    cy.wait("@createTransaction").its("request.body").should("deep.include", {
      transactionType: "payment",
      description: "Lunch now",
    });
    cy.getBySel("alert-bar-success").should("contain", "Transaction Submitted!");
    cy.getBySel("new-transaction-schedule-confirmation").should("not.exist");
  });

  it("shows the API error instead of a confirmation when scheduling fails", function () {
    cy.intercept("POST", "/scheduledPayments", {
      statusCode: 422,
      body: { errors: [{ path: "startDate", msg: "must be tomorrow or later" }] },
    }).as("rejectedSchedule");

    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");
    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

    cy.getBySelLike("amount-input").type("5");
    cy.getBySelLike("description-input").type("Rejected schedule");
    cy.getBySel("transaction-create-submit-schedule").click();
    cy.getBySel("transaction-create-submit-schedule").click();

    cy.wait("@rejectedSchedule");
    cy.getBySel("alert-bar-error").should(
      "contain",
      "Payment not scheduled: startDate must be tomorrow or later"
    );
    cy.getBySel("new-transaction-schedule-confirmation").should("not.exist");
    cy.getBySel("transaction-create-submit-schedule").should("be.enabled");
  });

  it("navigates to the new transaction form, selects a user and submits a transaction request", function () {
    const request = {
      amount: "95",
      description: "Fancy Hotel 🏨",
    };

    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");

    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });
    cy.visualSnapshot("User Search First Name Input");

    cy.getBySelLike("amount-input").type(request.amount);
    cy.getBySelLike("description-input").type(request.description);
    cy.visualSnapshot("Amount and Description Input");
    cy.getBySelLike("submit-request").click();
    cy.wait("@createTransaction");
    cy.getBySel("alert-bar-success")
      .should("be.visible")
      .and("have.text", "Transaction Submitted!");
    cy.visualSnapshot("Transaction Request Submitted Notification");

    cy.getBySelLike("return-to-transactions").click();
    cy.getBySelLike("personal-tab").click();
    cy.getBySelLike("personal-tab").should("have.class", "Mui-selected");

    cy.getBySelLike("transaction-item").should("contain", request.description);
    cy.visualSnapshot("Transaction Item Description in List");
  });

  it("displays new transaction errors", function () {
    cy.getBySelLike("new-transaction").click();
    cy.wait("@allUsers");

    cy.getBySelLike("user-list-item").contains(ctx.contact!.firstName).click({ force: true });

    cy.getBySelLike("amount-input").type("43");
    cy.getBySelLike("amount-input").find("input").clear();
    cy.getBySelLike("amount-input").find("input").blur();
    cy.get("#transaction-create-amount-input-helper-text")
      .should("be.visible")
      .and("contain", "Please enter a valid amount");

    cy.getBySelLike("description-input").type("Fun");
    cy.getBySelLike("description-input").find("input").clear();
    cy.getBySelLike("description-input").find("input").blur();
    cy.get("#transaction-create-description-input-helper-text")
      .should("be.visible")
      .and("contain", "Please enter a note");

    cy.getBySelLike("submit-request").should("be.disabled");
    cy.getBySelLike("submit-payment").should("be.disabled");
    cy.visualSnapshot("New Transaction Errors with Submit Payment/Request Buttons Disabled");
  });

  it("submits a transaction payment and verifies the deposit for the receiver", function () {
    cy.getBySel("nav-top-new-transaction").click();

    const transactionPayload = {
      transactionType: "payment",
      amount: 25,
      description: "Indian Food",
      sender: ctx.user,
      receiver: ctx.contact,
    };

    // first let's grab the current balance from the UI
    let startBalance: string;
    if (!isMobile()) {
      // only check the balance display in desktop resolution
      // as it is NOT shown on mobile screen
      cy.get("[data-test=sidenav-user-balance]")
        .invoke("text")
        .then((x) => {
          startBalance = x; // something like "$1,484.81"
          expect(startBalance).to.match(/\$\d/);
        });
    }

    cy.createTransaction(transactionPayload);
    cy.wait("@createTransaction");
    cy.getBySel("new-transaction-create-another-transaction").should("be.visible");

    if (!isMobile()) {
      // make sure the new balance is displayed
      cy.get("[data-test=sidenav-user-balance]").should(($el) => {
        // here we only make sure the text has changed
        // we could also convert the balance to actual number
        // and confirm the new balance is the start balance - amount
        expect($el.text()).to.not.equal(startBalance);
      });
    }
    cy.visualSnapshot("Transaction Payment Submitted Notification");

    cy.switchUserByXstate(ctx.contact!.username);

    const updatedAccountBalance = Dinero({
      amount: ctx.contact!.balance + transactionPayload.amount * 100,
    }).toFormat();

    if (isMobile()) {
      cy.getBySel("sidenav-toggle").click();
    }

    cy.getBySelLike("user-balance").should("contain", updatedAccountBalance);
    cy.visualSnapshot("Verify Updated Sender Account Balance");
  });

  it("submits a transaction request and accepts the request for the receiver", function () {
    const transactionPayload = {
      transactionType: "request",
      amount: 100,
      description: "Fancy Hotel",
      sender: ctx.user,
      receiver: ctx.contact,
    };

    cy.getBySelLike("new-transaction").click();
    cy.createTransaction(transactionPayload);
    cy.wait("@createTransaction");
    cy.getBySel("new-transaction-create-another-transaction").should("be.visible");
    cy.visualSnapshot("receiver - Transaction Payment Submitted Notification");

    cy.switchUserByXstate(ctx.contact!.username);

    cy.getBySelLike("personal-tab").click();

    cy.wait("@personalTransactions");

    cy.getBySelLike("transaction-item")
      .first()
      .should("contain", transactionPayload.description)
      .click({ force: true });
    cy.getBySel("transaction-detail-header").should("exist");
    cy.visualSnapshot("Navigate to Transaction Item");

    cy.getBySelLike("accept-request").click();
    cy.wait("@updateTransaction").its("response.statusCode").should("eq", 204);
    cy.getBySelLike("transaction-detail-header").should("be.visible");
    cy.getBySelLike("transaction-amount").should("be.visible");
    cy.getBySelLike("sender-avatar").should("be.visible");
    cy.getBySelLike("receiver-avatar").should("be.visible");
    cy.getBySelLike("transaction-description").should("be.visible");
    cy.visualSnapshot("Accept Transaction Request");

    cy.switchUserByXstate(ctx.user!.username);

    const updatedAccountBalance = Dinero({
      amount: ctx.user!.balance + transactionPayload.amount * 100,
    }).toFormat();

    if (isMobile()) {
      cy.getBySel("sidenav-toggle").click();
    }

    cy.getBySelLike("user-balance").should("contain", updatedAccountBalance);
    cy.visualSnapshot("Verify Updated Sender Account Balance");
  });

  context("searches for a user by attribute", function () {
    const searchAttrs: (keyof User)[] = [
      "firstName",
      "lastName",
      "username",
      "email",
      "phoneNumber",
    ];

    beforeEach(function () {
      cy.getBySelLike("new-transaction").click();
      cy.wait("@allUsers");
    });

    searchAttrs.forEach((attr: keyof User) => {
      it(attr, function () {
        const targetUser = ctx.allUsers![2];

        cy.log(`Searching by **${attr}**`);
        cy.getBySel("user-list-search-input").type(targetUser[attr] as string, { force: true });
        cy.wait("@usersSearch")
          // make sure the backend returns some results
          .its("response.body.results")
          .should("have.length.gt", 0)
          .its("length")
          .then((resultsN) => {
            cy.getBySelLike("user-list-item")
              // make sure the list of results is fully updated
              // and shows the number of results returned from the backend
              .should("have.length", resultsN)
              .first()
              .contains(targetUser[attr] as string);
          });

        cy.visualSnapshot(`User List for Search: ${attr} = ${targetUser[attr]}`);

        cy.focused().clear();
        cy.getBySel("users-list").should("be.empty");
        cy.visualSnapshot("User List Clear Search");
      });
    });
  });
});
