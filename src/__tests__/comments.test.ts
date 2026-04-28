import { describe, expect, it, beforeEach } from "vitest";
import {
  seedDatabase,
  getTransactionsForUserContacts,
  getAllUsers,
  getTransactionsByUserId,
  createComment,
  createComments,
  getCommentsByTransactionId,
  getTransactionById,
  getNotificationsByUserId,
} from "../../backend/database";

import { User, Transaction } from "../../src/models";

describe("Comments", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should comment a transaction for a contact", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsForUserContacts(user.id);

    const content = "This is my comment content";
    const comment = createComment(user.id, transactions[0].id, content);

    expect(comment.transactionId).toBe(transactions[0].id);
    expect(comment.content).toBe(content);

    expect(comment).toHaveProperty("id");
    expect(comment).toHaveProperty("uuid");
    expect(comment).toHaveProperty("content");
    expect(comment).toHaveProperty("userId");
    expect(comment).toHaveProperty("transactionId");
    expect(comment).toHaveProperty("createdAt");
    expect(comment).toHaveProperty("modifiedAt");
  });

  it("should get a list of comments for a transaction", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsByUserId(user.id);
    const transaction = transactions[0];

    createComment(user.id, transaction.id, "This is my comment");

    const comments = getCommentsByTransactionId(transaction.id);

    expect(comments[0].transactionId).toBe(transaction.id);
  });

  it("should create a comment and generate notifications for sender and receiver", () => {
    const users = getAllUsers();
    const transactions: Transaction[] = getTransactionsByUserId(users[0].id);
    const transaction = transactions[0];
    const { senderId, receiverId } = getTransactionById(transaction.id);

    // Pick a user who is NOT the sender or receiver to exercise the branch at line 675
    const thirdPartyUser = users.find(
      (u: User) => u.id !== senderId && u.id !== receiverId
    )!;

    const senderNotificationsBefore = getNotificationsByUserId(senderId);
    const receiverNotificationsBefore = getNotificationsByUserId(receiverId);

    createComments(thirdPartyUser.id, transaction.id, "Third-party comment");

    const comments = getCommentsByTransactionId(transaction.id);
    const createdComment = comments.find(
      (c) => c.content === "Third-party comment"
    );
    expect(createdComment).toBeDefined();
    expect(createdComment!.userId).toBe(thirdPartyUser.id);
    expect(createdComment!.transactionId).toBe(transaction.id);

    const senderNotificationsAfter = getNotificationsByUserId(senderId);
    const receiverNotificationsAfter = getNotificationsByUserId(receiverId);

    expect(senderNotificationsAfter.length).toBeGreaterThan(
      senderNotificationsBefore.length
    );
    expect(receiverNotificationsAfter.length).toBeGreaterThan(
      receiverNotificationsBefore.length
    );
  });

  it("should return an empty array for a transaction with no comments", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsByUserId(user.id);

    // Find a transaction that has no comments
    const transactionWithNoComments = transactions.find(
      (t) => getCommentsByTransactionId(t.id).length === 0
    );
    expect(transactionWithNoComments).toBeDefined();

    const comments = getCommentsByTransactionId(transactionWithNoComments!.id);
    expect(comments).toEqual([]);
  });
});
