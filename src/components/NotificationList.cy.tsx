import { MemoryRouter } from "react-router-dom";
import NotificationsList from "./NotificationList";
import { NotificationResponseItem, NotificationsType, PaymentNotificationStatus } from "../models";

describe("NotificationsList", () => {
  const notifications: NotificationResponseItem[] = [
    {
      id: "notification-1",
      uuid: "uuid-1",
      userId: "user-1",
      transactionId: "tx-1",
      isRead: false,
      createdAt: new Date("2024-01-01"),
      modifiedAt: new Date("2024-01-01"),
      status: PaymentNotificationStatus.received,
      userFullName: "Alice Smith",
    },
    {
      id: "notification-2",
      uuid: "uuid-2",
      userId: "user-2",
      transactionId: "tx-2",
      isRead: false,
      createdAt: new Date("2024-01-02"),
      modifiedAt: new Date("2024-01-02"),
      likeId: "like-1",
      userFullName: "Bob Jones",
    },
    {
      id: "notification-3",
      uuid: "uuid-3",
      userId: "user-3",
      transactionId: "tx-3",
      isRead: false,
      createdAt: new Date("2024-01-03"),
      modifiedAt: new Date("2024-01-03"),
      commentId: "comment-1",
      userFullName: "Charlie Brown",
    },
  ];

  it("renders notification items", () => {
    const updateNotification = cy.stub();
    cy.mount(
      <MemoryRouter>
        <NotificationsList notifications={notifications} updateNotification={updateNotification} />
      </MemoryRouter>
    );
    cy.get("[data-test=notifications-list]").should("exist");
    cy.get("[data-test^=notification-list-item-]").should("have.length", 3);
    cy.contains("Alice Smith").should("exist");
    cy.contains("Bob Jones").should("exist");
    cy.contains("Charlie Brown").should("exist");
  });

  it("handles empty state", () => {
    const updateNotification = cy.stub();
    cy.mount(
      <MemoryRouter>
        <NotificationsList notifications={[]} updateNotification={updateNotification} />
      </MemoryRouter>
    );
    cy.get("[data-test=notifications-list]").should("not.exist");
    cy.get("[data-test=empty-list-header]").should("contain", "No Notifications");
  });

  it("marks as read", () => {
    const updateNotification = cy.stub().as("updateNotification");
    cy.mount(
      <MemoryRouter>
        <NotificationsList
          notifications={[notifications[0]]}
          updateNotification={updateNotification}
        />
      </MemoryRouter>
    );
    cy.get("[data-test=notification-mark-read-notification-1]").click();
    cy.get("@updateNotification").should("have.been.calledWith", {
      id: "notification-1",
      isRead: true,
    });
  });
});
