import { describe, it, expect, vi } from "vitest";

vi.mock("../../database", () => ({
  getBankAccountsByUserId: vi.fn().mockReturnValue([
    {
      id: "ba-1",
      uuid: "uuid-1",
      userId: "user-1",
      bankName: "Test Bank",
      accountNumber: "123456789",
      routingNumber: "987654321",
      isDeleted: false,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ]),
}));

import Query from "../resolvers/Query";
import { getBankAccountsByUserId } from "../../database";

describe("GraphQL Query resolvers", () => {
  describe("listBankAccount", () => {
    it("returns bank accounts for the authenticated user", () => {
      const ctx = { user: { id: "user-1" } };
      const result = Query.listBankAccount({}, {}, ctx);
      expect(getBankAccountsByUserId).toHaveBeenCalledWith("user-1");
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "ba-1",
            bankName: "Test Bank",
          }),
        ])
      );
    });

    it("calls getBankAccountsByUserId with the user id from context", () => {
      const ctx = { user: { id: "user-2" } };
      Query.listBankAccount({}, {}, ctx);
      expect(getBankAccountsByUserId).toHaveBeenCalledWith("user-2");
    });

    it("throws when getBankAccountsByUserId throws", () => {
      const mockFn = getBankAccountsByUserId as any;
      mockFn.mockImplementationOnce(() => {
        throw new Error("DB error");
      });
      const ctx = { user: { id: "user-1" } };
      expect(() => Query.listBankAccount({}, {}, ctx)).toThrow("DB error");
    });
  });
});
