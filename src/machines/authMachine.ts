import { createMachine, assign, createActor, fromPromise } from "xstate";
import { omit } from "lodash/fp";
import { httpClient } from "../utils/asyncUtils";
import { history } from "../utils/historyUtils";
import { User } from "../models";
import { backendPort } from "../utils/portUtils";

export type AuthMachineEvents =
  | { type: "LOGIN" }
  | { type: "LOGOUT" }
  | { type: "UPDATE" }
  | { type: "REFRESH" }
  | { type: "AUTH0" }
  | { type: "COGNITO" }
  | { type: "OKTA" }
  | { type: "GOOGLE" }
  | { type: "SIGNUP" };

export interface AuthMachineContext {
  user?: User;
  message?: string;
}

export const authMachine = createMachine(
  {
    id: "authentication",
    initial: "unauthorized",
    types: {} as { context: AuthMachineContext; events: AuthMachineEvents },
    context: {
      user: undefined,
      message: undefined,
    },
    states: {
      unauthorized: {
        entry: "resetUser",
        on: {
          LOGIN: "loading",
          SIGNUP: "signup",
          GOOGLE: "google",
          AUTH0: "auth0",
          OKTA: "okta",
          COGNITO: "cognito",
        },
      },
      signup: {
        invoke: {
          src: "performSignup",
          input: ({ event }) => ({ event }),
          onDone: { target: "unauthorized", actions: "onSuccess" },
          onError: { target: "unauthorized", actions: "onError" },
        },
      },
      loading: {
        invoke: {
          src: "performLogin",
          input: ({ event }) => ({ event }),
          onDone: { target: "authorized", actions: "onSuccess" },
          onError: { target: "unauthorized", actions: "onError" },
        },
      },
      updating: {
        invoke: {
          src: "updateProfile",
          input: ({ event }) => ({ event }),
          onDone: { target: "refreshing" },
          onError: { target: "unauthorized", actions: "onError" },
        },
      },
      refreshing: {
        invoke: {
          src: "getUserProfile",
          input: () => ({}),
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
        on: {
          LOGOUT: "logout",
        },
      },
      google: {
        invoke: {
          src: "getGoogleUserProfile",
          input: ({ event }) => ({ event }),
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
        on: {
          LOGOUT: "logout",
        },
      },
      logout: {
        invoke: {
          src: "performLogout",
          input: () => ({}),
          onDone: { target: "unauthorized" },
          onError: { target: "unauthorized", actions: "onError" },
        },
      },
      authorized: {
        entry: "redirectHomeAfterLogin",
        on: {
          UPDATE: "updating",
          REFRESH: "refreshing",
          LOGOUT: "logout",
        },
      },
      auth0: {
        invoke: {
          src: "getAuth0UserProfile",
          input: ({ event }) => ({ event }),
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
        on: {
          LOGOUT: "logout",
        },
      },
      okta: {
        invoke: {
          src: "getOktaUserProfile",
          input: ({ event }) => ({ event }),
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
        on: {
          LOGOUT: "logout",
        },
      },
      cognito: {
        invoke: {
          src: "getCognitoUserProfile",
          input: ({ event }) => ({ event }),
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
        on: {
          LOGOUT: "logout",
        },
      },
    },
  },
  {
    actors: {
      performSignup: fromPromise(async ({ input }: { input: any }) => {
        const payload = omit("type", input.event);
        const resp = await httpClient.post(`http://localhost:${backendPort}/users`, payload);
        history.push("/signin");
        return resp.data;
      }),
      performLogin: fromPromise(async ({ input }: { input: any }) => {
        return await httpClient
          .post(`http://localhost:${backendPort}/login`, input.event)
          .then(({ data }) => {
            history.push("/");
            return data;
          })
          .catch((error) => {
            throw new Error("Username or password is invalid");
          });
      }),
      getOktaUserProfile: /* istanbul ignore next */ fromPromise(
        async ({ input }: { input: any }) => {
          const event = input.event;
          // Map Okta User fields to our User Model
          const user = {
            id: event.user.sub,
            email: event.user.email,
            firstName: event.user.given_name,
            lastName: event.user.family_name,
            username: event.user.preferred_username,
          };

          // Set Access Token in Local Storage for API calls
          localStorage.setItem(process.env.VITE_AUTH_TOKEN_NAME!, event.token);

          return { user };
        }
      ),
      getUserProfile: fromPromise(async ({ input }: { input: any }) => {
        const resp = await httpClient.get(`http://localhost:${backendPort}/checkAuth`);
        return resp.data;
      }),
      getGoogleUserProfile: /* istanbul ignore next */ fromPromise(
        async ({ input }: { input: any }) => {
          const event = input.event;
          // Map Google User fields to our User Model
          const user = {
            id: event.user.googleId,
            email: event.user.email,
            firstName: event.user.givenName,
            lastName: event.user.familyName,
            avatar: event.user.imageUrl,
          };

          // Set Google Access Token in Local Storage for API calls
          localStorage.setItem(process.env.VITE_AUTH_TOKEN_NAME!, event.token);

          return { user };
        }
      ),
      getAuth0UserProfile: /* istanbul ignore next */ fromPromise(
        async ({ input }: { input: any }) => {
          const event = input.event;
          // Map Auth0 User fields to our User Model
          const user = {
            id: event.user.sub,
            email: event.user.email,
            firstName: event.user.nickname,
            avatar: event.user.picture,
          };

          // Set Auth0 Access Token in Local Storage for API calls
          localStorage.setItem(process.env.VITE_AUTH_TOKEN_NAME!, event.token);

          return { user };
        }
      ),
      updateProfile: fromPromise(async ({ input }: { input: any }) => {
        const payload = omit("type", input.event);
        const resp = await httpClient.patch(
          `http://localhost:${backendPort}/users/${payload.id}`,
          payload
        );
        return resp.data;
      }),
      performLogout: fromPromise(async ({ input }: { input: any }) => {
        localStorage.removeItem("authState");
        return await httpClient.post(`http://localhost:${backendPort}/logout`);
      }),
      getCognitoUserProfile: /* istanbul ignore next */ fromPromise(
        async ({ input }: { input: any }) => {
          const event = input.event;
          // Map Cognito User fields to our User Model
          const ourUser = {
            id: event.userSub,
            email: event.email,
          };

          // Set Access Token in Local Storage for API calls
          localStorage.setItem(process.env.VITE_AUTH_TOKEN_NAME!, event.accessTokenJwtString);

          return ourUser;
        }
      ),
    },
    actions: {
      redirectHomeAfterLogin: ({ context, event }) => {
        if (history.location.pathname === "/signin") {
          /* istanbul ignore next */
          window.location.pathname = "/";
        }
      },
      resetUser: assign(() => ({
        user: undefined,
      })),
      setUserProfile: assign(({ event }) => ({
        user: (event as any).output.user,
      })),
      onSuccess: assign(({ event }) => ({
        user: (event as any).output.user,
        message: undefined,
      })),
      onError: assign(({ event }) => ({
        message: (event as any).error.message,
      })),
    },
  }
);

// @ts-ignore
const stateDefinition = JSON.parse(localStorage.getItem("authState")!);

export const authService = createActor(authMachine, {
  ...(stateDefinition ? { snapshot: stateDefinition } : {}),
});

authService.subscribe((snapshot) => {
  localStorage.setItem("authState", JSON.stringify(snapshot));
});

authService.start();
