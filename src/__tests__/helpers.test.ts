import { describe, expect, it, vi } from "vitest";
import { check } from "express-validator";

import { ensureAuthenticated, validateMiddleware } from "../../backend/helpers";

const buildResponse = () => {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.send = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

const buildRequest = (overrides: Record<string, any> = {}): any => ({
  body: {},
  query: {},
  params: {},
  headers: {},
  cookies: {},
  ...overrides,
});

describe("Helpers", () => {
  describe("ensureAuthenticated", () => {
    it("calls next for an authenticated request", () => {
      const req = buildRequest({ isAuthenticated: () => true, user: { id: "abc123" } });
      const res = buildResponse();
      const next = vi.fn();

      ensureAuthenticated(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(req.user.id).toBe("abc123");
      expect(res.status).not.toHaveBeenCalled();
    });

    it("maps the token subject to the user id for third-party auth providers", () => {
      const req = buildRequest({ isAuthenticated: () => true, user: { sub: "auth0|xyz" } });
      const next = vi.fn();

      ensureAuthenticated(req, buildResponse(), next);

      expect(next).toHaveBeenCalledOnce();
      expect(req.user.id).toBe("auth0|xyz");
    });

    it("responds 401 Unauthorized for an unauthenticated request", () => {
      const req = buildRequest({ isAuthenticated: () => false });
      const res = buildResponse();
      const next = vi.fn();

      ensureAuthenticated(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ error: "Unauthorized" });
    });
  });

  describe("validateMiddleware", () => {
    const middleware = validateMiddleware([
      check("username").isString(),
      check("amount").isNumeric(),
    ]);

    it("calls next when all validations pass", async () => {
      const req = buildRequest({ body: { username: "edgar", amount: "100" } });
      const res = buildResponse();
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("responds 422 with the validation errors when a validation fails", async () => {
      const req = buildRequest({ body: { username: "edgar", amount: "abc" } });
      const res = buildResponse();
      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(422);
      const { errors } = res.json.mock.calls[0][0];
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({ param: "amount", value: "abc", location: "body" });
    });

    it("reports every failing field", async () => {
      const req = buildRequest();
      const res = buildResponse();

      await middleware(req, res, vi.fn());

      const { errors } = res.json.mock.calls[0][0];
      expect(errors.map((error: any) => error.param).sort()).toEqual(["amount", "username"]);
    });

    it("calls next when no validations are provided", async () => {
      const next = vi.fn();

      await validateMiddleware([])(buildRequest(), buildResponse(), next);

      expect(next).toHaveBeenCalledOnce();
    });
  });
});
