import { describe, it, expect, vi } from "vitest";
import { interpret } from "xstate";
import { authMachine } from "../../machines/authMachine";

// Create a test instance with mocked services
const createTestMachine = (serviceOverrides: Record<string, any> = {}) => {
  return authMachine.withConfig({
    services: {
      performLogin: vi.fn().mockResolvedValue({ user: { id: "1", username: "testuser" } }),
      performSignup: vi.fn().mockResolvedValue({ user: { id: "2", username: "newuser" } }),
      getUserProfile: vi.fn().mockResolvedValue({ user: { id: "1", username: "testuser" } }),
      updateProfile: vi.fn().mockResolvedValue({ user: { id: "1", username: "testuser" } }),
      performLogout: vi.fn().mockResolvedValue(undefined),
      getGoogleUserProfile: vi.fn().mockResolvedValue({ user: { id: "g1" } }),
      getAuth0UserProfile: vi.fn().mockResolvedValue({ user: { id: "a1" } }),
      getOktaUserProfile: vi.fn().mockResolvedValue({ user: { id: "o1" } }),
      getCognitoUserProfile: vi.fn().mockResolvedValue({ user: { id: "c1" } }),
      ...serviceOverrides,
    },
    actions: {
      redirectHomeAfterLogin: vi.fn(),
      resetUser: authMachine.options.actions!.resetUser as any,
      setUserProfile: authMachine.options.actions!.setUserProfile as any,
      onSuccess: authMachine.options.actions!.onSuccess as any,
      onError: authMachine.options.actions!.onError as any,
    },
  });
};

describe("authMachine", () => {
  it("should start in unauthorized state", () => {
    const machine = createTestMachine();
    expect(machine.initialState.value).toBe("unauthorized");
  });

  it("should have undefined user in initial context", () => {
    const machine = createTestMachine();
    expect(machine.initialState.context.user).toBeUndefined();
  });

  it("should transition from unauthorized to loading on LOGIN", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("unauthorized", "LOGIN");
    expect(nextState.value).toBe("loading");
  });

  it("should transition from unauthorized to signup on SIGNUP", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("unauthorized", "SIGNUP");
    expect(nextState.value).toBe("signup");
  });

  it("should transition from unauthorized to google on GOOGLE", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("unauthorized", "GOOGLE");
    expect(nextState.value).toBe("google");
  });

  it("should transition from unauthorized to auth0 on AUTH0", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("unauthorized", "AUTH0");
    expect(nextState.value).toBe("auth0");
  });

  it("should transition from unauthorized to okta on OKTA", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("unauthorized", "OKTA");
    expect(nextState.value).toBe("okta");
  });

  it("should transition from unauthorized to cognito on COGNITO", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("unauthorized", "COGNITO");
    expect(nextState.value).toBe("cognito");
  });

  it("should transition from authorized to logout on LOGOUT", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("authorized", "LOGOUT");
    expect(nextState.value).toBe("logout");
  });

  it("should transition from authorized to updating on UPDATE", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("authorized", "UPDATE");
    expect(nextState.value).toBe("updating");
  });

  it("should transition from authorized to refreshing on REFRESH", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("authorized", "REFRESH");
    expect(nextState.value).toBe("refreshing");
  });

  it("should transition from refreshing to logout on LOGOUT (race condition)", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("refreshing", "LOGOUT");
    expect(nextState.value).toBe("logout");
  });

  it("should ignore UPDATE event in unauthorized state", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("unauthorized", "UPDATE");
    expect(nextState.value).toBe("unauthorized");
  });

  it("should ignore REFRESH event in unauthorized state", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("unauthorized", "REFRESH");
    expect(nextState.value).toBe("unauthorized");
  });

  it("should reach authorized state after successful login", async () => {
    const machine = createTestMachine();
    const state = await new Promise<any>((resolve) => {
      const service = interpret(machine).onTransition((state) => {
        if (state.value === "authorized") {
          service.stop();
          resolve(state);
        }
      });
      service.start();
      service.send("LOGIN");
    });
    expect(state.context.user).toEqual({ id: "1", username: "testuser" });
  });

  it("should return to unauthorized on login error", async () => {
    const machine = createTestMachine({
      performLogin: vi.fn().mockRejectedValue(new Error("Invalid credentials")),
    });

    let passedThroughLoading = false;
    const state = await new Promise<any>((resolve) => {
      const service = interpret(machine).onTransition((state) => {
        if (state.value === "loading") {
          passedThroughLoading = true;
        }
        if (state.value === "unauthorized" && passedThroughLoading) {
          service.stop();
          resolve(state);
        }
      });
      service.start();
      service.send("LOGIN");
    });

    expect(state.context.message).toBe("Invalid credentials");
  });

  it("should reach unauthorized after successful signup", async () => {
    const machine = createTestMachine();
    let passedThroughSignup = false;
    await new Promise<void>((resolve) => {
      const service = interpret(machine).onTransition((state) => {
        if (state.value === "signup") {
          passedThroughSignup = true;
        }
        if (state.value === "unauthorized" && passedThroughSignup) {
          service.stop();
          resolve();
        }
      });
      service.start();
      service.send("SIGNUP");
    });
    expect(passedThroughSignup).toBe(true);
  });

  it("should return to unauthorized on signup error", async () => {
    const machine = createTestMachine({
      performSignup: vi.fn().mockRejectedValue(new Error("Signup failed")),
    });

    let passedThroughSignup = false;
    const state = await new Promise<any>((resolve) => {
      const service = interpret(machine).onTransition((state) => {
        if (state.value === "signup") {
          passedThroughSignup = true;
        }
        if (state.value === "unauthorized" && passedThroughSignup) {
          service.stop();
          resolve(state);
        }
      });
      service.start();
      service.send("SIGNUP");
    });

    expect(state.context.message).toBe("Signup failed");
  });

  it("should set user profile on successful google login", async () => {
    const machine = createTestMachine();
    const state = await new Promise<any>((resolve) => {
      const service = interpret(machine).onTransition((state) => {
        if (state.value === "authorized" && state.context.user) {
          service.stop();
          resolve(state);
        }
      });
      service.start();
      service.send("GOOGLE");
    });
    expect(state.context.user).toEqual({ id: "g1" });
  });

  it("should reach unauthorized after logout", async () => {
    const machine = createTestMachine();
    let wasAuthorized = false;
    let wasLogout = false;

    await new Promise<void>((resolve) => {
      const service = interpret(machine).onTransition((state) => {
        if (state.value === "authorized") {
          wasAuthorized = true;
          service.send("LOGOUT");
        }
        if (state.value === "logout") {
          wasLogout = true;
        }
        if (state.value === "unauthorized" && wasLogout) {
          service.stop();
          resolve();
        }
      });
      service.start();
      service.send("LOGIN");
    });

    expect(wasAuthorized).toBe(true);
    expect(wasLogout).toBe(true);
  });
});
