import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { interpret, Interpreter } from "xstate";
import { authMachine, authService } from "../machines/authMachine";
import { httpClient } from "../utils/asyncUtils";
import { history } from "../utils/historyUtils";

const user = {
  id: "t45AiwidW",
  firstName: "Edgar",
  lastName: "Johns",
  username: "Katharina_Bernier",
};

const waitForState = (service: Interpreter<any, any, any, any, any>, stateValue: string) =>
  new Promise<any>((resolve) => {
    if (service.state.matches(stateValue)) return resolve(service.state);
    service.onTransition((state) => {
      if (state.matches(stateValue)) resolve(state);
    });
  });

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("authMachine", () => {
  let service: Interpreter<any, any, any, any, any>;

  beforeEach(() => {
    history.replace("/");
    service = interpret(authMachine).start();
  });

  afterEach(() => {
    service.stop();
    vi.restoreAllMocks();
  });

  it("starts unauthorized without a user", () => {
    expect(service.state.value).toBe("unauthorized");
    expect(service.state.context.user).toBeUndefined();
  });

  it("logs in and stores the user profile", async () => {
    const post = vi.spyOn(httpClient, "post").mockResolvedValue({ data: { user } });

    service.send({ type: "LOGIN", username: user.username, password: "s3cret" } as any);
    expect(service.state.value).toBe("loading");

    const state = await waitForState(service, "authorized");

    expect(post).toHaveBeenCalledWith(
      expect.stringMatching(/\/login$/),
      expect.objectContaining({ username: user.username, password: "s3cret" })
    );
    expect(state.context).toEqual({ user, message: undefined });
    expect(history.location.pathname).toBe("/");
  });

  it("returns to unauthorized with an error message when login fails", async () => {
    vi.spyOn(httpClient, "post").mockRejectedValue(new Error("Request failed with 401"));

    service.send({ type: "LOGIN", username: "nobody", password: "wrong" } as any);
    await flush();

    expect(service.state.value).toBe("unauthorized");
    expect(service.state.context.user).toBeUndefined();
    expect(service.state.context.message).toBe("Username or password is invalid");
  });

  it("signs up, redirects to /signin and stays unauthorized", async () => {
    const post = vi.spyOn(httpClient, "post").mockResolvedValue({ data: { user } });

    service.send({ type: "SIGNUP", firstName: "Edgar", username: "edgar" } as any);
    expect(service.state.value).toBe("signup");
    await flush();

    expect(post).toHaveBeenCalledWith(expect.stringMatching(/\/users$/), {
      firstName: "Edgar",
      username: "edgar",
    });
    expect(history.location.pathname).toBe("/signin");
    expect(service.state.value).toBe("unauthorized");
    expect(service.state.context.message).toBeUndefined();
  });

  it("stores the error message when sign up fails", async () => {
    vi.spyOn(httpClient, "post").mockRejectedValue(new Error("Username already exists"));

    service.send({ type: "SIGNUP", username: "edgar" } as any);
    await flush();

    expect(service.state.value).toBe("unauthorized");
    expect(service.state.context.message).toBe("Username already exists");
  });

  describe("when authorized", () => {
    beforeEach(async () => {
      vi.spyOn(httpClient, "post").mockResolvedValue({ data: { user } });
      service.send({ type: "LOGIN", username: user.username, password: "s3cret" } as any);
      await waitForState(service, "authorized");
    });

    it("updates the profile and refreshes the user", async () => {
      const updatedUser = { ...user, firstName: "Ed" };
      const patch = vi.spyOn(httpClient, "patch").mockResolvedValue({ data: {} });
      const get = vi.spyOn(httpClient, "get").mockResolvedValue({ data: { user: updatedUser } });

      service.send({ type: "UPDATE", id: user.id, firstName: "Ed" } as any);
      expect(service.state.value).toBe("updating");

      await flush();
      const state = await waitForState(service, "authorized");

      expect(patch).toHaveBeenCalledWith(expect.stringMatching(/\/users\/t45AiwidW$/), {
        id: user.id,
        firstName: "Ed",
      });
      expect(get).toHaveBeenCalledWith(expect.stringMatching(/\/checkAuth$/));
      expect(state.context.user).toEqual(updatedUser);
    });

    it("becomes unauthorized when the profile update fails", async () => {
      vi.spyOn(httpClient, "patch").mockRejectedValue(new Error("Update failed"));

      service.send({ type: "UPDATE", id: user.id } as any);
      await flush();

      expect(service.state.value).toBe("unauthorized");
      expect(service.state.context.message).toBe("Update failed");
      expect(service.state.context.user).toBeUndefined();
    });

    it("refreshes the user profile", async () => {
      const get = vi.spyOn(httpClient, "get").mockResolvedValue({ data: { user } });

      service.send("REFRESH");
      expect(service.state.value).toBe("refreshing");
      const state = await waitForState(service, "authorized");

      expect(get).toHaveBeenCalledOnce();
      expect(state.context.user).toEqual(user);
    });

    it("becomes unauthorized when refreshing the profile fails", async () => {
      vi.spyOn(httpClient, "get").mockRejectedValue(new Error("Unauthorized"));

      service.send("REFRESH");
      await flush();

      expect(service.state.value).toBe("unauthorized");
      expect(service.state.context.message).toBe("Unauthorized");
    });

    it("can log out while refreshing", async () => {
      vi.spyOn(httpClient, "get").mockReturnValue(new Promise(() => {}));

      service.send("REFRESH");
      service.send("LOGOUT");

      expect(service.state.value).toBe("logout");
    });

    it("logs out and clears the persisted auth state", async () => {
      localStorage.setItem("authState", "{}");
      const post = vi.spyOn(httpClient, "post").mockResolvedValue({ data: {} });

      service.send("LOGOUT");
      expect(service.state.value).toBe("logout");
      await flush();

      expect(post).toHaveBeenCalledWith(expect.stringMatching(/\/logout$/));
      expect(localStorage.getItem("authState")).toBeNull();
      expect(service.state.value).toBe("unauthorized");
      expect(service.state.context.user).toBeUndefined();
    });

    it("still becomes unauthorized when the logout request fails", async () => {
      vi.spyOn(httpClient, "post").mockRejectedValue(new Error("Network Error"));

      service.send("LOGOUT");
      await flush();

      expect(service.state.value).toBe("unauthorized");
      expect(service.state.context.message).toBe("Network Error");
    });
  });

  it.each([
    ["GOOGLE", "google"],
    ["AUTH0", "auth0"],
    ["OKTA", "okta"],
    ["COGNITO", "cognito"],
  ])("transitions to the %s provider state", (event, stateValue) => {
    const providerService = interpret(
      authMachine.withConfig({
        services: {
          getGoogleUserProfile: () => new Promise(() => {}),
          getAuth0UserProfile: () => new Promise(() => {}),
          getOktaUserProfile: () => new Promise(() => {}),
          getCognitoUserProfile: () => new Promise(() => {}),
        },
      })
    ).start();

    providerService.send(event as any);

    expect(providerService.state.value).toBe(stateValue);
    providerService.send("LOGOUT");
    expect(providerService.state.value).toBe("logout");
    providerService.stop();
  });

  it("authorizes with the profile returned by a third-party provider", async () => {
    const providerService = interpret(
      authMachine.withConfig({
        services: { getAuth0UserProfile: () => Promise.resolve({ user }) },
      })
    ).start();

    providerService.send("AUTH0");
    const state = await waitForState(providerService, "authorized");

    expect(state.context.user).toEqual(user);
    providerService.stop();
  });

  it("returns to unauthorized when a third-party provider fails", async () => {
    const providerService = interpret(
      authMachine.withConfig({
        services: { getOktaUserProfile: () => Promise.reject(new Error("Okta failed")) },
      })
    ).start();

    providerService.send("OKTA");
    await flush();

    expect(providerService.state.value).toBe("unauthorized");
    expect(providerService.state.context.message).toBe("Okta failed");
    providerService.stop();
  });

  it("exposes a started authService that persists state changes to localStorage", () => {
    expect(authService.status).toBe(1);
    expect(authService.state.value).toBe("unauthorized");
  });
});
