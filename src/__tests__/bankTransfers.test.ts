import { describe, expect, it, beforeEach } from "vitest";
import {
  seedDatabase,
  getAllUsers,
  getBankAccountsByUserId,
  createBankTransfer,
  getBankTransfersByUserId,
} from "../../backend/database";
import { User, BankTransferType } from "../models";

describe("Bank Transfers", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("should create a withdrawal bank transfer", () => {
    const user: User = getAllUsers()[0];
    const bankAccount = getBankAccountsByUserId(user.id)[0];

    const transfer = createBankTransfer({
      userId: user.id,
      source: bankAccount.id,
      amount: 10000,
      transactionId: "test-txn-id",
      type: BankTransferType.withdrawal,
    });

    expect(transfer.id).toBeDefined();
    expect(transfer.uuid).toBeDefined();
    expect(transfer.userId).toBe(user.id);
    expect(transfer.source).toBe(bankAccount.id);
    expect(transfer.amount).toBe(10000);
    expect(transfer.type).toBe(BankTransferType.withdrawal);
    expect(transfer.transactionId).toBe("test-txn-id");
    expect(transfer.createdAt).toBeDefined();
    expect(transfer.modifiedAt).toBeDefined();
  });

  it("should create a deposit bank transfer", () => {
    const user: User = getAllUsers()[0];
    const bankAccount = getBankAccountsByUserId(user.id)[0];

    const transfer = createBankTransfer({
      userId: user.id,
      source: bankAccount.id,
      amount: 25000,
      transactionId: "test-txn-deposit",
      type: BankTransferType.deposit,
    });

    expect(transfer.id).toBeDefined();
    expect(transfer.type).toBe(BankTransferType.deposit);
    expect(transfer.amount).toBe(25000);
  });

  it("should retrieve bank transfers by user id", () => {
    const user: User = getAllUsers()[0];
    const bankAccount = getBankAccountsByUserId(user.id)[0];

    // Create some transfers
    createBankTransfer({
      userId: user.id,
      source: bankAccount.id,
      amount: 5000,
      transactionId: "txn-1",
      type: BankTransferType.withdrawal,
    });

    createBankTransfer({
      userId: user.id,
      source: bankAccount.id,
      amount: 8000,
      transactionId: "txn-2",
      type: BankTransferType.deposit,
    });

    const transfers = getBankTransfersByUserId(user.id);
    expect(transfers.length).toBeGreaterThanOrEqual(2);
    transfers.forEach((t: any) => {
      expect(t.userId).toBe(user.id);
    });
  });

  it("should return empty array for user with no transfers", () => {
    // Create a fresh user who has no transfers
    const users = getAllUsers();
    // Find the user with no bank transfers (may vary, but test the query works)
    const transfers = getBankTransfersByUserId("nonexistent-user-id");
    expect(transfers).toEqual([]);
  });
});
