import CommentForm from "./CommentForm";

describe("CommentForm", () => {
  it("renders the comment input", () => {
    const transactionComment = cy.stub();
    cy.mount(
      <CommentForm transactionId="tx-123" transactionComment={transactionComment} />
    );

    cy.get("[data-test=transaction-comment-input-tx-123]").should("be.visible");
  });

  it("allows typing a comment", () => {
    const transactionComment = cy.stub();
    cy.mount(
      <CommentForm transactionId="tx-123" transactionComment={transactionComment} />
    );

    cy.get("[data-test=transaction-comment-input-tx-123]").type("Great transaction!");
    cy.get("[data-test=transaction-comment-input-tx-123]").should(
      "have.value",
      "Great transaction!"
    );
  });

  it("renders with correct placeholder", () => {
    const transactionComment = cy.stub();
    cy.mount(
      <CommentForm transactionId="tx-456" transactionComment={transactionComment} />
    );

    cy.get("[data-test=transaction-comment-input-tx-456]")
      .should("have.attr", "placeholder", "Write a comment...");
  });
});
