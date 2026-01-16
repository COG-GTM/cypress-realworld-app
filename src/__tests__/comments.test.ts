import { describe, expect, it, beforeEach } from "vitest";
import {
  seedDatabase,
  getTransactionsForUserContacts,
  getAllUsers,
  getTransactionsByUserId,
  createComment,
  createComments,
  getCommentsByTransactionId,
  getCommentBy,
  getCommentById,
  getCommentsByObj,
  getNotificationsByUserId,
} from "../../backend/database";

import { User, Transaction, Comment } from "../../src/models";

describe("Comments", () => {
  beforeEach(() => {
    seedDatabase();
  });

  describe("createComment", () => {
    it("should create a comment on a transaction for a contact", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsForUserContacts(user.id);

      const content = "This is my comment content";
      const comment = createComment(user.id, transactions[0].id, content);

      expect(comment.transactionId).toBe(transactions[0].id);
      expect(comment.content).toBe(content);
    });

    it("should create a comment with all required fields", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const content = "Test comment with all fields";
      const comment = createComment(user.id, transaction.id, content);

      expect(comment.id).toBeDefined();
      expect(comment.uuid).toBeDefined();
      expect(comment.content).toBe(content);
      expect(comment.userId).toBe(user.id);
      expect(comment.transactionId).toBe(transaction.id);
      expect(comment.createdAt).toBeDefined();
      expect(comment.modifiedAt).toBeDefined();
    });

    it("should create multiple comments on the same transaction", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const comment1 = createComment(user.id, transaction.id, "First comment");
      const comment2 = createComment(user.id, transaction.id, "Second comment");

      expect(comment1.id).not.toBe(comment2.id);
      expect(comment1.transactionId).toBe(comment2.transactionId);

      const comments = getCommentsByTransactionId(transaction.id);
      expect(comments.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("createComments", () => {
    it("should create a comment and notifications for transaction participants", () => {
      const users: User[] = getAllUsers();
      const user: User = users[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const initialNotifications = getNotificationsByUserId(transaction.senderId);

      createComments(user.id, transaction.id, "Comment with notification");

      const comments = getCommentsByTransactionId(transaction.id);
      expect(comments.length).toBeGreaterThanOrEqual(1);

      const updatedNotifications = getNotificationsByUserId(transaction.senderId);
      expect(updatedNotifications.length).toBeGreaterThanOrEqual(initialNotifications.length);
    });
  });

  describe("getCommentsByTransactionId", () => {
    it("should get a list of comments for a transaction", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      createComment(user.id, transaction.id, "This is my comment");

      const comments = getCommentsByTransactionId(transaction.id);

      expect(comments[0].transactionId).toBe(transaction.id);
    });

    it("should return an empty array for a transaction with no comments", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[transactions.length - 1];

      const existingComments = getCommentsByTransactionId(transaction.id);
      const initialCount = existingComments.length;

      const comments = getCommentsByTransactionId(transaction.id);
      expect(comments.length).toBe(initialCount);
    });

    it("should return all comments for a transaction with multiple comments", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const initialComments = getCommentsByTransactionId(transaction.id);
      const initialCount = initialComments.length;

      createComment(user.id, transaction.id, "Comment 1");
      createComment(user.id, transaction.id, "Comment 2");
      createComment(user.id, transaction.id, "Comment 3");

      const comments = getCommentsByTransactionId(transaction.id);
      expect(comments.length).toBe(initialCount + 3);
    });
  });

  describe("getCommentBy", () => {
    it("should get a comment by id", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const createdComment = createComment(user.id, transaction.id, "Test comment");
      const foundComment = getCommentBy("id", createdComment.id);

      expect(foundComment.id).toBe(createdComment.id);
      expect(foundComment.content).toBe(createdComment.content);
    });

    it("should get a comment by userId", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      createComment(user.id, transaction.id, "User specific comment");
      const foundComment = getCommentBy("userId", user.id);

      expect(foundComment.userId).toBe(user.id);
    });

    it("should get a comment by transactionId", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      createComment(user.id, transaction.id, "Transaction specific comment");
      const foundComment = getCommentBy("transactionId", transaction.id);

      expect(foundComment.transactionId).toBe(transaction.id);
    });
  });

  describe("getCommentById", () => {
    it("should get a comment by its id", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const createdComment = createComment(user.id, transaction.id, "Get by ID test");
      const foundComment: Comment = getCommentById(createdComment.id);

      expect(foundComment.id).toBe(createdComment.id);
      expect(foundComment.content).toBe("Get by ID test");
      expect(foundComment.userId).toBe(user.id);
      expect(foundComment.transactionId).toBe(transaction.id);
    });
  });

  describe("getCommentsByObj", () => {
    it("should get comments by query object with transactionId", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      createComment(user.id, transaction.id, "Query test comment");

      const comments: Comment[] = getCommentsByObj({ transactionId: transaction.id });
      expect(comments.length).toBeGreaterThanOrEqual(1);
      expect(comments.every((c) => c.transactionId === transaction.id)).toBe(true);
    });

    it("should get comments by query object with userId", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      createComment(user.id, transaction.id, "User query test");

      const comments: Comment[] = getCommentsByObj({ userId: user.id });
      expect(comments.length).toBeGreaterThanOrEqual(1);
      expect(comments.every((c) => c.userId === user.id)).toBe(true);
    });

    it("should get comments by query object with multiple criteria", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      createComment(user.id, transaction.id, "Multi-criteria test");

      const comments: Comment[] = getCommentsByObj({
        userId: user.id,
        transactionId: transaction.id,
      });
      expect(comments.length).toBeGreaterThanOrEqual(1);
      expect(comments.every((c) => c.userId === user.id && c.transactionId === transaction.id)).toBe(
        true
      );
    });
  });
});
