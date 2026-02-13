import NotificationList from "./NotificationList";
import { NotificationsType, PaymentNotificationStatus, NotificationResponseItem } from "../models";

describe("NotificationList", () => {
  it("renders notifications and allows dismiss", () => {
    const updateNotification = cy.spy().as("updateNotification");

    const notifications: NotificationResponseItem[] = [
      {
        id: "n1",
        uuid: "nu1",
        userId: "u1",
        transactionId: "t1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
        type: NotificationsType.like,
        likeId: "l1",
        userFullName: "Alice Doe",
      } as any,
      {
        id: "n2",
        uuid: "nu2",
        userId: "u2",
        transactionId: "t2",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
        type: NotificationsType.payment,
        status: PaymentNotificationStatus.requested,
        userFullName: "Bob Smith",
      } as any,
    ];

    cy.mount(
      <NotificationList notifications={notifications} updateNotification={updateNotification} />
    );

    cy.get("[data-test=notifications-list]").should("exist");
    cy.get("[data-test=notification-list-item-n1]").should("exist");
    cy.contains("Alice Doe liked a transaction.").should("exist");

    cy.get("[data-test=notification-mark-read-n1]").click();
    cy.get("@updateNotification").should("have.been.calledWith", { id: "n1", isRead: true });
  });

  it("renders empty state", () => {
    const updateNotification = cy.spy().as("updateNotification");

    cy.mount(<NotificationList notifications={[]} updateNotification={updateNotification} />);

    cy.contains("No Notifications").should("exist");
    cy.get("[data-test=notifications-list]").should("not.exist");
  });
});
