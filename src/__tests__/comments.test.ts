import { describe, expect, it, beforeEach } from "vitest";
import {
  seedDatabase,
  getTransactionsForUserContacts,
  getAllUsers,
  getTransactionsByUserId,
  createComment,
  createComments,
  getCommentsByTransactionId,
  getCommentById,
  getNotificationsByObj,
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
  });

  it("should populate all Comment fields when creating a comment", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsForUserContacts(user.id);

    const content = "This is my comment content";
    const comment = createComment(user.id, transactions[0].id, content);

    expect(comment.id).toBeDefined();
    expect(comment.uuid).toBeDefined();
    expect(comment.userId).toBe(user.id);
    expect(comment.transactionId).toBe(transactions[0].id);
    expect(comment.content).toBe(content);
    expect(comment.createdAt).toBeDefined();
    expect(comment.modifiedAt).toBeDefined();
  });

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
    const transactions: Transaction[] = getTransactionsForUserContacts(user.id);
    const transactionWithoutComments = transactions.find(
      (t) => getCommentsByTransactionId(t.id).length === 0
    )!;

    expect(transactionWithoutComments).toBeDefined();
    expect(getCommentsByTransactionId(transactionWithoutComments.id)).toEqual([]);
  });

  it("should retrieve a comment by id", () => {
    const user: User = getAllUsers()[0];
    const transactions: Transaction[] = getTransactionsForUserContacts(user.id);
    const content = "Looking this one up by id";
    const comment = createComment(user.id, transactions[0].id, content);

    const found = getCommentById(comment.id);

    expect(found.id).toBe(comment.id);
    expect(found.uuid).toBe(comment.uuid);
    expect(found.userId).toBe(comment.userId);
    expect(found.transactionId).toBe(comment.transactionId);
    expect(found.content).toBe(content);
  });

  it("createComments notifies both sender and receiver when the commenter is a third party", () => {
    const users = getAllUsers();
    const commenter = users[0];
    const transaction = users
      .map((u) => getTransactionsForUserContacts(u.id))
      .flat()
      .find((t) => t.senderId !== commenter.id && t.receiverId !== commenter.id)!;

    expect(transaction).toBeDefined();

    createComments(commenter.id, transaction.id, "Third party comment");

    const notifications = getNotificationsByObj({ transactionId: transaction.id });
    const commentNotifications = notifications.filter(
      (n: any) => "commentId" in n && n.commentId !== undefined
    );

    expect(commentNotifications.some((n: any) => n.userId === transaction.senderId)).toBe(true);
    expect(commentNotifications.some((n: any) => n.userId === transaction.receiverId)).toBe(true);
  });

  it("createComments notifies the sender when the commenter is the sender of the transaction", () => {
    const senderTransaction = getAllUsers()
      .flatMap((u) => getTransactionsByUserId(u.id))
      .find((t) => t.senderId !== t.receiverId)!;

    expect(senderTransaction).toBeDefined();

    createComments(senderTransaction.senderId, senderTransaction.id, "Sender commenting");

    const notifications = getNotificationsByObj({ transactionId: senderTransaction.id });
    const commentNotifications = notifications.filter(
      (n: any) => "commentId" in n && n.commentId !== undefined
    );

    expect(commentNotifications.some((n: any) => n.userId === senderTransaction.senderId)).toBe(
      true
    );
  });
});
