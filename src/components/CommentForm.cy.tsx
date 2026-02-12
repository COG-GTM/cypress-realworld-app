import CommentForm from "./CommentForm";

describe("CommentForm", () => {
  const transactionId = "tx-123";
  let transactionComment: ReturnType<typeof cy.stub>;

  beforeEach(() => {
    transactionComment = cy.stub();
  });

  it("renders the comment input", () => {
    cy.mount(<CommentForm transactionId={transactionId} transactionComment={transactionComment} />);
    cy.get(`[data-test=transaction-comment-input-${transactionId}]`).should("be.visible");
    cy.get(`[data-test=transaction-comment-input-${transactionId}]`)
      .invoke("attr", "placeholder")
      .should("equal", "Write a comment...");
  });

  it("allows typing a comment", () => {
    cy.mount(<CommentForm transactionId={transactionId} transactionComment={transactionComment} />);
    cy.get(`[data-test=transaction-comment-input-${transactionId}]`).type("Great transaction!");
    cy.get(`[data-test=transaction-comment-input-${transactionId}]`).should(
      "have.value",
      "Great transaction!"
    );
  });

  it("submits comment text on Enter", () => {
    cy.mount(<CommentForm transactionId={transactionId} transactionComment={transactionComment} />);
    cy.get(`[data-test=transaction-comment-input-${transactionId}]`).type("Nice payment!{enter}");
    cy.wrap(transactionComment).should("be.calledOnce");
    cy.wrap(transactionComment).should("be.calledWithMatch", {
      transactionId: "tx-123",
      content: "Nice payment!",
    });
  });
});
