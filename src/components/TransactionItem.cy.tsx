import * as React from "react";
import { MemoryRouter } from "react-router-dom";
import TransactionItem from "./TransactionItem";

describe("TransactionItem Airbnb Redesign", () => {
  it("renders transaction card with Airbnb-style design", () => {
    cy.fixture("public-transactions.json").then((data) => {
      const transaction = data.results[0];
      cy.mount(
        <MemoryRouter>
          <TransactionItem transaction={transaction} />
        </MemoryRouter>
      );

      // Verify the card has rounded corners (16px border-radius)
      cy.get(`[data-test=transaction-item-${transaction.id}]`).should("be.visible");

      // Verify the card paper element has proper styling
      cy.get(`[data-test=transaction-item-${transaction.id}]`)
        .find(".MuiPaper-root")
        .should("have.css", "border-radius", "16px")
        .and("have.css", "border-style", "solid")
        .and("have.css", "border-color", "rgb(235, 235, 235)");

      // Verify sender name is displayed
      cy.get(`[data-test=transaction-sender-${transaction.id}]`).should(
        "contain",
        transaction.senderName
      );

      // Verify receiver name is displayed
      cy.get(`[data-test=transaction-receiver-${transaction.id}]`).should(
        "contain",
        transaction.receiverName
      );

      // Verify like and comment counts are displayed
      cy.get("[data-test=transaction-like-count]").should(
        "have.text",
        `${transaction.likes.length}`
      );
      cy.get("[data-test=transaction-comment-count]").should(
        "have.text",
        `${transaction.comments.length}`
      );
    });
  });

  it("displays transaction amount with colored badge styling", () => {
    cy.fixture("public-transactions.json").then((data) => {
      const transaction = data.results[0];
      cy.mount(
        <MemoryRouter>
          <TransactionItem transaction={transaction} />
        </MemoryRouter>
      );

      // Verify amount is displayed with badge-style rounded background
      cy.get(`[data-test=transaction-amount-${transaction.id}]`)
        .should("be.visible")
        .and("have.css", "border-radius", "20px")
        .and("have.css", "font-weight", "800");
    });
  });

  it("uses Nunito font in social stats", () => {
    cy.fixture("public-transactions.json").then((data) => {
      const transaction = data.results[0];
      cy.mount(
        <MemoryRouter>
          <TransactionItem transaction={transaction} />
        </MemoryRouter>
      );

      cy.get("[data-test=transaction-like-count]")
        .should("have.css", "font-family")
        .and("include", "Nunito");
    });
  });
});
