import NotificationsList from "./NotificationList";
import {
  NotificationResponseItem,
  PaymentNotificationStatus,
  NotificationsType,
} from "../models";

const paymentNotification: NotificationResponseItem = {
  id: "notification-1",
  uuid: "uuid-1",
  userId: "user-1",
  transactionId: "tx-1",
  status: PaymentNotificationStatus.received,
  isRead: false,
  userFullName: "Alice Smith",
  createdAt: new Date("2024-01-01"),
  modifiedAt: new Date("2024-01-01"),
};

const likeNotification: NotificationResponseItem = {
  id: "notification-2",
  uuid: "uuid-2",
  userId: "user-2",
  transactionId: "tx-2",
  likeId: "like-1",
  isRead: false,
  userFullName: "Bob Jones",
  createdAt: new Date("2024-01-02"),
  modifiedAt: new Date("2024-01-02"),
};

const commentNotification: NotificationResponseItem = {
  id: "notification-3",
  uuid: "uuid-3",
  userId: "user-3",
  transactionId: "tx-3",
  commentId: "comment-1",
  isRead: false,
  userFullName: "Carol Lee",
  createdAt: new Date("2024-01-03"),
  modifiedAt: new Date("2024-01-03"),
};

describe("NotificationsList", () => {
  it("renders notification items", () => {
    const updateNotification = cy.stub();
    cy.mount(
      <NotificationsList
        notifications={[paymentNotification, likeNotification, commentNotification]}
        updateNotification={updateNotification}
      />
    );
    cy.get("[data-test=notifications-list]").should("exist");
    cy.get("[data-test=notification-list-item-notification-1]").should("exist");
    cy.get("[data-test=notification-list-item-notification-2]").should("exist");
    cy.get("[data-test=notification-list-item-notification-3]").should("exist");
  });

  it("handles empty state", () => {
    const updateNotification = cy.stub();
    cy.mount(<NotificationsList notifications={[]} updateNotification={updateNotification} />);
    cy.get("[data-test=notifications-list]").should("not.exist");
    cy.get("[data-test=empty-list-header]").should("contain", "No Notifications");
  });

  it("marks notification as read", () => {
    const updateNotification = cy.stub();
    cy.mount(
      <NotificationsList
        notifications={[paymentNotification]}
        updateNotification={updateNotification}
      />
    );
    cy.get(`[data-test=notification-mark-read-${paymentNotification.id}]`)
      .click()
      .then(() => {
        expect(updateNotification).to.have.been.calledWith({
          id: paymentNotification.id,
          isRead: true,
        });
      });
  });
});
