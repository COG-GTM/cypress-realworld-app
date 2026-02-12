import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock(
  "../../src/aws-exports",
  () => ({
    default: {
      Auth: {
        Cognito: {
          userPoolId: "us-east-1_TEST",
        },
      },
    },
  }),
  { virtual: true }
);

vi.mock("express-jwt", () => ({
  default: () => ({
    unless: () => (_req: any, _res: any, next: any) => next(),
  }),
}));

vi.mock("jwks-rsa", () => ({
  default: {
    expressJwtSecret: vi.fn(() => vi.fn()),
  },
}));

vi.mock("@okta/jwt-verifier", () => ({
  default: class OktaJwtVerifier {
    verifyAccessToken() {
      return Promise.resolve({ sub: "okta-sub" });
    }
  },
}));

vi.mock("express-validator", () => ({
  validationResult: vi.fn(),
}));

import { ensureAuthenticated, validateMiddleware } from "../helpers";
import { validationResult } from "express-validator";

describe("backend/helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ensureAuthenticated: calls next and maps sub to id", () => {
    const req: any = {
      isAuthenticated: vi.fn(() => true),
      user: { sub: "user-sub" },
    };

    const res: any = {
      status: vi.fn(() => res),
      send: vi.fn(),
    };

    const next = vi.fn();

    ensureAuthenticated(req, res, next);

    expect(req.user.id).toBe("user-sub");
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("ensureAuthenticated: calls next when authenticated without sub", () => {
    const req: any = {
      isAuthenticated: vi.fn(() => true),
      user: {},
    };

    const res: any = {
      status: vi.fn(() => res),
      send: vi.fn(),
    };

    const next = vi.fn();

    ensureAuthenticated(req, res, next);

    expect(req.user.id).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("ensureAuthenticated: returns 401 when unauthenticated", () => {
    const req: any = {
      isAuthenticated: vi.fn(() => false),
    };

    const res: any = {
      status: vi.fn(() => res),
      send: vi.fn(),
    };

    const next = vi.fn();

    ensureAuthenticated(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  it("validateMiddleware: calls next when validationResult is empty", async () => {
    vi.mocked(validationResult).mockReturnValueOnce({
      isEmpty: () => true,
      array: () => [],
    } as any);

    const validation1 = { run: vi.fn().mockResolvedValueOnce(undefined) };
    const validation2 = { run: vi.fn().mockResolvedValueOnce(undefined) };

    const req: any = {};
    const res: any = {
      status: vi.fn(() => res),
      json: vi.fn(),
    };
    const next = vi.fn();

    const middleware = validateMiddleware([validation1, validation2]);
    await middleware(req, res, next);

    expect(validation1.run).toHaveBeenCalledWith(req);
    expect(validation2.run).toHaveBeenCalledWith(req);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("validateMiddleware: returns 422 when validationResult has errors", async () => {
    const errors = [{ msg: "Bad request" }];
    vi.mocked(validationResult).mockReturnValueOnce({
      isEmpty: () => false,
      array: () => errors,
    } as any);

    const validation = { run: vi.fn().mockResolvedValueOnce(undefined) };

    const req: any = {};
    const res: any = {
      status: vi.fn(() => res),
      json: vi.fn(),
    };
    const next = vi.fn();

    const middleware = validateMiddleware([validation]);
    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ errors });
  });
});
