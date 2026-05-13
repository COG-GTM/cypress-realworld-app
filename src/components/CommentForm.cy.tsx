import CommentForm from "./CommentForm";

describe("CommentForm", () => {
  const transactionId = "tx123";
  let transactionCommentStub: ReturnType<typeof cy.stub>;

  beforeEach(() => {
    transactionCommentStub = cy.stub();
  });

  it("renders text input with placeholder", () => {
    cy.mount(
      <CommentForm transactionId={transactionId} transactionComment={transactionCommentStub} />
    );
    cy.get(`[data-test=transaction-comment-input-${transactionId}]`).should("exist");
    cy.get(`[data-test=transaction-comment-input-${transactionId}]`)
      .invoke("attr", "placeholder")
      .should("equal", "Write a comment...");
  });

  it("input has correct data-test attribute", () => {
    cy.mount(
      <CommentForm transactionId={transactionId} transactionComment={transactionCommentStub} />
    );
    cy.get(`[data-test=transaction-comment-input-${transactionId}]`).should("exist");
  });

  it("typing and submitting calls transactionComment with correct payload", () => {
    cy.mount(
      <CommentForm transactionId={transactionId} transactionComment={transactionCommentStub} />
    );
    cy.get(`[data-test=transaction-comment-input-${transactionId}]`).type("Nice!{enter}");
    cy.wrap(transactionCommentStub).should(
      "be.calledWithMatch",
      Cypress.sinon.match({ transactionId, content: "Nice!" })
    );
  });
});
