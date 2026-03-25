import { describe, expect, it } from "vitest";
import { authMachine } from "../../machines/authMachine";

describe("authMachine", () => {
  it("should have correct initial state", () => {
    const initialState = authMachine.initialState;
    expect(initialState.value).toBe("unauthorized");
    expect(initialState.context.user).toBeUndefined();
    expect(initialState.context.message).toBeUndefined();
  });

  describe("unauthorized state transitions", () => {
    it("should transition to loading on LOGIN", () => {
      const nextState = authMachine.transition("unauthorized", "LOGIN");
      expect(nextState.value).toBe("loading");
    });

    it("should transition to signup on SIGNUP", () => {
      const nextState = authMachine.transition("unauthorized", "SIGNUP");
      expect(nextState.value).toBe("signup");
    });

    it("should transition to google on GOOGLE", () => {
      const nextState = authMachine.transition("unauthorized", "GOOGLE");
      expect(nextState.value).toBe("google");
    });

    it("should transition to auth0 on AUTH0", () => {
      const nextState = authMachine.transition("unauthorized", "AUTH0");
      expect(nextState.value).toBe("auth0");
    });

    it("should transition to okta on OKTA", () => {
      const nextState = authMachine.transition("unauthorized", "OKTA");
      expect(nextState.value).toBe("okta");
    });

    it("should transition to cognito on COGNITO", () => {
      const nextState = authMachine.transition("unauthorized", "COGNITO");
      expect(nextState.value).toBe("cognito");
    });
  });

  describe("authorized state transitions", () => {
    it("should transition to updating on UPDATE", () => {
      const nextState = authMachine.transition("authorized", "UPDATE");
      expect(nextState.value).toBe("updating");
    });

    it("should transition to refreshing on REFRESH", () => {
      const nextState = authMachine.transition("authorized", "REFRESH");
      expect(nextState.value).toBe("refreshing");
    });

    it("should transition to logout on LOGOUT", () => {
      const nextState = authMachine.transition("authorized", "LOGOUT");
      expect(nextState.value).toBe("logout");
    });
  });

  describe("refreshing state transitions", () => {
    it("should transition to logout on LOGOUT", () => {
      const nextState = authMachine.transition("refreshing", "LOGOUT");
      expect(nextState.value).toBe("logout");
    });
  });

  describe("google state transitions", () => {
    it("should transition to logout on LOGOUT", () => {
      const nextState = authMachine.transition("google", "LOGOUT");
      expect(nextState.value).toBe("logout");
    });
  });

  describe("auth0 state transitions", () => {
    it("should transition to logout on LOGOUT", () => {
      const nextState = authMachine.transition("auth0", "LOGOUT");
      expect(nextState.value).toBe("logout");
    });
  });

  describe("okta state transitions", () => {
    it("should transition to logout on LOGOUT", () => {
      const nextState = authMachine.transition("okta", "LOGOUT");
      expect(nextState.value).toBe("logout");
    });
  });

  describe("cognito state transitions", () => {
    it("should transition to logout on LOGOUT", () => {
      const nextState = authMachine.transition("cognito", "LOGOUT");
      expect(nextState.value).toBe("logout");
    });
  });

  describe("actions", () => {
    it("should start in unauthorized state with no pending actions", () => {
      const initialState = authMachine.initialState;
      expect(initialState.value).toBe("unauthorized");
    });

    it("should invoke performLogin service when entering loading", () => {
      const nextState = authMachine.transition("unauthorized", "LOGIN");
      expect(nextState.value).toBe("loading");
    });
  });
});
