import { describe, it, expect, vi, beforeEach } from "vitest";
import { interpret } from "xstate";

vi.mock("../../utils/asyncUtils", () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("../../utils/historyUtils", () => ({
  history: {
    push: vi.fn(),
    location: { pathname: "/" },
  },
}));

vi.mock("../../utils/portUtils", () => ({
  backendPort: "3001",
}));

import { authMachine } from "../authMachine";
import { httpClient } from "../../utils/asyncUtils";

describe("authMachine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start in unauthorized state", () => {
    const service = interpret(authMachine).start();
    expect(service.state.value).toBe("unauthorized");
    expect(service.state.context.user).toBeUndefined();
    service.stop();
  });

  it("should transition to loading on LOGIN", () => {
    const service = interpret(authMachine).start();
    service.send("LOGIN");
    expect(service.state.value).toBe("loading");
    service.stop();
  });

  it("should transition to signup on SIGNUP", () => {
    const service = interpret(authMachine).start();
    service.send("SIGNUP");
    expect(service.state.value).toBe("signup");
    service.stop();
  });

  it("should transition to authorized on successful login", () => {
    const mockUser = { id: "1", firstName: "Test", lastName: "User" };
    vi.mocked(httpClient.post).mockResolvedValueOnce({ data: { user: mockUser } });

    return new Promise<void>((resolve) => {
      const service = interpret(authMachine).onTransition((state) => {
        if (state.matches("authorized")) {
          expect(state.context.user).toEqual(mockUser);
          service.stop();
          resolve();
        }
      });

      service.start();
      service.send({ type: "LOGIN", username: "test", password: "pass" } as any);
    });
  });

  it("should transition to unauthorized on login error", () => {
    vi.mocked(httpClient.post).mockRejectedValueOnce(new Error("Invalid"));

    return new Promise<void>((resolve) => {
      let passedThroughLoading = false;

      const service = interpret(authMachine).onTransition((state) => {
        if (state.matches("loading")) {
          passedThroughLoading = true;
        }
        if (passedThroughLoading && state.matches("unauthorized")) {
          expect(state.context.message).toBeDefined();
          service.stop();
          resolve();
        }
      });

      service.start();
      service.send({ type: "LOGIN", username: "bad", password: "bad" } as any);
    });
  });

  it("should transition to logout on LOGOUT from authorized", () => {
    const mockUser = { id: "1", firstName: "Test", lastName: "User" };
    vi.mocked(httpClient.post).mockResolvedValueOnce({ data: { user: mockUser } });

    return new Promise<void>((resolve) => {
      const service = interpret(authMachine).onTransition((state) => {
        if (state.matches("authorized")) {
          vi.mocked(httpClient.post).mockResolvedValueOnce({});
          service.send("LOGOUT");
        }
        if (state.matches("logout")) {
          service.stop();
          resolve();
        }
      });

      service.start();
      service.send({ type: "LOGIN", username: "test", password: "pass" } as any);
    });
  });

  it("should transition to updating on UPDATE from authorized", () => {
    const mockUser = { id: "1", firstName: "Test", lastName: "User" };
    vi.mocked(httpClient.post).mockResolvedValueOnce({ data: { user: mockUser } });

    return new Promise<void>((resolve) => {
      const service = interpret(authMachine).onTransition((state) => {
        if (state.matches("authorized")) {
          service.send({ type: "UPDATE", id: "1", firstName: "Updated" } as any);
        }
        if (state.matches("updating")) {
          service.stop();
          resolve();
        }
      });

      service.start();
      service.send({ type: "LOGIN", username: "test", password: "pass" } as any);
    });
  });

  it("should transition to refreshing on REFRESH from authorized", () => {
    const mockUser = { id: "1", firstName: "Test", lastName: "User" };
    vi.mocked(httpClient.post).mockResolvedValueOnce({ data: { user: mockUser } });

    return new Promise<void>((resolve) => {
      const service = interpret(authMachine).onTransition((state) => {
        if (state.matches("authorized")) {
          service.send("REFRESH");
        }
        if (state.matches("refreshing")) {
          service.stop();
          resolve();
        }
      });

      service.start();
      service.send({ type: "LOGIN", username: "test", password: "pass" } as any);
    });
  });

  it("should define SSO state transitions in the machine config", () => {
    const states = authMachine.config.states;
    expect(states!.unauthorized!.on).toHaveProperty("GOOGLE");
    expect(states!.unauthorized!.on).toHaveProperty("AUTH0");
    expect(states!.unauthorized!.on).toHaveProperty("OKTA");
    expect(states!.unauthorized!.on).toHaveProperty("COGNITO");
    expect(states!.google!.on).toHaveProperty("LOGOUT");
    expect(states!.auth0!.on).toHaveProperty("LOGOUT");
    expect(states!.okta!.on).toHaveProperty("LOGOUT");
    expect(states!.cognito!.on).toHaveProperty("LOGOUT");
  });
});
