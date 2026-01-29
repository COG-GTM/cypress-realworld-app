import { describe, expect, it } from "vitest";
import {
  createFakeUser,
  createContact,
  createFakeLike,
  createFakeComment,
  createFakePaymentNotification,
  createFakeLikeNotification,
  createFakeCommentNotification,
  createBankTransfer,
  getUserAvatar,
  isPayment,
  getRandomTransactions,
  getOtherRandomUser,
  getBankAccountsByUserId,
  getTransactionsByUserId,
  getPublicTransactionsForOtherUsers,
  createSeedUsers,
  createSeedContacts,
  createSeedBankAccounts,
  createSeedTransactions,
  createSeedLikes,
  createSeedComments,
  userbaseSize,
  contactsPerUser,
  bankAccountsPerUser,
  transactionsPerUser,
  totalTransactions,
  totalLikes,
  totalComments,
} from "../../scripts/seedDataUtils";
import {
  User,
  Transaction,
  BankAccount,
  DefaultPrivacyLevel,
  BankTransferType,
  PaymentNotificationStatus,
  TransactionStatus,
} from "../models";

describe("Seed Data Utilities", () => {
  describe("createFakeUser", () => {
    it("should create a user with all required fields", () => {
      const user = createFakeUser();

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe("string");
      expect(user.uuid).toBeDefined();
      expect(user.firstName).toBeDefined();
      expect(user.lastName).toBeDefined();
      expect(user.username).toBeDefined();
      expect(user.password).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.phoneNumber).toBeDefined();
      expect(user.avatar).toBeDefined();
      expect(user.defaultPrivacyLevel).toBeDefined();
      expect(typeof user.balance).toBe("number");
      expect(user.createdAt).toBeDefined();
      expect(user.modifiedAt).toBeDefined();
    });

    it("should create unique users", () => {
      const user1 = createFakeUser();
      const user2 = createFakeUser();

      expect(user1.id).not.toBe(user2.id);
      expect(user1.uuid).not.toBe(user2.uuid);
    });

    it("should create user with valid privacy level", () => {
      const user = createFakeUser();
      expect([
        DefaultPrivacyLevel.public,
        DefaultPrivacyLevel.private,
        DefaultPrivacyLevel.contacts,
      ]).toContain(user.defaultPrivacyLevel);
    });

    it("should create user with hashed password", () => {
      const user = createFakeUser();
      expect(user.password).toMatch(/^\$2[aby]?\$\d{1,2}\$/);
    });
  });

  describe("createContact", () => {
    it("should create a contact with all required fields", () => {
      const userId = "user1";
      const contactUserId = "user2";

      const contact = createContact(userId, contactUserId);

      expect(contact.id).toBeDefined();
      expect(contact.uuid).toBeDefined();
      expect(contact.userId).toBe(userId);
      expect(contact.contactUserId).toBe(contactUserId);
      expect(contact.createdAt).toBeDefined();
      expect(contact.modifiedAt).toBeDefined();
    });

    it("should create unique contacts", () => {
      const contact1 = createContact("user1", "user2");
      const contact2 = createContact("user1", "user3");

      expect(contact1.id).not.toBe(contact2.id);
    });
  });

  describe("createFakeLike", () => {
    it("should create a like with all required fields", () => {
      const userId = "user1";
      const transactionId = "tx1";

      const like = createFakeLike(userId, transactionId);

      expect(like.id).toBeDefined();
      expect(like.uuid).toBeDefined();
      expect(like.userId).toBe(userId);
      expect(like.transactionId).toBe(transactionId);
      expect(like.createdAt).toBeDefined();
      expect(like.modifiedAt).toBeDefined();
    });
  });

  describe("createFakeComment", () => {
    it("should create a comment with all required fields", () => {
      const userId = "user1";
      const transactionId = "tx1";

      const comment = createFakeComment(userId, transactionId);

      expect(comment.id).toBeDefined();
      expect(comment.uuid).toBeDefined();
      expect(comment.userId).toBe(userId);
      expect(comment.transactionId).toBe(transactionId);
      expect(comment.content).toBeDefined();
      expect(typeof comment.content).toBe("string");
      expect(comment.createdAt).toBeDefined();
      expect(comment.modifiedAt).toBeDefined();
    });
  });

  describe("createFakePaymentNotification", () => {
    it("should create a payment notification with all required fields", () => {
      const userId = "user1";
      const transaction: Transaction = {
        id: "tx1",
        uuid: "uuid1",
        source: "source1",
        amount: 1000,
        description: "Test payment",
        privacyLevel: DefaultPrivacyLevel.public,
        receiverId: "user2",
        senderId: "user1",
        balanceAtCompletion: 5000,
        status: TransactionStatus.complete,
        requestStatus: "",
        requestResolvedAt: "",
        createdAt: new Date(),
        modifiedAt: new Date(),
      };

      const notification = createFakePaymentNotification(
        userId,
        transaction,
        PaymentNotificationStatus.received
      );

      expect(notification.id).toBeDefined();
      expect(notification.uuid).toBeDefined();
      expect(notification.userId).toBe(userId);
      expect(notification.transactionId).toBe(transaction.id);
      expect(notification.status).toBe(PaymentNotificationStatus.received);
      expect(notification.isRead).toBe(false);
      expect(notification.createdAt).toBeDefined();
      expect(notification.modifiedAt).toBeDefined();
    });
  });

  describe("createFakeLikeNotification", () => {
    it("should create a like notification with all required fields", () => {
      const userId = "user1";
      const transactionId = "tx1";
      const likeId = "like1";

      const notification = createFakeLikeNotification(userId, transactionId, likeId);

      expect(notification.id).toBeDefined();
      expect(notification.uuid).toBeDefined();
      expect(notification.userId).toBe(userId);
      expect(notification.transactionId).toBe(transactionId);
      expect(notification.likeId).toBe(likeId);
      expect(notification.isRead).toBe(false);
      expect(notification.createdAt).toBeDefined();
      expect(notification.modifiedAt).toBeDefined();
    });
  });

  describe("createFakeCommentNotification", () => {
    it("should create a comment notification with all required fields", () => {
      const userId = "user1";
      const transactionId = "tx1";
      const commentId = "comment1";

      const notification = createFakeCommentNotification(userId, transactionId, commentId);

      expect(notification.id).toBeDefined();
      expect(notification.uuid).toBeDefined();
      expect(notification.userId).toBe(userId);
      expect(notification.transactionId).toBe(transactionId);
      expect(notification.commentId).toBe(commentId);
      expect(notification.isRead).toBe(false);
      expect(notification.createdAt).toBeDefined();
      expect(notification.modifiedAt).toBeDefined();
    });
  });

  describe("createBankTransfer", () => {
    it("should create a bank transfer with all required fields", () => {
      const userId = "user1";
      const transactionId = "tx1";
      const bankAccountId = "ba1";

      const transfer = createBankTransfer(
        BankTransferType.deposit,
        userId,
        transactionId,
        bankAccountId
      );

      expect(transfer.id).toBeDefined();
      expect(transfer.uuid).toBeDefined();
      expect(transfer.userId).toBe(userId);
      expect(transfer.transactionId).toBe(transactionId);
      expect(transfer.source).toBe(bankAccountId);
      expect(transfer.type).toBe(BankTransferType.deposit);
      expect(typeof transfer.amount).toBe("number");
      expect(transfer.createdAt).toBeDefined();
      expect(transfer.modifiedAt).toBeDefined();
    });

    it("should create withdrawal transfer", () => {
      const transfer = createBankTransfer(BankTransferType.withdrawal, "user1", "tx1", "ba1");

      expect(transfer.type).toBe(BankTransferType.withdrawal);
    });
  });

  describe("getUserAvatar", () => {
    it("should generate avatar URL with identifier", () => {
      const identifier = "testuser123";
      const avatar = getUserAvatar(identifier);

      expect(avatar).toContain(identifier);
      expect(avatar).toContain("https://avatars.dicebear.com");
    });
  });

  describe("isPayment", () => {
    it("should return true for payment type", () => {
      expect(isPayment("payment")).toBe(true);
    });

    it("should return false for request type", () => {
      expect(isPayment("request")).toBe(false);
    });

    it("should return false for other types", () => {
      expect(isPayment("other")).toBe(false);
    });
  });

  describe("getRandomTransactions", () => {
    it("should return specified number of random transactions", () => {
      const transactions: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
        id: `tx${i}`,
        uuid: `uuid${i}`,
        source: "source1",
        amount: 1000,
        description: `Transaction ${i}`,
        privacyLevel: DefaultPrivacyLevel.public,
        receiverId: "user2",
        senderId: "user1",
        balanceAtCompletion: 5000,
        status: TransactionStatus.complete,
        requestStatus: "",
        requestResolvedAt: "",
        createdAt: new Date(),
        modifiedAt: new Date(),
      }));

      const result = getRandomTransactions(5, transactions);

      expect(result.length).toBeLessThanOrEqual(5);
      result.forEach((tx) => {
        expect(transactions.some((t) => t.id === tx.id)).toBe(true);
      });
    });

    it("should return unique transactions", () => {
      const transactions: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
        id: `tx${i}`,
        uuid: `uuid${i}`,
        source: "source1",
        amount: 1000,
        description: `Transaction ${i}`,
        privacyLevel: DefaultPrivacyLevel.public,
        receiverId: "user2",
        senderId: "user1",
        balanceAtCompletion: 5000,
        status: TransactionStatus.complete,
        requestStatus: "",
        requestResolvedAt: "",
        createdAt: new Date(),
        modifiedAt: new Date(),
      }));

      const result = getRandomTransactions(5, transactions);
      const ids = result.map((tx) => tx.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("getOtherRandomUser", () => {
    it("should return a user different from the specified user", () => {
      const users: User[] = [createFakeUser(), createFakeUser(), createFakeUser()];
      const targetUserId = users[0].id;

      const result = getOtherRandomUser(users, targetUserId);

      expect(result).toBeDefined();
      expect(result.id).not.toBe(targetUserId);
    });
  });

  describe("getBankAccountsByUserId", () => {
    it("should filter bank accounts by user id", () => {
      const bankAccounts: BankAccount[] = [
        {
          id: "ba1",
          uuid: "uuid1",
          userId: "user1",
          bankName: "Bank 1",
          accountNumber: "1234567890",
          routingNumber: "123456789",
          isDeleted: false,
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "ba2",
          uuid: "uuid2",
          userId: "user2",
          bankName: "Bank 2",
          accountNumber: "0987654321",
          routingNumber: "987654321",
          isDeleted: false,
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      const result = getBankAccountsByUserId(bankAccounts, "user1");

      expect(result.length).toBe(1);
      expect(result[0].userId).toBe("user1");
    });
  });

  describe("getTransactionsByUserId", () => {
    it("should filter transactions by sender or receiver id", () => {
      const transactions: Transaction[] = [
        {
          id: "tx1",
          uuid: "uuid1",
          source: "source1",
          amount: 1000,
          description: "Transaction 1",
          privacyLevel: DefaultPrivacyLevel.public,
          receiverId: "user2",
          senderId: "user1",
          balanceAtCompletion: 5000,
          status: TransactionStatus.complete,
          requestStatus: "",
          requestResolvedAt: "",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "tx2",
          uuid: "uuid2",
          source: "source2",
          amount: 2000,
          description: "Transaction 2",
          privacyLevel: DefaultPrivacyLevel.public,
          receiverId: "user1",
          senderId: "user3",
          balanceAtCompletion: 6000,
          status: TransactionStatus.complete,
          requestStatus: "",
          requestResolvedAt: "",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "tx3",
          uuid: "uuid3",
          source: "source3",
          amount: 3000,
          description: "Transaction 3",
          privacyLevel: DefaultPrivacyLevel.public,
          receiverId: "user3",
          senderId: "user2",
          balanceAtCompletion: 7000,
          status: TransactionStatus.complete,
          requestStatus: "",
          requestResolvedAt: "",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      const result = getTransactionsByUserId(transactions, "user1");

      expect(result.length).toBe(2);
      result.forEach((tx) => {
        expect(tx.senderId === "user1" || tx.receiverId === "user1").toBe(true);
      });
    });
  });

  describe("getPublicTransactionsForOtherUsers", () => {
    it("should filter public transactions excluding specified user", () => {
      const transactions: Transaction[] = [
        {
          id: "tx1",
          uuid: "uuid1",
          source: "source1",
          amount: 1000,
          description: "Transaction 1",
          privacyLevel: DefaultPrivacyLevel.public,
          receiverId: "user2",
          senderId: "user3",
          balanceAtCompletion: 5000,
          status: TransactionStatus.complete,
          requestStatus: "",
          requestResolvedAt: "",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "tx2",
          uuid: "uuid2",
          source: "source2",
          amount: 2000,
          description: "Transaction 2",
          privacyLevel: DefaultPrivacyLevel.private,
          receiverId: "user2",
          senderId: "user3",
          balanceAtCompletion: 6000,
          status: TransactionStatus.complete,
          requestStatus: "",
          requestResolvedAt: "",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
        {
          id: "tx3",
          uuid: "uuid3",
          source: "source3",
          amount: 3000,
          description: "Transaction 3",
          privacyLevel: DefaultPrivacyLevel.public,
          receiverId: "user1",
          senderId: "user2",
          balanceAtCompletion: 7000,
          status: TransactionStatus.complete,
          requestStatus: "",
          requestResolvedAt: "",
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ];

      const result = getPublicTransactionsForOtherUsers(transactions, "user1");

      expect(result.length).toBe(1);
      expect(result[0].id).toBe("tx1");
      expect(result[0].privacyLevel).toBe(DefaultPrivacyLevel.public);
      expect(result[0].senderId).not.toBe("user1");
      expect(result[0].receiverId).not.toBe("user1");
    });
  });

  describe("Seed Data Generation", () => {
    it("should create correct number of seed users", () => {
      const users = createSeedUsers();
      expect(users.length).toBe(userbaseSize);
    });

    it("should create correct number of seed contacts", () => {
      const users = createSeedUsers();
      const contacts = createSeedContacts(users);
      expect(contacts.length).toBe(contactsPerUser * userbaseSize);
    });

    it("should create correct number of seed bank accounts", () => {
      const users = createSeedUsers();
      const bankAccounts = createSeedBankAccounts(users);
      expect(bankAccounts.length).toBe(bankAccountsPerUser * userbaseSize);
    });

    it("should create seed transactions with correct structure", () => {
      const users = createSeedUsers();
      const bankAccounts = createSeedBankAccounts(users);
      const transactions = createSeedTransactions(users, bankAccounts);

      expect(transactions.length).toBe(totalTransactions);

      transactions.forEach((tx) => {
        expect(tx.id).toBeDefined();
        expect(tx.uuid).toBeDefined();
        expect(tx.source).toBeDefined();
        expect(typeof tx.amount).toBe("number");
        expect(tx.senderId).toBeDefined();
        expect(tx.receiverId).toBeDefined();
        expect(["pending", "complete"]).toContain(tx.status);
      });
    });

    it("should create seed likes with correct structure", () => {
      const users = createSeedUsers();
      const bankAccounts = createSeedBankAccounts(users);
      const transactions = createSeedTransactions(users, bankAccounts);
      const likes = createSeedLikes(users, transactions);

      expect(likes.length).toBe(totalLikes);

      likes.forEach((like) => {
        expect(like.id).toBeDefined();
        expect(like.uuid).toBeDefined();
        expect(like.userId).toBeDefined();
        expect(like.transactionId).toBeDefined();
      });
    });

    it("should create seed comments with correct structure", () => {
      const users = createSeedUsers();
      const bankAccounts = createSeedBankAccounts(users);
      const transactions = createSeedTransactions(users, bankAccounts);
      const comments = createSeedComments(users, transactions);

      expect(comments.length).toBe(totalComments);

      comments.forEach((comment) => {
        expect(comment.id).toBeDefined();
        expect(comment.uuid).toBeDefined();
        expect(comment.userId).toBeDefined();
        expect(comment.transactionId).toBeDefined();
        expect(comment.content).toBeDefined();
      });
    });
  });

  describe("Seed Data Constants", () => {
    it("should have valid userbase size", () => {
      expect(userbaseSize).toBeGreaterThan(0);
    });

    it("should have valid contacts per user", () => {
      expect(contactsPerUser).toBeGreaterThan(0);
    });

    it("should have valid bank accounts per user", () => {
      expect(bankAccountsPerUser).toBeGreaterThan(0);
    });

    it("should have valid transactions per user", () => {
      expect(transactionsPerUser).toBeGreaterThan(0);
    });

    it("should have correct total transactions calculation", () => {
      expect(totalTransactions).toBe(userbaseSize * transactionsPerUser);
    });
  });
});
