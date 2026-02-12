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

  const fakeUser = (overrides?: Partial<User>): User => ({
    id: shortid(),
    uuid: faker.datatype.uuid(),
    firstName: "John",
    lastName: "Doe",
    username: faker.internet.userName(),
    password: "abc123",
    email: faker.internet.email(),
    phoneNumber: faker.phone.phoneNumber(),
    avatar: faker.internet.avatar(),
    defaultPrivacyLevel: DefaultPrivacyLevel.public,
    balance: 10000,
    createdAt: faker.date.past(),
    modifiedAt: faker.date.recent(),
    ...overrides,
  });

  describe("isPendingRequestTransaction", () => {
    test("returns true for pending request", () => {
      const tx = fakeTransaction(TransactionRequestStatus.pending);
      expect(isPendingRequestTransaction(tx)).toBe(true);
    });

    test("returns false for accepted request", () => {
      const tx = fakeTransaction(TransactionRequestStatus.accepted);
      expect(isPendingRequestTransaction(tx)).toBe(false);
    });

    test("returns false for rejected request", () => {
      const tx = fakeTransaction(TransactionRequestStatus.rejected);
      expect(isPendingRequestTransaction(tx)).toBe(false);
    });
  });

  describe("isAcceptedRequestTransaction", () => {
    test("returns true for accepted request", () => {
      const tx = fakeTransaction(TransactionRequestStatus.accepted);
      expect(isAcceptedRequestTransaction(tx)).toBe(true);
    });

    test("returns false for pending request", () => {
      const tx = fakeTransaction(TransactionRequestStatus.pending);
      expect(isAcceptedRequestTransaction(tx)).toBe(false);
    });
  });

  describe("isRejectedRequestTransaction", () => {
    test("returns true for rejected request", () => {
      const tx = fakeTransaction(TransactionRequestStatus.rejected);
      expect(isRejectedRequestTransaction(tx)).toBe(true);
    });

    test("returns false for pending request", () => {
      const tx = fakeTransaction(TransactionRequestStatus.pending);
      expect(isRejectedRequestTransaction(tx)).toBe(false);
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

    test("formats large amount without decimals", () => {
      expect(formatAmountSlider(100000)).toBe("$1,000");
    });
  });

  describe("payAppDifference", () => {
    test("returns the difference between balance and amount", () => {
      const user = fakeUser({ balance: 5000 });
      const tx = fakeTransaction();
      (tx as any).amount = 3000;
      const result = payAppDifference(user, tx);
      expect(result.getAmount()).toBe(2000);
    });
  });

  describe("payAppAddition", () => {
    test("returns the sum of balance and amount", () => {
      const user = fakeUser({ balance: 5000 });
      const tx = fakeTransaction();
      (tx as any).amount = 3000;
      const result = payAppAddition(user, tx);
      expect(result.getAmount()).toBe(8000);
    });
  });

  describe("getChargeAmount", () => {
    test("returns absolute difference", () => {
      const user = fakeUser({ balance: 3000 });
      const tx = fakeTransaction();
      (tx as any).amount = 5000;
      expect(getChargeAmount(user, tx)).toBe(2000);
    });
  });

  describe("getTransferAmount", () => {
    test("returns absolute difference", () => {
      const user = fakeUser({ balance: 3000 });
      const tx = fakeTransaction();
      (tx as any).amount = 5000;
      expect(getTransferAmount(user, tx)).toBe(2000);
    });
  });

  describe("getPayAppCreditedAmount", () => {
    test("returns sum of balance and amount", () => {
      const user = fakeUser({ balance: 5000 });
      const tx = fakeTransaction();
      (tx as any).amount = 3000;
      expect(getPayAppCreditedAmount(user, tx)).toBe(8000);
    });
  });

  describe("hasSufficientFunds", () => {
    test("returns true when balance exceeds amount", () => {
      const user = fakeUser({ balance: 10000 });
      const tx = fakeTransaction();
      (tx as any).amount = 5000;
      expect(hasSufficientFunds(user, tx)).toBe(true);
    });

    test("returns false when amount exceeds balance", () => {
      const user = fakeUser({ balance: 1000 });
      const tx = fakeTransaction();
      (tx as any).amount = 5000;
      expect(hasSufficientFunds(user, tx)).toBe(false);
    });
  });

  describe("receiverIsCurrentUser", () => {
    test("returns true when user id matches receiverId", () => {
      const user = fakeUser({ id: "user-1" });
      const tx = fakeTransaction();
      (tx as any).receiverId = "user-1";
      expect(receiverIsCurrentUser(user, tx)).toBe(true);
    });

    test("returns false when user id does not match receiverId", () => {
      const user = fakeUser({ id: "user-1" });
      const tx = fakeTransaction();
      (tx as any).receiverId = "user-2";
      expect(receiverIsCurrentUser(user, tx)).toBe(false);
    });
  });

  describe("padAmountWithZeros", () => {
    test("pads number by multiplying by 1000 and ceiling", () => {
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
    test("returns formatted range string", () => {
      const result = formatAmountRangeValues([0, 10]);
      expect(result).toBe("$0 - $100");
    });
  });

  describe("formatFullName", () => {
    test("returns first and last name joined by space", () => {
      const user = fakeUser({ firstName: "Jane", lastName: "Smith" });
      expect(formatFullName(user)).toBe("Jane Smith");
    });
  });

  describe("isCommentNotification", () => {
    test("returns true for comment notification", () => {
      const notification = {
        id: "1",
        uuid: "uuid-1",
        userId: "u1",
        transactionId: "t1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
        commentId: "c1",
      };
      expect(isCommentNotification(notification)).toBe(true);
    });

    test("returns false for non-comment notification", () => {
      const notification = {
        id: "1",
        uuid: "uuid-1",
        userId: "u1",
        transactionId: "t1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
        likeId: "l1",
      };
      expect(isCommentNotification(notification)).toBe(false);
    });
  });

  describe("isLikeNotification", () => {
    test("returns true for like notification", () => {
      const notification = {
        id: "1",
        uuid: "uuid-1",
        userId: "u1",
        transactionId: "t1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
        likeId: "l1",
      };
      expect(isLikeNotification(notification)).toBe(true);
    });

    test("returns false for non-like notification", () => {
      const notification = {
        id: "1",
        uuid: "uuid-1",
        userId: "u1",
        transactionId: "t1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
        commentId: "c1",
      };
      expect(isLikeNotification(notification)).toBe(false);
    });
  });

  describe("isPaymentNotification", () => {
    test("returns true for payment notification", () => {
      const notification = {
        id: "1",
        uuid: "uuid-1",
        userId: "u1",
        transactionId: "t1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
        status: PaymentNotificationStatus.received,
      };
      expect(isPaymentNotification(notification)).toBe(true);
    });

    test("returns false for non-payment notification", () => {
      const notification = {
        id: "1",
        uuid: "uuid-1",
        userId: "u1",
        transactionId: "t1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
        likeId: "l1",
      };
      expect(isPaymentNotification(notification)).toBe(false);
    });
  });

  describe("isPaymentRequestedNotification", () => {
    test("returns true for requested status", () => {
      const notification = {
        id: "1",
        uuid: "uuid-1",
        userId: "u1",
        transactionId: "t1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
        status: PaymentNotificationStatus.requested,
      };
      expect(isPaymentRequestedNotification(notification)).toBe(true);
    });

    test("returns false for received status", () => {
      const notification = {
        id: "1",
        uuid: "uuid-1",
        userId: "u1",
        transactionId: "t1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
        status: PaymentNotificationStatus.received,
      };
      expect(isPaymentRequestedNotification(notification)).toBe(false);
    });
  });

  describe("isPaymentReceivedNotification", () => {
    test("returns true for received status", () => {
      const notification = {
        id: "1",
        uuid: "uuid-1",
        userId: "u1",
        transactionId: "t1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
        status: PaymentNotificationStatus.received,
      };
      expect(isPaymentReceivedNotification(notification)).toBe(true);
    });

    test("returns false for requested status", () => {
      const notification = {
        id: "1",
        uuid: "uuid-1",
        userId: "u1",
        transactionId: "t1",
        isRead: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
        status: PaymentNotificationStatus.requested,
      };
      expect(isPaymentReceivedNotification(notification)).toBe(false);
    });
  });

  describe("getPaginatedItems", () => {
    const items = Array.from({ length: 25 }, (_, i) => i);

    test("returns first page with correct limit", () => {
      const result = getPaginatedItems(1, 10, items);
      expect(result.data).toHaveLength(10);
      expect(result.totalPages).toBe(3);
    });

    test("returns second page", () => {
      const result = getPaginatedItems(2, 10, items);
      expect(result.data).toHaveLength(10);
      expect(result.data[0]).toBe(10);
    });

    test("returns last page with remaining items", () => {
      const result = getPaginatedItems(3, 10, items);
      expect(result.data).toHaveLength(5);
    });
  });

  describe("isoStringToLocalMidnightStart", () => {
    test("returns date with hours=0, minutes=0, seconds=0", () => {
      const date = isoStringToLocalMidnightStart("2023-06-15T14:30:00.000Z");
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
      expect(date.getMilliseconds()).toBe(0);
    });
  });

  describe("isoStringToLocalMidnightEnd", () => {
    test("returns date with hours=23, minutes=59, seconds=59, ms=999", () => {
      const date = isoStringToLocalMidnightEnd("2023-06-15T14:30:00.000Z");
      expect(date.getHours()).toBe(23);
      expect(date.getMinutes()).toBe(59);
      expect(date.getSeconds()).toBe(59);
      expect(date.getMilliseconds()).toBe(999);
    });
  });

  describe("isoStringToLocalDateFull", () => {
    test("returns date preserving the UTC time components", () => {
      const date = isoStringToLocalDateFull("2023-06-15T14:30:45.123Z");
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(5);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
      expect(date.getSeconds()).toBe(45);
    });
  });
});
