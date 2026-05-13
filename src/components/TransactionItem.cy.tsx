import { MemoryRouter } from "react-router-dom";
import TransactionItem from "./TransactionItem";
import {
  TransactionResponseItem,
  TransactionStatus,
  DefaultPrivacyLevel,
} from "../models";

const transaction: TransactionResponseItem = {
  id: "si_aNEMbyCA",
  uuid: "41754166-ea5b-448a-9a8a-374ce387c714",
  source: "GYDJUNEaOK7",
  amount: 8647,
  description: "Payment: db4uxOm7d to IMbeyzHTj9",
  privacyLevel: DefaultPrivacyLevel.private,
  receiverId: "IMbeyzHTj9",
  senderId: "db4uxOm7d",
  balanceAtCompletion: 8958,
  status: TransactionStatus.complete,
  requestStatus: "",
  createdAt: new Date("2019-12-10T21:38:16.311Z"),
  modifiedAt: new Date("2020-05-06T08:15:48.263Z"),
  receiverName: "Kevin",
  senderName: "Amir",
  receiverAvatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/IMbeyzHTj9.svg",
  senderAvatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/db4uxOm7d.svg",
  likes: [
    {
      id: "like1",
      uuid: "l1",
      userId: "u1",
      transactionId: "si_aNEMbyCA",
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ],
  comments: [
    {
      id: "comment1",
      uuid: "c1",
      content: "Nice",
      userId: "u1",
      transactionId: "si_aNEMbyCA",
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ],
};

describe("TransactionItem", () => {
  it("renders a single transaction row with sender/receiver info", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionItem transaction={transaction} />
      </MemoryRouter>
    );
    cy.get(`[data-test=transaction-item-${transaction.id}]`).should("exist");
    cy.contains(transaction.description).should("be.visible");
    cy.get("[data-test=transaction-like-count]").should("contain", "1");
    cy.get("[data-test=transaction-comment-count]").should("contain", "1");
  });
});
