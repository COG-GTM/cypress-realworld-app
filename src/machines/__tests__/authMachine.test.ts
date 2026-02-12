import { describe, expect, it, beforeEach } from "vitest";
import { interpret, InterpreterFrom } from "xstate";
import { authMachine } from "../authMachine";
import { User } from "../../models";

const mockUser: Partial<User> = {
  id: "user-123",
  uuid: "uuid-123",
  firstName: "Test",
  lastName: "User",
  username: "testuser",
  email: "test@example.com",
};

const createTestMachine = (serviceOverrides = {}) =>
  authMachine.withConfig({
    services: {
      performLogin: async () => ({ user: mockUser }),
      performSignup: async () => ({ user: mockUser }),
      performLogout: async () => ({}),
      getUserProfile: async () => ({ user: mockUser }),
      updateProfile: async () => ({ user: mockUser }),
      getGoogleUserProfile: async () => ({ user: mockUser }),
      getAuth0UserProfile: async () => ({ user: mockUser }),
      getOktaUserProfile: async () => ({ user: mockUser }),
      getCognitoUserProfile: async () => ({ user: mockUser }),
      ...serviceOverrides,
    },
    actions: {
      redirectHomeAfterLogin: () => {},
      resetUser: authMachine.options.actions!.resetUser as any,
      setUserProfile: authMachine.options.actions!.setUserProfile as any,
      onSuccess: authMachine.options.actions!.onSuccess as any,
      onError: authMachine.options.actions!.onError as any,
    },
  });

describe("authMachine", () => {
  let service: InterpreterFrom<typeof authMachine>;

  beforeEach(() => {
    service?.stop();
  });

  it("should start in the unauthorized state", () => {
    const machine = createTestMachine();
    service = interpret(machine).start();
    expect(service.state.matches("unauthorized")).toBe(true);
  });

  it("should have undefined user and message in initial context", () => {
    const machine = createTestMachine();
    service = interpret(machine).start();
    expect(service.state.context.user).toBeUndefined();
    expect(service.state.context.message).toBeUndefined();
  });

  describe("LOGIN", () => {
    it("should transition to loading on LOGIN event", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("LOGIN");
      expect(service.state.matches("loading")).toBe(true);
    });

    it("should transition to authorized and set user on successful login", async () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("LOGIN");

      await new Promise<void>((resolve) => {
        service.onTransition((state) => {
          if (state.matches("authorized")) {
            expect(state.context.user).toEqual(mockUser);
            expect(state.context.message).toBeUndefined();
            resolve();
          }
        });
      });
    });

    it("should transition to unauthorized and set error message on login failure", async () => {
      const errorMessage = "Username or password is invalid";
      const machine = createTestMachine({
        performLogin: async () => {
          throw new Error(errorMessage);
        },
      });
      service = interpret(machine).start();
      service.send("LOGIN");

      await new Promise<void>((resolve) => {
        service.onTransition((state) => {
          if (state.matches("unauthorized") && state.context.message) {
            expect(state.context.message).toBe(errorMessage);
            resolve();
          }
        });
      });
    });
  });

  describe("SIGNUP", () => {
    it("should transition to signup on SIGNUP event", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("SIGNUP");
      expect(service.state.matches("signup")).toBe(true);
    });

    it("should transition back to unauthorized after successful signup", async () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("SIGNUP");

      await new Promise<void>((resolve) => {
        let wasInSignup = false;
        service.onTransition((state) => {
          if (state.matches("signup")) wasInSignup = true;
          if (wasInSignup && state.matches("unauthorized")) {
            expect(state.context.user).toBeUndefined();
            resolve();
          }
        });
      });
    });

    it("should transition to unauthorized with error on signup failure", async () => {
      const machine = createTestMachine({
        performSignup: async () => {
          throw new Error("Signup failed");
        },
      });
      service = interpret(machine).start();
      service.send("SIGNUP");

      await new Promise<void>((resolve) => {
        service.onTransition((state) => {
          if (state.matches("unauthorized") && state.context.message) {
            expect(state.context.message).toBe("Signup failed");
            resolve();
          }
        });
      });
    });
  });

  describe("LOGOUT", () => {
    it("should transition to logout from authorized state", async () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("LOGIN");

      await new Promise<void>((resolve) => {
        service.onTransition((state) => {
          if (state.matches("authorized")) {
            service.send("LOGOUT");
          }
          if (state.matches("logout")) {
            resolve();
          }
        });
      });
    });

    it("should transition to unauthorized after logout completes", async () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("LOGIN");

      await new Promise<void>((resolve) => {
        let wasAuthorized = false;
        let wasLogout = false;
        service.onTransition((state) => {
          if (state.matches("authorized") && !wasAuthorized) {
            wasAuthorized = true;
            service.send("LOGOUT");
          }
          if (state.matches("logout")) wasLogout = true;
          if (wasLogout && state.matches("unauthorized")) {
            expect(state.context.user).toBeUndefined();
            resolve();
          }
        });
      });
    });
  });

  describe("UPDATE", () => {
    it("should transition to updating from authorized state", async () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("LOGIN");

      await new Promise<void>((resolve) => {
        service.onTransition((state) => {
          if (state.matches("authorized")) {
            service.send("UPDATE");
          }
          if (state.matches("updating")) {
            resolve();
          }
        });
      });
    });

    it("should transition through refreshing to authorized after update", async () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("LOGIN");

      await new Promise<void>((resolve) => {
        let wasAuthorized = false;
        let wasUpdating = false;
        service.onTransition((state) => {
          if (state.matches("authorized") && !wasAuthorized) {
            wasAuthorized = true;
            service.send("UPDATE");
          }
          if (state.matches("updating")) wasUpdating = true;
          if (wasUpdating && state.matches("authorized")) {
            resolve();
          }
        });
      });
    });
  });

  describe("REFRESH", () => {
    it("should transition to refreshing from authorized state", async () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("LOGIN");

      await new Promise<void>((resolve) => {
        service.onTransition((state) => {
          if (state.matches("authorized")) {
            service.send("REFRESH");
          }
          if (state.matches("refreshing")) {
            resolve();
          }
        });
      });
    });

    it("should update user profile after refresh", async () => {
      const updatedUser = { ...mockUser, firstName: "Updated" };
      const machine = createTestMachine({
        getUserProfile: async () => ({ user: updatedUser }),
      });
      service = interpret(machine).start();
      service.send("LOGIN");

      await new Promise<void>((resolve) => {
        let wasAuthorized = false;
        let wasRefreshing = false;
        service.onTransition((state) => {
          if (state.matches("authorized") && !wasAuthorized) {
            wasAuthorized = true;
            service.send("REFRESH");
          }
          if (state.matches("refreshing")) wasRefreshing = true;
          if (wasRefreshing && state.matches("authorized")) {
            expect(state.context.user).toEqual(updatedUser);
            resolve();
          }
        });
      });
    });
  });

  describe("third-party auth transitions", () => {
    it.each(["GOOGLE", "AUTH0", "OKTA", "COGNITO"] as const)(
      "should transition to %s state on %s event",
      (event) => {
        const machine = createTestMachine();
        service = interpret(machine).start();
        service.send(event);
        expect(service.state.matches(event.toLowerCase())).toBe(true);
      }
    );
  });

  describe("error handling for refreshing", () => {
    it("should transition to unauthorized on refresh failure", async () => {
      const machine = createTestMachine({
        getUserProfile: async () => {
          throw new Error("Session expired");
        },
      });
      service = interpret(machine).start();
      service.send("LOGIN");

      await new Promise<void>((resolve) => {
        let wasAuthorized = false;
        service.onTransition((state) => {
          if (state.matches("authorized") && !wasAuthorized) {
            wasAuthorized = true;
            service.send("REFRESH");
          }
          if (wasAuthorized && state.matches("unauthorized")) {
            expect(state.context.message).toBe("Session expired");
            resolve();
          }
        });
      });
    });
  });
});
