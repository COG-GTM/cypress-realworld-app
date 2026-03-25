import { describe, expect, it } from "vitest";
import {
  isPayment,
  getUserAvatar,
  createFakeUser,
  createContact,
  createFakeLike,
  createFakeComment,
  createFakePaymentNotification,
  createFakeLikeNotification,
  createFakeCommentNotification,
  createBankTransfer,
  userbaseSize,
  contactsPerUser,
  paymentsPerUser,
  requestsPerUser,
  bankAccountsPerUser,
  likesPerUser,
  commentsPerUser,
  notificationsPerUser,
  bankTransfersPerUser,
  defaultPassword,
  paymentVariations,
  requestVariations,
  transactionsPerUser,
  totalTransactions,
  totalLikes,
  totalComments,
  totalNotifications,
  totalContacts,
  totalBankTransfers,
  passwordHash,
  getRandomTransactions,
  getOtherRandomUser,
  createSeedUsers,
  createSeedContacts,
  createSeedBankAccounts,
  createTransaction,
  createPayment,
  createRequest,
  getBankAccountsByUserId,
  getTransactionsByUserId,
  getPublicTransactionsForOtherUsers,
  createSeedTransactions,
  createSeedLikes,
  createSeedComments,
  createSeedNotifications,
  createSeedBankTransfers,
  buildDatabase,
} from "../../scripts/seedDataUtils";
import {
  TransactionStatus,
  TransactionRequestStatus,
  PaymentNotificationStatus,
  BankTransferType,
  DefaultPrivacyLevel,
} from "../models";

describe("seedDataUtils", () => {
  describe("constants", () => {
    it("should have valid userbase size", () => {
      expect(userbaseSize).toBeGreaterThan(0);
    });

    it("should have valid contacts per user", () => {
      expect(contactsPerUser).toBeGreaterThan(0);
    });

    it("should have valid payments per user", () => {
      expect(paymentsPerUser).toBeGreaterThan(0);
    });

    it("should have valid requests per user", () => {
      expect(requestsPerUser).toBeGreaterThan(0);
    });

    it("should have valid bank accounts per user", () => {
      expect(bankAccountsPerUser).toBeGreaterThan(0);
    });

    it("should have valid likes per user", () => {
      expect(likesPerUser).toBeGreaterThan(0);
    });

    it("should have valid comments per user", () => {
      expect(commentsPerUser).toBeGreaterThan(0);
    });

    it("should have valid notifications per user", () => {
      expect(notificationsPerUser).toBeGreaterThan(0);
    });

    it("should have valid bank transfers per user", () => {
      expect(bankTransfersPerUser).toBeGreaterThan(0);
    });

    it("should have a default password", () => {
      expect(defaultPassword).toBeDefined();
    });

    it("should calculate transactionsPerUser correctly", () => {
      const expected =
        paymentsPerUser * paymentVariations * 2 + requestsPerUser * requestVariations * 2;
      expect(transactionsPerUser).toBe(expected);
    });

    it("should calculate totalTransactions correctly", () => {
      expect(totalTransactions).toBe(userbaseSize * transactionsPerUser);
    });

    it("should calculate totalLikes correctly", () => {
      expect(totalLikes).toBe(userbaseSize * likesPerUser);
    });

    it("should calculate totalComments correctly", () => {
      expect(totalComments).toBe(userbaseSize * commentsPerUser);
    });

    it("should calculate totalNotifications correctly", () => {
      expect(totalNotifications).toBe(userbaseSize * notificationsPerUser);
    });

    it("should calculate totalContacts correctly", () => {
      expect(totalContacts).toBe(userbaseSize * contactsPerUser);
    });

    it("should calculate totalBankTransfers correctly", () => {
      expect(totalBankTransfers).toBe(userbaseSize * bankTransfersPerUser * 2);
    });

    it("should have a valid passwordHash", () => {
      expect(passwordHash).toBeDefined();
      expect(passwordHash.length).toBeGreaterThan(10);
    });
  });

  describe("isPayment", () => {
    it("returns true for payment type", () => {
      expect(isPayment("payment")).toBe(true);
    });

    it("returns false for request type", () => {
      expect(isPayment("request")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isPayment("")).toBe(false);
    });
  });

  describe("getUserAvatar", () => {
    it("should generate avatar URL", () => {
      const avatar = getUserAvatar("test-id");
      expect(avatar).toContain("test-id");
      expect(avatar).toContain("https://avatars.dicebear.com");
    });
  });

  describe("createFakeUser", () => {
    it("should create a user with all required fields", () => {
      const user = createFakeUser();
      expect(user.id).toBeDefined();
      expect(user.uuid).toBeDefined();
      expect(user.firstName).toBeDefined();
      expect(user.lastName).toBeDefined();
      expect(user.username).toBeDefined();
      expect(user.password).toBe(passwordHash);
      expect(user.email).toBeDefined();
      expect(user.phoneNumber).toBeDefined();
      expect(user.avatar).toBeDefined();
      expect(user.defaultPrivacyLevel).toBeDefined();
      expect(user.balance).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.modifiedAt).toBeDefined();
    });

    it("should generate unique users", () => {
      const user1 = createFakeUser();
      const user2 = createFakeUser();
      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe("createContact", () => {
    it("should create a contact object", () => {
      const contact = createContact("user1", "user2");
      expect(contact.id).toBeDefined();
      expect(contact.uuid).toBeDefined();
      expect(contact.userId).toBe("user1");
      expect(contact.contactUserId).toBe("user2");
      expect(contact.createdAt).toBeDefined();
      expect(contact.modifiedAt).toBeDefined();
    });
  });

  describe("createSeedUsers", () => {
    it("should create the correct number of users", () => {
      const users = createSeedUsers();
      expect(users.length).toBe(userbaseSize);
    });
  });

  describe("getOtherRandomUser", () => {
    it("should return a different user", () => {
      const users = createSeedUsers();
      const user = users[0];
      const otherUser = getOtherRandomUser(users, user.id);
      expect(otherUser.id).not.toBe(user.id);
    });
  });

  describe("createSeedContacts", () => {
    it("should create contacts for seed users", () => {
      const users = createSeedUsers();
      const contacts = createSeedContacts(users);
      expect(contacts.length).toBeGreaterThan(0);
    });
  });

  describe("createSeedBankAccounts", () => {
    it("should create one bank account per user", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      expect(accounts.length).toBe(users.length);
    });

    it("should have correct fields", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const account = accounts[0];
      expect(account.id).toBeDefined();
      expect(account.uuid).toBeDefined();
      expect(account.userId).toBe(users[0].id);
      expect(account.bankName).toBeDefined();
      expect(account.accountNumber).toBeDefined();
      expect(account.routingNumber).toBeDefined();
      expect(account.isDeleted).toBe(false);
    });
  });

  describe("createTransaction", () => {
    it("should create a payment transaction", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const tx = createTransaction("payment", accounts[0], {
        senderId: users[0].id,
        receiverId: users[1].id,
      });
      expect(tx.id).toBeDefined();
      expect(tx.senderId).toBe(users[0].id);
      expect(tx.receiverId).toBe(users[1].id);
      expect(tx.source).toBe(accounts[0].id);
    });

    it("should create a request transaction with requestStatus", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const tx = createTransaction("request", accounts[0], {
        senderId: users[0].id,
        receiverId: users[1].id,
      });
      expect(tx.requestStatus).toBeDefined();
      expect(tx.requestStatus).not.toBe("");
    });
  });

  describe("createPayment", () => {
    it("should create payment scenarios", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const payments = createPayment(accounts[0], users[0], users[1]);
      expect(payments.length).toBe(paymentVariations * 2);
    });
  });

  describe("createRequest", () => {
    it("should create request scenarios", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const requests = createRequest(accounts[0], users[0], users[1]);
      expect(requests.length).toBe(requestVariations * 2);
    });
  });

  describe("getBankAccountsByUserId", () => {
    it("should filter bank accounts by userId", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const userAccounts = getBankAccountsByUserId(accounts, users[0].id);
      expect(userAccounts.length).toBeGreaterThan(0);
      userAccounts.forEach((a) => expect(a.userId).toBe(users[0].id));
    });
  });

  describe("getTransactionsByUserId", () => {
    it("should filter transactions by userId", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const transactions = createSeedTransactions(users, accounts);
      const userTxs = getTransactionsByUserId(transactions, users[0].id);
      expect(userTxs.length).toBeGreaterThan(0);
    });
  });

  describe("getPublicTransactionsForOtherUsers", () => {
    it("should return only public transactions from other users", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const transactions = createSeedTransactions(users, accounts);
      const publicTxs = getPublicTransactionsForOtherUsers(transactions, users[0].id);
      publicTxs.forEach((tx) => {
        expect(tx.privacyLevel).toBe(DefaultPrivacyLevel.public);
        expect(tx.senderId).not.toBe(users[0].id);
        expect(tx.receiverId).not.toBe(users[0].id);
      });
    });
  });

  describe("getRandomTransactions", () => {
    it("should return a subset of transactions", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const transactions = createSeedTransactions(users, accounts);
      const random = getRandomTransactions(5, transactions);
      expect(random.length).toBeLessThanOrEqual(5);
    });
  });

  describe("createFakeLike", () => {
    it("should create a like object", () => {
      const like = createFakeLike("user1", "tx1");
      expect(like.id).toBeDefined();
      expect(like.userId).toBe("user1");
      expect(like.transactionId).toBe("tx1");
    });
  });

  describe("createFakeComment", () => {
    it("should create a comment object", () => {
      const comment = createFakeComment("user1", "tx1");
      expect(comment.id).toBeDefined();
      expect(comment.userId).toBe("user1");
      expect(comment.transactionId).toBe("tx1");
      expect(comment.content).toBeDefined();
    });
  });

  describe("createFakePaymentNotification", () => {
    it("should create a payment notification", () => {
      const notification = createFakePaymentNotification(
        "user1",
        { id: "tx1" } as any,
        PaymentNotificationStatus.received
      );
      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe("user1");
      expect(notification.transactionId).toBe("tx1");
      expect(notification.status).toBe(PaymentNotificationStatus.received);
      expect(notification.isRead).toBe(false);
    });
  });

  describe("createFakeLikeNotification", () => {
    it("should create a like notification", () => {
      const notification = createFakeLikeNotification("user1", "tx1", "like1");
      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe("user1");
      expect(notification.transactionId).toBe("tx1");
      expect(notification.likeId).toBe("like1");
      expect(notification.isRead).toBe(false);
    });
  });

  describe("createFakeCommentNotification", () => {
    it("should create a comment notification", () => {
      const notification = createFakeCommentNotification("user1", "tx1", "comment1");
      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe("user1");
      expect(notification.transactionId).toBe("tx1");
      expect(notification.commentId).toBe("comment1");
      expect(notification.isRead).toBe(false);
    });
  });

  describe("createBankTransfer", () => {
    it("should create a deposit transfer", () => {
      const transfer = createBankTransfer(BankTransferType.deposit, "user1", "tx1", "account1");
      expect(transfer.id).toBeDefined();
      expect(transfer.userId).toBe("user1");
      expect(transfer.transactionId).toBe("tx1");
      expect(transfer.source).toBe("account1");
      expect(transfer.type).toBe(BankTransferType.deposit);
    });

    it("should create a withdrawal transfer", () => {
      const transfer = createBankTransfer(BankTransferType.withdrawal, "user1", "tx1", "account1");
      expect(transfer.type).toBe(BankTransferType.withdrawal);
    });
  });

  describe("createSeedTransactions", () => {
    it("should create transactions for all users", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const transactions = createSeedTransactions(users, accounts);
      expect(transactions.length).toBeGreaterThan(0);
    });
  });

  describe("createSeedLikes", () => {
    it("should create likes for seed data", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const transactions = createSeedTransactions(users, accounts);
      const likes = createSeedLikes(users, transactions);
      expect(likes.length).toBeGreaterThan(0);
    });
  });

  describe("createSeedComments", () => {
    it("should create comments for seed data", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const transactions = createSeedTransactions(users, accounts);
      const comments = createSeedComments(users, transactions);
      expect(comments.length).toBeGreaterThan(0);
    });
  });

  describe("createSeedNotifications", () => {
    it("should create notifications for seed data", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const transactions = createSeedTransactions(users, accounts);
      const likes = createSeedLikes(users, transactions);
      const comments = createSeedComments(users, transactions);
      const notifications = createSeedNotifications(users, transactions, likes, comments);
      expect(notifications.length).toBeGreaterThan(0);
    });
  });

  describe("createSeedBankTransfers", () => {
    it("should create bank transfers for seed data", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const transactions = createSeedTransactions(users, accounts);
      const transfers = createSeedBankTransfers(users, transactions, accounts);
      expect(transfers.length).toBeGreaterThan(0);
    });

    it("should create both deposits and withdrawals", () => {
      const users = createSeedUsers();
      const accounts = createSeedBankAccounts(users);
      const transactions = createSeedTransactions(users, accounts);
      const transfers = createSeedBankTransfers(users, transactions, accounts);
      const deposits = transfers.filter((t) => t.type === BankTransferType.deposit);
      const withdrawals = transfers.filter((t) => t.type === BankTransferType.withdrawal);
      expect(deposits.length).toBeGreaterThan(0);
      expect(withdrawals.length).toBeGreaterThan(0);
    });
  });

  describe("buildDatabase", () => {
    it("should build a complete database", () => {
      const db = buildDatabase();
      expect(db.users.length).toBe(userbaseSize);
      expect(db.contacts.length).toBeGreaterThan(0);
      expect(db.bankaccounts.length).toBe(userbaseSize);
      expect(db.transactions.length).toBeGreaterThan(0);
      expect(db.likes.length).toBeGreaterThan(0);
      expect(db.comments.length).toBeGreaterThan(0);
      expect(db.notifications.length).toBeGreaterThan(0);
      expect(db.banktransfers.length).toBeGreaterThan(0);
    });
  });
});
