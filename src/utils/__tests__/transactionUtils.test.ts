import { describe, expect, test, it } from "vitest";
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

const fakeUser = (overrides?: Partial<User>): User => ({
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
  balance: 50000,
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

  describe("isPendingRequestTransaction", () => {
    it("returns true for pending request", () => {
      const tx = fakeTransaction(TransactionRequestStatus.pending);
      expect(isPendingRequestTransaction(tx)).toBe(true);
    });
    it("returns false for accepted request", () => {
      const tx = fakeTransaction(TransactionRequestStatus.accepted);
      expect(isPendingRequestTransaction(tx)).toBe(false);
    });
    it("returns false for non-request", () => {
      const tx = fakeTransaction();
      expect(isPendingRequestTransaction(tx)).toBe(false);
    });
  });

  describe("isAcceptedRequestTransaction", () => {
    it("returns true for accepted request", () => {
      const tx = fakeTransaction(TransactionRequestStatus.accepted);
      expect(isAcceptedRequestTransaction(tx)).toBe(true);
    });
    it("returns false for pending request", () => {
      const tx = fakeTransaction(TransactionRequestStatus.pending);
      expect(isAcceptedRequestTransaction(tx)).toBe(false);
    });
  });

  describe("isRejectedRequestTransaction", () => {
    it("returns true for rejected request", () => {
      const tx = fakeTransaction(TransactionRequestStatus.rejected);
      expect(isRejectedRequestTransaction(tx)).toBe(true);
    });
    it("returns false for pending request", () => {
      const tx = fakeTransaction(TransactionRequestStatus.pending);
      expect(isRejectedRequestTransaction(tx)).toBe(false);
    });
  });

  describe("formatAmount", () => {
    it("formats cents to dollar string", () => {
      expect(formatAmount(1050)).toBe("$10.50");
    });
    it("formats zero", () => {
      expect(formatAmount(0)).toBe("$0.00");
    });
    it("formats large amounts", () => {
      expect(formatAmount(100000)).toBe("$1,000.00");
    });
  });

  describe("formatAmountSlider", () => {
    it("formats amount without decimals", () => {
      expect(formatAmountSlider(1050)).toBe("$11");
    });
    it("formats zero", () => {
      expect(formatAmountSlider(0)).toBe("$0");
    });
  });

  describe("payAppDifference", () => {
    it("returns a Dinero object with the difference", () => {
      const user = fakeUser({ balance: 10000 });
      const tx = fakeTransaction();
      Object.assign(tx, { amount: 3000 });
      const result = payAppDifference(user, tx);
      expect(result.getAmount()).toBe(7000);
    });
  });

  describe("payAppAddition", () => {
    it("returns a Dinero object with the sum", () => {
      const user = fakeUser({ balance: 10000 });
      const tx = fakeTransaction();
      Object.assign(tx, { amount: 3000 });
      const result = payAppAddition(user, tx);
      expect(result.getAmount()).toBe(13000);
    });
  });

  describe("getChargeAmount", () => {
    it("returns absolute difference", () => {
      const user = fakeUser({ balance: 10000 });
      const tx = fakeTransaction();
      Object.assign(tx, { amount: 3000 });
      expect(getChargeAmount(user, tx)).toBe(7000);
    });
  });

  describe("getTransferAmount", () => {
    it("returns absolute difference for insufficient funds", () => {
      const user = fakeUser({ balance: 3000 });
      const tx = fakeTransaction();
      Object.assign(tx, { amount: 10000 });
      expect(getTransferAmount(user, tx)).toBe(7000);
    });
  });

  describe("getPayAppCreditedAmount", () => {
    it("returns sum of balance and amount", () => {
      const user = fakeUser({ balance: 10000 });
      const tx = fakeTransaction();
      Object.assign(tx, { amount: 5000 });
      expect(getPayAppCreditedAmount(user, tx)).toBe(15000);
    });
  });

  describe("hasSufficientFunds", () => {
    it("returns true when balance exceeds amount", () => {
      const user = fakeUser({ balance: 10000 });
      const tx = fakeTransaction();
      Object.assign(tx, { amount: 3000 });
      expect(hasSufficientFunds(user, tx)).toBe(true);
    });
    it("returns false when amount exceeds balance", () => {
      const user = fakeUser({ balance: 3000 });
      const tx = fakeTransaction();
      Object.assign(tx, { amount: 10000 });
      expect(hasSufficientFunds(user, tx)).toBe(false);
    });
  });

  describe("receiverIsCurrentUser", () => {
    it("returns true when user id matches receiverId", () => {
      const user = fakeUser({ id: "user-1" });
      const tx = fakeTransaction();
      Object.assign(tx, { receiverId: "user-1" });
      expect(receiverIsCurrentUser(user, tx)).toBe(true);
    });
    it("returns false when user id does not match", () => {
      const user = fakeUser({ id: "user-1" });
      const tx = fakeTransaction();
      Object.assign(tx, { receiverId: "user-2" });
      expect(receiverIsCurrentUser(user, tx)).toBe(false);
    });
  });

  describe("formatFullName", () => {
    it("returns first and last name joined", () => {
      const user = fakeUser({ firstName: "John", lastName: "Doe" });
      expect(formatFullName(user)).toBe("John Doe");
    });
  });

  describe("isCommentNotification", () => {
    it("returns true for comment notification", () => {
      const notification = {
        id: "1", uuid: "uuid-1", userId: "u1", transactionId: "t1",
        commentId: "c1", isRead: false, createdAt: new Date(), modifiedAt: new Date(),
      };
      expect(isCommentNotification(notification)).toBe(true);
    });
    it("returns false for like notification", () => {
      const notification = {
        id: "1", uuid: "uuid-1", userId: "u1", transactionId: "t1",
        likeId: "l1", isRead: false, createdAt: new Date(), modifiedAt: new Date(),
      };
      expect(isCommentNotification(notification)).toBe(false);
    });
  });

  describe("isLikeNotification", () => {
    it("returns true for like notification", () => {
      const notification = {
        id: "1", uuid: "uuid-1", userId: "u1", transactionId: "t1",
        likeId: "l1", isRead: false, createdAt: new Date(), modifiedAt: new Date(),
      };
      expect(isLikeNotification(notification)).toBe(true);
    });
    it("returns false for payment notification", () => {
      const notification = {
        id: "1", uuid: "uuid-1", userId: "u1", transactionId: "t1",
        status: PaymentNotificationStatus.received, isRead: false,
        createdAt: new Date(), modifiedAt: new Date(),
      };
      expect(isLikeNotification(notification)).toBe(false);
    });
  });

  describe("isPaymentNotification", () => {
    it("returns true for payment notification", () => {
      const notification = {
        id: "1", uuid: "uuid-1", userId: "u1", transactionId: "t1",
        status: PaymentNotificationStatus.received, isRead: false,
        createdAt: new Date(), modifiedAt: new Date(),
      };
      expect(isPaymentNotification(notification)).toBe(true);
    });
    it("returns false for like notification", () => {
      const notification = {
        id: "1", uuid: "uuid-1", userId: "u1", transactionId: "t1",
        likeId: "l1", isRead: false, createdAt: new Date(), modifiedAt: new Date(),
      };
      expect(isPaymentNotification(notification)).toBe(false);
    });
  });

  describe("isPaymentRequestedNotification", () => {
    it("returns true for requested status", () => {
      const notification = {
        id: "1", uuid: "uuid-1", userId: "u1", transactionId: "t1",
        status: PaymentNotificationStatus.requested, isRead: false,
        createdAt: new Date(), modifiedAt: new Date(),
      };
      expect(isPaymentRequestedNotification(notification)).toBe(true);
    });
    it("returns false for received status", () => {
      const notification = {
        id: "1", uuid: "uuid-1", userId: "u1", transactionId: "t1",
        status: PaymentNotificationStatus.received, isRead: false,
        createdAt: new Date(), modifiedAt: new Date(),
      };
      expect(isPaymentRequestedNotification(notification)).toBe(false);
    });
  });

  describe("isPaymentReceivedNotification", () => {
    it("returns true for received status", () => {
      const notification = {
        id: "1", uuid: "uuid-1", userId: "u1", transactionId: "t1",
        status: PaymentNotificationStatus.received, isRead: false,
        createdAt: new Date(), modifiedAt: new Date(),
      };
      expect(isPaymentReceivedNotification(notification)).toBe(true);
    });
    it("returns false for requested status", () => {
      const notification = {
        id: "1", uuid: "uuid-1", userId: "u1", transactionId: "t1",
        status: PaymentNotificationStatus.requested, isRead: false,
        createdAt: new Date(), modifiedAt: new Date(),
      };
      expect(isPaymentReceivedNotification(notification)).toBe(false);
    });
  });

  describe("getPaginatedItems", () => {
    it("returns correct page and total pages", () => {
      const items = Array.from({ length: 25 }, (_, i) => i);
      const result = getPaginatedItems(1, 10, items);
      expect(result.data.length).toBe(10);
      expect(result.totalPages).toBe(3);
    });
    it("returns correct items for page 2", () => {
      const items = Array.from({ length: 25 }, (_, i) => i);
      const result = getPaginatedItems(2, 10, items);
      expect(result.data.length).toBe(10);
      expect(result.data[0]).toBe(10);
    });
    it("returns remaining items on last page", () => {
      const items = Array.from({ length: 25 }, (_, i) => i);
      const result = getPaginatedItems(3, 10, items);
      expect(result.data.length).toBe(5);
    });
  });

  describe("padAmountWithZeros", () => {
    it("multiplies and ceils number by 1000", () => {
      expect(padAmountWithZeros(10)).toBe(10000);
      expect(padAmountWithZeros(1.5)).toBe(1500);
    });
  });

  describe("amountRangeValueText", () => {
    it("formats a value through pad and formatAmount", () => {
      const result = amountRangeValueText(10);
      expect(result).toBe("$100.00");
    });
  });

  describe("formatAmountRangeValues", () => {
    it("formats array of values into range string", () => {
      const result = formatAmountRangeValues([0, 100]);
      expect(result).toBe("$0 - $1,000");
    });
  });

  describe("isoStringToLocalMidnightStart", () => {
    it("returns date with time set to midnight start", () => {
      const result = isoStringToLocalMidnightStart("2024-06-15T14:30:00.000Z");
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe("isoStringToLocalMidnightEnd", () => {
    it("returns date with time set to end of day", () => {
      const result = isoStringToLocalMidnightEnd("2024-06-15T14:30:00.000Z");
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe("isoStringToLocalDateFull", () => {
    it("returns date preserving full time components", () => {
      const result = isoStringToLocalDateFull("2024-06-15T14:30:45.123Z");
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(5);
      expect(result.getFullYear()).toBe(2024);
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
});
