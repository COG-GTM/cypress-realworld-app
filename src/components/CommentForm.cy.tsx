import CommentForm from "./CommentForm";

describe("CommentForm", () => {
  it("submits comment payload", () => {
    const transactionComment = cy.stub().as("transactionComment");

    cy.mount(<CommentForm transactionId="tx1" transactionComment={transactionComment} />);

    cy.get("[data-test=transaction-comment-input-tx1]").type("hello{enter}");

    cy.get("@transactionComment").should("have.been.calledOnce");
    cy.get("@transactionComment").should("have.been.calledWithMatch", {
      transactionId: "tx1",
      content: "hello",
    });
  });
});
