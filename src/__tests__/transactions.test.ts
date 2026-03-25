import { describe, expect, it, beforeEach } from "vitest";
import { map } from "lodash/fp";
import {
  seedDatabase,
  getTransactionsForUserByObj,
  getTransactionsForUserContacts,
  getAllUsers,
  getAllTransactions,
  getAllPublicTransactions,
  getBankAccountsByUserId,
  createTransaction,
  getTransactionsByUserId,
  updateTransactionById,
  getTransactionById,
  getPublicTransactionsDefaultSort,
  getUserById,
  getBankTransferByTransactionId,
} from "../../backend/database";

import {
  User,
  Transaction,
  TransactionRequestStatus,
  DefaultPrivacyLevel,
  BankTransferType,
  TransactionPayload,
  TransactionStatus,
} from "../../src/models";
import { getFakeAmount } from "../../src/utils/transactionUtils";
import { totalTransactions, transactionsPerUser } from "../../scripts/seedDataUtils";

describe("Transactions", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should retrieve a list of all transactions", () => {
    expect(getAllTransactions().length).toBe(totalTransactions);
  });

  it("should retrieve a list of all public transactions", () => {
    expect(getAllPublicTransactions().length).toBeGreaterThan(transactionsPerUser);
    expect(getAllPublicTransactions().length).toBeLessThan(totalTransactions);
  });

  it("should retrieve a list of transactions for a user (user is receiver)", () => {
    const userToLookup: User = getAllUsers()[0];

    const result: Transaction[] = getTransactionsForUserByObj(userToLookup.id, {
      status: "complete",
    });
    expect(result[0].receiverId).toBe(userToLookup.id);
  });

  it("should retrieve a list of transactions for a user (user is sender)", () => {
    const userToLookup: User = getAllUsers()[0];

    const result: Transaction[] = getTransactionsForUserByObj(userToLookup.id, {});
    expect(result.pop()!.senderId).toBe(userToLookup.id);
  });

  it("should retrieve a list of transactions for a users contacts", () => {
    const userToLookup: User = getAllUsers()[0];
    const result: Transaction[] = getTransactionsForUserContacts(userToLookup.id);

    expect(result.length).toBeGreaterThan(transactionsPerUser);
    expect(result.length).toBeLessThan(totalTransactions);
  });

  it("should retrieve a list of transactions for a users contacts - between date range", () => {
    const userToLookup: User = getAllUsers()[0];
    const result: Transaction[] = getTransactionsForUserContacts(userToLookup.id, {
      dateRangeStart: new Date("Mar 09 2023"),
      dateRangeEnd: new Date("Mar 09 2024"),
    });
    expect(result.length).toBeGreaterThan(1);
  });

  it("should retrieve a list of public transactions, default sort", () => {
    const user: User = getAllUsers()[0];
    const contactsTransactions: Transaction[] = getTransactionsForUserContacts(user.id);
    expect(contactsTransactions.length).toBeGreaterThan(1);
    expect(contactsTransactions.length).toBeLessThan(totalTransactions);

    const response = getPublicTransactionsDefaultSort(user.id);

    expect(response.contactsTransactions.length).toBeGreaterThan(1);
    expect(response.contactsTransactions.length).toBeLessThan(totalTransactions);
    expect(response.publicTransactions.length).toBeGreaterThan(1);
    expect(response.publicTransactions.length).toBeLessThan(totalTransactions);

    const ids = map("id", contactsTransactions);
    expect(ids).toContain(response.contactsTransactions[9].id);
  });

  it("should create a payment", () => {
    const sender: User = getAllUsers()[0];
    const receiver: User = getAllUsers()[1];
    const senderBankAccount = getBankAccountsByUserId(sender.id)[0];

    const paymentDetails: TransactionPayload = {
      source: senderBankAccount.id!,
      senderId: sender.id,
      receiverId: receiver.id,
      description: `Payment: ${sender.id} to ${receiver.id}`,
      amount: getFakeAmount(),
      privacyLevel: DefaultPrivacyLevel.public,
      status: TransactionStatus.pending,
    };

    const result = createTransaction(sender.id, "payment", paymentDetails);
    expect(result.id).toBeDefined();
    expect(result.status).toEqual("complete");
    expect(result.requestStatus).not.toBeDefined();
  });

  it("should create a request", () => {
    const sender: User = getAllUsers()[0];
    const receiver: User = getAllUsers()[1];
    const senderBankAccount = getBankAccountsByUserId(sender.id)[0];

    const requestDetails: TransactionPayload = {
      source: senderBankAccount.id!,
      senderId: sender.id,
      receiverId: receiver.id,
      description: `Request: ${sender.id} to ${receiver.id}`,
      amount: getFakeAmount(),
      privacyLevel: DefaultPrivacyLevel.public,
      status: TransactionStatus.pending,
    };

    const result = createTransaction(sender.id, "request", requestDetails);
    expect(result.id).toBeDefined();
    expect(result.status).toEqual("pending");
    expect(result.requestStatus).toEqual("pending");
  });

  it("should create a payment and find it in the personal transactions", () => {
    const sender: User = getAllUsers()[0];
    const receiver: User = getAllUsers()[1];
    const senderBankAccount = getBankAccountsByUserId(sender.id)[0];

    const paymentDetails: TransactionPayload = {
      source: senderBankAccount.id!,
      senderId: sender.id,
      receiverId: receiver.id,
      description: `Payment: ${sender.id} to ${receiver.id}`,
      amount: getFakeAmount(),
      privacyLevel: DefaultPrivacyLevel.private,
      status: TransactionStatus.pending,
    };

    const payment = createTransaction(sender.id, "payment", paymentDetails);
    expect(payment.id).toBeDefined();

    const personalTransactions: Transaction[] = getTransactionsForUserByObj(sender.id, {});
    const ids = map("id", personalTransactions);
    expect(ids).toContain(payment.id);
  });

  it("should reject (update) a transaction", () => {
    const user: User = getAllUsers()[0];

    const transactions = getTransactionsByUserId(user.id);
    expect(transactions.length).toBeGreaterThanOrEqual(transactionsPerUser);

    const transaction = transactions[0];
    expect(transaction.requestStatus).not.toEqual("rejected");

    const edits: Partial<Transaction> = {
      requestStatus: TransactionRequestStatus.rejected,
    };
    updateTransactionById(transaction.id, edits);

    const updatedTransaction = getTransactionById(transaction.id);
    expect(updatedTransaction.requestStatus).toEqual("rejected");
  });

  it("should accept (update) a transaction", () => {
    const user: User = getAllUsers()[0];

    const transactions = getTransactionsByUserId(user.id);
    expect(transactions.length).toBeGreaterThanOrEqual(transactionsPerUser);

    const transaction = transactions[0];
    expect(transaction.requestStatus).not.toEqual("accepted");

    const edits: Partial<Transaction> = {
      requestStatus: TransactionRequestStatus.accepted,
    };
    updateTransactionById(transaction.id, edits);

    const updatedTransaction = getTransactionById(transaction.id);
    expect(updatedTransaction.requestStatus).toEqual("accepted");
  });

  it("should add additional fields (e.g. retreiverName, senderName, etc) to a list of transactions for a user for API response", () => {
    const userToLookup: User = getAllUsers()[0];

    const result = getPublicTransactionsDefaultSort(userToLookup.id);

    const transaction = result.publicTransactions[0];
    const { receiverId, senderId, receiverName, senderName } = transaction;
    const receiver = getUserById(receiverId);
    const sender = getUserById(senderId);

    expect(receiverName).toBe(`${receiver.firstName} ${receiver.lastName}`);
    expect(senderName).toBe(`${sender.firstName} ${sender.lastName}`);
    expect(transaction.likes).toBeDefined();
    expect(transaction.comments).toBeDefined();
  });

  it("should create a payment and withdrawal (bank transfer) for remaining balance", () => {
    const sender: User = getAllUsers()[0];
    const receiver: User = getAllUsers()[1];
    const senderBankAccount = getBankAccountsByUserId(sender.id)[0];

    // Capture original balances before mutations (lowdb objects are mutable refs)
    const originalSenderBalance = sender.balance;
    const originalReceiverBalance = receiver.balance;

    // createTransaction multiplies amount by 100 (converts to cents).
    // To exceed sender's balance, we pass an amount that after *100 exceeds sender.balance (cents).
    const firstPaymentPayloadAmount = Math.floor(originalSenderBalance / 100) + 10;
    const secondPaymentPayloadAmount = 5;

    const receiverTransactions = getTransactionsByUserId(receiver.id);
    expect(receiverTransactions.length).toBeGreaterThan(1);

    const paymentDetails: TransactionPayload = {
      source: senderBankAccount.id!,
      senderId: sender.id,
      receiverId: receiver.id,
      description: `Payment: ${sender.id} to ${receiver.id}`,
      amount: firstPaymentPayloadAmount,
      privacyLevel: DefaultPrivacyLevel.public,
      status: TransactionStatus.pending,
    };

    const transaction = createTransaction(sender.id, "payment", paymentDetails);
    expect(transaction.id).toBeDefined();
    expect(transaction.status).toEqual("complete");
    expect(transaction.requestStatus).not.toBeDefined();

    const updatedSender: User = getAllUsers()[0];
    expect(updatedSender.balance).toBe(0);

    const withdrawal = getBankTransferByTransactionId(transaction.id);
    expect(withdrawal.type).toBe(BankTransferType.withdrawal);
    // Withdrawal amount = stored transaction amount (cents) - sender's original balance (cents)
    const expectedFirstWithdrawal = firstPaymentPayloadAmount * 100 - originalSenderBalance;
    expect(withdrawal.amount).toBe(expectedFirstWithdrawal);

    // Second transaction when sender balance is 0 — any amount exceeds balance
    const secondPaymentDetails: TransactionPayload = {
      source: senderBankAccount.id!,
      senderId: sender.id,
      receiverId: receiver.id,
      description: `Payment: ${sender.id} to ${receiver.id}`,
      amount: secondPaymentPayloadAmount,
      privacyLevel: DefaultPrivacyLevel.public,
      status: TransactionStatus.pending,
    };
    const secondTransaction = createTransaction(sender.id, "payment", secondPaymentDetails);
    expect(secondTransaction.id).toBeDefined();
    expect(secondTransaction.status).toEqual("complete");
    expect(secondTransaction.requestStatus).not.toBeDefined();

    const secondUpdatedSender: User = getAllUsers()[0];
    expect(secondUpdatedSender.balance).toBe(0);

    const secondWithdrawal = getBankTransferByTransactionId(secondTransaction.id);
    expect(secondWithdrawal.type).toBe(BankTransferType.withdrawal);
    // Sender balance is 0, so entire amount becomes withdrawal
    expect(secondWithdrawal.amount).toBe(secondPaymentPayloadAmount * 100);

    // Verify Deposit Transactions for Receiver
    const updatedReceiverTransactions = getTransactionsByUserId(receiver.id);
    expect(updatedReceiverTransactions.length).toBe(receiverTransactions.length + 2);

    // Verify Receiver's Updated App Balance (credited with both transaction amounts in cents)
    const updatedReceiver: User = getAllUsers()[1];
    expect(updatedReceiver.balance).toBe(
      originalReceiverBalance + firstPaymentPayloadAmount * 100 + secondPaymentPayloadAmount * 100
    );
  });

  it("should create a request and withdrawal (bank transfer) for remaining balance", () => {
    const sender: User = getAllUsers()[0];
    const receiver: User = getAllUsers()[1];
    const senderBankAccount = getBankAccountsByUserId(sender.id)[0];
    const requestPayloadAmount = 100;

    // Capture original balances before mutations (lowdb objects are mutable refs)
    const originalSenderBalance = sender.balance;
    const originalReceiverBalance = receiver.balance;

    const senderTransactions = getTransactionsByUserId(sender.id);
    const receiverTransactions = getTransactionsByUserId(receiver.id);
    expect(receiverTransactions.length).toBeGreaterThan(1);

    const requestDetails: TransactionPayload = {
      source: senderBankAccount.id!,
      senderId: sender.id,
      receiverId: receiver.id,
      description: `Request: ${sender.id} to ${receiver.id}`,
      amount: requestPayloadAmount,
      privacyLevel: DefaultPrivacyLevel.public,
      status: TransactionStatus.pending,
    };

    const transaction = createTransaction(sender.id, "request", requestDetails);
    expect(transaction.id).toBeDefined();
    expect(transaction.status).toEqual("pending");
    expect(transaction.requestStatus).toBe(TransactionRequestStatus.pending);

    const edits: Partial<Transaction> = {
      requestStatus: TransactionRequestStatus.accepted,
    };
    // Accepting the request debits the receiver and credits the sender
    updateTransactionById(transaction.id, edits);

    const updatedTransaction = getTransactionById(transaction.id);
    expect(updatedTransaction.requestStatus).toEqual("accepted");

    // Receiver is debited: balance decreases by requestPayloadAmount * 100 (cents)
    const updatedReceiver: User = getAllUsers()[1];
    expect(updatedReceiver.balance).toBe(originalReceiverBalance - requestPayloadAmount * 100);

    // Verify transaction count for receiver (debited party, transaction receiverId matches)
    const updatedReceiverTransactions = getTransactionsByUserId(receiver.id);
    expect(updatedReceiverTransactions.length).toBe(receiverTransactions.length + 1);

    // Sender is credited: balance increases by requestPayloadAmount * 100 (cents)
    const updatedSender: User = getAllUsers()[0];
    expect(updatedSender.balance).toBe(originalSenderBalance + requestPayloadAmount * 100);
  });
});
