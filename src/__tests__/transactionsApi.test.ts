import { describe, expect, it, beforeEach } from "vitest";
import {
  seedDatabase,
  getAllUsers,
  getBankAccountsByUserId,
  createTransaction,
  getTransactionById,
  getTransactionByIdForApi,
  formatTransactionForApiResponse,
  formatTransactionsForApiResponse,
  getAllTransactionsForUserByObj,
  getTransactionsForUserByObj,
  getTransactionsForUserContacts,
  getPublicTransactionsByQuery,
  getUnreadNotificationsByUserId,
  formatNotificationForApiResponse,
  createPaymentNotification,
  createLikeNotification,
  createCommentNotification,
  createLike,
  createComment,
  createLikes,
  createComments,
  getNotificationsByUserId,
  getLikesByTransactionId,
  getCommentsByTransactionId,
  getTransactionsByUserId,
  getUserById,
} from "../../backend/database";
import {
  User,
  Transaction,
  TransactionStatus,
  DefaultPrivacyLevel,
  PaymentNotificationStatus,
  TransactionPayload,
} from "../models";
import { getFakeAmount } from "../utils/transactionUtils";

describe("Transactions API Formatting", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should format a single transaction for API response", () => {
    const users = getAllUsers();
    const user: User = users[0];
    const transactions = getTransactionsByUserId(user.id);
    const transaction = transactions[0];

    const formatted = formatTransactionForApiResponse(transaction);

    expect(formatted.receiverName).toBeDefined();
    expect(formatted.senderName).toBeDefined();
    expect(formatted.receiverAvatar).toBeDefined();
    expect(formatted.senderAvatar).toBeDefined();
    expect(formatted.likes).toBeDefined();
    expect(formatted.comments).toBeDefined();
    expect(formatted.id).toBe(transaction.id);
  });

  it("should format transactions for API response sorted by modifiedAt desc", () => {
    const user: User = getAllUsers()[0];
    const transactions = getTransactionsByUserId(user.id);

    const formatted = formatTransactionsForApiResponse(transactions.slice(0, 5));

    expect(formatted.length).toBe(5);
    // Verify descending order by modifiedAt
    for (let i = 0; i < formatted.length - 1; i++) {
      const current = new Date(formatted[i].modifiedAt).getTime();
      const next = new Date(formatted[i + 1].modifiedAt).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it("should get a transaction by id for API response with extra fields", () => {
    const user: User = getAllUsers()[0];
    const transactions = getTransactionsByUserId(user.id);
    const transaction = transactions[0];

    const apiTransaction = getTransactionByIdForApi(transaction.id);

    expect(apiTransaction.id).toBe(transaction.id);
    expect(apiTransaction.receiverName).toBeDefined();
    expect(apiTransaction.senderName).toBeDefined();
    expect(apiTransaction.likes).toBeDefined();
    expect(apiTransaction.comments).toBeDefined();
  });
});

describe("Transactions Filtering", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should get all transactions for a user by query object", () => {
    const user: User = getAllUsers()[0];
    const result = getAllTransactionsForUserByObj(user.id, {});
    expect(result.length).toBeGreaterThan(0);

    // Every returned transaction should involve the user as sender or receiver
    result.forEach((txn: Transaction) => {
      const involvesUser = txn.senderId === user.id || txn.receiverId === user.id;
      expect(involvesUser).toBe(true);
    });
  });

  it("should filter transactions by status", () => {
    const user: User = getAllUsers()[0];
    const result = getTransactionsForUserByObj(user.id, { status: "complete" });

    result.forEach((txn: Transaction) => {
      expect(txn.status).toBe("complete");
    });
  });

  it("should filter transactions by date range", () => {
    const user: User = getAllUsers()[0];
    const result = getAllTransactionsForUserByObj(user.id, {
      dateRangeStart: new Date("Jan 01 2023"),
      dateRangeEnd: new Date("Dec 31 2025"),
    });

    expect(result.length).toBeGreaterThan(0);
    result.forEach((txn: Transaction) => {
      const txnDate = new Date(txn.createdAt);
      expect(txnDate.getTime()).toBeGreaterThanOrEqual(new Date("Jan 01 2023").getTime());
      expect(txnDate.getTime()).toBeLessThanOrEqual(new Date("Dec 31 2025").getTime());
    });
  });

  it("should get public transactions by query with amount filter", () => {
    const user: User = getAllUsers()[0];
    const result = getPublicTransactionsByQuery(user.id, {
      amountMin: 1,
      amountMax: 999999999,
    });

    expect(result.contactsTransactions).toBeDefined();
    expect(result.publicTransactions).toBeDefined();
  });

  it("should get public transactions by query without filters (default sort)", () => {
    const user: User = getAllUsers()[0];
    const result = getPublicTransactionsByQuery(user.id, {});

    expect(result.contactsTransactions).toBeDefined();
    expect(result.publicTransactions).toBeDefined();
    expect(result.contactsTransactions.length).toBeGreaterThan(0);
    expect(result.publicTransactions.length).toBeGreaterThan(0);
  });
});

describe("Notifications API Formatting", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should format a payment notification for API response", () => {
    const user: User = getAllUsers()[0];
    const transactions = getTransactionsByUserId(user.id);
    const transaction = transactions[0];

    const notification = createPaymentNotification(
      user.id,
      transaction.id,
      PaymentNotificationStatus.received
    );

    const formatted = formatNotificationForApiResponse(notification);
    expect(formatted.userFullName).toBeDefined();
    expect(formatted.transactionId).toBe(transaction.id);
  });

  it("should format a like notification for API response", () => {
    const user: User = getAllUsers()[0];
    const transactions = getTransactionsByUserId(user.id);
    const transaction = transactions[0];
    const like = createLike(user.id, transaction.id);

    const notification = createLikeNotification(user.id, transaction.id, like.id);
    const formatted = formatNotificationForApiResponse(notification);

    expect(formatted.userFullName).toBeDefined();
    expect(formatted.transactionId).toBe(transaction.id);
  });

  it("should format a comment notification for API response", () => {
    const user: User = getAllUsers()[0];
    const transactions = getTransactionsByUserId(user.id);
    const transaction = transactions[0];
    const comment = createComment(user.id, transaction.id, "Test comment");

    const notification = createCommentNotification(user.id, transaction.id, comment.id);
    const formatted = formatNotificationForApiResponse(notification);

    expect(formatted.userFullName).toBeDefined();
    expect(formatted.transactionId).toBe(transaction.id);
  });

  it("should retrieve unread notifications for a user", () => {
    const user: User = getAllUsers()[0];

    const unreadNotifications = getUnreadNotificationsByUserId(user.id);
    // All returned notifications should be unread
    unreadNotifications.forEach((n: any) => {
      expect(n.isRead).toBe(false);
    });
  });
});

describe("Create Likes with Notifications", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should create a like and associated notifications via createLikes", () => {
    const user: User = getAllUsers()[0];
    const transactions = getTransactionsByUserId(user.id);
    const transaction = transactions[0];

    const likesBefore = getLikesByTransactionId(transaction.id);

    createLikes(user.id, transaction.id);

    const likesAfter = getLikesByTransactionId(transaction.id);
    expect(likesAfter.length).toBe(likesBefore.length + 1);
  });
});

describe("Create Comments with Notifications", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should create a comment and associated notifications via createComments", () => {
    const user: User = getAllUsers()[0];
    const transactions = getTransactionsByUserId(user.id);
    const transaction = transactions[0];

    const commentsBefore = getCommentsByTransactionId(transaction.id);

    createComments(user.id, transaction.id, "A new comment");

    const commentsAfter = getCommentsByTransactionId(transaction.id);
    expect(commentsAfter.length).toBe(commentsBefore.length + 1);
    expect(commentsAfter[commentsAfter.length - 1].content).toBe("A new comment");
  });
});
