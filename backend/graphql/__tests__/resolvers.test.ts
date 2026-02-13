import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../database", () => ({
  getBankAccountsByUserId: vi.fn(),
}));

import Query from "../resolvers/Query";
import { getBankAccountsByUserId } from "../../database";

describe("graphql resolvers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listBankAccount: returns bank accounts for ctx.user.id", () => {
    const bankAccounts = [{ id: "ba1" }, { id: "ba2" }];
    vi.mocked(getBankAccountsByUserId).mockReturnValueOnce(bankAccounts as any);

    const result = Query.listBankAccount({}, {}, { user: { id: "u1" } });

    expect(getBankAccountsByUserId).toHaveBeenCalledWith("u1");
    expect(result).toEqual(bankAccounts);
  });

  it("listBankAccount: throws when database throws", () => {
    vi.mocked(getBankAccountsByUserId).mockImplementationOnce(() => {
      throw new Error("boom");
    });

    expect(() => Query.listBankAccount({}, {}, { user: { id: "u1" } })).toThrow();
  });
});
