import CommentForm from "./CommentForm";

describe("CommentForm", () => {
  const transactionId = "txn-123";

  it("renders the comment input", () => {
    const transactionComment = cy.stub();
    cy.mount(
      <CommentForm transactionId={transactionId} transactionComment={transactionComment} />
    );
    cy.get(`[data-test=transaction-comment-input-${transactionId}]`).should("be.visible");
  });

  it("allows typing a comment", () => {
    const transactionComment = cy.stub();
    cy.mount(
      <CommentForm transactionId={transactionId} transactionComment={transactionComment} />
    );
    cy.get(`[data-test=transaction-comment-input-${transactionId}]`).type("Great transaction!");
    cy.get(`[data-test=transaction-comment-input-${transactionId}]`).should(
      "have.value",
      "Great transaction!"
    );
  });

  it("submits comment text on enter", () => {
    const transactionComment = cy.stub().as("transactionComment");
    cy.mount(
      <CommentForm transactionId={transactionId} transactionComment={transactionComment} />
    );
    cy.get(`[data-test=transaction-comment-input-${transactionId}]`).type(
      "Nice payment!{enter}"
    );

    cy.get("@transactionComment").should("have.been.calledOnce");
    cy.get("@transactionComment").should(
      "have.been.calledWithMatch",
      Cypress.sinon.match({
        transactionId: "txn-123",
        content: "Nice payment!",
      })
    );
  });
});
