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
  payAppDifference,
  payAppAddition,
  getChargeAmount,
  getTransferAmount,
  getPayAppCreditedAmount,
  hasSufficientFunds,
  receiverIsCurrentUser,
  formatAmountSlider,
  padAmountWithZeros,
  amountRangeValueText,
  formatAmountRangeValues,
  formatFullName,
  isCommentNotification,
  isLikeNotification,
  isPaymentNotification,
  isPaymentRequestedNotification,
  isPaymentReceivedNotification,
  getPaginatedItems,
  isoStringToLocalMidnightStart,
  isoStringToLocalMidnightEnd,
  isoStringToLocalDateFull,
} from "../transactionUtils";
import { faker } from "@faker-js/faker";
import {
  Transaction,
  TransactionRequestStatus,
  DefaultPrivacyLevel,
  TransactionStatus,
  TransactionResponseItem,
  User,
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

const fakeUser = (overrides: Partial<User> = {}): User => ({
  id: shortid(),
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
  ...overrides,
});

const fakeNotificationBase = (extra: Record<string, unknown>) => ({
  id: shortid(),
  uuid: faker.datatype.uuid(),
  userId: shortid(),
  transactionId: shortid(),
  isRead: false,
  createdAt: new Date(),
  modifiedAt: new Date(),
  ...extra,
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
    test("returns true for pending request", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.pending);
      expect(isPendingRequestTransaction(transaction)).toBe(true);
    });

    test("returns false for non-pending request", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.accepted);
      expect(isPendingRequestTransaction(transaction)).toBe(false);
    });

    test("returns false when no requestStatus", () => {
      const transaction = fakeTransaction();
      expect(isPendingRequestTransaction(transaction)).toBe(false);
    });
  });

  describe("isAcceptedRequestTransaction", () => {
    test("returns true for accepted request", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.accepted);
      expect(isAcceptedRequestTransaction(transaction)).toBe(true);
    });

    test("returns false for non-accepted request", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.pending);
      expect(isAcceptedRequestTransaction(transaction)).toBe(false);
    });
  });

  describe("isRejectedRequestTransaction", () => {
    test("returns true for rejected request", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.rejected);
      expect(isRejectedRequestTransaction(transaction)).toBe(true);
    });

    test("returns false for non-rejected request", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.pending);
      expect(isRejectedRequestTransaction(transaction)).toBe(false);
    });
  });

  describe("formatAmount", () => {
    test("formats cents to dollar string", () => {
      expect(formatAmount(1050)).toBe("$10.50");
    });

    test("formats zero", () => {
      expect(formatAmount(0)).toBe("$0.00");
    });

    test("formats large amount", () => {
      expect(formatAmount(100000)).toBe("$1,000.00");
    });
  });

  describe("formatAmountSlider", () => {
    test("formats amount without decimals", () => {
      expect(formatAmountSlider(1050)).toBe("$11");
    });

    test("formats zero", () => {
      expect(formatAmountSlider(0)).toBe("$0");
    });
  });

  describe("payAppDifference", () => {
    test("returns the difference between balance and amount", () => {
      const sender = fakeUser({ balance: 5000 });
      const transaction = fakeTransaction();
      transaction.amount = 2000;
      const result = payAppDifference(sender, transaction);
      expect(result.getAmount()).toBe(3000);
    });
  });

  describe("payAppAddition", () => {
    test("returns the sum of balance and amount", () => {
      const sender = fakeUser({ balance: 5000 });
      const transaction = fakeTransaction();
      transaction.amount = 2000;
      const result = payAppAddition(sender, transaction);
      expect(result.getAmount()).toBe(7000);
    });
  });

  describe("getChargeAmount", () => {
    test("returns the absolute difference", () => {
      const sender = fakeUser({ balance: 5000 });
      const transaction = fakeTransaction();
      transaction.amount = 2000;
      expect(getChargeAmount(sender, transaction)).toBe(3000);
    });

    test("returns positive value when amount exceeds balance", () => {
      const sender = fakeUser({ balance: 2000 });
      const transaction = fakeTransaction();
      transaction.amount = 5000;
      expect(getChargeAmount(sender, transaction)).toBe(3000);
    });
  });

  describe("getTransferAmount", () => {
    test("returns the absolute difference", () => {
      const sender = fakeUser({ balance: 5000 });
      const transaction = fakeTransaction();
      transaction.amount = 2000;
      expect(getTransferAmount(sender, transaction)).toBe(3000);
    });
  });

  describe("getPayAppCreditedAmount", () => {
    test("returns the absolute sum", () => {
      const receiver = fakeUser({ balance: 5000 });
      const transaction = fakeTransaction();
      transaction.amount = 2000;
      expect(getPayAppCreditedAmount(receiver, transaction)).toBe(7000);
    });
  });

  describe("hasSufficientFunds", () => {
    test("returns true when balance exceeds amount", () => {
      const sender = fakeUser({ balance: 5000 });
      const transaction = fakeTransaction();
      transaction.amount = 2000;
      expect(hasSufficientFunds(sender, transaction)).toBe(true);
    });

    test("returns false when amount exceeds balance", () => {
      const sender = fakeUser({ balance: 2000 });
      const transaction = fakeTransaction();
      transaction.amount = 5000;
      expect(hasSufficientFunds(sender, transaction)).toBe(false);
    });
  });

  describe("receiverIsCurrentUser", () => {
    test("returns true when user id matches receiverId", () => {
      const user = fakeUser({ id: "user-123" });
      const transaction = fakeTransaction();
      transaction.receiverId = "user-123";
      expect(receiverIsCurrentUser(user, transaction)).toBe(true);
    });

    test("returns false when user id does not match receiverId", () => {
      const user = fakeUser({ id: "user-123" });
      const transaction = fakeTransaction();
      transaction.receiverId = "user-456";
      expect(receiverIsCurrentUser(user, transaction)).toBe(false);
    });
  });

  describe("padAmountWithZeros", () => {
    test("multiplies by 1000 and ceils", () => {
      expect(padAmountWithZeros(10)).toBe(10000);
      expect(padAmountWithZeros(1.5)).toBe(1500);
      expect(padAmountWithZeros(0)).toBe(0);
    });
  });

  describe("amountRangeValueText", () => {
    test("returns formatted dollar string from slider value", () => {
      expect(amountRangeValueText(10)).toBe("$100.00");
    });
  });

  describe("formatAmountRangeValues", () => {
    test("formats array of range values", () => {
      const result = formatAmountRangeValues([0, 10]);
      expect(result).toBe("$0 - $100");
    });
  });

  describe("formatFullName", () => {
    test("returns firstName and lastName joined by space", () => {
      const user = fakeUser({ firstName: "John", lastName: "Doe" });
      expect(formatFullName(user)).toBe("John Doe");
    });
  });

  describe("isCommentNotification", () => {
    test("returns true when notification has commentId", () => {
      const notification = fakeNotificationBase({ commentId: "comment-1" });
      expect(isCommentNotification(notification)).toBe(true);
    });

    test("returns false when notification has no commentId", () => {
      const notification = fakeNotificationBase({ likeId: "like-1" });
      expect(isCommentNotification(notification)).toBe(false);
    });
  });

  describe("isLikeNotification", () => {
    test("returns true when notification has likeId", () => {
      const notification = fakeNotificationBase({ likeId: "like-1" });
      expect(isLikeNotification(notification)).toBe(true);
    });

    test("returns false when notification has no likeId", () => {
      const notification = fakeNotificationBase({ commentId: "comment-1" });
      expect(isLikeNotification(notification)).toBe(false);
    });
  });

  describe("isPaymentNotification", () => {
    test("returns true when notification has status", () => {
      const notification = fakeNotificationBase({ status: PaymentNotificationStatus.requested });
      expect(isPaymentNotification(notification)).toBe(true);
    });

    test("returns false when notification has no status", () => {
      const notification = fakeNotificationBase({ likeId: "like-1" });
      expect(isPaymentNotification(notification)).toBe(false);
    });
  });

  describe("isPaymentRequestedNotification", () => {
    test("returns true for requested status", () => {
      const notification = fakeNotificationBase({ status: PaymentNotificationStatus.requested });
      expect(isPaymentRequestedNotification(notification)).toBe(true);
    });

    test("returns false for received status", () => {
      const notification = fakeNotificationBase({ status: PaymentNotificationStatus.received });
      expect(isPaymentRequestedNotification(notification)).toBe(false);
    });
  });

  describe("isPaymentReceivedNotification", () => {
    test("returns true for received status", () => {
      const notification = fakeNotificationBase({ status: PaymentNotificationStatus.received });
      expect(isPaymentReceivedNotification(notification)).toBe(true);
    });

    test("returns false for requested status", () => {
      const notification = fakeNotificationBase({ status: PaymentNotificationStatus.requested });
      expect(isPaymentReceivedNotification(notification)).toBe(false);
    });
  });

  describe("getPaginatedItems", () => {
    test("returns correct page and total pages", () => {
      const items = Array.from({ length: 25 }, (_, i) => i);
      const result = getPaginatedItems(1, 10, items);
      expect(result.data).toHaveLength(10);
      expect(result.totalPages).toBe(3);
    });

    test("returns correct items for page 2", () => {
      const items = Array.from({ length: 25 }, (_, i) => i);
      const result = getPaginatedItems(2, 10, items);
      expect(result.data).toHaveLength(10);
      expect(result.data[0]).toBe(10);
    });

    test("returns remaining items on last page", () => {
      const items = Array.from({ length: 25 }, (_, i) => i);
      const result = getPaginatedItems(3, 10, items);
      expect(result.data).toHaveLength(5);
    });
  });

  describe("isoStringToLocalMidnightStart", () => {
    test("returns date with time set to midnight start", () => {
      const result = isoStringToLocalMidnightStart("2024-06-15T14:30:00.000Z");
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe("isoStringToLocalMidnightEnd", () => {
    test("returns date with time set to end of day", () => {
      const result = isoStringToLocalMidnightEnd("2024-06-15T14:30:00.000Z");
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe("isoStringToLocalDateFull", () => {
    test("returns date preserving full time components", () => {
      const result = isoStringToLocalDateFull("2024-06-15T14:30:45.123Z");
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(5);
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
      expect(result.getMilliseconds()).toBe(123);
    });
  });
});
