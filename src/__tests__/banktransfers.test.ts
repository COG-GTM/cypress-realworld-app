import { describe, expect, it, beforeEach } from "vitest";
import {
  seedDatabase,
  getAllUsers,
  getBankAccountsByUserId,
  createBankTransfer,
  getBankTransferBy,
  getBankTransfersBy,
  getBankTransferByTransactionId,
} from "../../backend/database";
import { User, BankTransferType } from "../../src/models";

describe("BankTransfers", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should create a bank transfer and retrieve it by id", () => {
    const user: User = getAllUsers()[0];
    const bankAccounts = getBankAccountsByUserId(user.id);

    const bankTransferPayload = {
      userId: user.id,
      source: bankAccounts[0].id!,
      amount: 100,
      transactionId: "test-transaction-id",
      type: BankTransferType.withdrawal,
    };

    const result = createBankTransfer(bankTransferPayload);

    expect(result.id).toBeDefined();
    expect(result.uuid).toBeDefined();
    expect(result.userId).toBe(user.id);
    expect(result.amount).toBe(100);
    expect(result.type).toBe(BankTransferType.withdrawal);
    expect(result.transactionId).toBe("test-transaction-id");
    expect(result.createdAt).toBeDefined();
    expect(result.modifiedAt).toBeDefined();
  });

  it("should retrieve a bank transfer by key/value", () => {
    const user: User = getAllUsers()[0];
    const bankAccounts = getBankAccountsByUserId(user.id);

    const bankTransferPayload = {
      userId: user.id,
      source: bankAccounts[0].id!,
      amount: 250,
      transactionId: "lookup-transaction-id",
      type: BankTransferType.deposit,
    };

    const created = createBankTransfer(bankTransferPayload);
    const found = getBankTransferBy("id", created.id);

    expect(found.id).toBe(created.id);
    expect(found.amount).toBe(250);
    expect(found.type).toBe(BankTransferType.deposit);
  });

  it("should retrieve bank transfers by userId", () => {
    const user: User = getAllUsers()[0];
    const bankAccounts = getBankAccountsByUserId(user.id);

    createBankTransfer({
      userId: user.id,
      source: bankAccounts[0].id!,
      amount: 50,
      transactionId: "txn-1",
      type: BankTransferType.withdrawal,
    });

    createBankTransfer({
      userId: user.id,
      source: bankAccounts[0].id!,
      amount: 75,
      transactionId: "txn-2",
      type: BankTransferType.deposit,
    });

    const transfers = getBankTransfersBy("userId", user.id);
    expect(transfers.length).toBeGreaterThanOrEqual(2);
  });

  it("should retrieve a bank transfer by transactionId", () => {
    const user: User = getAllUsers()[0];
    const bankAccounts = getBankAccountsByUserId(user.id);

    const bankTransferPayload = {
      userId: user.id,
      source: bankAccounts[0].id!,
      amount: 300,
      transactionId: "unique-txn-id",
      type: BankTransferType.withdrawal,
    };

    createBankTransfer(bankTransferPayload);
    const found = getBankTransferByTransactionId("unique-txn-id");

    expect(found.transactionId).toBe("unique-txn-id");
    expect(found.amount).toBe(300);
  });
});
