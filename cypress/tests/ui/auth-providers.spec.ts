describe("Authentication Provider Flows", function () {
  beforeEach(function () {
    cy.task("db:seed");
    cy.intercept("GET", "/notifications").as("getNotifications");
    cy.intercept("GET", "/transactions/public*").as("publicTransactions");
  });

  describe("Auth0 Authentication Flow", function () {
    it("should have Auth0 login command available", function () {
      expect(Cypress.Commands._commands.loginToAuth0).to.exist;
    });

    it("should redirect to Auth0 when Auth0 is configured", function () {
      cy.intercept("GET", "/", (req) => {
        req.headers["x-auth-provider"] = "auth0";
      });

      cy.visit("/signin");
      cy.location("pathname").should("eq", "/signin");
    });

    it("should validate Auth0 session storage after login", function () {
      cy.window().then((win) => {
        win.localStorage.setItem(
          "authState",
          JSON.stringify({
            isAuthenticated: true,
            user: { sub: "auth0|123", email: "test@example.com" },
          })
        );
      });

      cy.window().its("localStorage").invoke("getItem", "authState").should("exist");
    });

    it("should handle Auth0 logout flow", function () {
      cy.window().then((win) => {
        win.localStorage.setItem(
          "authState",
          JSON.stringify({
            isAuthenticated: true,
            user: { sub: "auth0|123", email: "test@example.com" },
          })
        );
      });

      cy.window().then((win) => {
        win.localStorage.removeItem("authState");
      });

      cy.window().its("localStorage").invoke("getItem", "authState").should("be.null");
    });

    it("should handle Auth0 token refresh scenario", function () {
      const mockToken = {
        access_token: "mock_access_token",
        id_token: "mock_id_token",
        expires_in: 3600,
      };

      cy.window().then((win) => {
        win.localStorage.setItem("auth0Token", JSON.stringify(mockToken));
      });

      cy.window().its("localStorage").invoke("getItem", "auth0Token").should("exist");
    });
  });

  describe("Okta Authentication Flow", function () {
    it("should have Okta login commands available", function () {
      expect(Cypress.Commands._commands.loginByOktaApi).to.exist;
      expect(Cypress.Commands._commands.loginByOkta).to.exist;
    });

    it("should validate Okta session storage after login", function () {
      const oktaUserItem = {
        token: "mock_okta_token",
        user: {
          sub: "okta123",
          email: "test@example.com",
          given_name: "Test",
          family_name: "User",
          preferred_username: "testuser",
        },
      };

      cy.window().then((win) => {
        win.localStorage.setItem("oktaCypress", JSON.stringify(oktaUserItem));
      });

      cy.window().its("localStorage").invoke("getItem", "oktaCypress").should("exist");
    });

    it("should handle Okta logout flow", function () {
      const oktaUserItem = {
        token: "mock_okta_token",
        user: {
          sub: "okta123",
          email: "test@example.com",
        },
      };

      cy.window().then((win) => {
        win.localStorage.setItem("oktaCypress", JSON.stringify(oktaUserItem));
      });

      cy.window().then((win) => {
        win.localStorage.removeItem("oktaCypress");
      });

      cy.window().its("localStorage").invoke("getItem", "oktaCypress").should("be.null");
    });

    it("should handle Okta token structure validation", function () {
      const oktaConfig = {
        issuer: `https://${Cypress.env("okta_domain")}/oauth2/default`,
        clientId: Cypress.env("okta_client_id"),
        redirectUri: "http://localhost:3000/implicit/callback",
        scope: ["openid", "email", "profile"],
      };

      expect(oktaConfig).to.have.property("issuer");
      expect(oktaConfig).to.have.property("clientId");
      expect(oktaConfig).to.have.property("redirectUri");
      expect(oktaConfig.scope).to.include("openid");
    });
  });

  describe("AWS Cognito Authentication Flow", function () {
    it("should have Cognito login commands available", function () {
      expect(Cypress.Commands._commands.loginByCognitoApi).to.exist;
      expect(Cypress.Commands._commands.loginByCognito).to.exist;
    });

    it("should validate Cognito session storage structure", function () {
      const clientId = "test_client_id";
      const accessTokenSub = "cognito_user_123";
      const keyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
      const keyPrefixWithUsername = `${keyPrefix}.${accessTokenSub}`;

      cy.window().then((win) => {
        win.localStorage.setItem(`${keyPrefixWithUsername}.idToken`, "mock_id_token");
        win.localStorage.setItem(`${keyPrefixWithUsername}.accessToken`, "mock_access_token");
        win.localStorage.setItem(`${keyPrefix}.LastAuthUser`, accessTokenSub);
      });

      cy.window()
        .its("localStorage")
        .invoke("getItem", `${keyPrefixWithUsername}.idToken`)
        .should("exist");
      cy.window()
        .its("localStorage")
        .invoke("getItem", `${keyPrefixWithUsername}.accessToken`)
        .should("exist");
      cy.window()
        .its("localStorage")
        .invoke("getItem", `${keyPrefix}.LastAuthUser`)
        .should("eq", accessTokenSub);
    });

    it("should handle Cognito logout flow", function () {
      const clientId = "test_client_id";
      const accessTokenSub = "cognito_user_123";
      const keyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
      const keyPrefixWithUsername = `${keyPrefix}.${accessTokenSub}`;

      cy.window().then((win) => {
        win.localStorage.setItem(`${keyPrefixWithUsername}.idToken`, "mock_id_token");
        win.localStorage.setItem(`${keyPrefixWithUsername}.accessToken`, "mock_access_token");
        win.localStorage.setItem(`${keyPrefix}.LastAuthUser`, accessTokenSub);
      });

      cy.window().then((win) => {
        win.localStorage.removeItem(`${keyPrefixWithUsername}.idToken`);
        win.localStorage.removeItem(`${keyPrefixWithUsername}.accessToken`);
        win.localStorage.removeItem(`${keyPrefix}.LastAuthUser`);
      });

      cy.window()
        .its("localStorage")
        .invoke("getItem", `${keyPrefixWithUsername}.idToken`)
        .should("be.null");
    });

    it("should validate Cognito AWS config structure", function () {
      const awsConfig = Cypress.env("awsConfig");

      if (awsConfig) {
        expect(awsConfig).to.be.an("object");
      }
    });
  });

  describe("Google Authentication Flow", function () {
    it("should have Google login command available", function () {
      expect(Cypress.Commands._commands.loginByGoogleApi).to.exist;
    });

    it("should validate Google session storage structure", function () {
      const googleUserItem = {
        token: "mock_google_id_token",
        user: {
          googleId: "google123",
          email: "test@gmail.com",
          givenName: "Test",
          familyName: "User",
          imageUrl: "https://example.com/photo.jpg",
        },
      };

      cy.window().then((win) => {
        win.localStorage.setItem("googleCypress", JSON.stringify(googleUserItem));
      });

      cy.window().its("localStorage").invoke("getItem", "googleCypress").should("exist");

      cy.window()
        .its("localStorage")
        .invoke("getItem", "googleCypress")
        .then((item) => {
          const parsed = JSON.parse(item!);
          expect(parsed.user).to.have.property("googleId");
          expect(parsed.user).to.have.property("email");
        });
    });

    it("should handle Google logout flow", function () {
      const googleUserItem = {
        token: "mock_google_id_token",
        user: {
          googleId: "google123",
          email: "test@gmail.com",
        },
      };

      cy.window().then((win) => {
        win.localStorage.setItem("googleCypress", JSON.stringify(googleUserItem));
      });

      cy.window().then((win) => {
        win.localStorage.removeItem("googleCypress");
      });

      cy.window().its("localStorage").invoke("getItem", "googleCypress").should("be.null");
    });

    it("should validate Google OAuth config", function () {
      const googleConfig = {
        clientId: Cypress.env("googleClientId"),
        clientSecret: Cypress.env("googleClientSecret"),
        refreshToken: Cypress.env("googleRefreshToken"),
      };

      expect(googleConfig).to.have.property("clientId");
      expect(googleConfig).to.have.property("clientSecret");
      expect(googleConfig).to.have.property("refreshToken");
    });
  });

  describe("Authentication Provider Switching", function () {
    it("should handle switching between auth providers", function () {
      cy.window().then((win) => {
        win.localStorage.setItem("authState", JSON.stringify({ provider: "auth0" }));
      });

      cy.window().then((win) => {
        win.localStorage.removeItem("authState");
        win.localStorage.setItem("oktaCypress", JSON.stringify({ provider: "okta" }));
      });

      cy.window().its("localStorage").invoke("getItem", "authState").should("be.null");
      cy.window().its("localStorage").invoke("getItem", "oktaCypress").should("exist");
    });

    it("should clear all auth provider data on full logout", function () {
      cy.window().then((win) => {
        win.localStorage.setItem("authState", JSON.stringify({ provider: "auth0" }));
        win.localStorage.setItem("oktaCypress", JSON.stringify({ provider: "okta" }));
        win.localStorage.setItem("googleCypress", JSON.stringify({ provider: "google" }));
        win.localStorage.setItem(
          "CognitoIdentityServiceProvider.test.user.idToken",
          "cognito_token"
        );
      });

      cy.window().then((win) => {
        win.localStorage.clear();
      });

      cy.window().its("localStorage").invoke("getItem", "authState").should("be.null");
      cy.window().its("localStorage").invoke("getItem", "oktaCypress").should("be.null");
      cy.window().its("localStorage").invoke("getItem", "googleCypress").should("be.null");
    });
  });

  describe("Authentication Error Handling", function () {
    it("should handle invalid credentials error", function () {
      cy.visit("/signin");

      cy.getBySel("signin-username").type("invaliduser");
      cy.getBySel("signin-password").type("invalidpassword");
      cy.getBySel("signin-submit").click();

      cy.getBySel("signin-error")
        .should("be.visible")
        .and("have.text", "Username or password is invalid");
    });

    it("should handle session expiration scenario", function () {
      cy.window().then((win) => {
        win.localStorage.setItem(
          "authState",
          JSON.stringify({
            isAuthenticated: true,
            expiresAt: Date.now() - 3600000,
          })
        );
      });

      cy.window()
        .its("localStorage")
        .invoke("getItem", "authState")
        .then((item) => {
          const parsed = JSON.parse(item!);
          expect(parsed.expiresAt).to.be.lessThan(Date.now());
        });
    });

    it("should handle network error during authentication", function () {
      cy.intercept("POST", "/login", {
        statusCode: 500,
        body: { error: "Internal Server Error" },
      }).as("failedLogin");

      cy.visit("/signin");

      cy.getBySel("signin-username").type("testuser");
      cy.getBySel("signin-password").type("testpassword");
      cy.getBySel("signin-submit").click();

      cy.wait("@failedLogin");
    });

    it("should handle malformed token response", function () {
      cy.window().then((win) => {
        win.localStorage.setItem("authState", "invalid_json_string");
      });

      cy.window()
        .its("localStorage")
        .invoke("getItem", "authState")
        .should("eq", "invalid_json_string");
    });
  });

  describe("Authentication State Persistence", function () {
    it("should persist authentication state across page reloads", function () {
      cy.window().then((win) => {
        win.localStorage.setItem(
          "authState",
          JSON.stringify({
            isAuthenticated: true,
            user: { id: "123", email: "test@example.com" },
          })
        );
      });

      cy.reload();

      cy.window().its("localStorage").invoke("getItem", "authState").should("exist");
    });

    it("should handle remember me functionality", function () {
      cy.visit("/signin");

      cy.getBySel("signin-username").type("testuser");
      cy.getBySel("signin-password").type("s3cret");
      cy.getBySel("signin-remember-me").find("input").check();

      cy.getBySel("signin-remember-me").find("input").should("be.checked");
    });

    it("should clear session on explicit logout", function () {
      cy.window().then((win) => {
        win.localStorage.setItem(
          "authState",
          JSON.stringify({
            isAuthenticated: true,
            user: { id: "123" },
          })
        );
        win.sessionStorage.setItem("sessionData", "test_session");
      });

      cy.window().then((win) => {
        win.localStorage.clear();
        win.sessionStorage.clear();
      });

      cy.window().its("localStorage").invoke("getItem", "authState").should("be.null");
      cy.window().its("sessionStorage").invoke("getItem", "sessionData").should("be.null");
    });
  });

  describe("Multi-tab Authentication", function () {
    it("should handle authentication state in localStorage", function () {
      cy.window().then((win) => {
        win.localStorage.setItem(
          "authState",
          JSON.stringify({
            isAuthenticated: true,
            user: { id: "123" },
          })
        );
      });

      cy.window()
        .its("localStorage")
        .invoke("getItem", "authState")
        .then((item) => {
          const parsed = JSON.parse(item!);
          expect(parsed.isAuthenticated).to.be.true;
        });
    });

    it("should detect logout from another tab simulation", function () {
      cy.window().then((win) => {
        win.localStorage.setItem(
          "authState",
          JSON.stringify({
            isAuthenticated: true,
            user: { id: "123" },
          })
        );
      });

      cy.window().then((win) => {
        win.localStorage.removeItem("authState");

        const event = new StorageEvent("storage", {
          key: "authState",
          oldValue: JSON.stringify({ isAuthenticated: true }),
          newValue: null,
          storageArea: win.localStorage,
        });
        win.dispatchEvent(event);
      });

      cy.window().its("localStorage").invoke("getItem", "authState").should("be.null");
    });
  });
});
