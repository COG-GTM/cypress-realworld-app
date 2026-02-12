import { describe, it, expect, vi } from "vitest";
import { notificationsMachine } from "../notificationsMachine";

vi.mock("../../utils/asyncUtils", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
    interceptors: { request: { use: vi.fn() } },
    defaults: { withCredentials: true },
  },
}));

describe("notificationsMachine", () => {
  it("has an initial state of idle", () => {
    expect(notificationsMachine.initialState.value).toBe("idle");
  });

  it("has correct initial context", () => {
    const ctx = notificationsMachine.initialState.context;
    expect(ctx.results).toEqual([]);
    expect(ctx.message).toBeUndefined();
    expect(ctx.pageData).toEqual({});
  });

  it("transitions from idle to loading on FETCH", () => {
    const nextState = notificationsMachine.transition("idle", "FETCH");
    expect(nextState.value).toBe("loading");
  });

  it("transitions from idle to creating on CREATE", () => {
    const nextState = notificationsMachine.transition("idle", "CREATE");
    expect(nextState.value).toBe("creating");
  });

  it("transitions from idle to updating on UPDATE", () => {
    const nextState = notificationsMachine.transition("idle", "UPDATE");
    expect(nextState.value).toBe("updating");
  });

  it("transitions from idle to deleting on DELETE", () => {
    const nextState = notificationsMachine.transition("idle", "DELETE");
    expect(nextState.value).toBe("deleting");
  });
});
