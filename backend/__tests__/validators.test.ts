import { describe, expect, it } from "vitest";
import { validationResult } from "express-validator";
import { TransactionRequestStatus, TransactionStatus } from "../../src/models";
import { sanitizeRequestStatus, sanitizeTransactionStatus, shortIdValidation } from "../validators";

describe("sanitizeTransactionStatus", () => {
  it("valid status passes through", async () => {
    const req: any = { query: { status: TransactionStatus.complete } };

    await sanitizeTransactionStatus.run(req);

    expect(req.query.status).toBe(TransactionStatus.complete);
  });

  it("invalid status returns undefined", async () => {
    const req: any = { query: { status: "invalid" } };

    await sanitizeTransactionStatus.run(req);

    expect(req.query.status).toBeUndefined();
  });
});

describe("sanitizeRequestStatus", () => {
  it("valid request status passes through", async () => {
    const req: any = { query: { requestStatus: TransactionRequestStatus.accepted } };

    await sanitizeRequestStatus.run(req);

    expect(req.query.requestStatus).toBe(TransactionRequestStatus.accepted);
  });

  it("invalid request status returns undefined", async () => {
    const req: any = { query: { requestStatus: "invalid" } };

    await sanitizeRequestStatus.run(req);

    expect(req.query.requestStatus).toBeUndefined();
  });
});

describe("shortIdValidation", () => {
  it("accepts a valid shortid", async () => {
    const req: any = { body: { id: "PPBqWA9" } };

    await shortIdValidation("id").run(req);

    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(true);
  });

  it("rejects an invalid shortid", async () => {
    const req: any = { body: { id: "" } };

    await shortIdValidation("id").run(req);

    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });
});
