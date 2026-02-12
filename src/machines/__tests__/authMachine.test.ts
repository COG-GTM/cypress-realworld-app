import { describe, it, expect, vi, beforeEach } from "vitest";
import { interpret } from "xstate";
import { authMachine } from "../authMachine";

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

vi.mock("../../utils/historyUtils", () => ({
  history: {
    push: vi.fn(),
    location: { pathname: "/signin" },
    listen: vi.fn(),
  },
}));

describe("authMachine", () => {
  it("has an initial state of unauthorized", () => {
    expect(authMachine.initialState.value).toBe("unauthorized");
  });

  it("has undefined user and message in initial context", () => {
    expect(authMachine.initialState.context.user).toBeUndefined();
    expect(authMachine.initialState.context.message).toBeUndefined();
  });

  it("transitions from unauthorized to loading on LOGIN", () => {
    const nextState = authMachine.transition("unauthorized", "LOGIN");
    expect(nextState.value).toBe("loading");
  });

  it("transitions from unauthorized to signup on SIGNUP", () => {
    const nextState = authMachine.transition("unauthorized", "SIGNUP");
    expect(nextState.value).toBe("signup");
  });

  it("transitions from authorized to updating on UPDATE", () => {
    const nextState = authMachine.transition("authorized", "UPDATE");
    expect(nextState.value).toBe("updating");
  });

  it("transitions from authorized to refreshing on REFRESH", () => {
    const nextState = authMachine.transition("authorized", "REFRESH");
    expect(nextState.value).toBe("refreshing");
  });

  it("transitions from authorized to logout on LOGOUT", () => {
    const nextState = authMachine.transition("authorized", "LOGOUT");
    expect(nextState.value).toBe("logout");
  });

  it("transitions from unauthorized to google on GOOGLE", () => {
    const nextState = authMachine.transition("unauthorized", "GOOGLE");
    expect(nextState.value).toBe("google");
  });

  it("transitions from unauthorized to auth0 on AUTH0", () => {
    const nextState = authMachine.transition("unauthorized", "AUTH0");
    expect(nextState.value).toBe("auth0");
  });

  it("transitions from unauthorized to okta on OKTA", () => {
    const nextState = authMachine.transition("unauthorized", "OKTA");
    expect(nextState.value).toBe("okta");
  });

  it("transitions from unauthorized to cognito on COGNITO", () => {
    const nextState = authMachine.transition("unauthorized", "COGNITO");
    expect(nextState.value).toBe("cognito");
  });

  it("can be started with interpret", () => {
    const service = interpret(authMachine);
    service.start();
    expect(service.state.value).toBe("unauthorized");
    service.stop();
  });
});
