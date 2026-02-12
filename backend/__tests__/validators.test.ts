import { describe, it, expect } from "vitest";
import {
  shortIdValidation,
  searchValidation,
  isBankAccountValidator,
  isUserValidator,
  isTransactionQSValidator,
  isTransactionPayloadValidator,
  isTransactionPatchValidator,
  isTransactionPublicQSValidator,
  isCommentValidator,
  isNotificationsBodyValidator,
  isNotificationPatchValidator,
  isValidEntityValidator,
  sanitizeTransactionStatus,
  sanitizeRequestStatus,
  userFieldsValidator,
} from "../validators";

describe("validators", () => {
  describe("shortIdValidation", () => {
    it("returns a validation chain for a given key", () => {
      const chain = shortIdValidation("id");
      expect(chain).toBeDefined();
      expect(typeof chain.run).toBe("function");
    });
  });

  describe("searchValidation", () => {
    it("is defined", () => {
      expect(searchValidation).toBeDefined();
      expect(typeof searchValidation.run).toBe("function");
    });
  });

  describe("isBankAccountValidator", () => {
    it("is an array of validation chains", () => {
      expect(Array.isArray(isBankAccountValidator)).toBe(true);
      expect(isBankAccountValidator.length).toBe(3);
    });
  });

  describe("isUserValidator", () => {
    it("is an array of validation chains", () => {
      expect(Array.isArray(isUserValidator)).toBe(true);
      expect(isUserValidator.length).toBe(9);
    });
  });

  describe("isTransactionQSValidator", () => {
    it("is an array of validation chains", () => {
      expect(Array.isArray(isTransactionQSValidator)).toBe(true);
    });
  });

  describe("isTransactionPayloadValidator", () => {
    it("is an array of validation chains", () => {
      expect(Array.isArray(isTransactionPayloadValidator)).toBe(true);
    });
  });

  describe("isTransactionPatchValidator", () => {
    it("is an array of validation chains", () => {
      expect(Array.isArray(isTransactionPatchValidator)).toBe(true);
      expect(isTransactionPatchValidator.length).toBe(1);
    });
  });

  describe("isTransactionPublicQSValidator", () => {
    it("is an array of validation chains", () => {
      expect(Array.isArray(isTransactionPublicQSValidator)).toBe(true);
    });
  });

  describe("isCommentValidator", () => {
    it("is defined", () => {
      expect(isCommentValidator).toBeDefined();
    });
  });

  describe("isNotificationsBodyValidator", () => {
    it("is an array of validation chains", () => {
      expect(Array.isArray(isNotificationsBodyValidator)).toBe(true);
    });
  });

  describe("isNotificationPatchValidator", () => {
    it("is an array of validation chains", () => {
      expect(Array.isArray(isNotificationPatchValidator)).toBe(true);
    });
  });

  describe("isValidEntityValidator", () => {
    it("is an array of validation chains", () => {
      expect(Array.isArray(isValidEntityValidator)).toBe(true);
    });
  });

  describe("sanitizeTransactionStatus", () => {
    it("is defined as a sanitizer", () => {
      expect(sanitizeTransactionStatus).toBeDefined();
      expect(typeof sanitizeTransactionStatus.run).toBe("function");
    });
  });

  describe("sanitizeRequestStatus", () => {
    it("is defined as a sanitizer", () => {
      expect(sanitizeRequestStatus).toBeDefined();
      expect(typeof sanitizeRequestStatus.run).toBe("function");
    });
  });

  describe("userFieldsValidator", () => {
    it("is defined", () => {
      expect(userFieldsValidator).toBeDefined();
    });
  });
});
