import TransactionDetail from "./TransactionDetail";
import { TransactionResponseItem, TransactionRequestStatus, TransactionStatus, User } from "../models";

const currentUser: User = {
  id: "user2",
  uuid: "uuid-user2",
  firstName: "Jane",
  lastName: "Doe",
  username: "janedoe",
  password: "hashed",
  email: "jane@example.com",
  phoneNumber: "555-1234",
  avatar: "https://example.com/avatar2.png",
  defaultPrivacyLevel: "public",
  balance: 50000,
  createdAt: new Date(),
  modifiedAt: new Date(),
};

const baseTransaction: TransactionResponseItem = {
  id: "tx1",
  uuid: "uuid-tx1",
  source: "",
  amount: 5000,
  description: "Lunch money",
  privacyLevel: "public",
  receiverId: "user2",
  senderId: "user1",
  balanceAtCompletion: 10000,
  status: TransactionStatus.complete,
  requestStatus: "",
  createdAt: new Date("2023-01-15"),
  modifiedAt: new Date("2023-01-15"),
  likes: [],
  comments: [],
  receiverName: "Jane Doe",
  receiverAvatar: "https://example.com/avatar2.png",
  senderName: "John Doe",
  senderAvatar: "https://example.com/avatar1.png",
};

describe("TransactionDetail", () => {
  it("renders transaction detail with header and description", () => {
    cy.mount(
      <TransactionDetail
        transaction={baseTransaction}
        transactionLike={cy.stub()}
        transactionComment={cy.stub()}
        transactionUpdate={cy.stub()}
        currentUser={currentUser}
      />
    );

    cy.get("[data-test=transaction-detail-header]").should("contain", "Transaction Detail");
    cy.get("[data-test=transaction-description]").should("contain", "Lunch money");
    cy.get("[data-test=transaction-sender-avatar]").should("exist");
    cy.get("[data-test=transaction-receiver-avatar]").should("exist");
  });

  it("shows accept/reject buttons for pending request when receiver is current user", () => {
    const pendingRequest: TransactionResponseItem = {
      ...baseTransaction,
      requestStatus: TransactionRequestStatus.pending,
    };

    const updateStub = cy.stub().as("transactionUpdate");

    cy.mount(
      <TransactionDetail
        transaction={pendingRequest}
        transactionLike={cy.stub()}
        transactionComment={cy.stub()}
        transactionUpdate={updateStub}
        currentUser={currentUser}
      />
    );

    cy.get(`[data-test=transaction-accept-request-${pendingRequest.id}]`).should("exist").click();
    cy.get("@transactionUpdate").should("have.been.calledOnce");

    cy.get(`[data-test=transaction-reject-request-${pendingRequest.id}]`).should("exist");
  });

  it("hides accept/reject buttons when current user is not receiver", () => {
    const pendingRequest: TransactionResponseItem = {
      ...baseTransaction,
      receiverId: "other-user",
      requestStatus: TransactionRequestStatus.pending,
    };

    cy.mount(
      <TransactionDetail
        transaction={pendingRequest}
        transactionLike={cy.stub()}
        transactionComment={cy.stub()}
        transactionUpdate={cy.stub()}
        currentUser={currentUser}
      />
    );

    cy.get(`[data-test=transaction-accept-request-${pendingRequest.id}]`).should("not.exist");
  });

  it("renders like button and handles like action", () => {
    const likeStub = cy.stub().as("transactionLike");

    cy.mount(
      <TransactionDetail
        transaction={baseTransaction}
        transactionLike={likeStub}
        transactionComment={cy.stub()}
        transactionUpdate={cy.stub()}
        currentUser={currentUser}
      />
    );

    cy.get(`[data-test=transaction-like-button-${baseTransaction.id}]`).click();
    cy.get("@transactionLike").should("have.been.calledWith", baseTransaction.id);
  });

  it("renders comments section when comments exist", () => {
    const txWithComments: TransactionResponseItem = {
      ...baseTransaction,
      comments: [
        {
          id: "c1",
          uuid: "cu1",
          content: "Great transaction!",
          userId: "user3",
          transactionId: "tx1",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ],
    };

    cy.mount(
      <TransactionDetail
        transaction={txWithComments}
        transactionLike={cy.stub()}
        transactionComment={cy.stub()}
        transactionUpdate={cy.stub()}
        currentUser={currentUser}
      />
    );

    cy.contains("Comments").should("exist");
    cy.contains("Great transaction!").should("exist");
  });
});
