import { describe, expect, test, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import {
  shortIdValidation,
  searchValidation,
  userFieldsValidator,
  isBankAccountValidator,
  isUserValidator,
  sanitizeTransactionStatus,
  sanitizeRequestStatus,
  isTransactionQSValidator,
  isTransactionPayloadValidator,
  isTransactionPatchValidator,
  isTransactionPublicQSValidator,
  isCommentValidator,
  isNotificationsBodyValidator,
  isNotificationPatchValidator,
  isValidEntityValidator,
} from "../validators";
import { validationResult } from "express-validator";

const runValidation = async (validation: any, req: Partial<Request>) => {
  await validation.run(req);
  return validationResult(req as Request);
};

const runValidations = async (validations: any[], req: Partial<Request>) => {
  await Promise.all(validations.map((v) => v.run(req)));
  return validationResult(req as Request);
};

describe("Backend Validators", () => {
  describe("shortIdValidation", () => {
    test("should pass for valid shortid", async () => {
      const req: Partial<Request> = {
        params: { id: "abc123" },
        body: {},
        query: {},
      };
      const validation = shortIdValidation("id");
      const result = await runValidation(validation, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail for invalid shortid", async () => {
      const req: Partial<Request> = {
        params: { id: "invalid-id-with-special-chars!!!" },
        body: {},
        query: {},
      };
      const validation = shortIdValidation("id");
      const result = await runValidation(validation, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe("searchValidation", () => {
    test("should pass when q query param exists", async () => {
      const req: Partial<Request> = {
        query: { q: "searchterm" },
        body: {},
        params: {},
      };
      const result = await runValidation(searchValidation, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail when q query param is missing", async () => {
      const req: Partial<Request> = {
        query: {},
        body: {},
        params: {},
      };
      const result = await runValidation(searchValidation, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe("isBankAccountValidator", () => {
    test("should pass for valid bank account data", async () => {
      const req: Partial<Request> = {
        body: {
          bankName: "Test Bank",
          accountNumber: "123456789",
          routingNumber: "987654321",
        },
        query: {},
        params: {},
      };
      const result = await runValidations(isBankAccountValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail for missing bank account fields", async () => {
      const req: Partial<Request> = {
        body: {},
        query: {},
        params: {},
      };
      const result = await runValidations(isBankAccountValidator, req);
      expect(result.isEmpty()).toBe(false);
    });

    test("should fail for non-string bank name", async () => {
      const req: Partial<Request> = {
        body: {
          bankName: 123,
          accountNumber: "123456789",
          routingNumber: "987654321",
        },
        query: {},
        params: {},
      };
      const result = await runValidations(isBankAccountValidator, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe("isUserValidator", () => {
    test("should pass for valid user data", async () => {
      const req: Partial<Request> = {
        body: {
          firstName: "John",
          lastName: "Doe",
          username: "johndoe",
          email: "john@example.com",
        },
        query: {},
        params: {},
      };
      const result = await runValidations(isUserValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass for empty body (all fields optional)", async () => {
      const req: Partial<Request> = {
        body: {},
        query: {},
        params: {},
      };
      const result = await runValidations(isUserValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass for valid defaultPrivacyLevel", async () => {
      const req: Partial<Request> = {
        body: {
          defaultPrivacyLevel: "public",
        },
        query: {},
        params: {},
      };
      const result = await runValidations(isUserValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail for invalid defaultPrivacyLevel", async () => {
      const req: Partial<Request> = {
        body: {
          defaultPrivacyLevel: "invalid",
        },
        query: {},
        params: {},
      };
      const result = await runValidations(isUserValidator, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe("sanitizeTransactionStatus", () => {
    test("should keep valid transaction status", async () => {
      const req: Partial<Request> = {
        query: { status: "pending" },
        body: {},
        params: {},
      };
      await runValidation(sanitizeTransactionStatus, req);
      expect(req.query!.status).toBe("pending");
    });

    test("should sanitize invalid transaction status", async () => {
      const req: Partial<Request> = {
        query: { status: "invalid" },
        body: {},
        params: {},
      };
      await runValidation(sanitizeTransactionStatus, req);
      expect(req.query!.status).toBeUndefined();
    });
  });

  describe("sanitizeRequestStatus", () => {
    test("should keep valid request status", async () => {
      const req: Partial<Request> = {
        query: { requestStatus: "pending" },
        body: {},
        params: {},
      };
      await runValidation(sanitizeRequestStatus, req);
      expect(req.query!.requestStatus).toBe("pending");
    });

    test("should sanitize invalid request status", async () => {
      const req: Partial<Request> = {
        query: { requestStatus: "invalid" },
        body: {},
        params: {},
      };
      await runValidation(sanitizeRequestStatus, req);
      expect(req.query!.requestStatus).toBeUndefined();
    });
  });

  describe("isTransactionQSValidator", () => {
    test("should pass for valid transaction query params", async () => {
      const req: Partial<Request> = {
        query: {
          status: "pending",
          requestStatus: "pending",
          receiverId: "abc123",
          senderId: "def456",
        },
        body: {},
        params: {},
      };
      const result = await runValidations(isTransactionQSValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass for empty query params", async () => {
      const req: Partial<Request> = {
        query: {},
        body: {},
        params: {},
      };
      const result = await runValidations(isTransactionQSValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail for invalid status", async () => {
      const req: Partial<Request> = {
        query: { status: "invalid" },
        body: {},
        params: {},
      };
      const result = await runValidations(isTransactionQSValidator, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe("isTransactionPayloadValidator", () => {
    test("should pass for valid payment transaction payload", async () => {
      const req: Partial<Request> = {
        body: {
          transactionType: "payment",
          receiverId: "abc123",
          description: "Test payment",
          amount: 100,
        },
        query: {},
        params: {},
      };
      const result = await runValidations(isTransactionPayloadValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass for valid request transaction payload", async () => {
      const req: Partial<Request> = {
        body: {
          transactionType: "request",
          receiverId: "abc123",
          description: "Test request",
          amount: 50,
          privacyLevel: "public",
        },
        query: {},
        params: {},
      };
      const result = await runValidations(isTransactionPayloadValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail for invalid transaction type", async () => {
      const req: Partial<Request> = {
        body: {
          transactionType: "invalid",
          receiverId: "abc123",
          description: "Test",
          amount: 100,
        },
        query: {},
        params: {},
      };
      const result = await runValidations(isTransactionPayloadValidator, req);
      expect(result.isEmpty()).toBe(false);
    });

    test("should fail for missing required fields", async () => {
      const req: Partial<Request> = {
        body: {
          transactionType: "payment",
        },
        query: {},
        params: {},
      };
      const result = await runValidations(isTransactionPayloadValidator, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe("isTransactionPatchValidator", () => {
    test("should pass for valid request status", async () => {
      const req: Partial<Request> = {
        body: { requestStatus: "accepted" },
        query: {},
        params: {},
      };
      const result = await runValidations(isTransactionPatchValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail for invalid request status", async () => {
      const req: Partial<Request> = {
        body: { requestStatus: "invalid" },
        query: {},
        params: {},
      };
      const result = await runValidations(isTransactionPatchValidator, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe("isTransactionPublicQSValidator", () => {
    test("should pass for valid order param", async () => {
      const req: Partial<Request> = {
        query: { order: "default" },
        body: {},
        params: {},
      };
      const result = await runValidations(isTransactionPublicQSValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass for empty query", async () => {
      const req: Partial<Request> = {
        query: {},
        body: {},
        params: {},
      };
      const result = await runValidations(isTransactionPublicQSValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail for invalid order param", async () => {
      const req: Partial<Request> = {
        query: { order: "invalid" },
        body: {},
        params: {},
      };
      const result = await runValidations(isTransactionPublicQSValidator, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe("isCommentValidator", () => {
    test("should pass for valid comment content", async () => {
      const req: Partial<Request> = {
        body: { content: "This is a test comment" },
        query: {},
        params: {},
      };
      const result = await runValidation(isCommentValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail for missing content", async () => {
      const req: Partial<Request> = {
        body: {},
        query: {},
        params: {},
      };
      const result = await runValidation(isCommentValidator, req);
      expect(result.isEmpty()).toBe(false);
    });

    test("should fail for non-string content", async () => {
      const req: Partial<Request> = {
        body: { content: 123 },
        query: {},
        params: {},
      };
      const result = await runValidation(isCommentValidator, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe("isNotificationPatchValidator", () => {
    test("should pass for valid isRead boolean", async () => {
      const req: Partial<Request> = {
        body: { isRead: true },
        query: {},
        params: {},
      };
      const result = await runValidations(isNotificationPatchValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass for isRead false", async () => {
      const req: Partial<Request> = {
        body: { isRead: false },
        query: {},
        params: {},
      };
      const result = await runValidations(isNotificationPatchValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail for non-boolean isRead", async () => {
      const req: Partial<Request> = {
        body: { isRead: 123 },
        query: {},
        params: {},
      };
      const result = await runValidations(isNotificationPatchValidator, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe("isValidEntityValidator", () => {
    test("should pass for valid entity names", async () => {
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

      for (const entity of validEntities) {
        const req: Partial<Request> = {
          params: { entity },
          body: {},
          query: {},
        };
        const result = await runValidations(isValidEntityValidator, req);
        expect(result.isEmpty()).toBe(true);
      }
    });

    test("should fail for invalid entity name", async () => {
      const req: Partial<Request> = {
        params: { entity: "invalid" },
        body: {},
        query: {},
      };
      const result = await runValidations(isValidEntityValidator, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe("userFieldsValidator", () => {
    test("should pass when at least one user field exists", async () => {
      const req: Partial<Request> = {
        body: { firstName: "John" },
        query: {},
        params: {},
      };
      const result = await runValidation(userFieldsValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass when lastName exists", async () => {
      const req: Partial<Request> = {
        body: { lastName: "Doe" },
        query: {},
        params: {},
      };
      const result = await runValidation(userFieldsValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass when password exists", async () => {
      const req: Partial<Request> = {
        body: { password: "secret123" },
        query: {},
        params: {},
      };
      const result = await runValidation(userFieldsValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass when balance exists", async () => {
      const req: Partial<Request> = {
        body: { balance: 1000 },
        query: {},
        params: {},
      };
      const result = await runValidation(userFieldsValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass when avatar exists", async () => {
      const req: Partial<Request> = {
        body: { avatar: "https://example.com/avatar.png" },
        query: {},
        params: {},
      };
      const result = await runValidation(userFieldsValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should pass when defaultPrivacyLevel exists", async () => {
      const req: Partial<Request> = {
        body: { defaultPrivacyLevel: "public" },
        query: {},
        params: {},
      };
      const result = await runValidation(userFieldsValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail when no user fields exist", async () => {
      const req: Partial<Request> = {
        body: {},
        query: {},
        params: {},
      };
      const result = await runValidation(userFieldsValidator, req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe("isNotificationsBodyValidator", () => {
    test("should pass for valid notification items", async () => {
      const req: Partial<Request> = {
        body: {
          items: [
            { type: "payment", transactionId: "abc123" },
            { type: "like", transactionId: "def456" },
          ],
        },
        query: {},
        params: {},
      };
      const result = await runValidations(isNotificationsBodyValidator, req);
      expect(result.isEmpty()).toBe(true);
    });

    test("should fail for invalid notification type", async () => {
      const req: Partial<Request> = {
        body: {
          items: [{ type: "invalid", transactionId: "abc123" }],
        },
        query: {},
        params: {},
      };
      const result = await runValidations(isNotificationsBodyValidator, req);
      expect(result.isEmpty()).toBe(false);
    });

    test("should fail for invalid transactionId", async () => {
      const req: Partial<Request> = {
        body: {
          items: [{ type: "payment", transactionId: "invalid-id-with-special-chars!!!" }],
        },
        query: {},
        params: {},
      };
      const result = await runValidations(isNotificationsBodyValidator, req);
      expect(result.isEmpty()).toBe(false);
    });
  });
});
