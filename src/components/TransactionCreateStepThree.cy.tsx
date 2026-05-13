import { interpret, Machine, assign } from "xstate";
import { MemoryRouter } from "react-router-dom";
import TransactionCreateStepThree from "./TransactionCreateStepThree";
import { User, DefaultPrivacyLevel } from "../models";

const sender: User = {
  id: "t45AiwidW",
  uuid: "6383f84e-b511-44c5-a835-3ece1d781fa8",
  firstName: "Edgar",
  lastName: "Johns",
  username: "Katharina_Bernier",
  password: "$2a$10$5PXHGtcsckWtAprT5/JmluhR13f16BL8SIGhvAKNP.Dhxkt69FfzW",
  email: "Norene39@yahoo.com",
  phoneNumber: "625-316-9882",
  avatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/t45AiwidW.svg",
  defaultPrivacyLevel: DefaultPrivacyLevel.public,
  balance: 168137,
  createdAt: new Date("2019-08-27T23:47:05.637Z"),
  modifiedAt: new Date("2020-05-21T11:02:22.857Z"),
};

const receiver: User = {
  id: "qywYp6hS0U",
  uuid: "b5e3e29d-1f97-4ed7-a7ae-e1b7e1e4f536",
  firstName: "Devon",
  lastName: "Becker",
  username: "Tavares_Barrows",
  password: "$2a$10$5PXHGtcsckWtAprT5/JmluhR13f16BL8SIGhvAKNP.Dhxkt69FfzW",
  email: "Aniya_Bernier@gmail.com",
  phoneNumber: "556-210-9052",
  avatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/qywYp6hS0U.svg",
  defaultPrivacyLevel: DefaultPrivacyLevel.public,
  balance: 120000,
  createdAt: new Date("2019-08-27T23:47:05.637Z"),
  modifiedAt: new Date("2020-05-21T11:02:22.857Z"),
};

const createTestMachine = (transactionType: string) =>
  Machine(
    {
      id: "createTransaction",
      initial: "stepThree",
      context: {
        sender,
        receiver,
        transactionDetails: {
          transactionType,
          amount: "50",
          description: "Test transaction",
          senderId: sender.id,
          receiverId: receiver.id,
        },
      },
      states: {
        stepOne: {},
        stepTwo: {},
        stepThree: {
          on: {
            RESET: "stepOne",
          },
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
  it("displays receiver name and avatar for payment", () => {
    const service = interpret(createTestMachine("payment")).start();

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );
    cy.contains(`${receiver.firstName} ${receiver.lastName}`).should("be.visible");
    cy.get(`img[src="${receiver.avatar}"]`).should("exist");
  });

  it("shows Paid for payment type", () => {
    const service = interpret(createTestMachine("payment")).start();

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );
    cy.contains("Paid").should("be.visible");
    cy.contains("Test transaction").should("be.visible");
  });

  it("shows Requested for request type", () => {
    const service = interpret(createTestMachine("request")).start();

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );
    cy.contains("Requested").should("be.visible");
    cy.contains("Test transaction").should("be.visible");
  });

  it("Return To Transactions link navigates to /", () => {
    const service = interpret(createTestMachine("payment")).start();

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );
    cy.get("[data-test=new-transaction-return-to-transactions]")
      .should("be.visible")
      .and("have.attr", "href", "/");
  });

  it("Create Another Transaction button sends RESET event", () => {
    const service = interpret(createTestMachine("payment")).start();
    const sendSpy = cy.spy(service, "send");

    cy.mount(
      <MemoryRouter>
        <TransactionCreateStepThree createTransactionService={service as any} />
      </MemoryRouter>
    );
    cy.get("[data-test=new-transaction-create-another-transaction]").click();
    cy.wrap(sendSpy).should("be.calledWith", "RESET");
  });
});
