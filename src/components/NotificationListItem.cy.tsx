import NotificationListItem from "./NotificationListItem";
import {
  PaymentNotificationStatus,
  PaymentNotificationResponseItem,
  LikeNotificationResponseItem,
  CommentNotificationResponseItem,
} from "../models";

const baseNotification = {
  id: "notification1",
  uuid: "notif-uuid-1",
  userId: "user1",
  transactionId: "tx1",
  isRead: false,
  createdAt: new Date(),
  modifiedAt: new Date(),
  userFullName: "Edgar Johns",
};

describe("NotificationListItem", () => {
  let updateNotificationStub: ReturnType<typeof cy.stub>;

  beforeEach(() => {
    updateNotificationStub = cy.stub();
  });

  it("comment notification shows correct icon text", () => {
    const notification: CommentNotificationResponseItem = {
      ...baseNotification,
      commentId: "comment1",
    };

    cy.mount(
      <NotificationListItem
        notification={notification}
        updateNotification={updateNotificationStub}
      />
    );
    cy.contains("Edgar Johns commented on a transaction.").should("be.visible");
  });

  it("like notification shows correct text", () => {
    const notification: LikeNotificationResponseItem = {
      ...baseNotification,
      likeId: "like1",
    };

    cy.mount(
      <NotificationListItem
        notification={notification}
        updateNotification={updateNotificationStub}
      />
    );
    cy.contains("Edgar Johns liked a transaction.").should("be.visible");
  });

  it("payment requested notification shows correct text and red class", () => {
    const notification: PaymentNotificationResponseItem = {
      ...baseNotification,
      status: PaymentNotificationStatus.requested,
    };

    cy.mount(
      <NotificationListItem
        notification={notification}
        updateNotification={updateNotificationStub}
      />
    );
    cy.contains("Edgar Johns requested payment.").should("be.visible");
    cy.get("[data-test=notification-list-item-notification1] svg").first().should("exist");
  });

  it("payment received notification shows correct text and green class", () => {
    const notification: PaymentNotificationResponseItem = {
      ...baseNotification,
      status: PaymentNotificationStatus.received,
    };

    cy.mount(
      <NotificationListItem
        notification={notification}
        updateNotification={updateNotificationStub}
      />
    );
    cy.contains("Edgar Johns received payment.").should("be.visible");
  });

  it("dismiss button calls updateNotification with id and isRead true", () => {
    const notification: CommentNotificationResponseItem = {
      ...baseNotification,
      commentId: "comment1",
    };

    cy.mount(
      <NotificationListItem
        notification={notification}
        updateNotification={updateNotificationStub}
      />
    );
    cy.get(`[data-test=notification-mark-read-${notification.id}]`).click();
    cy.wrap(updateNotificationStub).should(
      "be.calledWithMatch",
      Cypress.sinon.match({ id: notification.id, isRead: true })
    );
  });
});
