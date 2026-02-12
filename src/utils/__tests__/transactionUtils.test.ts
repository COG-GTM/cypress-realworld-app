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

  const fakeUser = (overrides: Record<string, unknown> = {}) => ({
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

  describe("request status helpers", () => {
    test("isPendingRequestTransaction", () => {
      expect(isPendingRequestTransaction(fakeTransaction(TransactionRequestStatus.pending))).toBe(true);
      expect(isPendingRequestTransaction(fakeTransaction(TransactionRequestStatus.accepted))).toBe(false);
      expect(isPendingRequestTransaction(fakeTransaction())).toBe(false);
    });

    test("isAcceptedRequestTransaction", () => {
      expect(isAcceptedRequestTransaction(fakeTransaction(TransactionRequestStatus.accepted))).toBe(true);
      expect(isAcceptedRequestTransaction(fakeTransaction(TransactionRequestStatus.pending))).toBe(false);
    });

    test("isRejectedRequestTransaction", () => {
      expect(isRejectedRequestTransaction(fakeTransaction(TransactionRequestStatus.rejected))).toBe(true);
      expect(isRejectedRequestTransaction(fakeTransaction(TransactionRequestStatus.pending))).toBe(false);
    });
  });

  describe("amount formatting helpers", () => {
    test("formatAmount", () => {
      expect(formatAmount(1050)).toBe("$10.50");
      expect(formatAmount(0)).toBe("$0.00");
      expect(formatAmount(100000)).toBe("$1,000.00");
    });

    test("formatAmountSlider", () => {
      expect(formatAmountSlider(100000)).toBe("$1,000");
      expect(formatAmountSlider(0)).toBe("$0");
    });

    test("padAmountWithZeros", () => {
      expect(padAmountWithZeros(10)).toBe(10000);
      expect(padAmountWithZeros(1.5)).toBe(1500);
    });

    test("amountRangeValueText", () => {
      expect(amountRangeValueText(10)).toBe("$100.00");
    });

    test("formatAmountRangeValues", () => {
      expect(formatAmountRangeValues([0, 100])).toBe("$0 - $1,000");
    });
  });

  describe("pay app arithmetic helpers", () => {
    test("payAppDifference", () => {
      const user = fakeUser({ balance: 50000 });
      const tx = { ...fakeTransaction(), amount: 10000 };
      expect(payAppDifference(user as any, tx as any).getAmount()).toBe(40000);

      const user2 = fakeUser({ balance: 10000 });
      const tx2 = { ...fakeTransaction(), amount: 50000 };
      expect(payAppDifference(user2 as any, tx2 as any).getAmount()).toBe(-40000);
    });

    test("payAppAddition", () => {
      const user = fakeUser({ balance: 50000 });
      const tx = { ...fakeTransaction(), amount: 10000 };
      expect(payAppAddition(user as any, tx as any).getAmount()).toBe(60000);
    });

    test("getChargeAmount", () => {
      const user = fakeUser({ balance: 50000 });
      const tx = { ...fakeTransaction(), amount: 10000 };
      expect(getChargeAmount(user as any, tx as any)).toBe(40000);
    });

    test("getTransferAmount", () => {
      const user = fakeUser({ balance: 10000 });
      const tx = { ...fakeTransaction(), amount: 50000 };
      expect(getTransferAmount(user as any, tx as any)).toBe(40000);
    });

    test("getPayAppCreditedAmount", () => {
      const user = fakeUser({ balance: 50000 });
      const tx = { ...fakeTransaction(), amount: 10000 };
      expect(getPayAppCreditedAmount(user as any, tx as any)).toBe(60000);
    });

    test("hasSufficientFunds", () => {
      const user = fakeUser({ balance: 50000 });
      const tx = { ...fakeTransaction(), amount: 10000 };
      expect(hasSufficientFunds(user as any, tx as any)).toBe(true);

      const user2 = fakeUser({ balance: 10000 });
      const tx2 = { ...fakeTransaction(), amount: 50000 };
      expect(hasSufficientFunds(user2 as any, tx2 as any)).toBe(false);
    });

    test("receiverIsCurrentUser", () => {
      const user = fakeUser({ id: "user123" });
      const tx = { ...fakeTransaction(), receiverId: "user123" };
      const tx2 = { ...fakeTransaction(), receiverId: "other456" };

      expect(receiverIsCurrentUser(user as any, tx as any)).toBe(true);
      expect(receiverIsCurrentUser(user as any, tx2 as any)).toBe(false);
    });
  });

  describe("formatFullName", () => {
    test("joins first and last name", () => {
      const user = fakeUser({ firstName: "John", lastName: "Doe" });
      expect(formatFullName(user as any)).toBe("John Doe");
    });
  });

  describe("notification type helpers", () => {
    test("isCommentNotification", () => {
      expect(
        isCommentNotification({
          id: "1",
          uuid: "uuid",
          userId: "u1",
          transactionId: "t1",
          commentId: "c1",
          isRead: false,
          createdAt: new Date(),
          modifiedAt: new Date(),
        } as any)
      ).toBe(true);

      expect(
        isCommentNotification({
          id: "1",
          uuid: "uuid",
          userId: "u1",
          transactionId: "t1",
          likeId: "l1",
          isRead: false,
          createdAt: new Date(),
          modifiedAt: new Date(),
        } as any)
      ).toBe(false);
    });

    test("isLikeNotification", () => {
      expect(
        isLikeNotification({
          id: "1",
          uuid: "uuid",
          userId: "u1",
          transactionId: "t1",
          likeId: "l1",
          isRead: false,
          createdAt: new Date(),
          modifiedAt: new Date(),
        } as any)
      ).toBe(true);

      expect(
        isLikeNotification({
          id: "1",
          uuid: "uuid",
          userId: "u1",
          transactionId: "t1",
          commentId: "c1",
          isRead: false,
          createdAt: new Date(),
          modifiedAt: new Date(),
        } as any)
      ).toBe(false);
    });

    test("isPaymentNotification", () => {
      expect(
        isPaymentNotification({
          id: "1",
          uuid: "uuid",
          userId: "u1",
          transactionId: "t1",
          status: PaymentNotificationStatus.received,
          isRead: false,
          createdAt: new Date(),
          modifiedAt: new Date(),
        } as any)
      ).toBe(true);

      expect(
        isPaymentNotification({
          id: "1",
          uuid: "uuid",
          userId: "u1",
          transactionId: "t1",
          likeId: "l1",
          isRead: false,
          createdAt: new Date(),
          modifiedAt: new Date(),
        } as any)
      ).toBe(false);
    });

    test("isPaymentRequestedNotification", () => {
      expect(
        isPaymentRequestedNotification({
          status: PaymentNotificationStatus.requested,
        } as any)
      ).toBe(true);

      expect(
        isPaymentRequestedNotification({
          status: PaymentNotificationStatus.received,
        } as any)
      ).toBe(false);
    });

    test("isPaymentReceivedNotification", () => {
      expect(
        isPaymentReceivedNotification({
          status: PaymentNotificationStatus.received,
        } as any)
      ).toBe(true);

      expect(
        isPaymentReceivedNotification({
          status: PaymentNotificationStatus.requested,
        } as any)
      ).toBe(false);
    });
  });

  describe("getPaginatedItems", () => {
    test("paginates items", () => {
      const items = Array.from({ length: 25 }, (_, i) => i);
      const page1 = getPaginatedItems(1, 10, items);
      expect(page1.data).toHaveLength(10);
      expect(page1.totalPages).toBe(3);

      const page2 = getPaginatedItems(2, 10, items);
      expect(page2.data).toHaveLength(10);
      expect(page2.data[0]).toBe(10);

      const page3 = getPaginatedItems(3, 10, items);
      expect(page3.data).toHaveLength(5);
    });
  });

  describe("ISO string to local Date helpers", () => {
    test("isoStringToLocalMidnightStart", () => {
      const result = isoStringToLocalMidnightStart("2024-03-15T14:30:00.000Z");
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    test("isoStringToLocalMidnightEnd", () => {
      const result = isoStringToLocalMidnightEnd("2024-03-15T14:30:00.000Z");
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    test("isoStringToLocalDateFull", () => {
      const result = isoStringToLocalDateFull("2024-03-15T14:30:45.123Z");
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
      expect(result.getMilliseconds()).toBe(123);
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
