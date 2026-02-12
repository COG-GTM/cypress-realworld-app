import NotificationList from "./NotificationList";
import { NotificationResponseItem } from "../models";

describe("NotificationList", () => {
  const notifications: NotificationResponseItem[] = [
    {
      id: "notif-1",
      uuid: "uuid-1",
      userId: "user-1",
      transactionId: "tx-1",
      isRead: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
      status: "received" as any,
      userFullName: "Alice Smith",
    } as any,
    {
      id: "notif-2",
      uuid: "uuid-2",
      userId: "user-1",
      transactionId: "tx-2",
      isRead: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
      status: "requested" as any,
      userFullName: "Bob Jones",
    } as any,
  ];

  it("renders list of notifications", () => {
    const updateNotification = cy.stub();
    cy.mount(
      <NotificationList notifications={notifications} updateNotification={updateNotification} />
    );

    cy.get("[data-test=notifications-list]").should("be.visible");
    cy.get("[data-test*=notification-list-item]").should("have.length", 2);
  });

  it("renders empty state when no notifications", () => {
    const updateNotification = cy.stub();
    cy.mount(<NotificationList notifications={[]} updateNotification={updateNotification} />);

    cy.get("[data-test=notifications-list]").should("not.exist");
    cy.contains("No Notifications").should("be.visible");
  });
});
