import EmptyList from "./EmptyList";

describe("EmptyList", () => {
  it("renders the empty state header", () => {
    cy.mount(<EmptyList entity="Transactions" />);
    cy.get("[data-test=empty-list-header]").should("contain", "No Transactions");
  });

  it("renders children content when provided", () => {
    cy.mount(
      <EmptyList entity="Transactions">
        <span data-test="child-content">Create a transaction to get started</span>
      </EmptyList>
    );
    cy.get("[data-test=empty-list-header]").should("contain", "No Transactions");
    cy.get("[data-test=child-content]").should(
      "contain",
      "Create a transaction to get started"
    );
  });
});
