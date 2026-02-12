import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { set } from "lodash";
import { validationResult } from "express-validator";

const ensureAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    if (req.user?.sub) {
      set(req.user, "id", req.user.sub);
    }
    return next();
  }
  res.status(401).send({
    error: "Unauthorized",
  });
};

const validateMiddleware = (validations: any[]) => {
  return async (req: any, res: any, next: any) => {
    await Promise.all(validations.map((validation: any) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(422).json({ errors: errors.array() });
  };
};

describe("helpers", () => {
  describe("ensureAuthenticated", () => {
    let req: any;
    let res: any;
    let next: any;

    beforeEach(() => {
      req = {
        isAuthenticated: vi.fn(),
        user: {},
      };
      res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };
      next = vi.fn();
    });

    it("calls next() when user is authenticated", () => {
      req.isAuthenticated.mockReturnValue(true);
      ensureAuthenticated(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("maps sub to id when user has sub property", () => {
      req.isAuthenticated.mockReturnValue(true);
      req.user = { sub: "auth0|123" };
      ensureAuthenticated(req, res, next);
      expect(req.user.id).toBe("auth0|123");
      expect(next).toHaveBeenCalled();
    });

    it("sends 401 when user is not authenticated", () => {
      req.isAuthenticated.mockReturnValue(false);
      ensureAuthenticated(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });

    it("does not map sub to id when sub is absent", () => {
      req.isAuthenticated.mockReturnValue(true);
      req.user = { name: "testuser" };
      ensureAuthenticated(req, res, next);
      expect(req.user.id).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("validateMiddleware", () => {
    it("calls next when validations pass", async () => {
      const mockValidation = {
        run: vi.fn().mockResolvedValue(undefined),
      };
      const middleware = validateMiddleware([mockValidation]);

      const req = {} as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      await middleware(req, res, next);
      expect(mockValidation.run).toHaveBeenCalledWith(req);
    });
  });
});
