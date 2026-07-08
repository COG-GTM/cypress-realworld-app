import Dinero from "dinero.js";
import { User } from "../../../src/models";
import { isMobile } from "../../support/utils";

type NewTransactionInsufficientFundsTestCtx = {
  sender?: User;
  receiver?: User;
};

describe("New Transaction - Insufficient Funds", function () {
  const ctx: NewTransactionInsufficientFundsTestCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.intercept("POST", "/transactions").as("createTransaction");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.sender = users[0];
      ctx.receiver = users[1];

      return cy.loginByXstate(ctx.sender.username);
    });
  });

  it("withdraws from the linked bank account when the sender has insufficient funds", function () {
    // Choose an amount that exceeds the sender's PayApp balance (stored in cents).
    const amount = Math.ceil(ctx.sender!.balance / 100) + 100;

    cy.getBySel("nav-top-new-transaction").click();

    cy.createTransaction({
      transactionType: "payment",
      amount,
      description: "Insufficient funds withdrawal",
      sender: ctx.sender,
      receiver: ctx.receiver,
    });
    cy.wait("@createTransaction").then((intercept) => {
      const transactionId = intercept.response!.body.transaction.id;

      // A withdrawal bank transfer is created for the sender against this transaction.
      cy.database("find", "banktransfers", { userId: ctx.sender!.id, transactionId })
        .its("type")
        .should("equal", "withdrawal");
    });

    cy.getBySel("new-transaction-create-another-transaction").should("be.visible");
    cy.visualSnapshot("Insufficient Funds Transaction Payment Submitted Notification");

    // Sender's PayApp balance is reset to 0 after the bank-transfer withdrawal.
    cy.database("find", "users", { id: ctx.sender!.id }).its("balance").should("equal", 0);

    // Receiver is credited by the full transaction amount (in cents).
    cy.switchUserByXstate(ctx.receiver!.username);

    const updatedAccountBalance = Dinero({
      amount: ctx.receiver!.balance + amount * 100,
    }).toFormat();

    if (isMobile()) {
      cy.getBySel("sidenav-toggle").click();
    }

    cy.getBySelLike("user-balance").should("contain", updatedAccountBalance);
    cy.visualSnapshot("Verify Updated Receiver Account Balance");
  });
});
