import { describe, expect, test } from "vitest";
import {
  isRequestTransaction,
  getFakeAmount,
  currentUserLikesTransaction,
  getQueryWithoutDateFields,
  getQueryWithoutAmountFields,
  getQueryWithoutFilterFields,
  isPendingRequestTransaction,
  isAcceptedRequestTransaction,
  isRejectedRequestTransaction,
  formatAmount,
  formatAmountSlider,
  receiverIsCurrentUser,
  isPaymentRequestedNotification,
  isPaymentReceivedNotification,
  padAmountWithZeros,
  amountRangeValueText,
  formatAmountRangeValues,
} from "../transactionUtils";
import { faker } from "@faker-js/faker";
import {
  Transaction,
  TransactionRequestStatus,
  DefaultPrivacyLevel,
  TransactionStatus,
  TransactionResponseItem,
  PaymentNotificationStatus,
} from "../../models";
import shortid from "shortid";

const fakeTransaction = (
  requestStatus?: TransactionRequestStatus,
  createdAt?: Date
): Transaction => ({
  id: shortid(),
  uuid: faker.datatype.uuid(),
  source: shortid(),
  amount: getFakeAmount(),
  description: "food",
  privacyLevel: DefaultPrivacyLevel.public,
  receiverId: shortid(),
  senderId: shortid(),
  balanceAtCompletion: getFakeAmount(),
  status: TransactionStatus.pending,
  requestStatus,
  requestResolvedAt: faker.date.future(),
  createdAt: faker.date.past(),
  modifiedAt: createdAt || faker.date.recent(),
});

describe("Transaction Utils", () => {
  describe("isRequestTransaction", () => {
    let transaction;

    test("validates that a transaction is a request", () => {
      for (let s in TransactionRequestStatus) {
        transaction = fakeTransaction(s as TransactionRequestStatus);
        expect(isRequestTransaction(transaction)).toBeTruthy();
      }
    });

    test("validates that a transaction is not a request", () => {
      transaction = fakeTransaction();
      expect(isRequestTransaction(transaction)).toBe(false);
    });

    test("checks if the current user likes a transaction", () => {
      const transactionBase = fakeTransaction();

      const currentUser = {
        id: "9IUK0xpw",
        uuid: faker.datatype.uuid(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        password: "abc123",
        email: faker.internet.email(),
        phoneNumber: faker.phone.phoneNumber(),
        avatar: faker.internet.avatar(),
        defaultPrivacyLevel: DefaultPrivacyLevel.public,
        balance: faker.datatype.number(),
        createdAt: faker.date.past(),
        modifiedAt: faker.date.recent(),
      };

      const transactionWithLikes: TransactionResponseItem = {
        ...transactionBase,
        receiverName: "Receiver Name",
        receiverAvatar: "/path/to/receiver/avatar.png",
        senderAvatar: "/path/to/sender/avatar.png",
        senderName: "Sender Name",
        likes: [
          {
            id: "ExVksKSH",
            uuid: "c849329f-42f7-4ff5-a792-e01c9cec05b5",
            userId: "9IUK0xpw",
            transactionId: "dKAI-6Ua",
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        ],
        comments: [],
      };

      expect(currentUserLikesTransaction(currentUser, transactionWithLikes)).toBe(true);

      const otherCurrentUser = {
        ...currentUser,
        id: "ABC123",
      };

      expect(currentUserLikesTransaction(otherCurrentUser, transactionWithLikes)).toBe(false);
    });
  });

  test("gets query with and without date range fields", () => {
    expect(
      getQueryWithoutDateFields({
        dateRangeStart: new Date().toString(),
        dateRangeEnd: new Date().toString(),
        status: TransactionStatus.incomplete,
      })
    ).toMatchObject({ status: "incomplete" });
    expect(
      getQueryWithoutDateFields({
        status: TransactionStatus.incomplete,
      })
    ).toMatchObject({ status: "incomplete" });
  });

  test("gets query with and without amount range fields", () => {
    expect(
      getQueryWithoutAmountFields({
        amountMin: 5,
        amountMax: 10,
        status: TransactionStatus.incomplete,
      })
    ).toMatchObject({ status: "incomplete" });
    expect(
      getQueryWithoutAmountFields({
        status: TransactionStatus.incomplete,
      })
    ).toMatchObject({ status: "incomplete" });
  });

  test("gets query with and without date and amount range fields", () => {
    const query = {
      amountMin: 5,
      amountMax: 10,
      requestStatus: "pending",
      dateRangeStart: "2019-12-01T06:00:00.000Z",
      dateRangeEnd: "2019-12-05T06:00:00.000Z",
    };
    expect(getQueryWithoutFilterFields(query)).toMatchObject({
      requestStatus: "pending",
    });
    expect(
      getQueryWithoutFilterFields({
        status: TransactionStatus.incomplete,
      })
    ).toMatchObject({ status: "incomplete" });
  });

  describe("isPendingRequestTransaction", () => {
    test("returns true for pending request transactions", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.pending);
      expect(isPendingRequestTransaction(transaction)).toBe(true);
    });

    test("returns false for non-pending request transactions", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.accepted);
      expect(isPendingRequestTransaction(transaction)).toBe(false);
    });

    test("returns false for transactions without requestStatus", () => {
      const transaction = fakeTransaction();
      expect(isPendingRequestTransaction(transaction)).toBe(false);
    });
  });

  describe("isAcceptedRequestTransaction", () => {
    test("returns true for accepted request transactions", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.accepted);
      expect(isAcceptedRequestTransaction(transaction)).toBe(true);
    });

    test("returns false for non-accepted request transactions", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.rejected);
      expect(isAcceptedRequestTransaction(transaction)).toBe(false);
    });

    test("returns false for transactions without requestStatus", () => {
      const transaction = fakeTransaction();
      expect(isAcceptedRequestTransaction(transaction)).toBe(false);
    });
  });

  describe("isRejectedRequestTransaction", () => {
    test("returns true for rejected request transactions", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.rejected);
      expect(isRejectedRequestTransaction(transaction)).toBe(true);
    });

    test("returns false for non-rejected request transactions", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.pending);
      expect(isRejectedRequestTransaction(transaction)).toBe(false);
    });

    test("returns false for transactions without requestStatus", () => {
      const transaction = fakeTransaction();
      expect(isRejectedRequestTransaction(transaction)).toBe(false);
    });
  });

  describe("formatAmount", () => {
    test("formats 0 cents", () => {
      expect(formatAmount(0)).toBe("$0.00");
    });

    test("formats 100 cents as $1.00", () => {
      expect(formatAmount(100)).toBe("$1.00");
    });

    test("formats 12345 cents as $123.45", () => {
      expect(formatAmount(12345)).toBe("$123.45");
    });
  });

  describe("formatAmountSlider", () => {
    test("formats amount without decimals", () => {
      expect(formatAmountSlider(0)).toBe("$0");
    });

    test("formats larger amounts with comma separators", () => {
      expect(formatAmountSlider(100000)).toBe("$1,000");
    });

    test("formats amount in $X,XXX pattern", () => {
      const result = formatAmountSlider(500000);
      expect(result).toMatch(/^\$[\d,]+$/);
    });
  });

  describe("receiverIsCurrentUser", () => {
    test("returns true when currentUser is the receiver", () => {
      const transaction = fakeTransaction();
      const currentUser = {
        id: transaction.receiverId,
        uuid: faker.datatype.uuid(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        password: "abc123",
        email: faker.internet.email(),
        phoneNumber: faker.phone.phoneNumber(),
        avatar: faker.internet.avatar(),
        defaultPrivacyLevel: DefaultPrivacyLevel.public,
        balance: faker.datatype.number(),
        createdAt: faker.date.past(),
        modifiedAt: faker.date.recent(),
      };
      expect(receiverIsCurrentUser(currentUser, transaction)).toBe(true);
    });

    test("returns false when currentUser is not the receiver", () => {
      const transaction = fakeTransaction();
      const currentUser = {
        id: "different-user-id",
        uuid: faker.datatype.uuid(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        password: "abc123",
        email: faker.internet.email(),
        phoneNumber: faker.phone.phoneNumber(),
        avatar: faker.internet.avatar(),
        defaultPrivacyLevel: DefaultPrivacyLevel.public,
        balance: faker.datatype.number(),
        createdAt: faker.date.past(),
        modifiedAt: faker.date.recent(),
      };
      expect(receiverIsCurrentUser(currentUser, transaction)).toBe(false);
    });
  });

  describe("isPaymentRequestedNotification", () => {
    test("returns true for requested payment notifications", () => {
      const notification = {
        id: shortid(),
        uuid: faker.datatype.uuid(),
        userId: shortid(),
        transactionId: shortid(),
        status: PaymentNotificationStatus.requested,
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(isPaymentRequestedNotification(notification)).toBe(true);
    });

    test("returns false for received payment notifications", () => {
      const notification = {
        id: shortid(),
        uuid: faker.datatype.uuid(),
        userId: shortid(),
        transactionId: shortid(),
        status: PaymentNotificationStatus.received,
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(isPaymentRequestedNotification(notification)).toBe(false);
    });
  });

  describe("isPaymentReceivedNotification", () => {
    test("returns true for received payment notifications", () => {
      const notification = {
        id: shortid(),
        uuid: faker.datatype.uuid(),
        userId: shortid(),
        transactionId: shortid(),
        status: PaymentNotificationStatus.received,
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(isPaymentReceivedNotification(notification)).toBe(true);
    });

    test("returns false for requested payment notifications", () => {
      const notification = {
        id: shortid(),
        uuid: faker.datatype.uuid(),
        userId: shortid(),
        transactionId: shortid(),
        status: PaymentNotificationStatus.requested,
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(isPaymentReceivedNotification(notification)).toBe(false);
    });
  });

  describe("padAmountWithZeros", () => {
    test("multiplies by 1000 and ceils", () => {
      expect(padAmountWithZeros(1)).toBe(1000);
      expect(padAmountWithZeros(0)).toBe(0);
      expect(padAmountWithZeros(5.5)).toBe(5500);
    });

    test("handles fractional results by ceiling", () => {
      expect(padAmountWithZeros(1.001)).toBe(1001);
    });
  });

  describe("amountRangeValueText", () => {
    test("formats a value through padAmountWithZeros then formatAmount", () => {
      const result = amountRangeValueText(1);
      // padAmountWithZeros(1) = 1000, formatAmount(1000) = "$10.00"
      expect(result).toBe("$10.00");
    });
  });

  describe("formatAmountRangeValues", () => {
    test("formats array of values into a range string", () => {
      const result = formatAmountRangeValues([0, 10]);
      expect(result).toContain(" - ");
    });

    test("formats single-element array", () => {
      const result = formatAmountRangeValues([5]);
      // padAmountWithZeros(5) = 5000 cents = $50 → "$50"
      expect(result).toBe("$50");
    });
  });
});
