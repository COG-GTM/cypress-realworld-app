import { describe, expect, test, beforeEach } from "vitest";
import {
  seedDatabase,
  getAllUsers,
  getBankAccountsBy,
  createBankAccountForUser,
  getBankAccountById,
} from "../database";
import Query from "../graphql/resolvers/Query";
import Mutation from "../graphql/resolvers/Mutation";
import { BankAccount } from "../../src/models";

describe("GraphQL Resolvers", () => {
  beforeEach(() => {
    seedDatabase();
  });

  describe("Query Resolvers", () => {
    describe("listBankAccount", () => {
      test("should return bank accounts for authenticated user", () => {
        const users = getAllUsers();
        const firstUser = users[0];

        const ctx = { user: { id: firstUser.id } };
        const result = Query.listBankAccount({}, {}, ctx);

        expect(Array.isArray(result)).toBe(true);
        result.forEach((account: BankAccount) => {
          expect(account.userId).toBe(firstUser.id);
        });
      });

      test("should return empty array for user with no bank accounts", () => {
        const users = getAllUsers();
        const userWithNoAccounts = users.find((u) => {
          const accounts = getBankAccountsBy("userId", u.id);
          return accounts.length === 0;
        });

        if (userWithNoAccounts) {
          const ctx = { user: { id: userWithNoAccounts.id } };
          const result = Query.listBankAccount({}, {}, ctx);
          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBe(0);
        }
      });

      test("should throw error when user context is missing", () => {
        const ctx = { user: null };
        expect(() => Query.listBankAccount({}, {}, ctx)).toThrow();
      });
    });
  });

  describe("Mutation Resolvers", () => {
    describe("createBankAccount", () => {
      test("should create a new bank account for authenticated user", () => {
        const users = getAllUsers();
        const firstUser = users[0];

        const ctx = { user: { id: firstUser.id } };
        const args = {
          bankName: "Test Bank",
          accountNumber: "123456789",
          routingNumber: "987654321",
        };

        const result = Mutation.createBankAccount({}, args, ctx);

        expect(result).toBeDefined();
        expect(result.bankName).toBe(args.bankName);
        expect(result.accountNumber).toBe(args.accountNumber);
        expect(result.routingNumber).toBe(args.routingNumber);
        expect(result.userId).toBe(firstUser.id);
        expect(result.isDeleted).toBe(false);
      });

      test("should create bank account with all required fields", () => {
        const users = getAllUsers();
        const firstUser = users[0];

        const ctx = { user: { id: firstUser.id } };
        const args = {
          bankName: "Another Bank",
          accountNumber: "111222333",
          routingNumber: "444555666",
        };

        const result = Mutation.createBankAccount({}, args, ctx);

        expect(result.id).toBeDefined();
        expect(result.uuid).toBeDefined();
        expect(result.createdAt).toBeDefined();
        expect(result.modifiedAt).toBeDefined();
      });
    });

    describe("deleteBankAccount", () => {
      test("should soft delete a bank account", () => {
        const users = getAllUsers();
        const firstUser = users[0];

        const bankAccount = createBankAccountForUser(firstUser.id, {
          bankName: "Bank to Delete",
          accountNumber: "999888777",
          routingNumber: "666555444",
        });

        const ctx = { user: { id: firstUser.id } };
        const args = { id: bankAccount.id };

        const result = Mutation.deleteBankAccount({}, args, ctx);

        expect(result).toBe(true);

        const deletedAccount = getBankAccountById(bankAccount.id);
        expect(deletedAccount.isDeleted).toBe(true);
      });

      test("should return true after deletion", () => {
        const users = getAllUsers();
        const firstUser = users[0];

        const bankAccount = createBankAccountForUser(firstUser.id, {
          bankName: "Another Bank to Delete",
          accountNumber: "123123123",
          routingNumber: "456456456",
        });

        const ctx = { user: { id: firstUser.id } };
        const args = { id: bankAccount.id };

        const result = Mutation.deleteBankAccount({}, args, ctx);
        expect(result).toBe(true);
      });
    });
  });

  describe("Resolver Integration", () => {
    test("should create and then list bank account", () => {
      const users = getAllUsers();
      const firstUser = users[0];
      const ctx = { user: { id: firstUser.id } };

      const initialAccounts = Query.listBankAccount({}, {}, ctx);
      const initialCount = initialAccounts.length;

      const args = {
        bankName: "Integration Test Bank",
        accountNumber: "777888999",
        routingNumber: "111222333",
      };

      Mutation.createBankAccount({}, args, ctx);

      const updatedAccounts = Query.listBankAccount({}, {}, ctx);
      expect(updatedAccounts.length).toBe(initialCount + 1);

      const newAccount = updatedAccounts.find(
        (a: BankAccount) => a.bankName === "Integration Test Bank"
      );
      expect(newAccount).toBeDefined();
    });

    test("should create, delete, and verify bank account is marked as deleted", () => {
      const users = getAllUsers();
      const firstUser = users[0];
      const ctx = { user: { id: firstUser.id } };

      const createArgs = {
        bankName: "Delete Test Bank",
        accountNumber: "333444555",
        routingNumber: "666777888",
      };

      const createdAccount = Mutation.createBankAccount({}, createArgs, ctx);
      expect(createdAccount.isDeleted).toBe(false);

      Mutation.deleteBankAccount({}, { id: createdAccount.id }, ctx);

      const deletedAccount = getBankAccountById(createdAccount.id);
      expect(deletedAccount.isDeleted).toBe(true);
    });
  });
});
