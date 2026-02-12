import { describe, expect, it, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";

vi.mock("../../src/aws-exports", () => ({
  default: {
    Auth: {
      Cognito: {
        userPoolId: "us-east-1_test",
      },
    },
  },
}));

vi.mock("@okta/jwt-verifier", () => ({
  default: vi.fn().mockImplementation(() => ({
    verifyAccessToken: vi.fn(),
  })),
}));

vi.mock("jwks-rsa", () => ({
  default: {
    expressJwtSecret: vi.fn().mockReturnValue(vi.fn()),
  },
}));

vi.mock("express-jwt", () => ({
  default: vi.fn().mockReturnValue({
    unless: vi.fn().mockReturnValue(vi.fn()),
  }),
}));

import { ensureAuthenticated, validateMiddleware, verifyOktaToken } from "../helpers";

describe("helpers", () => {
  describe("verifyOktaToken", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        headers: {},
      };
      res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };
      next = vi.fn();
    });

    it("should return 401 when no authorization header is present", () => {
      verifyOktaToken(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });
  });

  describe("ensureAuthenticated", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        isAuthenticated: vi.fn() as any,
      };
      res = {
        status: vi.fn().mockReturnThis() as any,
        send: vi.fn(),
      };
      next = vi.fn();
    });

    it("should call next() when user is authenticated", () => {
      (req.isAuthenticated as any).mockReturnValue(true);
      // @ts-ignore
      req.user = { id: "user-1" };

      ensureAuthenticated(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should send 401 when user is not authenticated", () => {
      (req.isAuthenticated as any).mockReturnValue(false);

      ensureAuthenticated(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should map req.user.sub to req.user.id when sub is present", () => {
      (req.isAuthenticated as any).mockReturnValue(true);
      // @ts-ignore
      req.user = { sub: "auth0|12345" };

      ensureAuthenticated(req as Request, res as Response, next);

      // @ts-ignore
      expect(req.user.id).toBe("auth0|12345");
      expect(next).toHaveBeenCalled();
    });

    it("should not map sub to id when sub is not present", () => {
      (req.isAuthenticated as any).mockReturnValue(true);
      // @ts-ignore
      req.user = { id: "user-1" };

      ensureAuthenticated(req as Request, res as Response, next);

      // @ts-ignore
      expect(req.user.id).toBe("user-1");
      expect(next).toHaveBeenCalled();
    });
  });

  describe("validateMiddleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        body: {},
        query: {},
        params: {},
      };
      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      next = vi.fn();
    });

    it("should call next() when validations pass", async () => {
      const mockValidation = {
        run: vi.fn().mockResolvedValue(undefined),
      };

      const middleware = validateMiddleware([mockValidation]);
      await middleware(req as Request, res as Response, next);

      expect(mockValidation.run).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalled();
    });

    it("should return 422 when validations fail", async () => {
      const { check } = await import("express-validator");
      const validation = check("requiredField").exists();

      const middleware = validateMiddleware([validation]);
      await middleware(req as Request, res as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalled();
    });
  });
});
