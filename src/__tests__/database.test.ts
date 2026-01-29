import { describe, expect, it, beforeEach } from "vitest";
import { filter, find } from "lodash";
import {
  seedDatabase,
  getAllUsers,
  getAllForEntity,
  getAllBy,
  getBy,
  getAllByObj,
  getUserById,
  getUserByUsername,
  createUser,
  updateUserById,
  getContactsByUserId,
  getBankAccountsByUserId,
  getTransactionById,
  getTransactionsByObj,
  getLikesByTransactionId,
  getCommentsByTransactionId,
  getNotificationsByUserId,
  cleanSearchQuery,
  searchUsers,
  performSearch,
} from "../../backend/database";
import { User, DefaultPrivacyLevel } from "../models";
import { DbSchema } from "../models/db-schema";

describe("Database Utilities", () => {
  beforeEach(() => {
    seedDatabase();
  });

  describe("seedDatabase", () => {
    it("should seed the database with test data", () => {
      const users = getAllUsers();
      expect(users.length).toBeGreaterThan(0);
    });

    it("should reset database state when called multiple times", () => {
      const initialUsers = getAllUsers();
      const initialCount = initialUsers.length;

      const newUser = createUser({
        firstName: "Test",
        lastName: "User",
        username: "testuser123",
        password: "password123",
        email: "test@example.com",
        phoneNumber: "123-456-7890",
        balance: 1000,
        avatar: "https://example.com/avatar.png",
        defaultPrivacyLevel: DefaultPrivacyLevel.public,
      });

      const usersAfterCreate = getAllUsers();
      expect(usersAfterCreate.length).toBe(initialCount + 1);

      seedDatabase();

      const usersAfterReseed = getAllUsers();
      expect(usersAfterReseed.length).toBe(initialCount);
      expect(usersAfterReseed.find((u) => u.id === newUser.id)).toBeUndefined();
    });
  });

  describe("getAllForEntity", () => {
    it("should retrieve all users", () => {
      const users = getAllForEntity("users");
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });

    it("should retrieve all contacts", () => {
      const contacts = getAllForEntity("contacts");
      expect(Array.isArray(contacts)).toBe(true);
      expect(contacts.length).toBeGreaterThan(0);
    });

    it("should retrieve all bankaccounts", () => {
      const bankaccounts = getAllForEntity("bankaccounts");
      expect(Array.isArray(bankaccounts)).toBe(true);
      expect(bankaccounts.length).toBeGreaterThan(0);
    });

    it("should retrieve all transactions", () => {
      const transactions = getAllForEntity("transactions");
      expect(Array.isArray(transactions)).toBe(true);
      expect(transactions.length).toBeGreaterThan(0);
    });

    it("should retrieve all likes", () => {
      const likes = getAllForEntity("likes");
      expect(Array.isArray(likes)).toBe(true);
      expect(likes.length).toBeGreaterThan(0);
    });

    it("should retrieve all comments", () => {
      const comments = getAllForEntity("comments");
      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBeGreaterThan(0);
    });

    it("should retrieve all notifications", () => {
      const notifications = getAllForEntity("notifications");
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBeGreaterThan(0);
    });

    it("should retrieve all banktransfers", () => {
      const banktransfers = getAllForEntity("banktransfers");
      expect(Array.isArray(banktransfers)).toBe(true);
    });
  });

  describe("getAllBy", () => {
    it("should filter users by a specific key-value pair", () => {
      const users = getAllUsers();
      const targetUser = users[0];

      const result = getAllBy("users", "id", targetUser.id);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(targetUser.id);
    });

    it("should return empty array when no match found", () => {
      const result = getAllBy("users", "id", "nonexistent-id");
      expect(result.length).toBe(0);
    });

    it("should filter contacts by userId", () => {
      const users = getAllUsers();
      const targetUser = users[0];

      const result = getAllBy("contacts", "userId", targetUser.id);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((contact) => {
        expect(contact.userId).toBe(targetUser.id);
      });
    });
  });

  describe("getBy", () => {
    it("should find a single user by id", () => {
      const users = getAllUsers();
      const targetUser = users[0];

      const result = getBy("users", "id", targetUser.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(targetUser.id);
    });

    it("should find a user by username", () => {
      const users = getAllUsers();
      const targetUser = users[0];

      const result = getBy("users", "username", targetUser.username);
      expect(result).toBeDefined();
      expect(result.username).toBe(targetUser.username);
    });

    it("should return undefined when no match found", () => {
      const result = getBy("users", "id", "nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("getAllByObj", () => {
    it("should filter by multiple criteria", () => {
      const transactions = getAllForEntity("transactions") as DbSchema["transactions"];
      const targetTransaction = transactions[0];

      const result = getAllByObj("transactions", {
        senderId: targetTransaction.senderId,
        receiverId: targetTransaction.receiverId,
      });

      expect(result.length).toBeGreaterThan(0);
      result.forEach((tx) => {
        expect(tx.senderId).toBe(targetTransaction.senderId);
        expect(tx.receiverId).toBe(targetTransaction.receiverId);
      });
    });

    it("should return empty array when no match found", () => {
      const result = getAllByObj("users", { id: "nonexistent", username: "nonexistent" });
      expect(result.length).toBe(0);
    });
  });

  describe("User operations", () => {
    it("should get user by id", () => {
      const users = getAllUsers();
      const targetUser = users[0];

      const result = getUserById(targetUser.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(targetUser.id);
      expect(result.username).toBe(targetUser.username);
    });

    it("should get user by username", () => {
      const users = getAllUsers();
      const targetUser = users[0];

      const result = getUserByUsername(targetUser.username);
      expect(result).toBeDefined();
      expect(result.username).toBe(targetUser.username);
    });

    it("should create a new user", () => {
      const initialCount = getAllUsers().length;

      const newUser = createUser({
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        password: "securepassword",
        email: "john@example.com",
        phoneNumber: "555-123-4567",
        balance: 5000,
        avatar: "https://example.com/john.png",
        defaultPrivacyLevel: DefaultPrivacyLevel.private,
      });

      expect(newUser.id).toBeDefined();
      expect(newUser.uuid).toBeDefined();
      expect(newUser.firstName).toBe("John");
      expect(newUser.lastName).toBe("Doe");
      expect(newUser.username).toBe("johndoe");
      expect(newUser.password).not.toBe("securepassword");

      const users = getAllUsers();
      expect(users.length).toBe(initialCount + 1);
    });

    it("should update user by id", () => {
      const users = getAllUsers();
      const targetUser = users[0];
      const newFirstName = "UpdatedFirstName";

      updateUserById(targetUser.id, { firstName: newFirstName });

      const updatedUser = getUserById(targetUser.id);
      expect(updatedUser.firstName).toBe(newFirstName);
    });
  });

  describe("Search operations", () => {
    it("should clean search query by removing special characters", () => {
      expect(cleanSearchQuery("test@user")).toBe("testuser");
      expect(cleanSearchQuery("test-user")).toBe("testuser");
      expect(cleanSearchQuery("test_user")).toBe("testuser");
      expect(cleanSearchQuery("test123")).toBe("test123");
    });

    it("should search users by username", () => {
      const users = getAllUsers();
      const targetUser = users[0];

      const results = searchUsers(targetUser.username);
      expect(results.length).toBeGreaterThan(0);
    });

    it("should search users by first name", () => {
      const users = getAllUsers();
      const targetUser = users[0];

      const results = searchUsers(targetUser.firstName);
      expect(results.length).toBeGreaterThan(0);
    });

    it("should search users by email", () => {
      const users = getAllUsers();
      const targetUser = users[0];

      const results = searchUsers(targetUser.email);
      expect(results.length).toBeGreaterThan(0);
    });

    it("should perform search with custom options", () => {
      const users = getAllUsers();
      const results = performSearch(users, { keys: ["firstName", "lastName"] }, users[0].firstName);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("Related entity queries", () => {
    it("should get contacts by user id", () => {
      const users = getAllUsers();
      const targetUser = users[0];

      const contacts = getContactsByUserId(targetUser.id);
      expect(contacts.length).toBeGreaterThan(0);
      contacts.forEach((contact) => {
        expect(contact.userId).toBe(targetUser.id);
      });
    });

    it("should get bank accounts by user id", () => {
      const users = getAllUsers();
      const targetUser = users[0];

      const bankAccounts = getBankAccountsByUserId(targetUser.id);
      expect(bankAccounts.length).toBeGreaterThan(0);
      bankAccounts.forEach((account) => {
        expect(account.userId).toBe(targetUser.id);
      });
    });

    it("should get transaction by id", () => {
      const transactions = getAllForEntity("transactions") as DbSchema["transactions"];
      const targetTransaction = transactions[0];

      const result = getTransactionById(targetTransaction.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(targetTransaction.id);
    });

    it("should get transactions by query object", () => {
      const transactions = getAllForEntity("transactions") as DbSchema["transactions"];
      const targetTransaction = transactions[0];

      const results = getTransactionsByObj({ senderId: targetTransaction.senderId });
      expect(results.length).toBeGreaterThan(0);
      results.forEach((tx) => {
        expect(tx.senderId).toBe(targetTransaction.senderId);
      });
    });

    it("should get likes by transaction id", () => {
      const likes = getAllForEntity("likes") as DbSchema["likes"];
      if (likes.length > 0) {
        const targetLike = likes[0];
        const results = getLikesByTransactionId(targetLike.transactionId);
        expect(results.length).toBeGreaterThan(0);
        results.forEach((like) => {
          expect(like.transactionId).toBe(targetLike.transactionId);
        });
      }
    });

    it("should get comments by transaction id", () => {
      const comments = getAllForEntity("comments") as DbSchema["comments"];
      if (comments.length > 0) {
        const targetComment = comments[0];
        const results = getCommentsByTransactionId(targetComment.transactionId);
        expect(results.length).toBeGreaterThan(0);
        results.forEach((comment) => {
          expect(comment.transactionId).toBe(targetComment.transactionId);
        });
      }
    });

    it("should get notifications by user id", () => {
      const users = getAllUsers();
      const targetUser = users[0];

      const notifications = getNotificationsByUserId(targetUser.id);
      expect(Array.isArray(notifications)).toBe(true);
    });
  });
});

describe("Cypress Task Logic Simulation", () => {
  beforeEach(() => {
    seedDatabase();
  });

  describe("filter:database task logic", () => {
    it("should filter users by specific attributes", () => {
      const users = getAllForEntity("users") as User[];
      const targetUser = users[0];

      const filtered = filter(users, { id: targetUser.id });
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe(targetUser.id);
    });

    it("should filter transactions by status", () => {
      const transactions = getAllForEntity("transactions") as DbSchema["transactions"];

      const pendingTransactions = filter(transactions, { status: "pending" });
      const completeTransactions = filter(transactions, { status: "complete" });

      expect(pendingTransactions.length + completeTransactions.length).toBeLessThanOrEqual(
        transactions.length
      );
      pendingTransactions.forEach((tx) => {
        expect(tx.status).toBe("pending");
      });
      completeTransactions.forEach((tx) => {
        expect(tx.status).toBe("complete");
      });
    });

    it("should filter contacts by userId", () => {
      const contacts = getAllForEntity("contacts") as DbSchema["contacts"];
      const users = getAllUsers();
      const targetUser = users[0];

      const filtered = filter(contacts, { userId: targetUser.id });
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((contact) => {
        expect(contact.userId).toBe(targetUser.id);
      });
    });

    it("should return empty array when no matches found", () => {
      const users = getAllForEntity("users") as User[];
      const filtered = filter(users, { id: "nonexistent-id-12345" });
      expect(filtered.length).toBe(0);
    });

    it("should filter by multiple attributes", () => {
      const transactions = getAllForEntity("transactions") as DbSchema["transactions"];
      const targetTransaction = transactions[0];

      const filtered = filter(transactions, {
        senderId: targetTransaction.senderId,
        status: targetTransaction.status,
      });

      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((tx) => {
        expect(tx.senderId).toBe(targetTransaction.senderId);
        expect(tx.status).toBe(targetTransaction.status);
      });
    });
  });

  describe("find:database task logic", () => {
    it("should find a single user by id", () => {
      const users = getAllForEntity("users") as User[];
      const targetUser = users[0];

      const found = find(users, { id: targetUser.id });
      expect(found).toBeDefined();
      expect(found!.id).toBe(targetUser.id);
    });

    it("should find a transaction by id", () => {
      const transactions = getAllForEntity("transactions") as DbSchema["transactions"];
      const targetTransaction = transactions[0];

      const found = find(transactions, { id: targetTransaction.id });
      expect(found).toBeDefined();
      expect(found!.id).toBe(targetTransaction.id);
    });

    it("should return undefined when no match found", () => {
      const users = getAllForEntity("users") as User[];
      const found = find(users, { id: "nonexistent-id-12345" });
      expect(found).toBeUndefined();
    });

    it("should find by multiple attributes", () => {
      const transactions = getAllForEntity("transactions") as DbSchema["transactions"];
      const targetTransaction = transactions[0];

      const found = find(transactions, {
        senderId: targetTransaction.senderId,
        receiverId: targetTransaction.receiverId,
      });

      expect(found).toBeDefined();
      expect(found!.senderId).toBe(targetTransaction.senderId);
      expect(found!.receiverId).toBe(targetTransaction.receiverId);
    });
  });

  describe("db:seed task logic", () => {
    it("should reset database to seed state", () => {
      const users = getAllUsers();
      const initialUserCount = users.length;

      createUser({
        firstName: "Temp",
        lastName: "User",
        username: "tempuser",
        password: "password",
        email: "temp@example.com",
        phoneNumber: "000-000-0000",
        balance: 0,
        avatar: "https://example.com/temp.png",
        defaultPrivacyLevel: DefaultPrivacyLevel.public,
      });

      expect(getAllUsers().length).toBe(initialUserCount + 1);

      seedDatabase();

      expect(getAllUsers().length).toBe(initialUserCount);
    });

    it("should restore all entities to seed state", () => {
      const initialCounts = {
        users: (getAllForEntity("users") as User[]).length,
        contacts: (getAllForEntity("contacts") as DbSchema["contacts"]).length,
        transactions: (getAllForEntity("transactions") as DbSchema["transactions"]).length,
      };

      seedDatabase();

      expect((getAllForEntity("users") as User[]).length).toBe(initialCounts.users);
      expect((getAllForEntity("contacts") as DbSchema["contacts"]).length).toBe(
        initialCounts.contacts
      );
      expect((getAllForEntity("transactions") as DbSchema["transactions"]).length).toBe(
        initialCounts.transactions
      );
    });
  });
});
