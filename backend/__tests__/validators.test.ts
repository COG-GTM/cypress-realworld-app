import { describe, it, expect } from "vitest";
import { validationResult } from "express-validator";
import shortid from "shortid";

import {
  sanitizeTransactionStatus,
  sanitizeRequestStatus,
  shortIdValidation,
  isNotificationsBodyValidator,
  isTransactionQSValidator,
} from "../validators";

import { TransactionStatus, TransactionRequestStatus, NotificationsType } from "../../src/models";

describe("backend/validators", () => {
  it("sanitizeTransactionStatus: keeps valid values", async () => {
    const req: any = { query: { status: TransactionStatus.complete } };
    await sanitizeTransactionStatus.run(req);
    expect(req.query.status).toBe(TransactionStatus.complete);
  });

  it("sanitizeTransactionStatus: clears invalid values", async () => {
    const req: any = { query: { status: "not-a-status" } };
    await sanitizeTransactionStatus.run(req);
    expect(req.query.status).toBeUndefined();
  });

  it("sanitizeRequestStatus: keeps valid values", async () => {
    const req: any = { query: { requestStatus: TransactionRequestStatus.pending } };
    await sanitizeRequestStatus.run(req);
    expect(req.query.requestStatus).toBe(TransactionRequestStatus.pending);
  });

  it("sanitizeRequestStatus: clears invalid values", async () => {
    const req: any = { query: { requestStatus: "not-a-request-status" } };
    await sanitizeRequestStatus.run(req);
    expect(req.query.requestStatus).toBeUndefined();
  });

  it("shortIdValidation: accepts a valid shortid", async () => {
    const req: any = { body: { transactionId: shortid() } };
    await shortIdValidation("transactionId").run(req);
    const result = validationResult(req);
    expect(result.isEmpty()).toBe(true);
  });

  it("shortIdValidation: rejects an invalid shortid", async () => {
    const req: any = { body: { transactionId: "###" } };
    await shortIdValidation("transactionId").run(req);
    const result = validationResult(req);
    expect(result.isEmpty()).toBe(false);
  });

  it("isNotificationsBodyValidator: validates items.type and items.transactionId", async () => {
    const req: any = {
      body: {
        items: [{ type: NotificationsType.like, transactionId: shortid() }],
      },
    };

    await Promise.all(isNotificationsBodyValidator.map((v) => v.run(req)));

    const result = validationResult(req);
    expect(result.isEmpty()).toBe(true);
  });

  it("isTransactionQSValidator: rejects invalid status", async () => {
    const req: any = { query: { status: "bad" } };

    await Promise.all(isTransactionQSValidator.map((v) => v.run(req)));

    const result = validationResult(req);
    expect(result.isEmpty()).toBe(false);
  });
});
