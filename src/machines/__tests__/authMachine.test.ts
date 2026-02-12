import { describe, expect, it, beforeEach, vi } from "vitest";
import { interpret, InterpreterFrom } from "xstate";

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
  backendPort: 3001,
}));

import { authMachine } from "../authMachine";
import { httpClient } from "../../utils/asyncUtils";

describe("authMachine", () => {
  let service: InterpreterFrom<typeof authMachine>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = interpret(authMachine).start();
  });

  it("should start in the unauthorized state", () => {
    expect(service.state.matches("unauthorized")).toBe(true);
  });

  it("should have initial context with undefined user and message", () => {
    expect(service.state.context.user).toBeUndefined();
    expect(service.state.context.message).toBeUndefined();
  });

  it("should transition to loading on LOGIN event", () => {
    service.send("LOGIN");
    expect(service.state.matches("loading")).toBe(true);
  });

  it("should transition to signup on SIGNUP event", () => {
    service.send("SIGNUP");
    expect(service.state.matches("signup")).toBe(true);
  });

  it("should transition to google state and then to authorized on GOOGLE event", async () => {
    service.send({
      type: "GOOGLE",
      user: { googleId: "g1", email: "g@test.com", givenName: "G", familyName: "User", imageUrl: "img" },
      token: "google-token",
    } as any);
    expect(service.state.matches("google")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches("authorized")).toBe(true);
    });
  });

  it("should transition to auth0 state and then to authorized on AUTH0 event", async () => {
    service.send({
      type: "AUTH0",
      user: { sub: "a0-1", email: "a0@test.com", nickname: "a0user", picture: "pic" },
      token: "auth0-token",
    } as any);
    expect(service.state.matches("auth0")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches("authorized")).toBe(true);
    });
  });

  it("should transition to okta state and then to authorized on OKTA event", async () => {
    service.send({
      type: "OKTA",
      user: { sub: "o1", email: "o@test.com", given_name: "O", family_name: "User", preferred_username: "ouser" },
      token: "okta-token",
    } as any);
    expect(service.state.matches("okta")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches("authorized")).toBe(true);
    });
  });

  it("should transition to cognito state and then to authorized on COGNITO event", async () => {
    service.send({
      type: "COGNITO",
      userSub: "c1",
      email: "c@test.com",
      accessTokenJwtString: "cognito-token",
    } as any);
    expect(service.state.matches("cognito")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches("authorized")).toBe(true);
    });
  });

  it("should transition to authorized on successful login", async () => {
    const mockUser = { id: "1", firstName: "Test", lastName: "User" };
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: { user: mockUser },
    });

    service.send("LOGIN");
    expect(service.state.matches("loading")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches("authorized")).toBe(true);
    });

    expect(service.state.context.user).toEqual(mockUser);
    expect(service.state.context.message).toBeUndefined();
  });

  it("should transition to unauthorized with error message on failed login", async () => {
    vi.mocked(httpClient.post).mockRejectedValueOnce(
      new Error("Username or password is invalid")
    );

    service.send("LOGIN");
    expect(service.state.matches("loading")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches("unauthorized")).toBe(true);
      expect(service.state.context.message).toBeDefined();
    });
  });

  it("should transition to logout state on LOGOUT from authorized", async () => {
    const mockUser = { id: "1", firstName: "Test", lastName: "User" };
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: { user: mockUser },
    });

    service.send("LOGIN");
    await vi.waitFor(() => {
      expect(service.state.matches("authorized")).toBe(true);
    });

    vi.mocked(httpClient.post).mockResolvedValueOnce({});
    service.send("LOGOUT");
    expect(service.state.matches("logout")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches("unauthorized")).toBe(true);
    });
  });

  it("should transition to updating on UPDATE from authorized", async () => {
    const mockUser = { id: "1", firstName: "Test", lastName: "User" };
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: { user: mockUser },
    });

    service.send("LOGIN");
    await vi.waitFor(() => {
      expect(service.state.matches("authorized")).toBe(true);
    });

    service.send("UPDATE");
    expect(service.state.matches("updating")).toBe(true);
  });

  it("should transition to refreshing on REFRESH from authorized", async () => {
    const mockUser = { id: "1", firstName: "Test", lastName: "User" };
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: { user: mockUser },
    });

    service.send("LOGIN");
    await vi.waitFor(() => {
      expect(service.state.matches("authorized")).toBe(true);
    });

    service.send("REFRESH");
    expect(service.state.matches("refreshing")).toBe(true);
  });

  it("should update user profile after refreshing", async () => {
    const mockUser = { id: "1", firstName: "Test", lastName: "User" };
    const updatedUser = { id: "1", firstName: "Updated", lastName: "User" };

    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: { user: mockUser },
    });

    service.send("LOGIN");
    await vi.waitFor(() => {
      expect(service.state.matches("authorized")).toBe(true);
    });

    vi.mocked(httpClient.get).mockResolvedValueOnce({
      data: { user: updatedUser },
    });

    service.send("REFRESH");
    expect(service.state.matches("refreshing")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches("authorized")).toBe(true);
    });

    expect(service.state.context.user).toEqual(updatedUser);
  });

  it("should transition to unauthorized on refresh error", async () => {
    const mockUser = { id: "1", firstName: "Test", lastName: "User" };
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: { user: mockUser },
    });

    service.send("LOGIN");
    await vi.waitFor(() => {
      expect(service.state.matches("authorized")).toBe(true);
    });

    vi.mocked(httpClient.get).mockRejectedValueOnce(
      new Error("Session expired")
    );

    service.send("REFRESH");

    await vi.waitFor(() => {
      expect(service.state.matches("unauthorized")).toBe(true);
    });
  });

  it("should reset user on entering unauthorized state", async () => {
    const mockUser = { id: "1", firstName: "Test", lastName: "User" };
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: { user: mockUser },
    });

    service.send("LOGIN");
    await vi.waitFor(() => {
      expect(service.state.matches("authorized")).toBe(true);
    });
    expect(service.state.context.user).toEqual(mockUser);

    vi.mocked(httpClient.post).mockResolvedValueOnce({});
    service.send("LOGOUT");

    await vi.waitFor(() => {
      expect(service.state.matches("unauthorized")).toBe(true);
    });

    expect(service.state.context.user).toBeUndefined();
  });

  it("should transition to unauthorized on signup error", async () => {
    vi.mocked(httpClient.post).mockRejectedValueOnce(
      new Error("Signup failed")
    );

    service.send("SIGNUP");
    expect(service.state.matches("signup")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches("unauthorized")).toBe(true);
      expect(service.state.context.message).toBeDefined();
    });
  });

  it("should transition to unauthorized on successful signup", async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: { user: { id: "new-user" } },
    });

    service.send("SIGNUP");

    await vi.waitFor(() => {
      expect(service.state.matches("unauthorized")).toBe(true);
    });
  });
});
