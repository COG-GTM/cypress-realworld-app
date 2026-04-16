import { describe, expect, test } from "vitest";
import {
  isRequestTransaction,
  isPayment,
  isPendingRequestTransaction,
  isAcceptedRequestTransaction,
  isRejectedRequestTransaction,
  formatFullName,
  isCommentNotification,
  isLikeNotification,
  isPaymentNotification,
  isPaymentRequestedNotification,
  isPaymentReceivedNotification,
  hasSufficientFunds,
  getChargeAmount,
  getTransferAmount,
  getPayAppCreditedAmount,
  payAppDifference,
  payAppAddition,
  receiverIsCurrentUser,
  hasDateQueryFields,
  getDateQueryFields,
  hasAmountQueryFields,
  getAmountQueryFields,
  omitDateQueryFields,
  omitAmountQueryFields,
  omitPaginationQueryFields,
  getPaginatedItems,
  isoStringToLocalMidnightStart,
  isoStringToLocalMidnightEnd,
  isoStringToLocalDateFull,
  localDateToIsoString,
  localDateToUTCISOString,
  getFakeAmount,
} from "../transactionUtils";
import {
  Transaction,
  TransactionRequestStatus,
  TransactionStatus,
  DefaultPrivacyLevel,
  PaymentNotificationStatus,
} from "../../models";
import type {
  User,
  PaymentNotification,
  LikeNotification,
  CommentNotification,
} from "../../models";
import shortid from "shortid";

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: shortid(),
  uuid: "test-uuid",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  password: "s3cret",
  email: "john@example.com",
  phoneNumber: "555-1234",
  avatar: "/avatar.png",
  defaultPrivacyLevel: DefaultPrivacyLevel.public,
  balance: 100000, // $1000.00 in cents
  createdAt: new Date(),
  modifiedAt: new Date(),
  ...overrides,
});

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: shortid(),
  uuid: "test-txn-uuid",
  source: shortid(),
  amount: 50000, // $500.00 in cents
  description: "Test transaction",
  privacyLevel: DefaultPrivacyLevel.public,
  receiverId: shortid(),
  senderId: shortid(),
  status: TransactionStatus.pending,
  createdAt: new Date(),
  modifiedAt: new Date(),
  ...overrides,
});

describe("Transaction Utils - Extended", () => {
  describe("isPayment", () => {
    test("returns true for a payment transaction (no requestStatus)", () => {
      const txn = makeTransaction({ requestStatus: undefined });
      expect(isPayment(txn)).toBe(true);
    });

    test("returns false for a request transaction", () => {
      const txn = makeTransaction({ requestStatus: TransactionRequestStatus.pending });
      expect(isPayment(txn)).toBe(false);
    });
  });

  describe("isPendingRequestTransaction", () => {
    test("returns true for pending request", () => {
      const txn = makeTransaction({ requestStatus: TransactionRequestStatus.pending });
      expect(isPendingRequestTransaction(txn)).toBe(true);
    });

    test("returns false for accepted request", () => {
      const txn = makeTransaction({ requestStatus: TransactionRequestStatus.accepted });
      expect(isPendingRequestTransaction(txn)).toBe(false);
    });

    test("returns false for payment (no requestStatus)", () => {
      const txn = makeTransaction({ requestStatus: undefined });
      expect(isPendingRequestTransaction(txn)).toBe(false);
    });
  });

  describe("isAcceptedRequestTransaction", () => {
    test("returns true for accepted request", () => {
      const txn = makeTransaction({ requestStatus: TransactionRequestStatus.accepted });
      expect(isAcceptedRequestTransaction(txn)).toBe(true);
    });

    test("returns false for pending request", () => {
      const txn = makeTransaction({ requestStatus: TransactionRequestStatus.pending });
      expect(isAcceptedRequestTransaction(txn)).toBe(false);
    });
  });

  describe("isRejectedRequestTransaction", () => {
    test("returns true for rejected request", () => {
      const txn = makeTransaction({ requestStatus: TransactionRequestStatus.rejected });
      expect(isRejectedRequestTransaction(txn)).toBe(true);
    });

    test("returns false for pending request", () => {
      const txn = makeTransaction({ requestStatus: TransactionRequestStatus.pending });
      expect(isRejectedRequestTransaction(txn)).toBe(false);
    });
  });

  describe("formatFullName", () => {
    test("formats user first and last name", () => {
      const user = makeUser({ firstName: "Jane", lastName: "Smith" });
      expect(formatFullName(user)).toBe("Jane Smith");
    });

    test("handles single character names", () => {
      const user = makeUser({ firstName: "A", lastName: "B" });
      expect(formatFullName(user)).toBe("A B");
    });
  });

  describe("notification type guards", () => {
    const paymentNotification: PaymentNotification = {
      id: "n1",
      uuid: "uuid-1",
      userId: "u1",
      transactionId: "t1",
      status: PaymentNotificationStatus.received,
      isRead: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    const likeNotification: LikeNotification = {
      id: "n2",
      uuid: "uuid-2",
      userId: "u1",
      transactionId: "t1",
      likeId: "l1",
      isRead: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    const commentNotification: CommentNotification = {
      id: "n3",
      uuid: "uuid-3",
      userId: "u1",
      transactionId: "t1",
      commentId: "c1",
      isRead: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    test("isCommentNotification identifies comment notifications", () => {
      expect(isCommentNotification(commentNotification)).toBe(true);
      expect(isCommentNotification(paymentNotification)).toBe(false);
      expect(isCommentNotification(likeNotification)).toBe(false);
    });

    test("isLikeNotification identifies like notifications", () => {
      expect(isLikeNotification(likeNotification)).toBe(true);
      expect(isLikeNotification(paymentNotification)).toBe(false);
      expect(isLikeNotification(commentNotification)).toBe(false);
    });

    test("isPaymentNotification identifies payment notifications", () => {
      expect(isPaymentNotification(paymentNotification)).toBe(true);
      expect(isPaymentNotification(likeNotification)).toBe(false);
      expect(isPaymentNotification(commentNotification)).toBe(false);
    });

    test("isPaymentRequestedNotification checks requested status", () => {
      const requested: PaymentNotification = {
        ...paymentNotification,
        status: PaymentNotificationStatus.requested,
      };
      expect(isPaymentRequestedNotification(requested)).toBe(true);
      expect(isPaymentRequestedNotification(paymentNotification)).toBe(false);
    });

    test("isPaymentReceivedNotification checks received status", () => {
      expect(isPaymentReceivedNotification(paymentNotification)).toBe(true);
      const requested: PaymentNotification = {
        ...paymentNotification,
        status: PaymentNotificationStatus.requested,
      };
      expect(isPaymentReceivedNotification(requested)).toBe(false);
    });
  });

  describe("balance calculations", () => {
    test("hasSufficientFunds returns true when balance > transaction amount", () => {
      const user = makeUser({ balance: 100000 });
      const txn = makeTransaction({ amount: 50000 });
      expect(hasSufficientFunds(user, txn)).toBe(true);
    });

    test("hasSufficientFunds returns false when balance < transaction amount", () => {
      const user = makeUser({ balance: 10000 });
      const txn = makeTransaction({ amount: 50000 });
      expect(hasSufficientFunds(user, txn)).toBe(false);
    });

    test("getChargeAmount returns the correct remaining balance", () => {
      const user = makeUser({ balance: 100000 });
      const txn = makeTransaction({ amount: 30000 });
      // chargeAmount = |balance - amount| = |100000 - 30000| = 70000
      expect(getChargeAmount(user, txn)).toBe(70000);
    });

    test("getTransferAmount returns the shortfall amount", () => {
      const user = makeUser({ balance: 10000 });
      const txn = makeTransaction({ amount: 50000 });
      // transferAmount = |balance - amount| = |10000 - 50000| = 40000
      expect(getTransferAmount(user, txn)).toBe(40000);
    });

    test("getPayAppCreditedAmount returns the sum of balance and amount", () => {
      const user = makeUser({ balance: 100000 });
      const txn = makeTransaction({ amount: 30000 });
      // creditedAmount = |balance + amount| = 130000
      expect(getPayAppCreditedAmount(user, txn)).toBe(130000);
    });

    test("payAppDifference returns correct Dinero object", () => {
      const user = makeUser({ balance: 100000 });
      const txn = makeTransaction({ amount: 30000 });
      const result = payAppDifference(user, txn);
      expect(result.getAmount()).toBe(70000);
    });

    test("payAppAddition returns correct Dinero object", () => {
      const user = makeUser({ balance: 100000 });
      const txn = makeTransaction({ amount: 30000 });
      const result = payAppAddition(user, txn);
      expect(result.getAmount()).toBe(130000);
    });
  });

  describe("receiverIsCurrentUser", () => {
    test("returns true when current user is the receiver", () => {
      const user = makeUser({ id: "user-123" });
      const txn = makeTransaction({ receiverId: "user-123" });
      expect(receiverIsCurrentUser(user, txn)).toBe(true);
    });

    test("returns false when current user is not the receiver", () => {
      const user = makeUser({ id: "user-123" });
      const txn = makeTransaction({ receiverId: "user-456" });
      expect(receiverIsCurrentUser(user, txn)).toBe(false);
    });
  });

  describe("query field helpers", () => {
    test("hasDateQueryFields returns true when both date fields present", () => {
      expect(hasDateQueryFields({ dateRangeStart: "2024-01-01", dateRangeEnd: "2024-12-31" })).toBe(
        true
      );
    });

    test("hasDateQueryFields returns false when fields missing", () => {
      expect(hasDateQueryFields({ dateRangeStart: "2024-01-01" })).toBe(false);
      expect(hasDateQueryFields({})).toBe(false);
    });

    test("getDateQueryFields extracts date fields", () => {
      const query = {
        dateRangeStart: "2024-01-01",
        dateRangeEnd: "2024-12-31",
        status: TransactionStatus.complete,
      };
      expect(getDateQueryFields(query)).toEqual({
        dateRangeStart: "2024-01-01",
        dateRangeEnd: "2024-12-31",
      });
    });

    test("hasAmountQueryFields returns true when both amount fields present", () => {
      expect(hasAmountQueryFields({ amountMin: 10, amountMax: 100 })).toBe(true);
    });

    test("hasAmountQueryFields returns false when fields missing", () => {
      expect(hasAmountQueryFields({ amountMin: 10 })).toBe(false);
      expect(hasAmountQueryFields({})).toBe(false);
    });

    test("getAmountQueryFields extracts amount fields", () => {
      const query = { amountMin: 10, amountMax: 100, status: TransactionStatus.complete };
      expect(getAmountQueryFields(query)).toEqual({ amountMin: 10, amountMax: 100 });
    });

    test("omitDateQueryFields removes date fields", () => {
      const query = {
        dateRangeStart: "2024-01-01",
        dateRangeEnd: "2024-12-31",
        status: TransactionStatus.complete,
      };
      expect(omitDateQueryFields(query)).toEqual({ status: TransactionStatus.complete });
    });

    test("omitAmountQueryFields removes amount fields", () => {
      const query = { amountMin: 10, amountMax: 100, status: TransactionStatus.complete };
      expect(omitAmountQueryFields(query)).toEqual({ status: TransactionStatus.complete });
    });

    test("omitPaginationQueryFields removes page and limit fields", () => {
      const query = { page: 1, limit: 10, status: TransactionStatus.complete };
      expect(omitPaginationQueryFields(query)).toEqual({ status: TransactionStatus.complete });
    });
  });

  describe("getPaginatedItems", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

    test("returns first page correctly", () => {
      const result = getPaginatedItems(1, 10, items);
      expect(result.data).toHaveLength(10);
      expect(result.totalPages).toBe(3);
      expect(result.data[0]).toEqual({ id: 1 });
    });

    test("returns second page correctly", () => {
      const result = getPaginatedItems(2, 10, items);
      expect(result.data).toHaveLength(10);
      expect(result.data[0]).toEqual({ id: 11 });
    });

    test("returns last page with remaining items", () => {
      const result = getPaginatedItems(3, 10, items);
      expect(result.data).toHaveLength(5);
      expect(result.data[0]).toEqual({ id: 21 });
    });

    test("returns empty data for out of range page", () => {
      const result = getPaginatedItems(4, 10, items);
      expect(result.data).toHaveLength(0);
    });

    test("handles single item per page", () => {
      const result = getPaginatedItems(1, 1, items);
      expect(result.data).toHaveLength(1);
      expect(result.totalPages).toBe(25);
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

    test("isoStringToLocalDateFull preserves time components", () => {
      const result = isoStringToLocalDateFull("2024-06-15T14:30:45.000Z");
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
    });

    test("localDateToIsoString converts date to ISO string", () => {
      const date = new Date(2024, 5, 15, 14, 30, 0, 0);
      const result = localDateToIsoString(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test("localDateToUTCISOString converts Date to UTC ISO string", () => {
      const date = new Date(2024, 5, 15, 14, 30, 0, 0);
      const result = localDateToUTCISOString(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T14:30:00\.000Z$/);
    });

    test("localDateToUTCISOString returns current date for null input", () => {
      const result = localDateToUTCISOString(null);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe("getFakeAmount", () => {
    test("returns a number within default range", () => {
      const amount = getFakeAmount();
      expect(amount).toBeGreaterThanOrEqual(1000);
      expect(amount).toBeLessThanOrEqual(50000);
    });

    test("returns a number within custom range", () => {
      const amount = getFakeAmount(100, 200);
      expect(amount).toBeGreaterThanOrEqual(100);
      expect(amount).toBeLessThanOrEqual(200);
    });
  });
});
