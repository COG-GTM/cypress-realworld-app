import { describe, expect, it, beforeEach, vi } from "vitest";
import { seedDatabase, getRandomUser, getBankAccountsByUserId } from "../../database";
import Query from "../resolvers/Query";

vi.mock("../../database", async () => {
  const actual = await vi.importActual<typeof import("../../database")>("../../database");
  return {
    ...actual,
    getBankAccountsByUserId: vi.fn(actual.getBankAccountsByUserId),
  };
});

const mockedGetBankAccountsByUserId = vi.mocked(getBankAccountsByUserId);

describe("GraphQL Query Resolvers", () => {
  beforeEach(() => {
    seedDatabase();
    mockedGetBankAccountsByUserId.mockRestore();
  });

  describe("listBankAccount", () => {
    it("should return bank accounts for the authenticated user", () => {
      const user = getRandomUser();
      const ctx = { user: { id: user.id } };

      const result = Query.listBankAccount({}, {}, ctx);

      const expected = getBankAccountsByUserId(user.id);
      expect(result).toEqual(expected);
      expect(result[0].userId).toBe(user.id);
    });

    it("should throw an error when getBankAccountsByUserId fails", () => {
      mockedGetBankAccountsByUserId.mockImplementation(() => {
        throw new Error("database error");
      });

      const ctx = { user: { id: "invalid-user-id" } };

      expect(() => Query.listBankAccount({}, {}, ctx)).toThrow("database error");
    });
  });
});
