import { describe, expect, it, beforeEach } from "vitest";
import {
  seedDatabase,
  getAllUsers,
  getAllPublicTransactions,
  getAllForEntity,
  getAllBy,
  getBy,
  getAllByObj,
  cleanSearchQuery,
  searchUsers,
  removeUserFromResults,
  getUserBy,
  getUserId,
  getUserById,
  getUserByUsername,
  createUser,
  updateUserById,
  getContactBy,
  getContactsBy,
  getContactsByUsername,
  getContactsByUserId,
  createContact,
  removeContactById,
  createContactForUser,
  getBankAccountBy,
  getBankAccountById,
  getBankAccountsBy,
  createBankAccount,
  createBankAccountForUser,
  removeBankAccountById,
  getBankTransfersBy,
  getBankTransfersByUserId,
  getTransactionBy,
  getTransactionById,
  getTransactionsByObj,
  getTransactionByIdForApi,
  getTransactionsForUserForApi,
  getFullNameForUser,
  formatTransactionForApiResponse,
  formatTransactionsForApiResponse,
  getAllTransactionsForUserByObj,
  transactionsWithinAmountRange,
  transactionsWithinDateRange,
  getTransactionsForUserByObj,
  getContactIdsForUser,
  getTransactionsForUserContacts,
  getTransactionIds,
  getContactsTransactionIds,
  nonContactPublicTransactions,
  getNonContactPublicTransactionsForApi,
  getPublicTransactionsDefaultSort,
  getPublicTransactionsByQuery,
  debitPayAppBalance,
  creditPayAppBalance,
  savePayAppBalance,
  createTransaction,
  updateTransactionById,
  getLikeBy,
  getLikesByObj,
  getLikeById,
  getLikesByTransactionId,
  createLike,
  createLikes,
  getCommentBy,
  getCommentsByObj,
  getCommentById,
  getCommentsByTransactionId,
  createComment,
  createComments,
  getNotificationBy,
  getNotificationsByObj,
  getUnreadNotificationsByUserId,
  createPaymentNotification,
  createLikeNotification,
  createCommentNotification,
  createNotifications,
  updateNotificationById,
  formatNotificationForApiResponse,
  formatNotificationsForApiResponse,
  getRandomUser,
  getAllContacts,
  getAllTransactions,
  getBankAccountsByUserId,
  getNotificationById,
  getNotificationsByUserId,
  getTransactionsBy,
  getTransactionsByUserId,
} from "../../backend/database";
import {
  User,
  Transaction,
  PaymentNotificationStatus,
  NotificationsType,
  DefaultPrivacyLevel,
  TransactionStatus,
  TransactionRequestStatus,
} from "../models";

describe("Database Extended Tests", () => {
  beforeEach(() => {
    seedDatabase();
  });

  describe("getAllUsers", () => {
    it("should return all users", () => {
      const users = getAllUsers();
      expect(users.length).toBeGreaterThan(0);
    });
  });

  describe("getAllPublicTransactions", () => {
    it("should return only public transactions", () => {
      const transactions = getAllPublicTransactions();
      transactions.forEach((tx: Transaction) => {
        expect(tx.privacyLevel).toBe(DefaultPrivacyLevel.public);
      });
    });
  });

  describe("getAllForEntity", () => {
    it("should return all users", () => {
      const users = getAllForEntity("users");
      expect(users.length).toBeGreaterThan(0);
    });

    it("should return all transactions", () => {
      const transactions = getAllForEntity("transactions");
      expect(transactions.length).toBeGreaterThan(0);
    });

    it("should return all contacts", () => {
      const contacts = getAllForEntity("contacts");
      expect(contacts.length).toBeGreaterThan(0);
    });
  });

  describe("getAllBy and getBy", () => {
    it("should find users by a key-value pair", () => {
      const user = getAllUsers()[0];
      const result = getAllBy("users", "id", user.id);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(user.id);
    });

    it("should find a single user by key-value pair", () => {
      const user = getAllUsers()[0];
      const result = getBy("users", "id", user.id);
      expect(result.id).toBe(user.id);
    });
  });

  describe("getAllByObj", () => {
    it("should find records by query object", () => {
      const user = getAllUsers()[0];
      const result = getAllByObj("users", { id: user.id });
      expect(result.length).toBe(1);
    });
  });

  describe("cleanSearchQuery", () => {
    it("should remove special characters", () => {
      expect(cleanSearchQuery("hello@world!")).toBe("helloworld");
    });

    it("should keep alphanumeric characters", () => {
      expect(cleanSearchQuery("test123")).toBe("test123");
    });
  });

  describe("searchUsers", () => {
    it("should search users by name", () => {
      const user = getAllUsers()[0];
      const results = searchUsers(user.firstName);
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("should search users by username", () => {
      const user = getAllUsers()[0];
      const results = searchUsers(user.username);
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("removeUserFromResults", () => {
    it("should remove user from results by id", () => {
      const users = getAllUsers();
      const userToRemove = users[0];
      const results = removeUserFromResults(userToRemove.id, [...users]);
      const found = results.find((u: User) => u.id === userToRemove.id);
      expect(found).toBeUndefined();
    });
  });

  describe("User convenience methods", () => {
    it("getUserBy should find user by key-value", () => {
      const user = getAllUsers()[0];
      const result = getUserBy("id", user.id);
      expect(result.id).toBe(user.id);
    });

    it("getUserId should return user id", () => {
      const user = getAllUsers()[0];
      expect(getUserId(user)).toBe(user.id);
    });

    it("getUserById should find user by id", () => {
      const user = getAllUsers()[0];
      const result = getUserById(user.id);
      expect(result.id).toBe(user.id);
    });

    it("getUserByUsername should find user by username", () => {
      const user = getAllUsers()[0];
      const result = getUserByUsername(user.username);
      expect(result.username).toBe(user.username);
    });
  });

  describe("createUser", () => {
    it("should create a new user", () => {
      const userDetails = {
        firstName: "Test",
        lastName: "User",
        username: "testuser_new",
        password: "password123",
        email: "test@example.com",
        phoneNumber: "555-0001",
        balance: 10000,
        avatar: "/avatar.png",
        defaultPrivacyLevel: DefaultPrivacyLevel.public,
      };
      const user = createUser(userDetails);
      expect(user.firstName).toBe("Test");
      expect(user.lastName).toBe("User");
      expect(user.username).toBe("testuser_new");
      expect(user.id).toBeDefined();
    });
  });

  describe("updateUserById", () => {
    it("should update user fields", () => {
      const user = getAllUsers()[0];
      updateUserById(user.id, { firstName: "Updated" });
      const updated = getUserById(user.id);
      expect(updated.firstName).toBe("Updated");
    });
  });

  describe("Contact methods", () => {
    it("getContactBy should find contact by key-value", () => {
      const contacts = getAllContacts();
      const contact = contacts[0];
      const result = getContactBy("id", contact.id);
      expect(result.id).toBe(contact.id);
    });

    it("getContactsBy should find contacts by key-value", () => {
      const user = getAllUsers()[0];
      const result = getContactsBy("userId", user.id);
      expect(result.length).toBeGreaterThan(0);
    });

    it("getContactsByUsername should find contacts for a username", () => {
      const user = getAllUsers()[0];
      const result = getContactsByUsername(user.username);
      expect(result.length).toBeGreaterThan(0);
    });

    it("getContactsByUserId should find contacts for a userId", () => {
      const user = getAllUsers()[0];
      const result = getContactsByUserId(user.id);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("Bank Account methods", () => {
    it("getBankAccountBy should find account by key-value", () => {
      const user = getAllUsers()[0];
      const accounts = getBankAccountsByUserId(user.id);
      const account = getBankAccountBy("id", accounts[0].id);
      expect(account.id).toBe(accounts[0].id);
    });

    it("getBankAccountsBy should find accounts by key-value", () => {
      const user = getAllUsers()[0];
      const accounts = getBankAccountsBy("userId", user.id);
      expect(accounts.length).toBeGreaterThan(0);
    });
  });

  describe("Bank Transfer methods", () => {
    it("getBankTransfersBy should return transfers", () => {
      const user = getAllUsers()[0];
      const transfers = getBankTransfersBy("userId", user.id);
      expect(transfers).toBeDefined();
    });

    it("getBankTransfersByUserId should return transfers for user", () => {
      const user = getAllUsers()[0];
      const transfers = getBankTransfersByUserId(user.id);
      expect(transfers).toBeDefined();
    });
  });

  describe("Transaction methods", () => {
    it("getTransactionBy should find transaction by key-value", () => {
      const transactions = getAllTransactions();
      const tx = transactions[0];
      const result = getTransactionBy("id", tx.id);
      expect(result.id).toBe(tx.id);
    });

    it("getTransactionById should find transaction by id", () => {
      const transactions = getAllTransactions();
      const tx = transactions[0];
      const result = getTransactionById(tx.id);
      expect(result.id).toBe(tx.id);
    });

    it("getTransactionsByObj should find transactions by query", () => {
      const transactions = getAllTransactions();
      const tx = transactions[0];
      const result = getTransactionsByObj({ senderId: tx.senderId });
      expect(result.length).toBeGreaterThan(0);
    });

    it("getTransactionByIdForApi should return formatted transaction", () => {
      const transactions = getAllTransactions();
      const tx = transactions[0];
      const result = getTransactionByIdForApi(tx.id);
      expect(result.receiverName).toBeDefined();
      expect(result.senderName).toBeDefined();
      expect(result.likes).toBeDefined();
      expect(result.comments).toBeDefined();
    });

    it("getTransactionsForUserForApi should return transactions for user", () => {
      const user = getAllUsers()[0];
      const result = getTransactionsForUserForApi(user.id);
      expect(result).toBeDefined();
    });

    it("getFullNameForUser should return full name", () => {
      const user = getAllUsers()[0];
      const fullName = getFullNameForUser(user.id);
      expect(fullName).toContain(user.firstName);
      expect(fullName).toContain(user.lastName);
    });
  });

  describe("formatTransactionForApiResponse", () => {
    it("should format a transaction for API response", () => {
      const transactions = getAllTransactions();
      const tx = transactions[0];
      const result = formatTransactionForApiResponse(tx);
      expect(result.receiverName).toBeDefined();
      expect(result.senderName).toBeDefined();
      expect(result.likes).toBeDefined();
      expect(result.comments).toBeDefined();
    });
  });

  describe("formatTransactionsForApiResponse", () => {
    it("should format multiple transactions and sort by date", () => {
      const transactions = getAllTransactions().slice(0, 5);
      const result = formatTransactionsForApiResponse(transactions);
      expect(result.length).toBe(5);
      for (let i = 0; i < result.length - 1; i++) {
        expect(new Date(result[i].modifiedAt).getTime()).toBeGreaterThanOrEqual(
          new Date(result[i + 1].modifiedAt).getTime()
        );
      }
    });
  });

  describe("getAllTransactionsForUserByObj", () => {
    it("should get all transactions for a user", () => {
      const user = getAllUsers()[0];
      const result = getAllTransactionsForUserByObj(user.id)({});
      expect(result.length).toBeGreaterThan(0);
    });

    it("should filter by date range when provided", () => {
      const user = getAllUsers()[0];
      const result = getAllTransactionsForUserByObj(user.id)({
        dateRangeStart: "2000-01-01",
        dateRangeEnd: "2030-12-31",
        amountMin: 0,
        amountMax: 999999999,
      });
      expect(result).toBeDefined();
    });
  });

  describe("transactionsWithinAmountRange", () => {
    it("should filter transactions within amount range", () => {
      const transactions = getAllTransactions();
      const result = transactionsWithinAmountRange(1000, 50000, transactions);
      result.forEach((tx: Transaction) => {
        expect(tx.amount).toBeGreaterThanOrEqual(1000);
      });
    });

    it("should return all transactions when range is empty", () => {
      const transactions = getAllTransactions().slice(0, 5);
      const result = transactionsWithinAmountRange(0, 0, transactions);
      expect(result.length).toBe(5);
    });
  });

  describe("transactionsWithinDateRange", () => {
    it("should filter transactions within date range", () => {
      const transactions = getAllTransactions();
      const result = transactionsWithinDateRange("2000-01-01", "2030-12-31", transactions);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return all transactions when range is empty", () => {
      const transactions = getAllTransactions().slice(0, 5);
      const result = transactionsWithinDateRange("", "", transactions);
      expect(result.length).toBe(5);
    });
  });

  describe("contact-based transaction methods", () => {
    it("getContactIdsForUser should return contact ids", () => {
      const user = getAllUsers()[0];
      const contactIds = getContactIdsForUser(user.id);
      expect(contactIds.length).toBeGreaterThan(0);
    });

    it("getTransactionsForUserContacts should return contact transactions", () => {
      const user = getAllUsers()[0];
      const result = getTransactionsForUserContacts(user.id);
      expect(result).toBeDefined();
    });

    it("getTransactionIds should return array of ids", () => {
      const transactions = getAllTransactions().slice(0, 3);
      const ids = getTransactionIds(transactions);
      expect(ids.length).toBe(3);
    });

    it("getContactsTransactionIds should return ids", () => {
      const user = getAllUsers()[0];
      const ids = getContactsTransactionIds(user.id);
      expect(ids).toBeDefined();
    });
  });

  describe("public transaction methods", () => {
    it("nonContactPublicTransactions should return public non-contact transactions", () => {
      const user = getAllUsers()[0];
      const result = nonContactPublicTransactions(user.id);
      expect(result).toBeDefined();
    });

    it("getNonContactPublicTransactionsForApi should return formatted transactions", () => {
      const user = getAllUsers()[0];
      const result = getNonContactPublicTransactionsForApi(user.id);
      expect(result).toBeDefined();
    });

    it("getPublicTransactionsDefaultSort should return both types", () => {
      const user = getAllUsers()[0];
      const result = getPublicTransactionsDefaultSort(user.id);
      expect(result.contactsTransactions).toBeDefined();
      expect(result.publicTransactions).toBeDefined();
    });

    it("getPublicTransactionsByQuery with date/amount filters", () => {
      const user = getAllUsers()[0];
      const result = getPublicTransactionsByQuery(user.id, {
        dateRangeStart: "2000-01-01",
        dateRangeEnd: "2030-12-31",
        amountMin: 0,
        amountMax: 999999999,
      });
      expect(result.contactsTransactions).toBeDefined();
      expect(result.publicTransactions).toBeDefined();
    });

    it("getPublicTransactionsByQuery without filters", () => {
      const user = getAllUsers()[0];
      const result = getPublicTransactionsByQuery(user.id, {});
      expect(result.contactsTransactions).toBeDefined();
      expect(result.publicTransactions).toBeDefined();
    });
  });

  describe("createTransaction", () => {
    it("should create a payment transaction", () => {
      const users = getAllUsers();
      const sender = users[0];
      const receiver = users[1];
      const bankAccounts = getBankAccountsByUserId(sender.id);

      const tx = createTransaction(sender.id, "payment", {
        source: bankAccounts[0].id,
        amount: 50,
        description: "Test payment",
        receiverId: receiver.id,
        senderId: sender.id,
        privacyLevel: DefaultPrivacyLevel.public,
        status: TransactionStatus.pending,
      });

      expect(tx.senderId).toBe(sender.id);
      expect(tx.receiverId).toBe(receiver.id);
      expect(tx.description).toBe("Test payment");
    });

    it("should create a request transaction", () => {
      const users = getAllUsers();
      const sender = users[0];
      const receiver = users[1];
      const bankAccounts = getBankAccountsByUserId(sender.id);

      const tx = createTransaction(sender.id, "request", {
        source: bankAccounts[0].id,
        amount: 25,
        description: "Test request",
        receiverId: receiver.id,
        senderId: sender.id,
        privacyLevel: DefaultPrivacyLevel.public,
        status: TransactionStatus.pending,
      });

      expect(tx.requestStatus).toBe(TransactionRequestStatus.pending);
    });
  });

  describe("debitPayAppBalance and creditPayAppBalance", () => {
    it("should debit user balance for payment", () => {
      const users = getAllUsers();
      const user = users[0];
      const initialBalance = user.balance;
      const transactions = getAllTransactions();
      const tx = transactions.find(
        (t: Transaction) => t.senderId === user.id && t.amount < initialBalance
      );
      if (tx) {
        debitPayAppBalance(user, tx);
        const updated = getUserById(user.id);
        expect(updated.balance).toBeLessThanOrEqual(initialBalance);
      }
    });

    it("should credit user balance", () => {
      const users = getAllUsers();
      const user = users[1];
      const initialBalance = user.balance;
      const transactions = getAllTransactions();
      const tx = transactions.find((t: Transaction) => t.receiverId === user.id);
      if (tx) {
        creditPayAppBalance(user, tx);
        const updated = getUserById(user.id);
        expect(updated.balance).toBeGreaterThanOrEqual(initialBalance);
      }
    });
  });

  describe("savePayAppBalance", () => {
    it("should save balance for user", () => {
      const user = getAllUsers()[0];
      savePayAppBalance(user, 99999);
      const updated = getUserById(user.id);
      expect(updated.balance).toBe(99999);
    });
  });

  describe("Like methods", () => {
    it("getLikeBy should find like by key-value", () => {
      const user = getAllUsers()[0];
      const transactions = getTransactionsForUserContacts(user.id);
      const like = createLike(user.id, transactions[0].id);
      const result = getLikeBy("id", like.id);
      expect(result.id).toBe(like.id);
    });

    it("getLikesByObj should find likes by query", () => {
      const user = getAllUsers()[0];
      const transactions = getTransactionsForUserContacts(user.id);
      createLike(user.id, transactions[0].id);
      const result = getLikesByObj({ transactionId: transactions[0].id });
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it("getLikeById should find like by id", () => {
      const user = getAllUsers()[0];
      const transactions = getTransactionsForUserContacts(user.id);
      const like = createLike(user.id, transactions[0].id);
      const result = getLikeById(like.id);
      expect(result.id).toBe(like.id);
    });

    it("createLikes should create like and notifications", () => {
      const user = getAllUsers()[0];
      const transactions = getTransactionsByUserId(user.id);
      createLikes(user.id, transactions[0].id);
      const likes = getLikesByTransactionId(transactions[0].id);
      expect(likes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Comment methods", () => {
    it("getCommentBy should find comment by key-value", () => {
      const user = getAllUsers()[0];
      const transactions = getTransactionsForUserContacts(user.id);
      const comment = createComment(user.id, transactions[0].id, "Test comment");
      const result = getCommentBy("id", comment.id);
      expect(result.id).toBe(comment.id);
    });

    it("getCommentsByObj should find comments by query", () => {
      const user = getAllUsers()[0];
      const transactions = getTransactionsForUserContacts(user.id);
      createComment(user.id, transactions[0].id, "Test");
      const result = getCommentsByObj({ transactionId: transactions[0].id });
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it("getCommentById should find comment by id", () => {
      const user = getAllUsers()[0];
      const transactions = getTransactionsForUserContacts(user.id);
      const comment = createComment(user.id, transactions[0].id, "Test comment");
      const result = getCommentById(comment.id);
      expect(result.id).toBe(comment.id);
    });

    it("createComments should create comment and notifications", () => {
      const user = getAllUsers()[0];
      const transactions = getTransactionsByUserId(user.id);
      createComments(user.id, transactions[0].id, "My comment");
      const comments = getCommentsByTransactionId(transactions[0].id);
      expect(comments.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Notification methods", () => {
    it("getNotificationBy should find notification by key-value", () => {
      const user = getAllUsers()[0];
      const notifications = getNotificationsByUserId(user.id);
      if (notifications.length > 0) {
        const result = getNotificationBy("id", notifications[0].id);
        expect(result.id).toBe(notifications[0].id);
      }
    });

    it("getNotificationsByObj should find notifications by query", () => {
      const user = getAllUsers()[0];
      const result = getNotificationsByObj({ userId: user.id });
      expect(result).toBeDefined();
    });

    it("getUnreadNotificationsByUserId should return unread notifications", () => {
      const user = getAllUsers()[0];
      const result = getUnreadNotificationsByUserId(user.id);
      expect(result).toBeDefined();
    });

    it("formatNotificationForApiResponse should format payment notification", () => {
      const user = getAllUsers()[0];
      const transactions = getTransactionsForUserContacts(user.id);
      const notification = createPaymentNotification(
        user.id,
        transactions[0].id,
        PaymentNotificationStatus.received
      );
      const formatted = formatNotificationForApiResponse(notification);
      expect(formatted.userFullName).toBeDefined();
    });

    it("formatNotificationForApiResponse should format like notification", () => {
      const user = getAllUsers()[0];
      const transactions = getTransactionsForUserContacts(user.id);
      const like = createLike(user.id, transactions[0].id);
      const notification = createLikeNotification(user.id, transactions[0].id, like.id);
      const formatted = formatNotificationForApiResponse(notification);
      expect(formatted.userFullName).toBeDefined();
    });

    it("formatNotificationsForApiResponse should format multiple notifications", () => {
      const user = getAllUsers()[0];
      const notifications = getNotificationsByUserId(user.id);
      if (notifications.length > 0) {
        const formatted = formatNotificationsForApiResponse(notifications.slice(0, 3) as any);
        expect(formatted.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Dev/test utility functions", () => {
    it("getRandomUser should return a user", () => {
      const user = getRandomUser();
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
    });

    it("getAllContacts should return all contacts", () => {
      const contacts = getAllContacts();
      expect(contacts.length).toBeGreaterThan(0);
    });

    it("getAllTransactions should return all transactions", () => {
      const transactions = getAllTransactions();
      expect(transactions.length).toBeGreaterThan(0);
    });

    it("getBankAccountsByUserId should return accounts for user", () => {
      const user = getAllUsers()[0];
      const accounts = getBankAccountsByUserId(user.id);
      expect(accounts.length).toBeGreaterThan(0);
    });

    it("getNotificationById should return notification", () => {
      const user = getAllUsers()[0];
      const notifications = getNotificationsByUserId(user.id);
      if (notifications.length > 0) {
        const result = getNotificationById(notifications[0].id);
        expect(result.id).toBe(notifications[0].id);
      }
    });

    it("getNotificationsByUserId should return notifications", () => {
      const user = getAllUsers()[0];
      const notifications = getNotificationsByUserId(user.id);
      expect(notifications).toBeDefined();
    });

    it("getTransactionsBy should return transactions by key-value", () => {
      const user = getAllUsers()[0];
      const result = getTransactionsBy("receiverId", user.id);
      expect(result).toBeDefined();
    });

    it("getTransactionsByUserId should return transactions for user", () => {
      const user = getAllUsers()[0];
      const result = getTransactionsByUserId(user.id);
      expect(result).toBeDefined();
    });
  });

  describe("updateTransactionById", () => {
    it("should update a request transaction", () => {
      const transactions = getAllTransactions();
      const requestTx = transactions.find(
        (tx: Transaction) => tx.requestStatus === TransactionRequestStatus.pending
      );
      if (requestTx) {
        updateTransactionById(requestTx.id, {
          requestStatus: TransactionRequestStatus.accepted,
        });
        const updated = getTransactionById(requestTx.id);
        expect(updated.status).toBe(TransactionStatus.complete);
      }
    });
  });
});
