import { MemoryRouter } from "react-router-dom";
import { Machine, assign, interpret } from "xstate";
import TransactionCreateStepThree from "./TransactionCreateStepThree";

const createTestMachine = (receiver: any, transactionDetails: any) =>
  Machine(
    {
      id: "createTransaction",
      initial: "stepThree",
      context: { receiver, transactionDetails, sender: {} },
      states: {
        stepOne: {},
        stepTwo: {},
        stepThree: {
          on: { RESET: "stepOne" },
        },
      },
    },
    {
      actions: {
        clearContext: assign(() => ({})),
      },
    }
  );

describe("TransactionCreateStepThree", () => {
  it("renders payment confirmation", () => {
    const receiver = {
      id: "r1",
      firstName: "Jane",
      lastName: "Smith",
      avatar: "https://example.com/a2.png",
    };
    const transactionDetails = {
      transactionType: "payment",
      amount: "50",
      description: "Lunch",
    };

    const service = interpret(createTestMachine(receiver, transactionDetails)).start();

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );

    cy.contains("Jane Smith").should("exist");
    cy.contains("Paid").should("exist");
    cy.contains("$50.00").should("exist");
    cy.contains("Lunch").should("exist");
    cy.get("[data-test=new-transaction-return-to-transactions]").should("exist");
    cy.get("[data-test=new-transaction-create-another-transaction]").should("exist");
  });

  it("renders request confirmation", () => {
    const receiver = {
      id: "r1",
      firstName: "Alice",
      lastName: "Wonder",
      avatar: "",
    };
    const transactionDetails = {
      transactionType: "request",
      amount: "100",
      description: "Dinner",
    };

    const service = interpret(createTestMachine(receiver, transactionDetails)).start();

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );

    cy.contains("Alice Wonder").should("exist");
    cy.contains("Requested").should("exist");
    cy.contains("$100.00").should("exist");
    cy.contains("Dinner").should("exist");
  });
});
