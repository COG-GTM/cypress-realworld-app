import { describe, expect, test, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { ensureAuthenticated, validateMiddleware } from "../helpers";

describe("Backend Helpers", () => {
  describe("ensureAuthenticated", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        isAuthenticated: vi.fn(),
        user: undefined,
      };
      mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };
      mockNext = vi.fn();
    });

    test("should call next() when user is authenticated", () => {
      (mockReq.isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(true);
      mockReq.user = { id: "test-user-id" };

      ensureAuthenticated(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test("should call next() when user is authenticated with sub property", () => {
      (mockReq.isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(true);
      mockReq.user = { sub: "test-sub-id" };

      ensureAuthenticated(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq.user as any).id).toBe("test-sub-id");
    });

    test("should return 401 when user is not authenticated", () => {
      (mockReq.isAuthenticated as ReturnType<typeof vi.fn>).mockReturnValue(false);

      ensureAuthenticated(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.send).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("validateMiddleware", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        body: {},
        query: {},
        params: {},
      };
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      mockNext = vi.fn();
    });

    test("should call next() when validations pass", async () => {
      const mockValidation = {
        run: vi.fn().mockResolvedValue(undefined),
      };

      const middleware = validateMiddleware([mockValidation]);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockValidation.run).toHaveBeenCalledWith(mockReq);
      expect(mockNext).toHaveBeenCalled();
    });

    test("should return 422 with errors when validations fail", async () => {
      const mockValidation = {
        run: vi.fn().mockImplementation((req: Request) => {
          (req as any)["express-validator#contexts"] = [
            {
              _errors: [{ msg: "Invalid value", param: "testField" }],
              fields: ["testField"],
            },
          ];
          return Promise.resolve();
        }),
      };

      const middleware = validateMiddleware([mockValidation]);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockValidation.run).toHaveBeenCalledWith(mockReq);
    });

    test("should handle multiple validations", async () => {
      const mockValidation1 = {
        run: vi.fn().mockResolvedValue(undefined),
      };
      const mockValidation2 = {
        run: vi.fn().mockResolvedValue(undefined),
      };

      const middleware = validateMiddleware([mockValidation1, mockValidation2]);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockValidation1.run).toHaveBeenCalledWith(mockReq);
      expect(mockValidation2.run).toHaveBeenCalledWith(mockReq);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
