import NotificationListItem from "./NotificationListItem";
import { NotificationResponseItem, PaymentNotificationStatus } from "../models";

const base = {
  id: "notification1",
  uuid: "uuid",
  userId: "t45AiwidW",
  transactionId: "183VHWyuQMS",
  isRead: false,
  userFullName: "Kaden Sears",
  createdAt: new Date(),
  modifiedAt: new Date(),
};

const notificationOf = (extra: object) => ({ ...base, ...extra }) as NotificationResponseItem;

describe("NotificationListItem", () => {
  context("desktop", () => {
    beforeEach(() => {
      cy.viewport(1000, 660);
    });

    [
      {
        name: "comment",
        extra: { commentId: "c1" },
        text: "Kaden Sears commented on a transaction.",
      },
      { name: "like", extra: { likeId: "l1" }, text: "Kaden Sears liked a transaction." },
      {
        name: "payment request",
        extra: { status: PaymentNotificationStatus.requested },
        text: "Kaden Sears requested payment.",
      },
      {
        name: "payment received",
        extra: { status: PaymentNotificationStatus.received },
        text: "Kaden Sears received payment.",
      },
    ].forEach(({ name, extra, text }) => {
      it(`renders a ${name} notification`, () => {
        cy.mount(
          <NotificationListItem
            notification={notificationOf(extra)}
            updateNotification={cy.spy()}
          />
        );

        cy.get("[data-test=notification-list-item-notification1]")
          .should("contain", text)
          .find("svg")
          .should("exist");
      });
    });

    it("renders no message for an incomplete payment notification", () => {
      cy.mount(
        <NotificationListItem
          notification={notificationOf({ status: PaymentNotificationStatus.incomplete })}
          updateNotification={cy.spy()}
        />
      );

      cy.get("[data-test=notification-list-item-notification1]").should("not.contain", "payment");
    });

    it("dismisses the notification", () => {
      const updateNotification = cy.spy().as("updateNotification");
      cy.mount(
        <NotificationListItem
          notification={notificationOf({ likeId: "l1" })}
          updateNotification={updateNotification}
        />
      );

      cy.get("[data-test=notification-mark-read-notification1]")
        .should("contain", "Dismiss")
        .click();

      cy.get("@updateNotification").should("have.been.calledOnceWith", {
        id: "notification1",
        isRead: true,
      });
    });
  });

  context("mobile", () => {
    beforeEach(() => {
      cy.viewport("iphone-6");
    });

    it("marks the notification as read with an icon button", () => {
      const updateNotification = cy.spy().as("updateNotification");
      cy.mount(
        <NotificationListItem
          notification={notificationOf({ commentId: "c1" })}
          updateNotification={updateNotification}
        />
      );

      cy.get("[data-test=notification-mark-read-notification1]")
        .should("have.attr", "aria-label", "mark as read")
        .and("not.contain", "Dismiss")
        .click();

      cy.get("@updateNotification").should("have.been.calledOnceWith", {
        id: "notification1",
        isRead: true,
      });
    });
  });
});
