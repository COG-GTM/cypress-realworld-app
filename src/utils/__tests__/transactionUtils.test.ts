import { describe, expect, test } from "vitest";
import {
  isRequestTransaction,
  getFakeAmount,
  currentUserLikesTransaction,
  getQueryWithoutDateFields,
  getQueryWithoutAmountFields,
  getQueryWithoutFilterFields,
  isPayment,
  payAppDifference,
  payAppAddition,
  getChargeAmount,
  getTransferAmount,
  getPayAppCreditedAmount,
  hasSufficientFunds,
  formatFullName,
  isCommentNotification,
  isLikeNotification,
  isPaymentNotification,
  hasDateQueryFields,
  getDateQueryFields,
  omitDateQueryFields,
  hasAmountQueryFields,
  getAmountQueryFields,
  omitAmountQueryFields,
  omitPaginationQueryFields,
  getPaginatedItems,
  isoStringToLocalMidnightStart,
  isoStringToLocalMidnightEnd,
  isoStringToLocalDateFull,
  localDateToIsoString,
  localDateToUTCISOString,
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
  CommentNotification,
  LikeNotification,
  PaymentNotification,
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

  describe("payAppDifference and payAppAddition", () => {
    const createUser = (balance: number): User => ({
      id: shortid(),
      uuid: faker.datatype.uuid(),
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      password: "password123",
      email: "john@example.com",
      phoneNumber: "555-1234",
      avatar: "/avatar.png",
      defaultPrivacyLevel: DefaultPrivacyLevel.public,
      balance,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    const createTransactionWithAmount = (amount: number): Transaction => ({
      id: shortid(),
      uuid: faker.datatype.uuid(),
      source: shortid(),
      amount,
      description: "test",
      privacyLevel: DefaultPrivacyLevel.public,
      receiverId: shortid(),
      senderId: shortid(),
      balanceAtCompletion: 0,
      status: TransactionStatus.pending,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    test("payAppDifference calculates balance minus transaction amount", () => {
      const user = createUser(10000);
      const transaction = createTransactionWithAmount(3000);
      const result = payAppDifference(user, transaction);
      expect(result.getAmount()).toBe(7000);
    });

    test("payAppAddition calculates balance plus transaction amount", () => {
      const user = createUser(10000);
      const transaction = createTransactionWithAmount(3000);
      const result = payAppAddition(user, transaction);
      expect(result.getAmount()).toBe(13000);
    });

    test("getChargeAmount returns absolute difference", () => {
      const user = createUser(10000);
      const transaction = createTransactionWithAmount(3000);
      expect(getChargeAmount(user, transaction)).toBe(7000);
    });

    test("getTransferAmount returns absolute difference", () => {
      const user = createUser(10000);
      const transaction = createTransactionWithAmount(3000);
      expect(getTransferAmount(user, transaction)).toBe(7000);
    });

    test("getPayAppCreditedAmount returns absolute sum", () => {
      const user = createUser(10000);
      const transaction = createTransactionWithAmount(3000);
      expect(getPayAppCreditedAmount(user, transaction)).toBe(13000);
    });

    test("hasSufficientFunds returns true when balance exceeds amount", () => {
      const user = createUser(10000);
      const transaction = createTransactionWithAmount(3000);
      expect(hasSufficientFunds(user, transaction)).toBe(true);
    });

    test("hasSufficientFunds returns false when amount exceeds balance", () => {
      const user = createUser(1000);
      const transaction = createTransactionWithAmount(5000);
      expect(hasSufficientFunds(user, transaction)).toBe(false);
    });
  });

  describe("formatFullName", () => {
    test("formats user first and last name", () => {
      const user: User = {
        id: "123",
        uuid: "uuid-123",
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        password: "password",
        email: "john@example.com",
        phoneNumber: "555-1234",
        avatar: "/avatar.png",
        defaultPrivacyLevel: DefaultPrivacyLevel.public,
        balance: 10000,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(formatFullName(user)).toBe("John Doe");
    });
  });

  describe("notification type guards", () => {
    const baseNotification = {
      id: "notif-1",
      uuid: "uuid-1",
      userId: "user-1",
      transactionId: "txn-1",
      isRead: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    test("isCommentNotification returns true for comment notifications", () => {
      const commentNotification: CommentNotification = {
        ...baseNotification,
        commentId: "comment-1",
      };
      expect(isCommentNotification(commentNotification)).toBe(true);
    });

    test("isCommentNotification returns false for non-comment notifications", () => {
      const likeNotification: LikeNotification = {
        ...baseNotification,
        likeId: "like-1",
      };
      expect(isCommentNotification(likeNotification)).toBe(false);
    });

    test("isLikeNotification returns true for like notifications", () => {
      const likeNotification: LikeNotification = {
        ...baseNotification,
        likeId: "like-1",
      };
      expect(isLikeNotification(likeNotification)).toBe(true);
    });

    test("isLikeNotification returns false for non-like notifications", () => {
      const commentNotification: CommentNotification = {
        ...baseNotification,
        commentId: "comment-1",
      };
      expect(isLikeNotification(commentNotification)).toBe(false);
    });

    test("isPaymentNotification returns true for payment notifications", () => {
      const paymentNotification: PaymentNotification = {
        ...baseNotification,
        status: PaymentNotificationStatus.received,
      };
      expect(isPaymentNotification(paymentNotification)).toBe(true);
    });

    test("isPaymentNotification returns false for non-payment notifications", () => {
      const likeNotification: LikeNotification = {
        ...baseNotification,
        likeId: "like-1",
      };
      expect(isPaymentNotification(likeNotification)).toBe(false);
    });
  });

  describe("query field helpers", () => {
    test("hasDateQueryFields returns true when both date fields present", () => {
      const query = {
        dateRangeStart: "2020-01-01",
        dateRangeEnd: "2020-12-31",
      };
      expect(hasDateQueryFields(query)).toBe(true);
    });

    test("hasDateQueryFields returns false when date fields missing", () => {
      const query = { status: TransactionStatus.pending };
      expect(hasDateQueryFields(query)).toBe(false);
    });

    test("getDateQueryFields extracts date fields", () => {
      const query = {
        dateRangeStart: "2020-01-01",
        dateRangeEnd: "2020-12-31",
        status: TransactionStatus.pending,
      };
      expect(getDateQueryFields(query)).toEqual({
        dateRangeStart: "2020-01-01",
        dateRangeEnd: "2020-12-31",
      });
    });

    test("omitDateQueryFields removes date fields", () => {
      const query = {
        dateRangeStart: "2020-01-01",
        dateRangeEnd: "2020-12-31",
        status: TransactionStatus.pending,
      };
      expect(omitDateQueryFields(query)).toEqual({
        status: TransactionStatus.pending,
      });
    });

    test("hasAmountQueryFields returns true when both amount fields present", () => {
      const query = { amountMin: 100, amountMax: 1000 };
      expect(hasAmountQueryFields(query)).toBe(true);
    });

    test("hasAmountQueryFields returns false when amount fields missing", () => {
      const query = { status: TransactionStatus.pending };
      expect(hasAmountQueryFields(query)).toBe(false);
    });

    test("getAmountQueryFields extracts amount fields", () => {
      const query = {
        amountMin: 100,
        amountMax: 1000,
        status: TransactionStatus.pending,
      };
      expect(getAmountQueryFields(query)).toEqual({
        amountMin: 100,
        amountMax: 1000,
      });
    });

    test("omitAmountQueryFields removes amount fields", () => {
      const query = {
        amountMin: 100,
        amountMax: 1000,
        status: TransactionStatus.pending,
      };
      expect(omitAmountQueryFields(query)).toEqual({
        status: TransactionStatus.pending,
      });
    });

    test("omitPaginationQueryFields removes pagination fields", () => {
      const query = {
        page: 1,
        limit: 10,
        status: TransactionStatus.pending,
      };
      expect(omitPaginationQueryFields(query)).toEqual({
        status: TransactionStatus.pending,
      });
    });
  });

  describe("getPaginatedItems", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    test("returns first page correctly", () => {
      const result = getPaginatedItems(1, 3, items);
      expect(result.data).toEqual([1, 2, 3]);
      expect(result.totalPages).toBe(4);
    });

    test("returns middle page correctly", () => {
      const result = getPaginatedItems(2, 3, items);
      expect(result.data).toEqual([4, 5, 6]);
      expect(result.totalPages).toBe(4);
    });

    test("returns last page correctly", () => {
      const result = getPaginatedItems(4, 3, items);
      expect(result.data).toEqual([10]);
      expect(result.totalPages).toBe(4);
    });

    test("handles empty items", () => {
      const result = getPaginatedItems(1, 10, []);
      expect(result.data).toEqual([]);
      expect(result.totalPages).toBe(0);
    });
  });

  describe("date conversion functions", () => {
    test("isoStringToLocalMidnightStart converts to start of day", () => {
      const isoString = "2020-06-15T14:30:00.000Z";
      const result = isoStringToLocalMidnightStart(isoString);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    test("isoStringToLocalMidnightEnd converts to end of day", () => {
      const isoString = "2020-06-15T14:30:00.000Z";
      const result = isoStringToLocalMidnightEnd(isoString);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    test("isoStringToLocalDateFull preserves full date/time", () => {
      const isoString = "2020-06-15T14:30:45.123Z";
      const result = isoStringToLocalDateFull(isoString);
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(5);
      expect(result.getFullYear()).toBe(2020);
    });

    test("localDateToIsoString converts local date to ISO string", () => {
      const date = new Date(2020, 5, 15, 14, 30, 0, 0);
      const result = localDateToIsoString(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });

    test("localDateToUTCISOString converts local date to UTC ISO string", () => {
      const date = new Date(2020, 5, 15, 14, 30, 45, 123);
      const result = localDateToUTCISOString(date);
      expect(result).toBe("2020-06-15T14:30:45.123Z");
    });

    test("localDateToUTCISOString handles null input", () => {
      const result = localDateToUTCISOString(null);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });
  });
});
