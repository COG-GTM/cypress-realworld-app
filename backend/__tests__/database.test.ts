import { describe, expect, test, beforeEach, vi } from "vitest";
import path from "path";
import fs from "fs";
import {
  seedDatabase,
  getAllUsers,
  getAllPublicTransactions,
  getAllForEntity,
  getAllBy,
  getBy,
  getAllByObj,
  cleanSearchQuery,
  performSearch,
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
  formatTransactionForApiResponse,
  formatTransactionsForApiResponse,
  getAllTransactionsForUserByObj,
  transactionsWithinAmountRange,
  transactionsWithinDateRange,
  getTransactionsForUserByObj,
  getContactIdsForUser,
  getTransactionsForUserContacts,
  getContactsTransactionIds,
  nonContactPublicTransactions,
  getNonContactPublicTransactionsForApi,
  getPublicTransactionsDefaultSort,
  getPublicTransactionsByQuery,
  debitPayAppBalance,
  creditPayAppBalance,
  createTransaction,
  updateTransactionById,
  getLikeBy,
  getLikesByObj,
  getLikeById,
  getLikesByTransactionId,
  createLike,
  getCommentBy,
  getCommentsByObj,
  getCommentById,
  getCommentsByTransactionId,
  createComment,
  getNotificationBy,
  getNotificationsByObj,
  getUnreadNotificationsByUserId,
  createPaymentNotification,
  createLikeNotification,
  createCommentNotification,
  updateNotificationById,
  formatNotificationForApiResponse,
  formatNotificationsForApiResponse,
} from "../database";
import {
  User,
  Contact,
  BankAccount,
  Transaction,
  Like,
  Comment,
  DefaultPrivacyLevel,
  PaymentNotificationStatus,
} from "../../src/models";

describe("Database Utilities", () => {
  beforeEach(() => {
    seedDatabase();
  });

  describe("seedDatabase", () => {
    test("should seed the database with test data", () => {
      seedDatabase();
      const users = getAllUsers();
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });
  });

  describe("getAllUsers", () => {
    test("should return all users from the database", () => {
      const users = getAllUsers();
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
      expect(users[0]).toHaveProperty("id");
      expect(users[0]).toHaveProperty("username");
    });
  });

  describe("getAllPublicTransactions", () => {
    test("should return only public transactions", () => {
      const transactions = getAllPublicTransactions();
      expect(Array.isArray(transactions)).toBe(true);
      transactions.forEach((transaction) => {
        expect(transaction.privacyLevel).toBe(DefaultPrivacyLevel.public);
      });
    });
  });

  describe("getAllForEntity", () => {
    test("should return all records for a given entity", () => {
      const users = getAllForEntity("users");
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });

    test("should return all contacts", () => {
      const contacts = getAllForEntity("contacts");
      expect(Array.isArray(contacts)).toBe(true);
    });

    test("should return all bank accounts", () => {
      const bankaccounts = getAllForEntity("bankaccounts");
      expect(Array.isArray(bankaccounts)).toBe(true);
    });
  });

  describe("getAllBy", () => {
    test("should return all records matching a key-value pair", () => {
      const users = getAllUsers();
      const firstUser = users[0];
      const result = getAllBy("users", "id", firstUser.id);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(firstUser.id);
    });

    test("should return empty array if no match found", () => {
      const result = getAllBy("users", "id", "nonexistent-id");
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("getBy", () => {
    test("should return a single record matching a key-value pair", () => {
      const users = getAllUsers();
      const firstUser = users[0];
      const result = getBy("users", "id", firstUser.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(firstUser.id);
    });

    test("should return undefined if no match found", () => {
      const result = getBy("users", "id", "nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("getAllByObj", () => {
    test("should return all records matching a query object", () => {
      const users = getAllUsers();
      const firstUser = users[0];
      const result = getAllByObj("users", { id: firstUser.id });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });
  });

  describe("Search Functions", () => {
    describe("cleanSearchQuery", () => {
      test("should remove non-alphanumeric characters", () => {
        expect(cleanSearchQuery("test@123!")).toBe("test123");
        expect(cleanSearchQuery("hello world")).toBe("helloworld");
        expect(cleanSearchQuery("abc-def_ghi")).toBe("abcdefghi");
      });

      test("should preserve alphanumeric characters", () => {
        expect(cleanSearchQuery("test123")).toBe("test123");
        expect(cleanSearchQuery("ABC")).toBe("ABC");
      });
    });

    describe("searchUsers", () => {
      test("should search users by firstName", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const results = searchUsers(firstUser.firstName);
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
      });

      test("should search users by username", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const results = searchUsers(firstUser.username);
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
      });

      test("should return empty array for non-matching query", () => {
        const results = searchUsers("xyznonexistent123");
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(0);
      });
    });

    describe("removeUserFromResults", () => {
      test("should remove a user from results by id", () => {
        const users = getAllUsers();
        const userToRemove = users[0];
        const results = removeUserFromResults(userToRemove.id, users);
        expect(results.find((u) => u.id === userToRemove.id)).toBeUndefined();
      });
    });
  });

  describe("User Functions", () => {
    describe("getUserBy", () => {
      test("should get user by any key", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getUserBy("username", firstUser.username);
        expect(result).toBeDefined();
        expect(result.username).toBe(firstUser.username);
      });
    });

    describe("getUserId", () => {
      test("should return user id", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        expect(getUserId(firstUser)).toBe(firstUser.id);
      });
    });

    describe("getUserById", () => {
      test("should get user by id", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getUserById(firstUser.id);
        expect(result).toBeDefined();
        expect(result.id).toBe(firstUser.id);
      });
    });

    describe("getUserByUsername", () => {
      test("should get user by username", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getUserByUsername(firstUser.username);
        expect(result).toBeDefined();
        expect(result.username).toBe(firstUser.username);
      });
    });

    describe("createUser", () => {
      test("should create a new user", () => {
        const userDetails: Partial<User> = {
          firstName: "Test",
          lastName: "User",
          username: "testuser123",
          password: "password123",
          email: "test@example.com",
          phoneNumber: "1234567890",
          balance: 1000,
          avatar: "https://example.com/avatar.png",
          defaultPrivacyLevel: DefaultPrivacyLevel.public,
        };

        const newUser = createUser(userDetails);
        expect(newUser).toBeDefined();
        expect(newUser.id).toBeDefined();
        expect(newUser.uuid).toBeDefined();
        expect(newUser.firstName).toBe(userDetails.firstName);
        expect(newUser.lastName).toBe(userDetails.lastName);
        expect(newUser.username).toBe(userDetails.username);
        expect(newUser.email).toBe(userDetails.email);
        expect(newUser.password).not.toBe(userDetails.password);
      });
    });

    describe("updateUserById", () => {
      test("should update user by id", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const newFirstName = "UpdatedFirstName";

        updateUserById(firstUser.id, { firstName: newFirstName });
        const updatedUser = getUserById(firstUser.id);
        expect(updatedUser.firstName).toBe(newFirstName);
      });
    });
  });

  describe("Contact Functions", () => {
    describe("getContactBy", () => {
      test("should get contact by key", () => {
        const contacts = getAllForEntity("contacts") as Contact[];
        if (contacts.length > 0) {
          const firstContact = contacts[0];
          const result = getContactBy("id", firstContact.id);
          expect(result).toBeDefined();
          expect(result.id).toBe(firstContact.id);
        }
      });
    });

    describe("getContactsBy", () => {
      test("should get all contacts by key", () => {
        const contacts = getAllForEntity("contacts") as Contact[];
        if (contacts.length > 0) {
          const firstContact = contacts[0];
          const result = getContactsBy("userId", firstContact.userId);
          expect(Array.isArray(result)).toBe(true);
        }
      });
    });

    describe("getContactsByUserId", () => {
      test("should get contacts by user id", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getContactsByUserId(firstUser.id);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("getContactsByUsername", () => {
      test("should get contacts by username", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getContactsByUsername(firstUser.username);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("createContactForUser", () => {
      test("should create a contact for a user", () => {
        const users = getAllUsers();
        const user1 = users[0];
        const user2 = users[1];

        const contact = createContactForUser(user1.id, user2.id);
        expect(contact).toBeDefined();
        expect(contact.userId).toBe(user1.id);
        expect(contact.contactUserId).toBe(user2.id);
      });
    });

    describe("removeContactById", () => {
      test("should remove a contact by id", () => {
        const users = getAllUsers();
        const user1 = users[0];
        const user2 = users[1];

        const contact = createContactForUser(user1.id, user2.id);
        removeContactById(contact.id);
        const result = getContactBy("id", contact.id);
        expect(result).toBeUndefined();
      });
    });
  });

  describe("Bank Account Functions", () => {
    describe("getBankAccountBy", () => {
      test("should get bank account by key", () => {
        const bankAccounts = getAllForEntity("bankaccounts") as BankAccount[];
        if (bankAccounts.length > 0) {
          const firstAccount = bankAccounts[0];
          const result = getBankAccountBy("id", firstAccount.id);
          expect(result).toBeDefined();
          expect(result.id).toBe(firstAccount.id);
        }
      });
    });

    describe("getBankAccountById", () => {
      test("should get bank account by id", () => {
        const bankAccounts = getAllForEntity("bankaccounts") as BankAccount[];
        if (bankAccounts.length > 0) {
          const firstAccount = bankAccounts[0];
          const result = getBankAccountById(firstAccount.id);
          expect(result).toBeDefined();
          expect(result.id).toBe(firstAccount.id);
        }
      });
    });

    describe("getBankAccountsBy", () => {
      test("should get all bank accounts by key", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getBankAccountsBy("userId", firstUser.id);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("createBankAccountForUser", () => {
      test("should create a bank account for a user", () => {
        const users = getAllUsers();
        const firstUser = users[0];

        const accountDetails: Partial<BankAccount> = {
          bankName: "Test Bank",
          accountNumber: "123456789",
          routingNumber: "987654321",
        };

        const bankAccount = createBankAccountForUser(firstUser.id, accountDetails);
        expect(bankAccount).toBeDefined();
        expect(bankAccount.userId).toBe(firstUser.id);
        expect(bankAccount.bankName).toBe(accountDetails.bankName);
        expect(bankAccount.accountNumber).toBe(accountDetails.accountNumber);
        expect(bankAccount.routingNumber).toBe(accountDetails.routingNumber);
        expect(bankAccount.isDeleted).toBe(false);
      });
    });

    describe("removeBankAccountById", () => {
      test("should soft delete a bank account", () => {
        const users = getAllUsers();
        const firstUser = users[0];

        const accountDetails: Partial<BankAccount> = {
          bankName: "Test Bank",
          accountNumber: "123456789",
          routingNumber: "987654321",
        };

        const bankAccount = createBankAccountForUser(firstUser.id, accountDetails);
        removeBankAccountById(bankAccount.id);
        const result = getBankAccountById(bankAccount.id);
        expect(result.isDeleted).toBe(true);
      });
    });
  });

  describe("Bank Transfer Functions", () => {
    describe("getBankTransfersBy", () => {
      test("should get bank transfers by key", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getBankTransfersBy("userId", firstUser.id);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("getBankTransfersByUserId", () => {
      test("should get bank transfers by user id", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getBankTransfersByUserId(firstUser.id);
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe("Transaction Functions", () => {
    describe("getTransactionBy", () => {
      test("should get transaction by key", () => {
        const transactions = getAllForEntity("transactions") as Transaction[];
        if (transactions.length > 0) {
          const firstTransaction = transactions[0];
          const result = getTransactionBy("id", firstTransaction.id);
          expect(result).toBeDefined();
          expect(result.id).toBe(firstTransaction.id);
        }
      });
    });

    describe("getTransactionById", () => {
      test("should get transaction by id", () => {
        const transactions = getAllForEntity("transactions") as Transaction[];
        if (transactions.length > 0) {
          const firstTransaction = transactions[0];
          const result = getTransactionById(firstTransaction.id);
          expect(result).toBeDefined();
          expect(result.id).toBe(firstTransaction.id);
        }
      });
    });

    describe("getTransactionsByObj", () => {
      test("should get transactions by query object", () => {
        const transactions = getAllForEntity("transactions") as Transaction[];
        if (transactions.length > 0) {
          const firstTransaction = transactions[0];
          const result = getTransactionsByObj({ senderId: firstTransaction.senderId });
          expect(Array.isArray(result)).toBe(true);
        }
      });
    });

    describe("getTransactionByIdForApi", () => {
      test("should format transaction for API response", () => {
        const transactions = getAllForEntity("transactions") as Transaction[];
        if (transactions.length > 0) {
          const firstTransaction = transactions[0];
          const result = getTransactionByIdForApi(firstTransaction.id);
          expect(result).toBeDefined();
          expect(result).toHaveProperty("receiverName");
          expect(result).toHaveProperty("senderName");
          expect(result).toHaveProperty("likes");
          expect(result).toHaveProperty("comments");
        }
      });
    });

    describe("formatTransactionForApiResponse", () => {
      test("should format a transaction with additional fields", () => {
        const transactions = getAllForEntity("transactions") as Transaction[];
        if (transactions.length > 0) {
          const firstTransaction = transactions[0];
          const result = formatTransactionForApiResponse(firstTransaction);
          expect(result).toHaveProperty("receiverName");
          expect(result).toHaveProperty("senderName");
          expect(result).toHaveProperty("receiverAvatar");
          expect(result).toHaveProperty("senderAvatar");
          expect(result).toHaveProperty("likes");
          expect(result).toHaveProperty("comments");
        }
      });
    });

    describe("formatTransactionsForApiResponse", () => {
      test("should format multiple transactions and sort by date", () => {
        const transactions = getAllForEntity("transactions") as Transaction[];
        if (transactions.length > 1) {
          const result = formatTransactionsForApiResponse(transactions.slice(0, 5));
          expect(Array.isArray(result)).toBe(true);
          expect(result[0]).toHaveProperty("receiverName");
        }
      });
    });

    describe("transactionsWithinAmountRange", () => {
      test("should filter transactions within amount range", () => {
        const transactions = getAllForEntity("transactions") as Transaction[];
        const result = transactionsWithinAmountRange(0, 100000, transactions);
        expect(Array.isArray(result)).toBe(true);
      });

      test("should return all transactions if no range provided", () => {
        const transactions = getAllForEntity("transactions") as Transaction[];
        const result = transactionsWithinAmountRange(0, 0, transactions);
        expect(result).toEqual(transactions);
      });
    });

    describe("transactionsWithinDateRange", () => {
      test("should filter transactions within date range", () => {
        const transactions = getAllForEntity("transactions") as Transaction[];
        const startDate = new Date("2019-01-01").toISOString();
        const endDate = new Date("2030-12-31").toISOString();
        const result = transactionsWithinDateRange(startDate, endDate, transactions);
        expect(Array.isArray(result)).toBe(true);
      });

      test("should return all transactions if no range provided", () => {
        const transactions = getAllForEntity("transactions") as Transaction[];
        const result = transactionsWithinDateRange("", "", transactions);
        expect(result).toEqual(transactions);
      });
    });

    describe("getTransactionsForUserByObj", () => {
      test("should get transactions for user by query object", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getTransactionsForUserByObj(firstUser.id, {});
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("getAllTransactionsForUserByObj", () => {
      test("should get all transactions for user", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getAllTransactionsForUserByObj(firstUser.id, {});
        expect(Array.isArray(result)).toBe(true);
      });

      test("should filter by date range", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getAllTransactionsForUserByObj(firstUser.id, {
          dateRangeStart: "2019-01-01",
          dateRangeEnd: "2030-12-31",
        });
        expect(Array.isArray(result)).toBe(true);
      });

      test("should filter by amount range", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getAllTransactionsForUserByObj(firstUser.id, {
          amountMin: 0,
          amountMax: 100000,
        });
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("getContactIdsForUser", () => {
      test("should get contact ids for user", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getContactIdsForUser(firstUser.id);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("getTransactionsForUserContacts", () => {
      test("should get transactions for user contacts", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getTransactionsForUserContacts(firstUser.id);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("getContactsTransactionIds", () => {
      test("should get transaction ids for contacts", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getContactsTransactionIds(firstUser.id);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("nonContactPublicTransactions", () => {
      test("should get non-contact public transactions", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = nonContactPublicTransactions(firstUser.id);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("getNonContactPublicTransactionsForApi", () => {
      test("should get formatted non-contact public transactions", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getNonContactPublicTransactionsForApi(firstUser.id);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("getPublicTransactionsDefaultSort", () => {
      test("should get public transactions with default sort", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getPublicTransactionsDefaultSort(firstUser.id);
        expect(result).toHaveProperty("contactsTransactions");
        expect(result).toHaveProperty("publicTransactions");
      });
    });

    describe("getPublicTransactionsByQuery", () => {
      test("should get public transactions by query", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getPublicTransactionsByQuery(firstUser.id, {});
        expect(result).toHaveProperty("contactsTransactions");
        expect(result).toHaveProperty("publicTransactions");
      });

      test("should filter by date and amount range", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getPublicTransactionsByQuery(firstUser.id, {
          dateRangeStart: "2019-01-01",
          dateRangeEnd: "2030-12-31",
          amountMin: 0,
          amountMax: 100000,
        });
        expect(result).toHaveProperty("contactsTransactions");
        expect(result).toHaveProperty("publicTransactions");
      });
    });

    describe("createTransaction", () => {
      test("should create a payment transaction", () => {
        const users = getAllUsers();
        const sender = users[0];
        const receiver = users[1];

        const bankAccounts = getBankAccountsBy("userId", sender.id);
        const sourceId = bankAccounts.length > 0 ? bankAccounts[0].id : "test-source";

        const transactionDetails = {
          receiverId: receiver.id,
          amount: 10,
          description: "Test payment",
          source: sourceId,
          privacyLevel: DefaultPrivacyLevel.public,
        };

        const transaction = createTransaction(sender.id, "payment", transactionDetails);
        expect(transaction).toBeDefined();
        expect(transaction.senderId).toBe(sender.id);
        expect(transaction.receiverId).toBe(receiver.id);
        expect(transaction.amount).toBe(1000);
        expect(transaction.description).toBe("Test payment");
      });

      test("should create a request transaction", () => {
        const users = getAllUsers();
        const sender = users[0];
        const receiver = users[1];

        const bankAccounts = getBankAccountsBy("userId", sender.id);
        const sourceId = bankAccounts.length > 0 ? bankAccounts[0].id : "test-source";

        const transactionDetails = {
          receiverId: receiver.id,
          amount: 10,
          description: "Test request",
          source: sourceId,
          privacyLevel: DefaultPrivacyLevel.public,
        };

        const transaction = createTransaction(sender.id, "request", transactionDetails);
        expect(transaction).toBeDefined();
        expect(transaction.senderId).toBe(sender.id);
        expect(transaction.receiverId).toBe(receiver.id);
        expect(transaction.requestStatus).toBeDefined();
      });
    });

    describe("debitPayAppBalance", () => {
      test("should debit user balance for payment", () => {
        const users = getAllUsers();
        const sender = users[0];
        const initialBalance = sender.balance;

        const transactions = getAllForEntity("transactions") as Transaction[];
        const paymentTransaction = transactions.find(
          (t) => t.senderId === sender.id && !t.requestStatus
        );

        if (paymentTransaction) {
          debitPayAppBalance(sender, paymentTransaction);
          const updatedSender = getUserById(sender.id);
          expect(updatedSender.balance).toBeDefined();
        }
      });
    });

    describe("creditPayAppBalance", () => {
      test("should credit user balance", () => {
        const users = getAllUsers();
        const receiver = users[1];

        const transactions = getAllForEntity("transactions") as Transaction[];
        const paymentTransaction = transactions.find(
          (t) => t.receiverId === receiver.id && !t.requestStatus
        );

        if (paymentTransaction) {
          creditPayAppBalance(receiver, paymentTransaction);
          const updatedReceiver = getUserById(receiver.id);
          expect(updatedReceiver.balance).toBeDefined();
        }
      });
    });
  });

  describe("Like Functions", () => {
    describe("getLikeBy", () => {
      test("should get like by key", () => {
        const likes = getAllForEntity("likes") as Like[];
        if (likes.length > 0) {
          const firstLike = likes[0];
          const result = getLikeBy("id", firstLike.id);
          expect(result).toBeDefined();
          expect(result.id).toBe(firstLike.id);
        }
      });
    });

    describe("getLikesByObj", () => {
      test("should get likes by query object", () => {
        const likes = getAllForEntity("likes") as Like[];
        if (likes.length > 0) {
          const firstLike = likes[0];
          const result = getLikesByObj({ transactionId: firstLike.transactionId });
          expect(Array.isArray(result)).toBe(true);
        }
      });
    });

    describe("getLikeById", () => {
      test("should get like by id", () => {
        const likes = getAllForEntity("likes") as Like[];
        if (likes.length > 0) {
          const firstLike = likes[0];
          const result = getLikeById(firstLike.id);
          expect(result).toBeDefined();
          expect(result.id).toBe(firstLike.id);
        }
      });
    });

    describe("getLikesByTransactionId", () => {
      test("should get likes by transaction id", () => {
        const transactions = getAllForEntity("transactions") as Transaction[];
        if (transactions.length > 0) {
          const firstTransaction = transactions[0];
          const result = getLikesByTransactionId(firstTransaction.id);
          expect(Array.isArray(result)).toBe(true);
        }
      });
    });

    describe("createLike", () => {
      test("should create a like", () => {
        const users = getAllUsers();
        const transactions = getAllForEntity("transactions") as Transaction[];
        if (transactions.length > 0) {
          const firstUser = users[0];
          const firstTransaction = transactions[0];
          const like = createLike(firstUser.id, firstTransaction.id);
          expect(like).toBeDefined();
          expect(like.userId).toBe(firstUser.id);
          expect(like.transactionId).toBe(firstTransaction.id);
        }
      });
    });
  });

  describe("Comment Functions", () => {
    describe("getCommentBy", () => {
      test("should get comment by key", () => {
        const comments = getAllForEntity("comments") as Comment[];
        if (comments.length > 0) {
          const firstComment = comments[0];
          const result = getCommentBy("id", firstComment.id);
          expect(result).toBeDefined();
          expect(result.id).toBe(firstComment.id);
        }
      });
    });

    describe("getCommentsByObj", () => {
      test("should get comments by query object", () => {
        const comments = getAllForEntity("comments") as Comment[];
        if (comments.length > 0) {
          const firstComment = comments[0];
          const result = getCommentsByObj({ transactionId: firstComment.transactionId });
          expect(Array.isArray(result)).toBe(true);
        }
      });
    });

    describe("getCommentById", () => {
      test("should get comment by id", () => {
        const comments = getAllForEntity("comments") as Comment[];
        if (comments.length > 0) {
          const firstComment = comments[0];
          const result = getCommentById(firstComment.id);
          expect(result).toBeDefined();
          expect(result.id).toBe(firstComment.id);
        }
      });
    });

    describe("getCommentsByTransactionId", () => {
      test("should get comments by transaction id", () => {
        const transactions = getAllForEntity("transactions") as Transaction[];
        if (transactions.length > 0) {
          const firstTransaction = transactions[0];
          const result = getCommentsByTransactionId(firstTransaction.id);
          expect(Array.isArray(result)).toBe(true);
        }
      });
    });

    describe("createComment", () => {
      test("should create a comment", () => {
        const users = getAllUsers();
        const transactions = getAllForEntity("transactions") as Transaction[];
        if (transactions.length > 0) {
          const firstUser = users[0];
          const firstTransaction = transactions[0];
          const comment = createComment(firstUser.id, firstTransaction.id, "Test comment");
          expect(comment).toBeDefined();
          expect(comment.userId).toBe(firstUser.id);
          expect(comment.transactionId).toBe(firstTransaction.id);
          expect(comment.content).toBe("Test comment");
        }
      });
    });
  });

  describe("Notification Functions", () => {
    describe("getNotificationBy", () => {
      test("should get notification by key", () => {
        const notifications = getAllForEntity("notifications");
        if (notifications.length > 0) {
          const firstNotification = notifications[0];
          const result = getNotificationBy("id", firstNotification.id);
          expect(result).toBeDefined();
          expect(result.id).toBe(firstNotification.id);
        }
      });
    });

    describe("getNotificationsByObj", () => {
      test("should get notifications by query object", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getNotificationsByObj({ userId: firstUser.id });
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("getUnreadNotificationsByUserId", () => {
      test("should get unread notifications for user", () => {
        const users = getAllUsers();
        const firstUser = users[0];
        const result = getUnreadNotificationsByUserId(firstUser.id);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("createPaymentNotification", () => {
      test("should create a payment notification", () => {
        const users = getAllUsers();
        const transactions = getAllForEntity("transactions") as Transaction[];
        if (transactions.length > 0) {
          const firstUser = users[0];
          const firstTransaction = transactions[0];
          const notification = createPaymentNotification(
            firstUser.id,
            firstTransaction.id,
            PaymentNotificationStatus.received
          );
          expect(notification).toBeDefined();
          expect(notification.userId).toBe(firstUser.id);
          expect(notification.transactionId).toBe(firstTransaction.id);
          expect(notification.status).toBe(PaymentNotificationStatus.received);
        }
      });
    });

    describe("createLikeNotification", () => {
      test("should create a like notification", () => {
        const users = getAllUsers();
        const transactions = getAllForEntity("transactions") as Transaction[];
        const likes = getAllForEntity("likes") as Like[];
        if (transactions.length > 0 && likes.length > 0) {
          const firstUser = users[0];
          const firstTransaction = transactions[0];
          const firstLike = likes[0];
          const notification = createLikeNotification(
            firstUser.id,
            firstTransaction.id,
            firstLike.id
          );
          expect(notification).toBeDefined();
          expect(notification.userId).toBe(firstUser.id);
          expect(notification.transactionId).toBe(firstTransaction.id);
          expect(notification.likeId).toBe(firstLike.id);
        }
      });
    });

    describe("createCommentNotification", () => {
      test("should create a comment notification", () => {
        const users = getAllUsers();
        const transactions = getAllForEntity("transactions") as Transaction[];
        const comments = getAllForEntity("comments") as Comment[];
        if (transactions.length > 0 && comments.length > 0) {
          const firstUser = users[0];
          const firstTransaction = transactions[0];
          const firstComment = comments[0];
          const notification = createCommentNotification(
            firstUser.id,
            firstTransaction.id,
            firstComment.id
          );
          expect(notification).toBeDefined();
          expect(notification.userId).toBe(firstUser.id);
          expect(notification.transactionId).toBe(firstTransaction.id);
          expect(notification.commentId).toBe(firstComment.id);
        }
      });
    });

    describe("updateNotificationById", () => {
      test("should update notification by id", () => {
        const users = getAllUsers();
        const transactions = getAllForEntity("transactions") as Transaction[];
        if (transactions.length > 0) {
          const firstUser = users[0];
          const firstTransaction = transactions[0];
          const notification = createPaymentNotification(
            firstUser.id,
            firstTransaction.id,
            PaymentNotificationStatus.received
          );

          updateNotificationById(firstUser.id, notification.id, { isRead: true });
          const updatedNotification = getNotificationBy("id", notification.id);
          expect(updatedNotification.isRead).toBe(true);
        }
      });
    });

    describe("formatNotificationForApiResponse", () => {
      test("should format notification for API response", () => {
        const notifications = getAllForEntity("notifications");
        if (notifications.length > 0) {
          const firstNotification = notifications[0];
          const result = formatNotificationForApiResponse(firstNotification);
          expect(result).toHaveProperty("userFullName");
        }
      });
    });

    describe("formatNotificationsForApiResponse", () => {
      test("should format multiple notifications for API response", () => {
        const notifications = getAllForEntity("notifications");
        if (notifications.length > 0) {
          const result = formatNotificationsForApiResponse(notifications.slice(0, 5));
          expect(Array.isArray(result)).toBe(true);
          if (result.length > 0) {
            expect(result[0]).toHaveProperty("userFullName");
          }
        }
      });
    });
  });
});
