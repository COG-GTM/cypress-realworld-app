import { MemoryRouter } from "react-router-dom";
import TransactionDetail from "./TransactionDetail";
import {
  TransactionResponseItem,
  TransactionStatus,
  TransactionRequestStatus,
  DefaultPrivacyLevel,
  User,
} from "../models";

const currentUser: User = {
  id: "user1",
  uuid: "user-uuid-1",
  firstName: "John",
  lastName: "Smith",
  username: "johnsmith",
  password: "hashed",
  email: "john@example.com",
  phoneNumber: "555-1234",
  balance: 50000,
  avatar: "https://example.com/avatar1.png",
  defaultPrivacyLevel: DefaultPrivacyLevel.public,
  createdAt: new Date("2024-01-01"),
  modifiedAt: new Date("2024-01-01"),
};

const baseTransaction: TransactionResponseItem = {
  id: "txn123",
  uuid: "txn-uuid-1",
  source: "",
  amount: 5000,
  description: "Test payment",
  privacyLevel: DefaultPrivacyLevel.public,
  receiverId: "user1",
  senderId: "user2",
  balanceAtCompletion: 10000,
  status: TransactionStatus.complete,
  createdAt: new Date("2024-01-01"),
  modifiedAt: new Date("2024-01-01"),
  likes: [],
  comments: [],
  receiverName: "John Smith",
  receiverAvatar: "https://example.com/avatar1.png",
  senderName: "Jane Doe",
  senderAvatar: "https://example.com/avatar2.png",
};

describe("TransactionDetail", () => {
  it("renders transaction detail view", () => {
    const transactionLike = cy.stub();
    const transactionComment = cy.stub();
    const transactionUpdate = cy.stub();

    cy.mount(
      <MemoryRouter>
        <TransactionDetail
          transaction={baseTransaction}
          transactionLike={transactionLike}
          transactionComment={transactionComment}
          transactionUpdate={transactionUpdate}
          currentUser={currentUser}
        />
      </MemoryRouter>
    );

    cy.get("[data-test='transaction-detail-header']").should("contain", "Transaction Detail");
    cy.get("[data-test='transaction-sender-avatar']").should("exist");
    cy.get("[data-test='transaction-receiver-avatar']").should("exist");
    cy.get("[data-test='transaction-description']").should("contain", "Test payment");
    cy.get(`[data-test="transaction-amount-${baseTransaction.id}"]`).should("exist");
  });

  it("renders comments when present", () => {
    const transactionWithComments: TransactionResponseItem = {
      ...baseTransaction,
      comments: [
        {
          id: "c1",
          uuid: "c-uuid-1",
          content: "Great transaction!",
          userId: "user3",
          transactionId: "txn123",
          createdAt: new Date("2024-01-01"),
          modifiedAt: new Date("2024-01-01"),
        },
      ],
    };

    cy.mount(
      <MemoryRouter>
        <TransactionDetail
          transaction={transactionWithComments}
          transactionLike={cy.stub()}
          transactionComment={cy.stub()}
          transactionUpdate={cy.stub()}
          currentUser={currentUser}
        />
      </MemoryRouter>
    );

    cy.get("[data-test='comments-list']").should("exist");
  });

  it("renders like button and allows liking", () => {
    const transactionLike = cy.stub();

    cy.mount(
      <MemoryRouter>
        <TransactionDetail
          transaction={baseTransaction}
          transactionLike={transactionLike}
          transactionComment={cy.stub()}
          transactionUpdate={cy.stub()}
          currentUser={currentUser}
        />
      </MemoryRouter>
    );

    cy.get(`[data-test="transaction-like-button-${baseTransaction.id}"]`)
      .click()
      .then(() => {
        expect(transactionLike).to.have.been.calledWith(baseTransaction.id);
      });
  });

  it("renders accept/reject buttons for pending request when receiver is current user", () => {
    const pendingRequest: TransactionResponseItem = {
      ...baseTransaction,
      requestStatus: TransactionRequestStatus.pending,
    };

    const transactionUpdate = cy.stub();

    cy.mount(
      <MemoryRouter>
        <TransactionDetail
          transaction={pendingRequest}
          transactionLike={cy.stub()}
          transactionComment={cy.stub()}
          transactionUpdate={transactionUpdate}
          currentUser={currentUser}
        />
      </MemoryRouter>
    );

    cy.get(`[data-test="transaction-accept-request-${pendingRequest.id}"]`).should("be.visible");
    cy.get(`[data-test="transaction-reject-request-${pendingRequest.id}"]`).should("be.visible");

    cy.get(`[data-test="transaction-accept-request-${pendingRequest.id}"]`)
      .click()
      .then(() => {
        expect(transactionUpdate).to.have.been.calledWith({
          id: pendingRequest.id,
          requestStatus: TransactionRequestStatus.accepted,
        });
      });
  });

  it("does not render accept/reject buttons for completed transactions", () => {
    cy.mount(
      <MemoryRouter>
        <TransactionDetail
          transaction={baseTransaction}
          transactionLike={cy.stub()}
          transactionComment={cy.stub()}
          transactionUpdate={cy.stub()}
          currentUser={currentUser}
        />
      </MemoryRouter>
    );

    cy.get(`[data-test="transaction-accept-request-${baseTransaction.id}"]`).should("not.exist");
    cy.get(`[data-test="transaction-reject-request-${baseTransaction.id}"]`).should("not.exist");
  });
});
