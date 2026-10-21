import { User, Transaction } from "../../../src/models";

type NewTransactionCtx = {
  transactionRequest?: Transaction;
  authenticatedUser?: User;
};

describe("Transaction View", function () {
  const ctx: NewTransactionCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.intercept("GET", "/transactions*").as("personalTransactions");
    cy.intercept("GET", "/transactions/public*").as("publicTransactions");
    cy.intercept("GET", "/transactions/*").as("getTransaction");
    cy.intercept("PATCH", "/transactions/*").as("updateTransaction");

    cy.intercept("GET", "/checkAuth").as("userProfile");
    cy.intercept("GET", "/notifications").as("getNotifications");
    cy.intercept("GET", "/bankAccounts").as("getBankAccounts");

    cy.database("find", "users").then((user: User) => {
      ctx.authenticatedUser = user;

      cy.loginByXstate(ctx.authenticatedUser.username);

      cy.database("find", "transactions", {
        receiverId: ctx.authenticatedUser.id,
        status: "pending",
        requestStatus: "pending",
        requestResolvedAt: "",
      }).then((transaction: Transaction) => {
        ctx.transactionRequest = transaction;
      });
    });

    cy.getBySel("nav-personal-tab").click();
    cy.wait("@personalTransactions");
  });

  it("transactions navigation tabs are hidden on a transaction view page", function () {
    // { force: true } is a workaround for https://github.com/cypress-io/cypress/issues/29776
    cy.getBySelLike("transaction-item").first().click({ force: true });
    cy.location("pathname").should("include", "/transaction");
    cy.getBySel("nav-transaction-tabs").should("not.exist");
    cy.getBySel("transaction-detail-header").should("be.visible");
    cy.visualSnapshot("Transaction Navigation Tabs Hidden");
  });

  it("likes a transaction", function () {
    // { force: true } is a workaround for https://github.com/cypress-io/cypress/issues/29776
    cy.getBySelLike("transaction-item").first().click({ force: true });
    cy.wait("@getTransaction");

    cy.getBySelLike("like-button").click();
    cy.getBySelLike("like-count").should("contain", 2);
    cy.getBySelLike("like-button").should("be.disabled");
    cy.visualSnapshot("Transaction after Liked");
  });

  it("comments on a transaction", function () {
    // { force: true } is a workaround for https://github.com/cypress-io/cypress/issues/29776
    cy.getBySelLike("transaction-item").first().click({ force: true });
    cy.wait("@getTransaction");

    const comments = ["Thank you!", "Appreciate it."];

    comments.forEach((comment, index) => {
      cy.getBySelLike("comment-input").type(`${comment}{enter}`);
      cy.getBySelLike("comments-list").children().eq(index).contains(comment);
    });

    cy.getBySelLike("comments-list").children().should("have.length", comments.length);
    cy.visualSnapshot("Comment on Transaction");
  });

  it("accepts a transaction request", function () {
    cy.visit(`/transaction/${ctx.transactionRequest!.id}`);
    cy.wait("@getTransaction");

    cy.getBySelLike("accept-request").click();
    cy.wait("@updateTransaction").its("response.statusCode").should("equal", 204);
    cy.getBySelLike("accept-request").should("not.exist");
    cy.getBySel("transaction-detail-header").should("be.visible");
    cy.visualSnapshot("Transaction Accepted");
  });

  it("rejects a transaction request", function () {
    cy.visit(`/transaction/${ctx.transactionRequest!.id}`);
    cy.wait("@getTransaction");

    cy.getBySelLike("reject-request").click();
    cy.wait("@updateTransaction").its("response.statusCode").should("equal", 204);
    cy.getBySelLike("reject-request").should("not.exist");
    cy.getBySel("transaction-detail-header").should("be.visible");
    cy.visualSnapshot("Transaction Rejected");
  });

  it("does not display accept/reject buttons on completed request", function () {
    cy.database("find", "transactions", {
      receiverId: ctx.authenticatedUser!.id,
      status: "complete",
      requestStatus: "accepted",
    }).then((transactionRequest) => {
      cy.visit(`/transaction/${transactionRequest!.id}`);

      cy.wait("@getNotifications");
      cy.getBySel("nav-top-notifications-count").should("be.visible");
      cy.getBySel("transaction-detail-header").should("be.visible");
      cy.getBySel("transaction-accept-request").should("not.exist");
      cy.getBySel("transaction-reject-request").should("not.exist");
      cy.getBySel("transaction-detail-header").should("be.visible");
      cy.visualSnapshot("Transaction Completed (not able to accept or reject)");
    });
  });

  it("keeps a like after reload and does not allow liking twice", function () {
    cy.intercept("POST", "/likes/*").as("postLike");
    cy.getBySelLike("transaction-item").first().click({ force: true });
    cy.wait("@getTransaction");

    cy.getBySelLike("like-button").click();
    cy.wait("@postLike");
    cy.getBySelLike("like-count").should("contain", 2);

    cy.reload();
    cy.wait("@getTransaction");
    cy.getBySelLike("like-count").should("contain", 2);
    cy.getBySelLike("like-button").should("be.disabled");
    cy.get("@postLike.all").should("have.length", 1);
  });

  it("trims whitespace around a comment", function () {
    cy.intercept("POST", "/comments/*").as("postComment");
    cy.getBySelLike("transaction-item").first().click({ force: true });
    cy.wait("@getTransaction");

    cy.getBySelLike("comment-input").type("   Looks good!   {enter}");
    cy.wait("@postComment");

    cy.getBySelLike("comments-list").children().first().should("contain", "Looks good!");
    cy.getBySelLike("comment-input").should("have.value", "");
  });

  it("does not persist a comment when the comment request fails", function () {
    cy.intercept("POST", "/comments/*", { statusCode: 500, body: {} }).as("postCommentError");
    cy.getBySelLike("transaction-item").first().click({ force: true });
    cy.wait("@getTransaction");
    cy.location("pathname").then((pathname) => {
      const transactionId = pathname.split("/").pop();

      cy.database("filter", "comments", { transactionId }).then((comments: any[]) => {
        cy.getBySelLike("comment-input").type("This will fail{enter}");
        cy.wait("@postCommentError");

        cy.contains("This will fail").should("not.exist");
        cy.database("filter", "comments", { transactionId }).should("have.length", comments.length);
      });
    });
  });

  it("does not record a like when the like request fails", function () {
    cy.intercept("POST", "/likes/*", { statusCode: 500, body: {} }).as("postLikeError");
    cy.getBySelLike("transaction-item").first().click({ force: true });
    cy.wait("@getTransaction");
    cy.location("pathname").then((pathname) => {
      const transactionId = pathname.split("/").pop();

      cy.database("filter", "likes", { transactionId }).then((likes: any[]) => {
        cy.getBySelLike("like-button").click();
        cy.wait("@postLikeError");

        cy.database("filter", "likes", { transactionId }).should("have.length", likes.length);
      });
    });
  });
});
