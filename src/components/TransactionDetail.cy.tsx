import TransactionDetail from "./TransactionDetail";
import {
  User,
  DefaultPrivacyLevel,
  TransactionResponseItem,
  TransactionRequestStatus,
  TransactionStatus,
} from "../models";

const currentUser: User = {
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

const baseTransaction: TransactionResponseItem = {
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
  requestResolvedAt: "2020-06-09T19:01:15.675Z",
  createdAt: new Date("2019-12-10T21:38:16.311Z"),
  modifiedAt: new Date("2020-05-06T08:15:48.263Z"),
  receiverName: "Kevin",
  senderName: "Amir",
  receiverAvatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/IMbeyzHTj9.svg",
  senderAvatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/db4uxOm7d.svg",
  likes: [],
  comments: [],
};

describe("TransactionDetail", () => {
  let transactionLikeStub: ReturnType<typeof cy.stub>;
  let transactionCommentStub: ReturnType<typeof cy.stub>;
  let transactionUpdateStub: ReturnType<typeof cy.stub>;

  beforeEach(() => {
    transactionLikeStub = cy.stub();
    transactionCommentStub = cy.stub();
    transactionUpdateStub = cy.stub();
  });

  it("renders transaction description and sender/receiver avatars", () => {
    cy.mount(
      <TransactionDetail
        transaction={baseTransaction}
        transactionLike={transactionLikeStub}
        transactionComment={transactionCommentStub}
        transactionUpdate={transactionUpdateStub}
        currentUser={currentUser}
      />
    );
    cy.get("[data-test=transaction-description]").should(
      "contain",
      baseTransaction.description
    );
    cy.get("[data-test=transaction-sender-avatar]").should("exist");
    cy.get("[data-test=transaction-receiver-avatar]").should("exist");
  });

  it("like button enabled when current user has not liked the transaction", () => {
    cy.mount(
      <TransactionDetail
        transaction={baseTransaction}
        transactionLike={transactionLikeStub}
        transactionComment={transactionCommentStub}
        transactionUpdate={transactionUpdateStub}
        currentUser={currentUser}
      />
    );
    cy.get(`[data-test=transaction-like-button-${baseTransaction.id}]`).should(
      "not.be.disabled"
    );
  });

  it("like button disabled when current user already liked the transaction", () => {
    const likedTransaction = {
      ...baseTransaction,
      likes: [
        {
          id: "like1",
          uuid: "like-uuid-1",
          userId: currentUser.id,
          transactionId: baseTransaction.id,
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ],
    };

    cy.mount(
      <TransactionDetail
        transaction={likedTransaction}
        transactionLike={transactionLikeStub}
        transactionComment={transactionCommentStub}
        transactionUpdate={transactionUpdateStub}
        currentUser={currentUser}
      />
    );
    cy.get(`[data-test=transaction-like-button-${baseTransaction.id}]`).should("be.disabled");
  });

  it("like button click calls transactionLike with transaction id", () => {
    cy.mount(
      <TransactionDetail
        transaction={baseTransaction}
        transactionLike={transactionLikeStub}
        transactionComment={transactionCommentStub}
        transactionUpdate={transactionUpdateStub}
        currentUser={currentUser}
      />
    );
    cy.get(`[data-test=transaction-like-button-${baseTransaction.id}]`).click();
    cy.wrap(transactionLikeStub).should("be.calledWith", baseTransaction.id);
  });

  it("accept/reject buttons visible for pending request when current user is receiver", () => {
    const pendingRequest: TransactionResponseItem = {
      ...baseTransaction,
      receiverId: currentUser.id,
      requestStatus: TransactionRequestStatus.pending,
      status: TransactionStatus.pending,
    };

    cy.mount(
      <TransactionDetail
        transaction={pendingRequest}
        transactionLike={transactionLikeStub}
        transactionComment={transactionCommentStub}
        transactionUpdate={transactionUpdateStub}
        currentUser={currentUser}
      />
    );
    cy.get(`[data-test=transaction-accept-request-${pendingRequest.id}]`).should("be.visible");
    cy.get(`[data-test=transaction-reject-request-${pendingRequest.id}]`).should("be.visible");
  });

  it("accept/reject buttons not visible for non-pending transactions", () => {
    cy.mount(
      <TransactionDetail
        transaction={baseTransaction}
        transactionLike={transactionLikeStub}
        transactionComment={transactionCommentStub}
        transactionUpdate={transactionUpdateStub}
        currentUser={currentUser}
      />
    );
    cy.get(`[data-test=transaction-accept-request-${baseTransaction.id}]`).should("not.exist");
    cy.get(`[data-test=transaction-reject-request-${baseTransaction.id}]`).should("not.exist");
  });

  it("accept click calls transactionUpdate with accepted status", () => {
    const pendingRequest: TransactionResponseItem = {
      ...baseTransaction,
      receiverId: currentUser.id,
      requestStatus: TransactionRequestStatus.pending,
      status: TransactionStatus.pending,
    };

    cy.mount(
      <TransactionDetail
        transaction={pendingRequest}
        transactionLike={transactionLikeStub}
        transactionComment={transactionCommentStub}
        transactionUpdate={transactionUpdateStub}
        currentUser={currentUser}
      />
    );
    cy.get(`[data-test=transaction-accept-request-${pendingRequest.id}]`).click();
    cy.wrap(transactionUpdateStub).should(
      "be.calledWithMatch",
      Cypress.sinon.match({
        id: pendingRequest.id,
        requestStatus: TransactionRequestStatus.accepted,
      })
    );
  });

  it("reject click calls transactionUpdate with rejected status", () => {
    const pendingRequest: TransactionResponseItem = {
      ...baseTransaction,
      receiverId: currentUser.id,
      requestStatus: TransactionRequestStatus.pending,
      status: TransactionStatus.pending,
    };

    cy.mount(
      <TransactionDetail
        transaction={pendingRequest}
        transactionLike={transactionLikeStub}
        transactionComment={transactionCommentStub}
        transactionUpdate={transactionUpdateStub}
        currentUser={currentUser}
      />
    );
    cy.get(`[data-test=transaction-reject-request-${pendingRequest.id}]`).click();
    cy.wrap(transactionUpdateStub).should(
      "be.calledWithMatch",
      Cypress.sinon.match({
        id: pendingRequest.id,
        requestStatus: TransactionRequestStatus.rejected,
      })
    );
  });

  it("comments section rendered when transaction has comments", () => {
    const transactionWithComments = {
      ...baseTransaction,
      comments: [
        {
          id: "comment1",
          uuid: "comment-uuid-1",
          content: "Great transaction!",
          userId: "someUser",
          transactionId: baseTransaction.id,
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ],
    };

    cy.mount(
      <TransactionDetail
        transaction={transactionWithComments}
        transactionLike={transactionLikeStub}
        transactionComment={transactionCommentStub}
        transactionUpdate={transactionUpdateStub}
        currentUser={currentUser}
      />
    );
    cy.get("[data-test=comments-list]").should("exist");
  });

  it("comments section hidden when transaction has no comments", () => {
    cy.mount(
      <TransactionDetail
        transaction={baseTransaction}
        transactionLike={transactionLikeStub}
        transactionComment={transactionCommentStub}
        transactionUpdate={transactionUpdateStub}
        currentUser={currentUser}
      />
    );
    cy.get("[data-test=comments-list]").should("not.exist");
  });

  it("like count displays correctly", () => {
    const transactionWithLikes = {
      ...baseTransaction,
      likes: [
        {
          id: "like1",
          uuid: "like-uuid-1",
          userId: "otherUser1",
          transactionId: baseTransaction.id,
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "like2",
          uuid: "like-uuid-2",
          userId: "otherUser2",
          transactionId: baseTransaction.id,
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ],
    };

    cy.mount(
      <TransactionDetail
        transaction={transactionWithLikes}
        transactionLike={transactionLikeStub}
        transactionComment={transactionCommentStub}
        transactionUpdate={transactionUpdateStub}
        currentUser={currentUser}
      />
    );
    cy.get(`[data-test=transaction-like-count-${baseTransaction.id}]`).should("contain", "2");
  });
});
