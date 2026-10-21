import { describe, expect, it } from "vitest";
import { validationResult, matchedData } from "express-validator";
import shortid from "shortid";
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
  isSeedValidator,
} from "../../backend/validators";

type MockRequest = {
  body: Record<string, any>;
  query: Record<string, any>;
  params: Record<string, any>;
  headers: Record<string, any>;
  cookies: Record<string, any>;
};

const buildRequest = (overrides: Partial<MockRequest> = {}): MockRequest => ({
  body: {},
  query: {},
  params: {},
  headers: {},
  cookies: {},
  ...overrides,
});

const runValidations = async (validations: any | any[], req: MockRequest) => {
  const list = Array.isArray(validations) ? validations : [validations];
  for (const validation of list) {
    await validation.run(req);
  }
  return validationResult(req);
};

const invalidFields = (result: ReturnType<typeof validationResult>) =>
  result.array().map((error: any) => error.param);

describe("Validators", () => {
  describe("shortIdValidation", () => {
    it("passes for a valid shortid", async () => {
      const req = buildRequest({ params: { transactionId: shortid() } });
      const result = await runValidations(shortIdValidation("transactionId"), req);

      expect(result.isEmpty()).toBe(true);
    });

    it("fails for an invalid shortid", async () => {
      const req = buildRequest({ params: { transactionId: "not a short id!" } });
      const result = await runValidations(shortIdValidation("transactionId"), req);

      expect(result.isEmpty()).toBe(false);
      expect(invalidFields(result)).toContain("transactionId");
    });

    it("fails when the key is missing", async () => {
      const result = await runValidations(shortIdValidation("transactionId"), buildRequest());

      expect(result.isEmpty()).toBe(false);
    });
  });

  describe("searchValidation", () => {
    it("passes when q is provided", async () => {
      const result = await runValidations(searchValidation, buildRequest({ query: { q: "abc" } }));

      expect(result.isEmpty()).toBe(true);
    });

    it("fails when q is missing", async () => {
      const result = await runValidations(searchValidation, buildRequest());

      expect(invalidFields(result)).toEqual(["q"]);
    });
  });

  describe("userFieldsValidator", () => {
    it("passes when at least one updatable user field exists", async () => {
      const result = await runValidations(
        userFieldsValidator,
        buildRequest({ body: { firstName: "Edgar" } })
      );

      expect(result.isEmpty()).toBe(true);
    });

    it("fails when no updatable user field exists", async () => {
      const result = await runValidations(
        userFieldsValidator,
        buildRequest({ body: { unknown: "x" } })
      );

      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe("Invalid value(s)");
    });
  });

  describe("isBankAccountValidator", () => {
    it("passes and trims a valid bank account payload", async () => {
      const req = buildRequest({
        body: { bankName: "  The Best Bank ", accountNumber: "123456789", routingNumber: "987" },
      });
      const result = await runValidations(isBankAccountValidator, req);

      expect(result.isEmpty()).toBe(true);
      expect(req.body.bankName).toBe("The Best Bank");
    });

    it("fails when bank account fields are missing or not strings", async () => {
      const req = buildRequest({ body: { bankName: 123 } });
      const result = await runValidations(isBankAccountValidator, req);

      expect(invalidFields(result).sort()).toEqual(["accountNumber", "bankName", "routingNumber"]);
    });
  });

  describe("isUserValidator", () => {
    it("passes when all optional fields are omitted", async () => {
      const result = await runValidations(isUserValidator, buildRequest());

      expect(result.isEmpty()).toBe(true);
    });

    it("passes for a fully populated valid user", async () => {
      const result = await runValidations(
        isUserValidator,
        buildRequest({
          body: {
            firstName: "Edgar",
            lastName: "Johns",
            username: "Katharina_Bernier",
            password: "s3cret",
            email: "edgar@example.com",
            phoneNumber: "625-316-9882",
            balance: "1000",
            avatar: "https://example.com/avatar.png",
            defaultPrivacyLevel: "public",
          },
        })
      );

      expect(result.isEmpty()).toBe(true);
    });

    it("fails for a non-numeric balance, invalid avatar URL and unknown privacy level", async () => {
      const result = await runValidations(
        isUserValidator,
        buildRequest({
          body: { balance: "lots", avatar: "not-a-url", defaultPrivacyLevel: "everyone" },
        })
      );

      expect(invalidFields(result).sort()).toEqual(["avatar", "balance", "defaultPrivacyLevel"]);
    });
  });

  describe("sanitizers", () => {
    it("keeps a known transaction status", async () => {
      const req = buildRequest({ query: { status: "pending" } });
      await sanitizeTransactionStatus.run(req);

      expect(req.query.status).toBe("pending");
    });

    it("clears an unknown transaction status", async () => {
      const req = buildRequest({ query: { status: "bogus" } });
      await sanitizeTransactionStatus.run(req);

      expect(req.query.status).toBeUndefined();
    });

    it("keeps a known request status", async () => {
      const req = buildRequest({ query: { requestStatus: "accepted" } });
      await sanitizeRequestStatus.run(req);

      expect(req.query.requestStatus).toBe("accepted");
    });

    it("clears an unknown request status", async () => {
      const req = buildRequest({ query: { requestStatus: "bogus" } });
      await sanitizeRequestStatus.run(req);

      expect(req.query.requestStatus).toBeUndefined();
    });
  });

  describe("isTransactionQSValidator", () => {
    it("passes for a valid query string", async () => {
      const result = await runValidations(
        isTransactionQSValidator,
        buildRequest({
          query: {
            status: "complete",
            requestStatus: "accepted",
            receiverId: shortid(),
            senderId: shortid(),
            rangeStartTs: "1",
            rangeEndTs: "2",
            amountMin: "100",
            amountMax: "500",
          },
        })
      );

      expect(result.isEmpty()).toBe(true);
    });

    it("fails for invalid status, request status and amount range values", async () => {
      const result = await runValidations(
        isTransactionQSValidator,
        buildRequest({
          query: { status: "bogus", requestStatus: "bogus", amountMin: "abc", amountMax: "xyz" },
        })
      );

      expect(invalidFields(result).sort()).toEqual([
        "amountMax",
        "amountMin",
        "requestStatus",
        "status",
      ]);
    });
  });

  describe("isTransactionPayloadValidator", () => {
    it("passes for a valid payment and converts the amount to an integer", async () => {
      const req = buildRequest({
        body: {
          transactionType: "payment",
          privacyLevel: "public",
          source: shortid(),
          receiverId: shortid(),
          description: "Pizza",
          amount: "150",
        },
      });
      const result = await runValidations(isTransactionPayloadValidator, req);

      expect(result.isEmpty()).toBe(true);
      expect(req.body.amount).toBe(150);
    });

    it("fails for an unknown transaction type, privacy level and non-numeric amount", async () => {
      const result = await runValidations(
        isTransactionPayloadValidator,
        buildRequest({
          body: {
            transactionType: "gift",
            privacyLevel: "secret",
            receiverId: shortid(),
            description: "Pizza",
            amount: "free",
          },
        })
      );

      expect(invalidFields(result).sort()).toEqual(["amount", "privacyLevel", "transactionType"]);
    });

    it("fails when required fields are missing", async () => {
      const result = await runValidations(isTransactionPayloadValidator, buildRequest());

      expect(invalidFields(result)).toEqual(
        expect.arrayContaining(["transactionType", "receiverId", "description", "amount"])
      );
    });
  });

  describe("isTransactionPatchValidator", () => {
    it("passes for a known request status", async () => {
      const result = await runValidations(
        isTransactionPatchValidator,
        buildRequest({ body: { requestStatus: "rejected" } })
      );

      expect(result.isEmpty()).toBe(true);
    });

    it("fails for an unknown request status", async () => {
      const result = await runValidations(
        isTransactionPatchValidator,
        buildRequest({ body: { requestStatus: "maybe" } })
      );

      expect(invalidFields(result)).toEqual(["requestStatus"]);
    });
  });

  describe("isTransactionPublicQSValidator", () => {
    it("passes for the default order", async () => {
      const result = await runValidations(
        isTransactionPublicQSValidator,
        buildRequest({ query: { order: "default" } })
      );

      expect(result.isEmpty()).toBe(true);
    });

    it("fails for an unsupported order", async () => {
      const result = await runValidations(
        isTransactionPublicQSValidator,
        buildRequest({ query: { order: "desc" } })
      );

      expect(invalidFields(result)).toEqual(["order"]);
    });
  });

  describe("isCommentValidator", () => {
    it("passes and trims a comment", async () => {
      const req = buildRequest({ body: { content: "  Thanks!  " } });
      const result = await runValidations(isCommentValidator, req);

      expect(result.isEmpty()).toBe(true);
      expect(matchedData(req)).toEqual({ content: "Thanks!" });
    });

    it("fails when content is not a string", async () => {
      const result = await runValidations(
        isCommentValidator,
        buildRequest({ body: { content: 42 } })
      );

      expect(invalidFields(result)).toEqual(["content"]);
    });
  });

  describe("isNotificationsBodyValidator", () => {
    it("passes for valid notification items", async () => {
      const result = await runValidations(
        isNotificationsBodyValidator,
        buildRequest({
          body: {
            items: [
              { type: "payment", transactionId: shortid() },
              { type: "like", transactionId: shortid() },
            ],
          },
        })
      );

      expect(result.isEmpty()).toBe(true);
    });

    it("fails for unknown notification types and invalid transaction ids", async () => {
      const result = await runValidations(
        isNotificationsBodyValidator,
        buildRequest({ body: { items: [{ type: "poke", transactionId: "%%%" }] } })
      );

      expect(invalidFields(result).sort()).toEqual(["items[0].transactionId", "items[0].type"]);
    });
  });

  describe("isNotificationPatchValidator", () => {
    it("passes for a boolean isRead", async () => {
      const result = await runValidations(
        isNotificationPatchValidator,
        buildRequest({ body: { isRead: true } })
      );

      expect(result.isEmpty()).toBe(true);
    });

    it("fails for a non-boolean isRead", async () => {
      const result = await runValidations(
        isNotificationPatchValidator,
        buildRequest({ body: { isRead: "yes" } })
      );

      expect(invalidFields(result)).toEqual(["isRead"]);
    });
  });

  describe("isValidEntityValidator", () => {
    it.each([
      "users",
      "contacts",
      "bankaccounts",
      "notifications",
      "transactions",
      "likes",
      "comments",
      "banktransfers",
    ])("passes for the %s entity", async (entity) => {
      const result = await runValidations(
        isValidEntityValidator,
        buildRequest({ params: { entity } })
      );

      expect(result.isEmpty()).toBe(true);
    });

    it("fails for an unknown entity", async () => {
      const result = await runValidations(
        isValidEntityValidator,
        buildRequest({ params: { entity: "passwords" } })
      );

      expect(invalidFields(result)).toEqual(["entity"]);
    });
  });

  describe("isSeedValidator", () => {
    it.each([undefined, "default", "empty"])("passes for the %s seed", async (seed) => {
      const result = await runValidations(isSeedValidator, buildRequest({ body: { seed } }));

      expect(result.isEmpty()).toBe(true);
    });

    it.each(["unknown", "", 42])("fails for the invalid %s seed", async (seed) => {
      const result = await runValidations(isSeedValidator, buildRequest({ body: { seed } }));

      expect(invalidFields(result)).toEqual(["seed"]);
      expect(result.array()[0].msg).toBe("seed must be one of: default, empty");
    });
  });
});
