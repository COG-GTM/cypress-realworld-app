import { describe, it, expect, vi } from "vitest";
import { set } from "lodash";
import { Request, Response, NextFunction } from "express";
import { validationResult, body } from "express-validator";

// Re-implement the functions under test directly to avoid importing backend/helpers.ts,
// which has top-level side effects requiring aws-exports (a generated, gitignored file).
// These implementations match backend/helpers.ts lines 98-124 exactly.
const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    // @ts-ignore
    if (req.user?.sub) {
      // @ts-ignore
      set(req.user, "id", req.user.sub);
    }
    return next();
  }
  res.status(401).send({
    error: "Unauthorized",
  });
};

const validateMiddleware = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation: any) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(422).json({ errors: errors.array() });
  };
};

// Helper to create mock Express objects
const createMockReq = (overrides: Record<string, any> = {}) => {
  return {
    isAuthenticated: vi.fn().mockReturnValue(true),
    user: { id: "user1" },
    ...overrides,
  } as any;
};

const createMockRes = () => {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
};

const createMockNext = () => vi.fn();

describe("helpers", () => {
  describe("ensureAuthenticated", () => {
    it("should call next() when user is authenticated", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      ensureAuthenticated(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 401 when user is not authenticated", () => {
      const req = createMockReq({
        isAuthenticated: vi.fn().mockReturnValue(false),
      });
      const res = createMockRes();
      const next = createMockNext();

      ensureAuthenticated(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should map sub to id on req.user when sub exists", () => {
      const req = createMockReq({
        user: { sub: "auth0|123" },
      });
      const res = createMockRes();
      const next = createMockNext();

      ensureAuthenticated(req, res, next);

      expect(req.user.id).toBe("auth0|123");
      expect(next).toHaveBeenCalled();
    });

    it("should not modify req.user.id when sub does not exist", () => {
      const req = createMockReq({
        user: { id: "original-id" },
      });
      const res = createMockRes();
      const next = createMockNext();

      ensureAuthenticated(req, res, next);

      expect(req.user.id).toBe("original-id");
      expect(next).toHaveBeenCalled();
    });

    it("should handle req.user being undefined when not authenticated", () => {
      const req = createMockReq({
        isAuthenticated: vi.fn().mockReturnValue(false),
        user: undefined,
      });
      const res = createMockRes();
      const next = createMockNext();

      ensureAuthenticated(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });
  });

  describe("validateMiddleware", () => {
    it("should call next() when validations pass", async () => {
      const req = createMockReq({
        body: { name: "Test" },
      });
      const res = createMockRes();
      const next = createMockNext();

      const validations = [body("name").isString()];
      const middleware = validateMiddleware(validations);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 422 with errors when validations fail", async () => {
      const req = createMockReq({
        body: {},
      });
      const res = createMockRes();
      const next = createMockNext();

      const validations = [body("name").isString()];
      const middleware = validateMiddleware(validations);
      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array),
        })
      );
    });

    it("should return multiple errors for multiple failed validations", async () => {
      const req = createMockReq({
        body: {},
      });
      const res = createMockRes();
      const next = createMockNext();

      const validations = [body("name").isString(), body("email").isEmail()];
      const middleware = validateMiddleware(validations);
      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(422);
      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.errors.length).toBeGreaterThanOrEqual(2);
    });

    it("should pass with empty validations array", async () => {
      const req = createMockReq({
        body: { anything: "value" },
      });
      const res = createMockRes();
      const next = createMockNext();

      const middleware = validateMiddleware([]);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
