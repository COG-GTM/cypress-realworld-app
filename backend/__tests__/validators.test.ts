import { describe, expect, it } from "vitest";
import { isValid } from "shortid";
import { TransactionStatus, TransactionRequestStatus } from "../../src/models";
import { includes } from "lodash/fp";

const TransactionStatusValues = Object.values(TransactionStatus);
const RequestStatusValues = Object.values(TransactionRequestStatus);

const isShortId = (value: string) => isValid(value);

const sanitizeTransactionStatus = (value: string) => {
  if (includes(value, TransactionStatusValues)) {
    return value;
  }
  return undefined;
};

const sanitizeRequestStatus = (value: string) => {
  if (includes(value, RequestStatusValues)) {
    return value;
  }
  return undefined;
};

describe("validators", () => {
  describe("isShortId", () => {
    it("should return true for a valid shortid", () => {
      expect(isShortId("PPBqWA9")).toBe(true);
    });

    it("should return false for an invalid shortid", () => {
      expect(isShortId("not-a-valid-shortid!!!")).toBe(false);
    });

    it("should return false for an empty string", () => {
      expect(isShortId("")).toBe(false);
    });
  });

  describe("sanitizeTransactionStatus", () => {
    it("should return the value when it is a valid transaction status", () => {
      expect(sanitizeTransactionStatus(TransactionStatus.pending)).toBe(TransactionStatus.pending);
      expect(sanitizeTransactionStatus(TransactionStatus.incomplete)).toBe(
        TransactionStatus.incomplete
      );
      expect(sanitizeTransactionStatus(TransactionStatus.complete)).toBe(
        TransactionStatus.complete
      );
    });

    it("should return undefined for an invalid transaction status", () => {
      expect(sanitizeTransactionStatus("invalid-status")).toBeUndefined();
    });

    it("should return undefined for an empty string", () => {
      expect(sanitizeTransactionStatus("")).toBeUndefined();
    });
  });

  describe("sanitizeRequestStatus", () => {
    it("should return the value when it is a valid request status", () => {
      expect(sanitizeRequestStatus(TransactionRequestStatus.pending)).toBe(
        TransactionRequestStatus.pending
      );
      expect(sanitizeRequestStatus(TransactionRequestStatus.accepted)).toBe(
        TransactionRequestStatus.accepted
      );
      expect(sanitizeRequestStatus(TransactionRequestStatus.rejected)).toBe(
        TransactionRequestStatus.rejected
      );
    });

    it("should return undefined for an invalid request status", () => {
      expect(sanitizeRequestStatus("invalid-status")).toBeUndefined();
    });

    it("should return undefined for an empty string", () => {
      expect(sanitizeRequestStatus("")).toBeUndefined();
    });
  });
});
