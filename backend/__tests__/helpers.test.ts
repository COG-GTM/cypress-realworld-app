import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../src/aws-exports", () => ({
  default: {
    Auth: {
      Cognito: {
        userPoolId: "us-east-1_test",
      },
    },
  },
}));

vi.mock("@okta/jwt-verifier", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      verifyAccessToken: vi.fn(),
    })),
  };
});

const { mockValidationResult } = vi.hoisted(() => ({
  mockValidationResult: vi.fn(),
}));
vi.mock("express-validator", async (importOriginal) => {
  const actual = await importOriginal<typeof import("express-validator")>();
  return {
    ...actual,
    validationResult: mockValidationResult,
  };
});

import { ensureAuthenticated, validateMiddleware } from "../helpers";
import { Request, Response, NextFunction } from "express";

describe("ensureAuthenticated", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      isAuthenticated: vi.fn() as unknown as Request["isAuthenticated"],
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
    mockNext = vi.fn();
  });

  it("should call next() when user is authenticated", () => {
    (mockReq.isAuthenticated as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    mockReq.user = { id: "user-1" } as any;

    ensureAuthenticated(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it("should send 401 when user is not authenticated", () => {
    (mockReq.isAuthenticated as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

    ensureAuthenticated(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should map req.user.sub to req.user.id when sub exists", () => {
    (mockReq.isAuthenticated as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    mockReq.user = { sub: "okta-user-123" } as any;

    ensureAuthenticated(mockReq as Request, mockRes as Response, mockNext);

    expect((mockReq.user as any).id).toBe("okta-user-123");
    expect(mockNext).toHaveBeenCalled();
  });

  it("should not map sub to id when sub does not exist", () => {
    (mockReq.isAuthenticated as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    mockReq.user = { id: "local-user-1" } as any;

    ensureAuthenticated(mockReq as Request, mockRes as Response, mockNext);

    expect((mockReq.user as any).id).toBe("local-user-1");
    expect(mockNext).toHaveBeenCalled();
  });
});

describe("validateMiddleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  it("should call next() when there are no validation errors", async () => {
    mockValidationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });
    const mockValidation = { run: vi.fn().mockResolvedValue(undefined) };

    const middleware = validateMiddleware([mockValidation]);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockValidation.run).toHaveBeenCalledWith(mockReq);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should return 422 with errors when validation fails", async () => {
    const validationErrors = [{ msg: "Invalid value", param: "field" }];
    mockValidationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => validationErrors,
    });
    const mockValidation = { run: vi.fn().mockResolvedValue(undefined) };

    const middleware = validateMiddleware([mockValidation]);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(422);
    expect(mockRes.json).toHaveBeenCalledWith({ errors: validationErrors });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
