import { MemoryRouter } from "react-router-dom";
import TransactionDetail from "./TransactionDetail";
import { TransactionResponseItem, User } from "../models";

describe("TransactionDetail", () => {
  const currentUser: User = {
    id: "user-1",
    uuid: "uuid-1",
    firstName: "Alice",
    lastName: "Smith",
    username: "alice",
    password: "hashed",
    email: "alice@test.com",
    phoneNumber: "111-111-1111",
    avatar: "https://example.com/alice.svg",
    defaultPrivacyLevel: "public" as any,
    balance: 100000,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  const transaction: TransactionResponseItem = {
    id: "tx-1",
    uuid: "uuid-tx",
    source: "",
    amount: 5000,
    description: "Lunch payment",
    privacyLevel: "public" as any,
    receiverId: "user-2",
    senderId: "user-1",
    status: "complete" as any,
    requestStatus: "",
    createdAt: new Date(),
    modifiedAt: new Date(),
    likes: [],
    comments: [],
    receiverName: "Bob Jones",
    receiverAvatar: "https://example.com/bob.svg",
    senderName: "Alice Smith",
    senderAvatar: "https://example.com/alice.svg",
  };

  it("renders transaction detail header", () => {
    const transactionLike = cy.stub();
    const transactionComment = cy.stub();
    const transactionUpdate = cy.stub();
    cy.mount(
      <MemoryRouter>
        <TransactionDetail
          transaction={transaction}
          transactionLike={transactionLike}
          transactionComment={transactionComment}
          transactionUpdate={transactionUpdate}
          currentUser={currentUser}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=transaction-detail-header]").should("contain", "Transaction Detail");
  });

  it("renders transaction description", () => {
    const transactionLike = cy.stub();
    const transactionComment = cy.stub();
    const transactionUpdate = cy.stub();
    cy.mount(
      <MemoryRouter>
        <TransactionDetail
          transaction={transaction}
          transactionLike={transactionLike}
          transactionComment={transactionComment}
          transactionUpdate={transactionUpdate}
          currentUser={currentUser}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=transaction-description]").should("contain", "Lunch payment");
  });

  it("renders sender and receiver avatars", () => {
    const transactionLike = cy.stub();
    const transactionComment = cy.stub();
    const transactionUpdate = cy.stub();
    cy.mount(
      <MemoryRouter>
        <TransactionDetail
          transaction={transaction}
          transactionLike={transactionLike}
          transactionComment={transactionComment}
          transactionUpdate={transactionUpdate}
          currentUser={currentUser}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=transaction-sender-avatar]").should("be.visible");
    cy.get("[data-test=transaction-receiver-avatar]").should("be.visible");
  });

  it("renders like button", () => {
    const transactionLike = cy.stub();
    const transactionComment = cy.stub();
    const transactionUpdate = cy.stub();
    cy.mount(
      <MemoryRouter>
        <TransactionDetail
          transaction={transaction}
          transactionLike={transactionLike}
          transactionComment={transactionComment}
          transactionUpdate={transactionUpdate}
          currentUser={currentUser}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=transaction-like-button-tx-1]").should("be.visible");
  });

  it("calls transactionLike when like button is clicked", () => {
    const transactionLike = cy.stub();
    const transactionComment = cy.stub();
    const transactionUpdate = cy.stub();
    cy.mount(
      <MemoryRouter>
        <TransactionDetail
          transaction={transaction}
          transactionLike={transactionLike}
          transactionComment={transactionComment}
          transactionUpdate={transactionUpdate}
          currentUser={currentUser}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=transaction-like-button-tx-1]").click();
    cy.wrap(transactionLike).should("have.been.calledWith", "tx-1");
  });

  it("renders comment input", () => {
    const transactionLike = cy.stub();
    const transactionComment = cy.stub();
    const transactionUpdate = cy.stub();
    cy.mount(
      <MemoryRouter>
        <TransactionDetail
          transaction={transaction}
          transactionLike={transactionLike}
          transactionComment={transactionComment}
          transactionUpdate={transactionUpdate}
          currentUser={currentUser}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=transaction-comment-input-tx-1]").should("be.visible");
  });

  it("shows accept/reject buttons for pending request when receiver is current user", () => {
    const pendingRequest: TransactionResponseItem = {
      ...transaction,
      receiverId: "user-1",
      senderId: "user-2",
      requestStatus: "pending" as any,
    };
    const transactionLike = cy.stub();
    const transactionComment = cy.stub();
    const transactionUpdate = cy.stub();
    cy.mount(
      <MemoryRouter>
        <TransactionDetail
          transaction={pendingRequest}
          transactionLike={transactionLike}
          transactionComment={transactionComment}
          transactionUpdate={transactionUpdate}
          currentUser={currentUser}
        />
      </MemoryRouter>
    );

    cy.get("[data-test=transaction-accept-request-tx-1]")
      .should("be.visible")
      .and("contain", "Accept Request");
    cy.get("[data-test=transaction-reject-request-tx-1]")
      .should("be.visible")
      .and("contain", "Reject Request");
  });
});
