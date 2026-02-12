import { describe, expect, it, beforeEach, vi } from "vitest";
import { seedDatabase, getRandomUser } from "../../database";
import * as database from "../../database";
import Query from "../resolvers/Query";

describe("GraphQL Query Resolvers", () => {
  beforeEach(() => {
    seedDatabase();
  });

  describe("listBankAccount", () => {
    it("should return bank accounts for the authenticated user", () => {
      const user = getRandomUser();
      const ctx = { user: { id: user.id } };

      const result = Query.listBankAccount({}, {}, ctx);

      const expected = database.getBankAccountsByUserId(user.id);
      expect(result).toEqual(expected);
      expect(result[0].userId).toBe(user.id);
    });

    it("should throw an error when getBankAccountsByUserId fails", () => {
      const spy = vi.spyOn(database, "getBankAccountsByUserId").mockImplementation(() => {
        throw new Error("User not found");
      });

      const ctx = { user: { id: "test-user-id" } };
      expect(() => Query.listBankAccount({}, {}, ctx)).toThrow("User not found");

      spy.mockRestore();
    });
  });
});
