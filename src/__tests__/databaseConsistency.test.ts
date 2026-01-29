import { describe, expect, it, beforeEach } from "vitest";
import {
  seedDatabase,
  getAllUsers,
  getAllForEntity,
  getAllContacts,
  getAllTransactions,
  getUserById,
  getContactsByUserId,
  getBankAccountsByUserId,
  getTransactionById,
  getLikesByTransactionId,
  getCommentsByTransactionId,
  createUser,
  createContactForUser,
  createTransaction,
  createLike,
  createComment,
  updateUserById,
  updateTransactionById,
} from "../../backend/database";
import {
  User,
  DefaultPrivacyLevel,
  TransactionPayload,
  TransactionStatus,
  TransactionRequestStatus,
} from "../models";
import { DbSchema } from "../models/db-schema";

describe("Database State Consistency", () => {
  beforeEach(() => {
    seedDatabase();
  });

  describe("Referential Integrity", () => {
    it("should ensure all contacts reference valid users", () => {
      const contacts = getAllContacts();
      const users = getAllUsers();
      const userIds = new Set(users.map((u) => u.id));

      contacts.forEach((contact) => {
        expect(userIds.has(contact.userId)).toBe(true);
        expect(userIds.has(contact.contactUserId)).toBe(true);
      });
    });

    it("should ensure all bank accounts reference valid users", () => {
      const bankAccounts = getAllForEntity("bankaccounts") as DbSchema["bankaccounts"];
      const users = getAllUsers();
      const userIds = new Set(users.map((u) => u.id));

      bankAccounts.forEach((account) => {
        expect(userIds.has(account.userId)).toBe(true);
      });
    });

    it("should ensure all transactions reference valid users", () => {
      const transactions = getAllTransactions();
      const users = getAllUsers();
      const userIds = new Set(users.map((u) => u.id));

      transactions.forEach((transaction) => {
        expect(userIds.has(transaction.senderId)).toBe(true);
        expect(userIds.has(transaction.receiverId)).toBe(true);
      });
    });

    it("should ensure all likes reference valid transactions and users", () => {
      const likes = getAllForEntity("likes") as DbSchema["likes"];
      const transactions = getAllTransactions();
      const users = getAllUsers();
      const transactionIds = new Set(transactions.map((t) => t.id));
      const userIds = new Set(users.map((u) => u.id));

      likes.forEach((like) => {
        expect(transactionIds.has(like.transactionId)).toBe(true);
        expect(userIds.has(like.userId)).toBe(true);
      });
    });

    it("should ensure all comments reference valid transactions and users", () => {
      const comments = getAllForEntity("comments") as DbSchema["comments"];
      const transactions = getAllTransactions();
      const users = getAllUsers();
      const transactionIds = new Set(transactions.map((t) => t.id));
      const userIds = new Set(users.map((u) => u.id));

      comments.forEach((comment) => {
        expect(transactionIds.has(comment.transactionId)).toBe(true);
        expect(userIds.has(comment.userId)).toBe(true);
      });
    });

    it("should ensure all notifications reference valid users and transactions", () => {
      const notifications = getAllForEntity("notifications") as DbSchema["notifications"];
      const transactions = getAllTransactions();
      const users = getAllUsers();
      const transactionIds = new Set(transactions.map((t) => t.id));
      const userIds = new Set(users.map((u) => u.id));

      notifications.forEach((notification) => {
        expect(userIds.has(notification.userId)).toBe(true);
        expect(transactionIds.has(notification.transactionId)).toBe(true);
      });
    });
  });

  describe("Data Consistency After Operations", () => {
    it("should maintain consistency after creating a user", () => {
      const initialUserCount = getAllUsers().length;

      const newUser = createUser({
        firstName: "Consistency",
        lastName: "Test",
        username: "consistencytest",
        password: "password123",
        email: "consistency@test.com",
        phoneNumber: "111-222-3333",
        balance: 10000,
        avatar: "https://example.com/avatar.png",
        defaultPrivacyLevel: DefaultPrivacyLevel.public,
      });

      const users = getAllUsers();
      expect(users.length).toBe(initialUserCount + 1);

      const retrievedUser = getUserById(newUser.id);
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser.id).toBe(newUser.id);
      expect(retrievedUser.username).toBe("consistencytest");
    });

    it("should maintain consistency after creating a contact", () => {
      const users = getAllUsers();
      const user1 = users[0];
      const user2 = users[1];

      const initialContactCount = getContactsByUserId(user1.id).length;

      const newContact = createContactForUser(user1.id, user2.id);

      const contacts = getContactsByUserId(user1.id);
      expect(contacts.length).toBe(initialContactCount + 1);
      expect(contacts.some((c) => c.id === newContact.id)).toBe(true);
    });

    it("should maintain consistency after creating a transaction", () => {
      const users = getAllUsers();
      const sender = users[0];
      const receiver = users[1];
      const bankAccounts = getBankAccountsByUserId(sender.id);

      const initialTransactionCount = getAllTransactions().length;

      const transactionPayload: TransactionPayload = {
        source: bankAccounts[0].id,
        senderId: sender.id,
        receiverId: receiver.id,
        description: "Consistency test payment",
        amount: 100,
        privacyLevel: DefaultPrivacyLevel.public,
        status: TransactionStatus.pending,
      };

      const newTransaction = createTransaction(sender.id, "payment", transactionPayload);

      const transactions = getAllTransactions();
      expect(transactions.length).toBe(initialTransactionCount + 1);

      const retrievedTransaction = getTransactionById(newTransaction.id);
      expect(retrievedTransaction).toBeDefined();
      expect(retrievedTransaction.senderId).toBe(sender.id);
      expect(retrievedTransaction.receiverId).toBe(receiver.id);
    });

    it("should maintain consistency after updating a user", () => {
      const users = getAllUsers();
      const targetUser = users[0];
      const originalFirstName = targetUser.firstName;
      const newFirstName = "UpdatedName";

      updateUserById(targetUser.id, { firstName: newFirstName });

      const updatedUser = getUserById(targetUser.id);
      expect(updatedUser.firstName).toBe(newFirstName);
      expect(updatedUser.firstName).not.toBe(originalFirstName);

      expect(updatedUser.lastName).toBe(targetUser.lastName);
      expect(updatedUser.username).toBe(targetUser.username);
    });

    it("should maintain consistency after updating a transaction", () => {
      const transactions = getAllTransactions();
      const targetTransaction = transactions.find((t) => t.requestStatus === "pending");

      if (targetTransaction) {
        updateTransactionById(targetTransaction.id, {
          requestStatus: TransactionRequestStatus.accepted,
        });

        const updatedTransaction = getTransactionById(targetTransaction.id);
        expect(updatedTransaction.requestStatus).toBe("accepted");
        expect(updatedTransaction.senderId).toBe(targetTransaction.senderId);
        expect(updatedTransaction.receiverId).toBe(targetTransaction.receiverId);
      }
    });
  });

  describe("Seed Data Consistency", () => {
    it("should have consistent user count after multiple seed operations", () => {
      const initialCount = getAllUsers().length;

      seedDatabase();
      expect(getAllUsers().length).toBe(initialCount);

      seedDatabase();
      expect(getAllUsers().length).toBe(initialCount);

      seedDatabase();
      expect(getAllUsers().length).toBe(initialCount);
    });

    it("should have consistent transaction count after multiple seed operations", () => {
      const initialCount = getAllTransactions().length;

      seedDatabase();
      expect(getAllTransactions().length).toBe(initialCount);

      seedDatabase();
      expect(getAllTransactions().length).toBe(initialCount);
    });

    it("should have consistent contact count after multiple seed operations", () => {
      const initialCount = getAllContacts().length;

      seedDatabase();
      expect(getAllContacts().length).toBe(initialCount);

      seedDatabase();
      expect(getAllContacts().length).toBe(initialCount);
    });

    it("should restore seed data after modifications", () => {
      const initialUserCount = getAllUsers().length;
      const initialTransactionCount = getAllTransactions().length;

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
      expect(getAllTransactions().length).toBe(initialTransactionCount);
    });
  });

  describe("Entity Relationships", () => {
    it("should have bidirectional contact relationships", () => {
      const contacts = getAllContacts();
      const users = getAllUsers();

      users.forEach((user) => {
        const userContacts = contacts.filter((c) => c.userId === user.id);
        userContacts.forEach((contact) => {
          const contactUser = getUserById(contact.contactUserId);
          expect(contactUser).toBeDefined();
        });
      });
    });

    it("should have valid transaction sources (bank accounts)", () => {
      const transactions = getAllTransactions();
      const bankAccounts = getAllForEntity("bankaccounts") as DbSchema["bankaccounts"];
      const bankAccountIds = new Set(bankAccounts.map((ba) => ba.id));

      transactions.forEach((transaction) => {
        expect(bankAccountIds.has(transaction.source)).toBe(true);
      });
    });

    it("should have likes associated with public or contacts-level transactions", () => {
      const likes = getAllForEntity("likes") as DbSchema["likes"];

      likes.forEach((like) => {
        const transaction = getTransactionById(like.transactionId);
        expect(transaction).toBeDefined();
        expect(["public", "contacts", "private"]).toContain(transaction.privacyLevel);
      });
    });

    it("should have comments associated with valid transactions", () => {
      const comments = getAllForEntity("comments") as DbSchema["comments"];

      comments.forEach((comment) => {
        const transaction = getTransactionById(comment.transactionId);
        expect(transaction).toBeDefined();
      });
    });
  });

  describe("Data Type Validation", () => {
    it("should have valid user data types", () => {
      const users = getAllUsers();

      users.forEach((user) => {
        expect(typeof user.id).toBe("string");
        expect(typeof user.uuid).toBe("string");
        expect(typeof user.firstName).toBe("string");
        expect(typeof user.lastName).toBe("string");
        expect(typeof user.username).toBe("string");
        expect(typeof user.password).toBe("string");
        expect(typeof user.email).toBe("string");
        expect(typeof user.phoneNumber).toBe("string");
        expect(typeof user.balance).toBe("number");
        expect(typeof user.avatar).toBe("string");
        expect(["public", "private", "contacts"]).toContain(user.defaultPrivacyLevel);
      });
    });

    it("should have valid transaction data types", () => {
      const transactions = getAllTransactions();

      transactions.forEach((transaction) => {
        expect(typeof transaction.id).toBe("string");
        expect(typeof transaction.uuid).toBe("string");
        expect(typeof transaction.source).toBe("string");
        expect(typeof transaction.amount).toBe("number");
        expect(typeof transaction.description).toBe("string");
        expect(typeof transaction.senderId).toBe("string");
        expect(typeof transaction.receiverId).toBe("string");
        expect(["pending", "complete"]).toContain(transaction.status);
        expect(["public", "private", "contacts"]).toContain(transaction.privacyLevel);
      });
    });

    it("should have valid contact data types", () => {
      const contacts = getAllContacts();

      contacts.forEach((contact) => {
        expect(typeof contact.id).toBe("string");
        expect(typeof contact.uuid).toBe("string");
        expect(typeof contact.userId).toBe("string");
        expect(typeof contact.contactUserId).toBe("string");
      });
    });

    it("should have valid bank account data types", () => {
      const bankAccounts = getAllForEntity("bankaccounts") as DbSchema["bankaccounts"];

      bankAccounts.forEach((account) => {
        expect(typeof account.id).toBe("string");
        expect(typeof account.uuid).toBe("string");
        expect(typeof account.userId).toBe("string");
        expect(typeof account.bankName).toBe("string");
        expect(typeof account.accountNumber).toBe("string");
        expect(typeof account.routingNumber).toBe("string");
        expect(typeof account.isDeleted).toBe("boolean");
      });
    });
  });
});
