import { describe, expect, it, beforeEach } from "vitest";
import {
  seedDatabase,
  getTransactionsForUserContacts,
  getAllUsers,
  getTransactionsByUserId,
  createComment,
  getCommentsByTransactionId,
  getCommentById,
  getCommentBy,
} from "../../backend/database";

import { User, Transaction, Comment } from "../../src/models";

describe("Comments", () => {
  beforeEach(() => {
    seedDatabase();
  });

  describe("createComment", () => {
    it("should create a comment for a transaction", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsForUserContacts(user.id);

      const content = "This is my comment content";
      const comment = createComment(user.id, transactions[0].id, content);

      expect(comment.transactionId).toBe(transactions[0].id);
      expect(comment.content).toBe(content);
    });

    it("should create a comment with all required fields populated", () => {
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

    it("should create multiple comments for the same transaction", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      createComment(user.id, transaction.id, "First comment");
      createComment(user.id, transaction.id, "Second comment");
      createComment(user.id, transaction.id, "Third comment");

      const comments = getCommentsByTransactionId(transaction.id);
      expect(comments.length).toBeGreaterThanOrEqual(3);
    });

    it("should create comments from different users on the same transaction", () => {
      const users: User[] = getAllUsers();
      const user1 = users[0];
      const user2 = users[1];
      const transactions: Transaction[] = getTransactionsByUserId(user1.id);
      const transaction = transactions[0];

      const comment1 = createComment(user1.id, transaction.id, "Comment from user 1");
      const comment2 = createComment(user2.id, transaction.id, "Comment from user 2");

      expect(comment1.userId).toBe(user1.id);
      expect(comment2.userId).toBe(user2.id);
      expect(comment1.transactionId).toBe(comment2.transactionId);
    });

    it("should handle empty string content", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const comment = createComment(user.id, transaction.id, "");

      expect(comment.content).toBe("");
      expect(comment.id).toBeDefined();
    });

    it("should handle very long content", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const longContent = "A".repeat(10000);
      const comment = createComment(user.id, transaction.id, longContent);

      expect(comment.content).toBe(longContent);
      expect(comment.content.length).toBe(10000);
    });

    it("should handle special characters in content", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const specialContent =
        "Special chars: <script>alert('xss')</script> & \"quotes\" 'apostrophe'";
      const comment = createComment(user.id, transaction.id, specialContent);

      expect(comment.content).toBe(specialContent);
    });

    it("should handle unicode characters in content", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const unicodeContent = "Unicode test: emoji 🎉 中文 العربية";
      const comment = createComment(user.id, transaction.id, unicodeContent);

      expect(comment.content).toBe(unicodeContent);
    });

    it("should handle whitespace-only content", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const whitespaceContent = "   \t\n   ";
      const comment = createComment(user.id, transaction.id, whitespaceContent);

      expect(comment.content).toBe(whitespaceContent);
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

    it("should return empty array for transaction with no comments", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[transactions.length - 1];

      const existingComments = getCommentsByTransactionId(transaction.id);
      const initialCount = existingComments.length;

      const comments = getCommentsByTransactionId(transaction.id);
      expect(comments.length).toBe(initialCount);
    });

    it("should return empty array for non-existent transaction ID", () => {
      const comments = getCommentsByTransactionId("non-existent-id");

      expect(comments).toEqual([]);
    });

    it("should return empty array for empty string transaction ID", () => {
      const comments = getCommentsByTransactionId("");

      expect(comments).toEqual([]);
    });

    it("should return all comments for a transaction in order", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const initialComments = getCommentsByTransactionId(transaction.id);
      const initialCount = initialComments.length;

      createComment(user.id, transaction.id, "Comment 1");
      createComment(user.id, transaction.id, "Comment 2");

      const comments = getCommentsByTransactionId(transaction.id);
      expect(comments.length).toBe(initialCount + 2);
    });
  });

  describe("getCommentById", () => {
    it("should retrieve a comment by its ID", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const createdComment = createComment(user.id, transaction.id, "Test comment");
      const retrievedComment = getCommentById(createdComment.id);

      expect(retrievedComment).toBeDefined();
      expect(retrievedComment.id).toBe(createdComment.id);
      expect(retrievedComment.content).toBe(createdComment.content);
    });

    it("should return undefined for non-existent comment ID", () => {
      const comment = getCommentById("non-existent-comment-id");

      expect(comment).toBeUndefined();
    });

    it("should return undefined for empty string comment ID", () => {
      const comment = getCommentById("");

      expect(comment).toBeUndefined();
    });
  });

  describe("getCommentBy", () => {
    it("should retrieve a comment by userId", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const createdComment = createComment(user.id, transaction.id, "User specific comment");
      const retrievedComment: Comment = getCommentBy("userId", user.id);

      expect(retrievedComment).toBeDefined();
      expect(retrievedComment.userId).toBe(user.id);
    });

    it("should retrieve a comment by transactionId", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      createComment(user.id, transaction.id, "Transaction specific comment");
      const retrievedComment: Comment = getCommentBy("transactionId", transaction.id);

      expect(retrievedComment).toBeDefined();
      expect(retrievedComment.transactionId).toBe(transaction.id);
    });

    it("should return undefined for non-existent key value", () => {
      const comment = getCommentBy("userId", "non-existent-user-id");

      expect(comment).toBeUndefined();
    });

    it("should return undefined for invalid key", () => {
      const comment = getCommentBy("invalidKey", "some-value");

      expect(comment).toBeUndefined();
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle creating comment with non-existent user ID", () => {
      const transactions: Transaction[] = getTransactionsByUserId(getAllUsers()[0].id);
      const transaction = transactions[0];

      const comment = createComment("non-existent-user-id", transaction.id, "Test content");

      expect(comment.id).toBeDefined();
      expect(comment.userId).toBe("non-existent-user-id");
    });

    it("should handle creating comment with non-existent transaction ID", () => {
      const user: User = getAllUsers()[0];

      const comment = createComment(user.id, "non-existent-transaction-id", "Test content");

      expect(comment.id).toBeDefined();
      expect(comment.transactionId).toBe("non-existent-transaction-id");
    });

    it("should generate unique IDs for each comment", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const comment1 = createComment(user.id, transaction.id, "Comment 1");
      const comment2 = createComment(user.id, transaction.id, "Comment 2");
      const comment3 = createComment(user.id, transaction.id, "Comment 3");

      expect(comment1.id).not.toBe(comment2.id);
      expect(comment2.id).not.toBe(comment3.id);
      expect(comment1.id).not.toBe(comment3.id);
    });

    it("should generate unique UUIDs for each comment", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const comment1 = createComment(user.id, transaction.id, "Comment 1");
      const comment2 = createComment(user.id, transaction.id, "Comment 2");

      expect(comment1.uuid).not.toBe(comment2.uuid);
    });

    it("should set createdAt and modifiedAt timestamps", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const beforeCreate = new Date();
      const comment = createComment(user.id, transaction.id, "Timestamp test");
      const afterCreate = new Date();

      expect(new Date(comment.createdAt).getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(new Date(comment.createdAt).getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(new Date(comment.modifiedAt).getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(new Date(comment.modifiedAt).getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it("should persist comment to database after creation", () => {
      const user: User = getAllUsers()[0];
      const transactions: Transaction[] = getTransactionsByUserId(user.id);
      const transaction = transactions[0];

      const comment = createComment(user.id, transaction.id, "Persistence test");
      const retrievedComment = getCommentById(comment.id);

      expect(retrievedComment).toBeDefined();
      expect(retrievedComment.id).toBe(comment.id);
      expect(retrievedComment.content).toBe(comment.content);
    });
  });
});
