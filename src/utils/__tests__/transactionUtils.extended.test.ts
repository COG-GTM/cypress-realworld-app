import { describe, expect, test } from "vitest";
import {
  isRequestTransaction,
  isPendingRequestTransaction,
  isAcceptedRequestTransaction,
  isRejectedRequestTransaction,
  isPayment,
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
  hasPaginationQueryFields,
  omitPaginationQueryFields,
  getQueryWithoutDateFields,
  getQueryWithoutAmountFields,
  getQueryWithoutFilterFields,
  padAmountWithZeros,
  amountRangeValueText,
  amountRangeValueTextLabel,
  formatAmountRangeValues,
  getPaginatedItems,
  isoStringToLocalMidnightStart,
  isoStringToLocalMidnightEnd,
  isoStringToLocalDateFull,
  localDateToIsoString,
  localDateToUTCISOString,
  startOfDayUTC,
  endOfDayUTC,
} from "../transactionUtils";
import {
  Transaction,
  TransactionRequestStatus,
  TransactionStatus,
  DefaultPrivacyLevel,
  PaymentNotificationStatus,
  TransactionResponseItem,
  User,
} from "../../models";
import shortid from "shortid";

const createFakeUser = (overrides: Partial<User> = {}): User => ({
  id: shortid(),
  uuid: "test-uuid",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  password: "abc123",
  email: "john@example.com",
  phoneNumber: "555-1234",
  avatar: "/avatar.png",
  defaultPrivacyLevel: DefaultPrivacyLevel.public,
  balance: 50000,
  createdAt: new Date(),
  modifiedAt: new Date(),
  ...overrides,
});

const createFakeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: shortid(),
  uuid: "test-uuid",
  source: shortid(),
  amount: 10000,
  description: "Test transaction",
  privacyLevel: DefaultPrivacyLevel.public,
  receiverId: shortid(),
  senderId: shortid(),
  balanceAtCompletion: 40000,
  status: TransactionStatus.pending,
  createdAt: new Date(),
  modifiedAt: new Date(),
  ...overrides,
});

describe("Transaction Utils - Extended Coverage", () => {
  describe("isRequestTransaction", () => {
    test("returns true for pending request", () => {
      const tx = createFakeTransaction({
        requestStatus: TransactionRequestStatus.pending,
      });
      expect(isRequestTransaction(tx)).toBeTruthy();
    });

    test("returns true for accepted request", () => {
      const tx = createFakeTransaction({
        requestStatus: TransactionRequestStatus.accepted,
      });
      expect(isRequestTransaction(tx)).toBeTruthy();
    });

    test("returns true for rejected request", () => {
      const tx = createFakeTransaction({
        requestStatus: TransactionRequestStatus.rejected,
      });
      expect(isRequestTransaction(tx)).toBeTruthy();
    });

    test("returns false for payment (no requestStatus)", () => {
      const tx = createFakeTransaction({ requestStatus: undefined });
      expect(isRequestTransaction(tx)).toBe(false);
    });
  });

  describe("isPendingRequestTransaction", () => {
    test("returns true for pending request", () => {
      const tx = createFakeTransaction({
        requestStatus: TransactionRequestStatus.pending,
      });
      expect(isPendingRequestTransaction(tx)).toBe(true);
    });

    test("returns false for accepted request", () => {
      const tx = createFakeTransaction({
        requestStatus: TransactionRequestStatus.accepted,
      });
      expect(isPendingRequestTransaction(tx)).toBe(false);
    });

    test("returns false for payment", () => {
      const tx = createFakeTransaction({ requestStatus: undefined });
      expect(isPendingRequestTransaction(tx)).toBe(false);
    });
  });

  describe("isAcceptedRequestTransaction", () => {
    test("returns true for accepted request", () => {
      const tx = createFakeTransaction({
        requestStatus: TransactionRequestStatus.accepted,
      });
      expect(isAcceptedRequestTransaction(tx)).toBe(true);
    });

    test("returns false for pending request", () => {
      const tx = createFakeTransaction({
        requestStatus: TransactionRequestStatus.pending,
      });
      expect(isAcceptedRequestTransaction(tx)).toBe(false);
    });
  });

  describe("isRejectedRequestTransaction", () => {
    test("returns true for rejected request", () => {
      const tx = createFakeTransaction({
        requestStatus: TransactionRequestStatus.rejected,
      });
      expect(isRejectedRequestTransaction(tx)).toBe(true);
    });

    test("returns false for accepted request", () => {
      const tx = createFakeTransaction({
        requestStatus: TransactionRequestStatus.accepted,
      });
      expect(isRejectedRequestTransaction(tx)).toBe(false);
    });
  });

  describe("isPayment", () => {
    test("returns true for payment (no requestStatus)", () => {
      const tx = createFakeTransaction({ requestStatus: undefined });
      expect(isPayment(tx)).toBe(true);
    });

    test("returns false for request", () => {
      const tx = createFakeTransaction({
        requestStatus: TransactionRequestStatus.pending,
      });
      expect(isPayment(tx)).toBe(false);
    });
  });

  describe("getFakeAmount", () => {
    test("generates amount within default range", () => {
      const amount = getFakeAmount();
      expect(amount).toBeGreaterThanOrEqual(1000);
      expect(amount).toBeLessThanOrEqual(50000);
    });

    test("generates amount within custom range", () => {
      const amount = getFakeAmount(100, 200);
      expect(amount).toBeGreaterThanOrEqual(100);
      expect(amount).toBeLessThanOrEqual(200);
    });
  });

  describe("formatAmount", () => {
    test("formats amount in dollars", () => {
      const result = formatAmount(10050);
      expect(result).toBe("$100.50");
    });

    test("formats zero amount", () => {
      const result = formatAmount(0);
      expect(result).toBe("$0.00");
    });
  });

  describe("formatAmountSlider", () => {
    test("formats amount without cents", () => {
      const result = formatAmountSlider(10000);
      expect(result).toBe("$100");
    });

    test("formats zero", () => {
      const result = formatAmountSlider(0);
      expect(result).toBe("$0");
    });
  });

  describe("payAppDifference and payAppAddition", () => {
    test("calculates difference correctly", () => {
      const user = createFakeUser({ balance: 50000 });
      const tx = createFakeTransaction({ amount: 10000 });
      const result = payAppDifference(user, tx);
      expect(result.getAmount()).toBe(40000);
    });

    test("calculates addition correctly", () => {
      const user = createFakeUser({ balance: 50000 });
      const tx = createFakeTransaction({ amount: 10000 });
      const result = payAppAddition(user, tx);
      expect(result.getAmount()).toBe(60000);
    });
  });

  describe("getChargeAmount", () => {
    test("returns absolute difference", () => {
      const user = createFakeUser({ balance: 50000 });
      const tx = createFakeTransaction({ amount: 10000 });
      expect(getChargeAmount(user, tx)).toBe(40000);
    });

    test("returns absolute difference when negative", () => {
      const user = createFakeUser({ balance: 5000 });
      const tx = createFakeTransaction({ amount: 10000 });
      expect(getChargeAmount(user, tx)).toBe(5000);
    });
  });

  describe("getTransferAmount", () => {
    test("returns transfer amount", () => {
      const user = createFakeUser({ balance: 5000 });
      const tx = createFakeTransaction({ amount: 10000 });
      expect(getTransferAmount(user, tx)).toBe(5000);
    });
  });

  describe("getPayAppCreditedAmount", () => {
    test("returns credited amount", () => {
      const receiver = createFakeUser({ balance: 50000 });
      const tx = createFakeTransaction({ amount: 10000 });
      expect(getPayAppCreditedAmount(receiver, tx)).toBe(60000);
    });
  });

  describe("hasSufficientFunds", () => {
    test("returns true when balance exceeds amount", () => {
      const user = createFakeUser({ balance: 50000 });
      const tx = createFakeTransaction({ amount: 10000 });
      expect(hasSufficientFunds(user, tx)).toBe(true);
    });

    test("returns false when balance is less than amount", () => {
      const user = createFakeUser({ balance: 5000 });
      const tx = createFakeTransaction({ amount: 10000 });
      expect(hasSufficientFunds(user, tx)).toBe(false);
    });
  });

  describe("receiverIsCurrentUser", () => {
    test("returns true when user is receiver", () => {
      const userId = "user123";
      const user = createFakeUser({ id: userId });
      const tx = createFakeTransaction({ receiverId: userId });
      expect(receiverIsCurrentUser(user, tx)).toBe(true);
    });

    test("returns false when user is not receiver", () => {
      const user = createFakeUser({ id: "user123" });
      const tx = createFakeTransaction({ receiverId: "other456" });
      expect(receiverIsCurrentUser(user, tx)).toBe(false);
    });
  });

  describe("formatFullName", () => {
    test("formats full name from user object", () => {
      const user = createFakeUser({
        firstName: "Jane",
        lastName: "Smith",
      });
      expect(formatFullName(user)).toBe("Jane Smith");
    });
  });

  describe("notification type guards", () => {
    test("isCommentNotification returns true for comment notification", () => {
      const notification = {
        id: "1",
        uuid: "uuid",
        userId: "u1",
        transactionId: "t1",
        commentId: "c1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(isCommentNotification(notification)).toBe(true);
    });

    test("isCommentNotification returns false for like notification", () => {
      const notification = {
        id: "1",
        uuid: "uuid",
        userId: "u1",
        transactionId: "t1",
        likeId: "l1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(isCommentNotification(notification)).toBe(false);
    });

    test("isLikeNotification returns true for like notification", () => {
      const notification = {
        id: "1",
        uuid: "uuid",
        userId: "u1",
        transactionId: "t1",
        likeId: "l1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(isLikeNotification(notification)).toBe(true);
    });

    test("isLikeNotification returns false for payment notification", () => {
      const notification = {
        id: "1",
        uuid: "uuid",
        userId: "u1",
        transactionId: "t1",
        status: PaymentNotificationStatus.received,
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(isLikeNotification(notification)).toBe(false);
    });

    test("isPaymentNotification returns true for payment notification", () => {
      const notification = {
        id: "1",
        uuid: "uuid",
        userId: "u1",
        transactionId: "t1",
        status: PaymentNotificationStatus.received,
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(isPaymentNotification(notification)).toBe(true);
    });

    test("isPaymentNotification returns false for like notification", () => {
      const notification = {
        id: "1",
        uuid: "uuid",
        userId: "u1",
        transactionId: "t1",
        likeId: "l1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(isPaymentNotification(notification)).toBe(false);
    });

    test("isPaymentRequestedNotification returns true for requested", () => {
      const notification = {
        id: "1",
        uuid: "uuid",
        userId: "u1",
        transactionId: "t1",
        status: PaymentNotificationStatus.requested,
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(isPaymentRequestedNotification(notification)).toBe(true);
    });

    test("isPaymentRequestedNotification returns false for received", () => {
      const notification = {
        id: "1",
        uuid: "uuid",
        userId: "u1",
        transactionId: "t1",
        status: PaymentNotificationStatus.received,
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(isPaymentRequestedNotification(notification)).toBe(false);
    });

    test("isPaymentReceivedNotification returns true for received", () => {
      const notification = {
        id: "1",
        uuid: "uuid",
        userId: "u1",
        transactionId: "t1",
        status: PaymentNotificationStatus.received,
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(isPaymentReceivedNotification(notification)).toBe(true);
    });

    test("isPaymentReceivedNotification returns false for requested", () => {
      const notification = {
        id: "1",
        uuid: "uuid",
        userId: "u1",
        transactionId: "t1",
        status: PaymentNotificationStatus.requested,
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      expect(isPaymentReceivedNotification(notification)).toBe(false);
    });
  });

  describe("currentUserLikesTransaction", () => {
    test("returns true when user has liked", () => {
      const user = createFakeUser({ id: "user1" });
      const txResponse: TransactionResponseItem = {
        ...createFakeTransaction(),
        receiverName: "Receiver",
        receiverAvatar: "/avatar.png",
        senderName: "Sender",
        senderAvatar: "/avatar.png",
        likes: [
          {
            id: "like1",
            uuid: "uuid",
            userId: "user1",
            transactionId: "tx1",
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        ],
        comments: [],
      };
      expect(currentUserLikesTransaction(user, txResponse)).toBe(true);
    });

    test("returns false when user has not liked", () => {
      const user = createFakeUser({ id: "user1" });
      const txResponse: TransactionResponseItem = {
        ...createFakeTransaction(),
        receiverName: "Receiver",
        receiverAvatar: "/avatar.png",
        senderName: "Sender",
        senderAvatar: "/avatar.png",
        likes: [
          {
            id: "like1",
            uuid: "uuid",
            userId: "other-user",
            transactionId: "tx1",
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        ],
        comments: [],
      };
      expect(currentUserLikesTransaction(user, txResponse)).toBe(false);
    });

    test("returns false when no likes", () => {
      const user = createFakeUser({ id: "user1" });
      const txResponse: TransactionResponseItem = {
        ...createFakeTransaction(),
        receiverName: "Receiver",
        receiverAvatar: "/avatar.png",
        senderName: "Sender",
        senderAvatar: "/avatar.png",
        likes: [],
        comments: [],
      };
      expect(currentUserLikesTransaction(user, txResponse)).toBe(false);
    });
  });

  describe("query field helpers", () => {
    test("hasDateQueryFields returns true when both fields present", () => {
      expect(
        hasDateQueryFields({
          dateRangeStart: "2023-01-01",
          dateRangeEnd: "2023-12-31",
        })
      ).toBe(true);
    });

    test("hasDateQueryFields returns false when fields missing", () => {
      expect(hasDateQueryFields({})).toBe(false);
    });

    test("getDateQueryFields extracts date fields", () => {
      const query = {
        dateRangeStart: "2023-01-01",
        dateRangeEnd: "2023-12-31",
        status: TransactionStatus.complete,
      };
      const result = getDateQueryFields(query);
      expect(result).toEqual({
        dateRangeStart: "2023-01-01",
        dateRangeEnd: "2023-12-31",
      });
    });

    test("omitDateQueryFields removes date fields", () => {
      const query = {
        dateRangeStart: "2023-01-01",
        dateRangeEnd: "2023-12-31",
        status: TransactionStatus.complete,
      };
      const result = omitDateQueryFields(query);
      expect(result).toEqual({ status: "complete" });
    });

    test("hasAmountQueryFields returns true when both fields present", () => {
      expect(hasAmountQueryFields({ amountMin: 0, amountMax: 100 })).toBe(true);
    });

    test("hasAmountQueryFields returns false when fields missing", () => {
      expect(hasAmountQueryFields({})).toBe(false);
    });

    test("getAmountQueryFields extracts amount fields", () => {
      const query = {
        amountMin: 10,
        amountMax: 100,
        status: TransactionStatus.complete,
      };
      const result = getAmountQueryFields(query);
      expect(result).toEqual({ amountMin: 10, amountMax: 100 });
    });

    test("omitAmountQueryFields removes amount fields", () => {
      const query = {
        amountMin: 10,
        amountMax: 100,
        status: TransactionStatus.complete,
      };
      const result = omitAmountQueryFields(query);
      expect(result).toEqual({ status: "complete" });
    });

    test("hasPaginationQueryFields returns true when both fields present", () => {
      expect(hasPaginationQueryFields({ page: 1, limit: 10 })).toBe(true);
    });

    test("hasPaginationQueryFields returns false when fields missing", () => {
      expect(hasPaginationQueryFields({})).toBe(false);
    });

    test("omitPaginationQueryFields removes pagination fields", () => {
      const query = { page: 1, limit: 10, status: TransactionStatus.complete };
      const result = omitPaginationQueryFields(query);
      expect(result).toEqual({ status: "complete" });
    });
  });

  describe("getQueryWithoutDateFields", () => {
    test("removes date fields when present", () => {
      const query = {
        dateRangeStart: "2023-01-01",
        dateRangeEnd: "2023-12-31",
        status: TransactionStatus.complete,
      };
      expect(getQueryWithoutDateFields(query)).toEqual({
        status: "complete",
      });
    });

    test("returns query unchanged when no date fields", () => {
      const query = { status: TransactionStatus.complete };
      expect(getQueryWithoutDateFields(query)).toEqual({
        status: "complete",
      });
    });
  });

  describe("getQueryWithoutAmountFields", () => {
    test("removes amount fields when present", () => {
      const query = {
        amountMin: 10,
        amountMax: 100,
        status: TransactionStatus.complete,
      };
      expect(getQueryWithoutAmountFields(query)).toEqual({
        status: "complete",
      });
    });

    test("returns query unchanged when no amount fields", () => {
      const query = { status: TransactionStatus.complete };
      expect(getQueryWithoutAmountFields(query)).toEqual({
        status: "complete",
      });
    });
  });

  describe("getQueryWithoutFilterFields", () => {
    test("removes all filter fields", () => {
      const query = {
        amountMin: 10,
        amountMax: 100,
        dateRangeStart: "2023-01-01",
        dateRangeEnd: "2023-12-31",
        page: 1,
        limit: 10,
        status: TransactionStatus.complete,
      };
      expect(getQueryWithoutFilterFields(query)).toEqual({
        status: "complete",
      });
    });
  });

  describe("padAmountWithZeros", () => {
    test("pads amount correctly", () => {
      expect(padAmountWithZeros(10)).toBe(10000);
    });

    test("pads decimal amount correctly", () => {
      expect(padAmountWithZeros(1.5)).toBe(1500);
    });
  });

  describe("amountRangeValueText", () => {
    test("formats amount range value", () => {
      const result = amountRangeValueText(10);
      expect(result).toContain("$");
    });
  });

  describe("amountRangeValueTextLabel", () => {
    test("formats amount range label", () => {
      const result = amountRangeValueTextLabel(10);
      expect(result).toContain("$");
    });
  });

  describe("formatAmountRangeValues", () => {
    test("formats range values as string", () => {
      const result = formatAmountRangeValues([0, 100]);
      expect(result).toContain(" - ");
      expect(result).toContain("$");
    });
  });

  describe("getPaginatedItems", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

    test("returns first page correctly", () => {
      const result = getPaginatedItems(1, 10, items);
      expect(result.data.length).toBe(10);
      expect(result.totalPages).toBe(3);
    });

    test("returns second page correctly", () => {
      const result = getPaginatedItems(2, 10, items);
      expect(result.data.length).toBe(10);
    });

    test("returns last page with remaining items", () => {
      const result = getPaginatedItems(3, 10, items);
      expect(result.data.length).toBe(5);
    });

    test("returns empty for page beyond range", () => {
      const result = getPaginatedItems(10, 10, items);
      expect(result.data.length).toBe(0);
    });
  });

  describe("date utility functions", () => {
    const testIsoString = "2023-06-15T14:30:45.123Z";

    test("isoStringToLocalMidnightStart returns midnight start", () => {
      const result = isoStringToLocalMidnightStart(testIsoString);
      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    test("isoStringToLocalMidnightEnd returns end of day", () => {
      const result = isoStringToLocalMidnightEnd(testIsoString);
      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
    });

    test("isoStringToLocalDateFull returns full date", () => {
      const result = isoStringToLocalDateFull(testIsoString);
      expect(result).toBeInstanceOf(Date);
    });

    test("localDateToIsoString converts date to ISO string", () => {
      const date = new Date(2023, 5, 15, 14, 30, 45);
      const result = localDateToIsoString(date);
      expect(result).toContain("T");
      expect(result).toContain("Z");
    });

    test("localDateToUTCISOString converts Date to UTC ISO string", () => {
      const date = new Date(2023, 5, 15, 14, 30, 45, 123);
      const result = localDateToUTCISOString(date);
      expect(result).toContain("T");
      expect(result).toContain("Z");
    });

    test("localDateToUTCISOString returns current time for non-Date input", () => {
      const result = localDateToUTCISOString(null);
      expect(result).toContain("T");
      expect(result).toContain("Z");
    });
  });

  describe("startOfDayUTC", () => {
    test("returns start of day in UTC", () => {
      const date = new Date(2023, 5, 15, 14, 30, 45);
      const result = startOfDayUTC(date);
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
    });

    test("handles non-date input by using current date", () => {
      // @ts-ignore - testing edge case
      const result = startOfDayUTC("not a date");
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCHours()).toBe(0);
    });
  });

  describe("endOfDayUTC", () => {
    test("returns end of day in UTC", () => {
      const date = new Date(2023, 5, 15, 14, 30, 45);
      const result = endOfDayUTC(date);
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCHours()).toBe(23);
      expect(result.getUTCMinutes()).toBe(59);
      expect(result.getUTCSeconds()).toBe(59);
    });

    test("handles non-date input by using current date", () => {
      // @ts-ignore - testing edge case
      const result = endOfDayUTC("not a date");
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCHours()).toBe(23);
    });
  });
});
