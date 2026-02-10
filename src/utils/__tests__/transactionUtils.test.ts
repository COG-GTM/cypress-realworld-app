import { describe, expect, test } from "vitest";
import {
  isRequestTransaction,
  isPayment,
  isPendingRequestTransaction,
  isAcceptedRequestTransaction,
  isRejectedRequestTransaction,
  getFakeAmount,
  formatAmount,
  formatAmountSlider,
  payAppDifference,
  payAppAddition,
  getChargeAmount,
  getTransferAmount,
  getPayAppCreditedAmount,
  hasSufficientFunds,
  receiverIsCurrentUser,
  formatFullName,
  isCommentNotification,
  isLikeNotification,
  isPaymentNotification,
  isPaymentRequestedNotification,
  isPaymentReceivedNotification,
  currentUserLikesTransaction,
  hasDateQueryFields,
  getDateQueryFields,
  omitDateQueryFields,
  hasAmountQueryFields,
  getAmountQueryFields,
  omitAmountQueryFields,
  omitPaginationQueryFields,
  getQueryWithoutDateFields,
  getQueryWithoutAmountFields,
  getQueryWithoutFilterFields,
  getPaginatedItems,
  isoStringToLocalMidnightStart,
  isoStringToLocalMidnightEnd,
  isoStringToLocalDateFull,
  localDateToIsoString,
  localDateToUTCISOString,
  padAmountWithZeros,
  formatAmountRangeValues,
  amountRangeValueText,
} from "../transactionUtils";
import { faker } from "@faker-js/faker";
import {
  Transaction,
  TransactionRequestStatus,
  DefaultPrivacyLevel,
  TransactionStatus,
  TransactionResponseItem,
  PaymentNotificationStatus,
  User,
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

  describe("isPayment", () => {
    test("returns true for a payment transaction (no requestStatus)", () => {
      const transaction = fakeTransaction();
      expect(isPayment(transaction)).toBe(true);
    });

    test("returns false for a request transaction", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.pending);
      expect(isPayment(transaction)).toBe(false);
    });
  });

  describe("isPendingRequestTransaction", () => {
    test("returns true for a pending request", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.pending);
      expect(isPendingRequestTransaction(transaction)).toBe(true);
    });

    test("returns false for an accepted request", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.accepted);
      expect(isPendingRequestTransaction(transaction)).toBe(false);
    });
  });

  describe("isAcceptedRequestTransaction", () => {
    test("returns true for an accepted request", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.accepted);
      expect(isAcceptedRequestTransaction(transaction)).toBe(true);
    });

    test("returns false for a pending request", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.pending);
      expect(isAcceptedRequestTransaction(transaction)).toBe(false);
    });
  });

  describe("isRejectedRequestTransaction", () => {
    test("returns true for a rejected request", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.rejected);
      expect(isRejectedRequestTransaction(transaction)).toBe(true);
    });

    test("returns false for a pending request", () => {
      const transaction = fakeTransaction(TransactionRequestStatus.pending);
      expect(isRejectedRequestTransaction(transaction)).toBe(false);
    });
  });

  describe("formatAmount", () => {
    test("formats an amount in cents to currency string", () => {
      expect(formatAmount(1050)).toBe("$10.50");
      expect(formatAmount(0)).toBe("$0.00");
      expect(formatAmount(100000)).toBe("$1,000.00");
    });
  });

  describe("formatAmountSlider", () => {
    test("formats an amount without cents", () => {
      expect(formatAmountSlider(1050)).toBe("$11");
      expect(formatAmountSlider(0)).toBe("$0");
      expect(formatAmountSlider(100000)).toBe("$1,000");
    });
  });

  describe("payAppDifference", () => {
    test("calculates sender balance minus transaction amount", () => {
      const sender = fakeUser({ balance: 5000 });
      const transaction = fakeTransaction();
      transaction.amount = 3000;
      const result = payAppDifference(sender, transaction);
      expect(result.getAmount()).toBe(2000);
    });
  });

  describe("payAppAddition", () => {
    test("calculates receiver balance plus transaction amount", () => {
      const receiver = fakeUser({ balance: 5000 });
      const transaction = fakeTransaction();
      transaction.amount = 3000;
      const result = payAppAddition(receiver, transaction);
      expect(result.getAmount()).toBe(8000);
    });
  });

  describe("getChargeAmount", () => {
    test("returns the absolute difference between balance and amount", () => {
      const sender = fakeUser({ balance: 3000 });
      const transaction = fakeTransaction();
      transaction.amount = 5000;
      expect(getChargeAmount(sender, transaction)).toBe(2000);
    });
  });

  describe("getTransferAmount", () => {
    test("returns the absolute transfer amount (curried)", () => {
      const sender = fakeUser({ balance: 3000 });
      const transaction = fakeTransaction();
      transaction.amount = 5000;
      expect(getTransferAmount(sender, transaction)).toBe(2000);
    });
  });

  describe("getPayAppCreditedAmount", () => {
    test("returns balance plus transaction amount", () => {
      const receiver = fakeUser({ balance: 5000 });
      const transaction = fakeTransaction();
      transaction.amount = 3000;
      expect(getPayAppCreditedAmount(receiver, transaction)).toBe(8000);
    });
  });

  describe("hasSufficientFunds", () => {
    test("returns true when sender has enough balance", () => {
      const sender = fakeUser({ balance: 5000 });
      const transaction = fakeTransaction();
      transaction.amount = 3000;
      expect(hasSufficientFunds(sender, transaction)).toBe(true);
    });

    test("returns false when sender has insufficient balance", () => {
      const sender = fakeUser({ balance: 1000 });
      const transaction = fakeTransaction();
      transaction.amount = 5000;
      expect(hasSufficientFunds(sender, transaction)).toBe(false);
    });
  });

  describe("receiverIsCurrentUser", () => {
    test("returns true when current user is the receiver", () => {
      const user = fakeUser({ id: "user-1" });
      const transaction = fakeTransaction();
      transaction.receiverId = "user-1";
      expect(receiverIsCurrentUser(user, transaction)).toBe(true);
    });

    test("returns false when current user is not the receiver", () => {
      const user = fakeUser({ id: "user-1" });
      const transaction = fakeTransaction();
      transaction.receiverId = "user-2";
      expect(receiverIsCurrentUser(user, transaction)).toBe(false);
    });
  });

  describe("formatFullName", () => {
    test("formats a user's first and last name", () => {
      const user = fakeUser({ firstName: "John", lastName: "Doe" });
      expect(formatFullName(user)).toBe("John Doe");
    });
  });

  describe("notification type guards", () => {
    const baseNotification = {
      id: shortid(),
      uuid: faker.datatype.uuid(),
      userId: shortid(),
      transactionId: shortid(),
      isRead: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    test("isCommentNotification returns true for comment notification", () => {
      expect(isCommentNotification({ ...baseNotification, commentId: "c1" })).toBe(true);
    });

    test("isCommentNotification returns false for like notification", () => {
      expect(isCommentNotification({ ...baseNotification, likeId: "l1" })).toBe(false);
    });

    test("isLikeNotification returns true for like notification", () => {
      expect(isLikeNotification({ ...baseNotification, likeId: "l1" })).toBe(true);
    });

    test("isLikeNotification returns false for payment notification", () => {
      expect(
        isLikeNotification({
          ...baseNotification,
          status: PaymentNotificationStatus.received,
        })
      ).toBe(false);
    });

    test("isPaymentNotification returns true for payment notification", () => {
      expect(
        isPaymentNotification({
          ...baseNotification,
          status: PaymentNotificationStatus.received,
        })
      ).toBe(true);
    });

    test("isPaymentNotification returns false for comment notification", () => {
      expect(isPaymentNotification({ ...baseNotification, commentId: "c1" })).toBe(false);
    });

    test("isPaymentRequestedNotification returns true for requested status", () => {
      expect(
        isPaymentRequestedNotification({
          ...baseNotification,
          status: PaymentNotificationStatus.requested,
        })
      ).toBe(true);
    });

    test("isPaymentRequestedNotification returns false for received status", () => {
      expect(
        isPaymentRequestedNotification({
          ...baseNotification,
          status: PaymentNotificationStatus.received,
        })
      ).toBe(false);
    });

    test("isPaymentReceivedNotification returns true for received status", () => {
      expect(
        isPaymentReceivedNotification({
          ...baseNotification,
          status: PaymentNotificationStatus.received,
        })
      ).toBe(true);
    });

    test("isPaymentReceivedNotification returns false for requested status", () => {
      expect(
        isPaymentReceivedNotification({
          ...baseNotification,
          status: PaymentNotificationStatus.requested,
        })
      ).toBe(false);
    });
  });

  describe("query field helpers", () => {
    test("hasDateQueryFields returns true when both date fields present", () => {
      expect(
        hasDateQueryFields({
          dateRangeStart: "2024-01-01",
          dateRangeEnd: "2024-12-31",
        })
      ).toBe(true);
    });

    test("hasDateQueryFields returns false when date fields missing", () => {
      expect(hasDateQueryFields({})).toBe(false);
    });

    test("getDateQueryFields picks only date fields", () => {
      expect(
        getDateQueryFields({
          dateRangeStart: "2024-01-01",
          dateRangeEnd: "2024-12-31",
        })
      ).toEqual({ dateRangeStart: "2024-01-01", dateRangeEnd: "2024-12-31" });
    });

    test("omitDateQueryFields removes date fields", () => {
      const result = omitDateQueryFields({
        dateRangeStart: "2024-01-01",
        dateRangeEnd: "2024-12-31",
        status: TransactionStatus.complete,
      });
      expect(result).toEqual({ status: "complete" });
    });

    test("hasAmountQueryFields returns true when both amount fields present", () => {
      expect(hasAmountQueryFields({ amountMin: 0, amountMax: 100 })).toBe(true);
    });

    test("hasAmountQueryFields returns false when amount fields missing", () => {
      expect(hasAmountQueryFields({})).toBe(false);
    });

    test("getAmountQueryFields picks only amount fields", () => {
      expect(getAmountQueryFields({ amountMin: 10, amountMax: 50 })).toEqual({
        amountMin: 10,
        amountMax: 50,
      });
    });

    test("omitAmountQueryFields removes amount fields", () => {
      const result = omitAmountQueryFields({
        amountMin: 10,
        amountMax: 50,
        status: TransactionStatus.pending,
      });
      expect(result).toEqual({ status: "pending" });
    });

    test("omitPaginationQueryFields removes page and limit", () => {
      const result = omitPaginationQueryFields({
        page: 2,
        limit: 10,
        status: TransactionStatus.complete,
      });
      expect(result).toEqual({ status: "complete" });
    });
  });

  describe("getPaginatedItems", () => {
    const items = Array.from({ length: 25 }, (_, i) => i + 1);

    test("returns first page correctly", () => {
      const result = getPaginatedItems(1, 10, items);
      expect(result.data).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(result.totalPages).toBe(3);
    });

    test("returns middle page correctly", () => {
      const result = getPaginatedItems(2, 10, items);
      expect(result.data).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
      expect(result.totalPages).toBe(3);
    });

    test("returns last partial page correctly", () => {
      const result = getPaginatedItems(3, 10, items);
      expect(result.data).toEqual([21, 22, 23, 24, 25]);
      expect(result.totalPages).toBe(3);
    });

    test("returns empty data for page beyond range", () => {
      const result = getPaginatedItems(4, 10, items);
      expect(result.data).toEqual([]);
    });
  });

  describe("padAmountWithZeros", () => {
    test("multiplies and ceils the number by 1000", () => {
      expect(padAmountWithZeros(5)).toBe(5000);
      expect(padAmountWithZeros(1.5)).toBe(1500);
      expect(padAmountWithZeros(0)).toBe(0);
    });
  });

  describe("amountRangeValueText", () => {
    test("pads amount and formats as currency", () => {
      expect(amountRangeValueText(10)).toBe("$100.00");
      expect(amountRangeValueText(0)).toBe("$0.00");
    });
  });

  describe("formatAmountRangeValues", () => {
    test("formats an array of amounts as a range string", () => {
      expect(formatAmountRangeValues([0, 10])).toBe("$0 - $100");
    });
  });

  describe("date utility functions", () => {
    test("isoStringToLocalMidnightStart returns start of day", () => {
      const result = isoStringToLocalMidnightStart("2024-06-15T14:30:00.000Z");
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    test("isoStringToLocalMidnightEnd returns end of day", () => {
      const result = isoStringToLocalMidnightEnd("2024-06-15T14:30:00.000Z");
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    test("isoStringToLocalDateFull preserves full date-time", () => {
      const result = isoStringToLocalDateFull("2024-06-15T14:30:45.123Z");
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(5);
      expect(result.getFullYear()).toBe(2024);
    });

    test("localDateToIsoString returns an ISO string", () => {
      const date = new Date(2024, 5, 15, 12, 0, 0);
      const result = localDateToIsoString(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test("localDateToUTCISOString converts Date to UTC ISO string", () => {
      const date = new Date(2024, 5, 15, 12, 30, 45, 123);
      const result = localDateToUTCISOString(date);
      expect(result).toBe("2024-06-15T12:30:45.123Z");
    });

    test("localDateToUTCISOString returns current ISO string for null input", () => {
      const before = new Date().toISOString();
      const result = localDateToUTCISOString(null);
      const after = new Date().toISOString();
      expect(result >= before && result <= after).toBe(true);
    });
  });
});
