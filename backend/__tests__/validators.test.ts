import { describe, it, expect } from "vitest";
import { validationResult } from "express-validator";
import { isValid as isValidShortId } from "shortid";
import shortid from "shortid";
import {
  shortIdValidation,
  searchValidation,
  isBankAccountValidator,
  isUserValidator,
  isTransactionPayloadValidator,
  isTransactionPatchValidator,
  sanitizeTransactionStatus,
  sanitizeRequestStatus,
  isValidEntityValidator,
  userFieldsValidator,
} from "../validators";

// Helper to create a mock Express request
const mockRequest = (options: {
  body?: Record<string, any>;
  query?: Record<string, any>;
  params?: Record<string, any>;
}) => {
  const req: any = {
    body: options.body || {},
    query: options.query || {},
    params: options.params || {},
    headers: {},
  };
  return req;
};

// Helper to run validations and get errors
const runValidation = async (validations: any[], req: any) => {
  for (const validation of validations) {
    if (Array.isArray(validation)) {
      for (const v of validation) {
        await v.run(req);
      }
    } else {
      await validation.run(req);
    }
  }
  return validationResult(req);
};

describe("Validators", () => {
  describe("shortIdValidation", () => {
    it("should pass for a valid shortid", async () => {
      const id = shortid.generate();
      const req = mockRequest({ params: { id } });
      const validation = shortIdValidation("id");
      await validation.run(req);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail for an invalid shortid", async () => {
      const req = mockRequest({ params: { id: "1234" } });
      const validation = shortIdValidation("id");
      await validation.run(req);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail for an empty string", async () => {
      const req = mockRequest({ params: { id: "" } });
      const validation = shortIdValidation("id");
      await validation.run(req);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe("isShortId (via shortid.isValid)", () => {
    it("should return true for a valid shortid", () => {
      const id = shortid.generate();
      expect(isValidShortId(id)).toBe(true);
    });

    it("should return false for arbitrary strings", () => {
      expect(isValidShortId("")).toBe(false);
    });
  });

  describe("searchValidation", () => {
    it("should pass when q parameter exists", async () => {
      const req = mockRequest({ query: { q: "test" } });
      await searchValidation.run(req);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail when q parameter is missing", async () => {
      const req = mockRequest({ query: {} });
      await searchValidation.run(req);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe("isBankAccountValidator", () => {
    it("should pass with all required fields", async () => {
      const req = mockRequest({
        body: {
          bankName: "Test Bank",
          accountNumber: "1234567890",
          routingNumber: "123456789",
        },
      });
      const errors = await runValidation(isBankAccountValidator, req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail when bankName is missing", async () => {
      const req = mockRequest({
        body: {
          accountNumber: "1234567890",
          routingNumber: "123456789",
        },
      });
      const errors = await runValidation(isBankAccountValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when accountNumber is missing", async () => {
      const req = mockRequest({
        body: {
          bankName: "Test Bank",
          routingNumber: "123456789",
        },
      });
      const errors = await runValidation(isBankAccountValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when routingNumber is missing", async () => {
      const req = mockRequest({
        body: {
          bankName: "Test Bank",
          accountNumber: "1234567890",
        },
      });
      const errors = await runValidation(isBankAccountValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe("isUserValidator", () => {
    it("should pass with no fields (all optional)", async () => {
      const req = mockRequest({ body: {} });
      const errors = await runValidation(isUserValidator, req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should pass with valid optional fields", async () => {
      const req = mockRequest({
        body: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          defaultPrivacyLevel: "public",
        },
      });
      const errors = await runValidation(isUserValidator, req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail with invalid avatar URL", async () => {
      const req = mockRequest({
        body: {
          avatar: "not-a-url",
        },
      });
      const errors = await runValidation(isUserValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail with invalid defaultPrivacyLevel", async () => {
      const req = mockRequest({
        body: {
          defaultPrivacyLevel: "invalid",
        },
      });
      const errors = await runValidation(isUserValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe("isTransactionPayloadValidator", () => {
    const validPayload = {
      transactionType: "payment",
      receiverId: "user123",
      description: "Test payment",
      amount: 100,
    };

    it("should pass with valid payload", async () => {
      const req = mockRequest({ body: validPayload });
      const errors = await runValidation(isTransactionPayloadValidator, req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail with missing transactionType", async () => {
      const { transactionType, ...payload } = validPayload;
      const req = mockRequest({ body: payload });
      const errors = await runValidation(isTransactionPayloadValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail with invalid transactionType", async () => {
      const req = mockRequest({
        body: { ...validPayload, transactionType: "invalid" },
      });
      const errors = await runValidation(isTransactionPayloadValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail with missing receiverId", async () => {
      const { receiverId, ...payload } = validPayload;
      const req = mockRequest({ body: payload });
      const errors = await runValidation(isTransactionPayloadValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail with missing amount", async () => {
      const { amount, ...payload } = validPayload;
      const req = mockRequest({ body: payload });
      const errors = await runValidation(isTransactionPayloadValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail with non-numeric amount", async () => {
      const req = mockRequest({
        body: { ...validPayload, amount: "not-a-number" },
      });
      const errors = await runValidation(isTransactionPayloadValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail with missing description", async () => {
      const { description, ...payload } = validPayload;
      const req = mockRequest({ body: payload });
      const errors = await runValidation(isTransactionPayloadValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should accept request as transactionType", async () => {
      const req = mockRequest({
        body: { ...validPayload, transactionType: "request" },
      });
      const errors = await runValidation(isTransactionPayloadValidator, req);
      expect(errors.isEmpty()).toBe(true);
    });
  });

  describe("isTransactionPatchValidator", () => {
    it("should pass with valid requestStatus", async () => {
      const req = mockRequest({ body: { requestStatus: "accepted" } });
      const errors = await runValidation(isTransactionPatchValidator, req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should pass with rejected requestStatus", async () => {
      const req = mockRequest({ body: { requestStatus: "rejected" } });
      const errors = await runValidation(isTransactionPatchValidator, req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail with invalid requestStatus", async () => {
      const req = mockRequest({ body: { requestStatus: "invalid" } });
      const errors = await runValidation(isTransactionPatchValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail with missing requestStatus", async () => {
      const req = mockRequest({ body: {} });
      const errors = await runValidation(isTransactionPatchValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe("sanitizeTransactionStatus", () => {
    it("should pass through valid transaction status", async () => {
      const req = mockRequest({ query: { status: "pending" } });
      await sanitizeTransactionStatus.run(req);
      expect(req.query.status).toBe("pending");
    });

    it("should sanitize invalid status to undefined", async () => {
      const req = mockRequest({ query: { status: "invalid" } });
      await sanitizeTransactionStatus.run(req);
      expect(req.query.status).toBeUndefined();
    });

    it("should pass through complete status", async () => {
      const req = mockRequest({ query: { status: "complete" } });
      await sanitizeTransactionStatus.run(req);
      expect(req.query.status).toBe("complete");
    });
  });

  describe("sanitizeRequestStatus", () => {
    it("should pass through valid request status", async () => {
      const req = mockRequest({ query: { requestStatus: "pending" } });
      await sanitizeRequestStatus.run(req);
      expect(req.query.requestStatus).toBe("pending");
    });

    it("should sanitize invalid requestStatus to undefined", async () => {
      const req = mockRequest({ query: { requestStatus: "invalid" } });
      await sanitizeRequestStatus.run(req);
      expect(req.query.requestStatus).toBeUndefined();
    });

    it("should pass through accepted status", async () => {
      const req = mockRequest({ query: { requestStatus: "accepted" } });
      await sanitizeRequestStatus.run(req);
      expect(req.query.requestStatus).toBe("accepted");
    });

    it("should pass through rejected status", async () => {
      const req = mockRequest({ query: { requestStatus: "rejected" } });
      await sanitizeRequestStatus.run(req);
      expect(req.query.requestStatus).toBe("rejected");
    });
  });

  describe("isValidEntityValidator", () => {
    const validEntities = [
      "users",
      "contacts",
      "bankaccounts",
      "notifications",
      "transactions",
      "likes",
      "comments",
      "banktransfers",
    ];

    validEntities.forEach((entity) => {
      it(`should pass for valid entity: ${entity}`, async () => {
        const req = mockRequest({ body: { entity }, query: { entity }, params: { entity } });
        const errors = await runValidation(isValidEntityValidator, req);
        expect(errors.isEmpty()).toBe(true);
      });
    });

    it("should fail for invalid entity name", async () => {
      const req = mockRequest({
        body: { entity: "invalid" },
        query: { entity: "invalid" },
        params: { entity: "invalid" },
      });
      const errors = await runValidation(isValidEntityValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should fail when entity is missing", async () => {
      const req = mockRequest({ body: {}, query: {}, params: {} });
      const errors = await runValidation(isValidEntityValidator, req);
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe("userFieldsValidator", () => {
    it("should pass when firstName is provided", async () => {
      const req = mockRequest({
        body: { firstName: "John" },
        query: { firstName: "John" },
        params: { firstName: "John" },
      });
      await userFieldsValidator.run(req);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should pass when lastName is provided", async () => {
      const req = mockRequest({
        body: { lastName: "Doe" },
        query: { lastName: "Doe" },
        params: { lastName: "Doe" },
      });
      await userFieldsValidator.run(req);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail when no valid user fields are provided", async () => {
      const req = mockRequest({ body: { invalid: "field" } });
      await userFieldsValidator.run(req);
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
    });
  });
});
