import CommentForm from "./CommentForm";

describe("CommentForm", () => {
  const transactionId = "183VHWyuQMS";

  it("submits the comment for the transaction on enter", () => {
    const transactionComment = cy.spy().as("transactionComment");
    cy.mount(<CommentForm transactionId={transactionId} transactionComment={transactionComment} />);

    cy.get(`[data-test=transaction-comment-input-${transactionId}]`)
      .should("have.attr", "placeholder", "Write a comment...")
      .type("Thank you!{enter}");

    cy.get("@transactionComment").should("have.been.calledOnceWith", {
      transactionId,
      content: "Thank you!",
    });
  });

  it("submits an empty comment when enter is pressed without content", () => {
    const transactionComment = cy.spy().as("transactionComment");
    cy.mount(<CommentForm transactionId={transactionId} transactionComment={transactionComment} />);

    cy.get(`[data-test=transaction-comment-input-${transactionId}]`).type("{enter}");

    cy.get("@transactionComment").should("have.been.calledOnceWith", {
      transactionId,
      content: "",
    });
  });

  it("only submits once while the form is submitting", () => {
    const transactionComment = cy.spy().as("transactionComment");
    cy.mount(<CommentForm transactionId={transactionId} transactionComment={transactionComment} />);

    cy.get(`[data-test=transaction-comment-input-${transactionId}]`).type("First{enter}");
    cy.get("@transactionComment").should("have.been.calledOnce");
  });
});
