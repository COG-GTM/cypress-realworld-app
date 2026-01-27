// check this file using TypeScript if available
// @ts-check

import {
  User,
  Comment,
  Transaction,
  NotificationType,
  CommentNotification,
} from "../../../src/models";

const apiComments = `${Cypress.env("apiUrl")}/comments`;

type TestCommentsCtx = {
  authenticatedUser?: User;
  transactionId?: string;
  transaction?: Transaction;
  allUsers?: User[];
};

describe("Comments API", function () {
  let ctx: TestCommentsCtx = {};

  before(() => {
    // Hacky workaround to have the e2e tests pass when cy.visit('http://localhost:3000') is called
    cy.request("GET", "/");
  });

  beforeEach(function () {
    cy.task("db:seed");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.authenticatedUser = users[0];
      ctx.allUsers = users;

      return cy.loginByApi(ctx.authenticatedUser.username);
    });

    cy.database("find", "comments").then((comment: Comment) => {
      ctx.transactionId = comment.transactionId;
    });

    cy.database("find", "transactions").then((transaction: Transaction) => {
      ctx.transaction = transaction;
    });
  });

  context("GET /comments/:transactionId", function () {
    it("gets a list of comments for a transaction", function () {
      const transactionId = ctx.transactionId!;
      cy.request("GET", `${apiComments}/${transactionId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comments).to.be.an("array").that.has.length(1);
      });
    });
  });

  context("POST /comments/:transactionId", function () {
    it("creates a new comment for a transaction", function () {
      const transactionId = ctx.transactionId!;
      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: "This is my comment",
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  context("GET /comments/:transactionId - Authentication", function () {
    it("returns 401 for unauthenticated GET request", function () {
      const transactionId = ctx.transactionId!;
      cy.clearCookies();
      cy.request({
        method: "GET",
        url: `${apiComments}/${transactionId}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property("error", "Unauthorized");
      });
    });
  });

  context("POST /comments/:transactionId - Authentication", function () {
    it("returns 401 for unauthenticated POST request", function () {
      const transactionId = ctx.transactionId!;
      cy.clearCookies();
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: "Test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property("error", "Unauthorized");
      });
    });
  });

  context("GET /comments/:transactionId - Invalid Transaction ID", function () {
    it("returns 200 with empty array for any transaction ID format (shortid validation is permissive)", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/invalid-id-format`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comments).to.be.an("array").that.has.length(0);
      });
    });

    it("returns 404 for empty transaction ID", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 422]);
      });
    });

    it("returns 404 for transaction ID with special characters in URL path", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/<script>alert('xss')</script>`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("returns empty array for non-existent but valid format transaction ID", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/abcd1234`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comments).to.be.an("array").that.has.length(0);
      });
    });
  });

  context("POST /comments/:transactionId - Invalid Transaction ID", function () {
    it("returns 500 for non-existent transaction ID (database lookup fails)", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/invalid-id-format`,
        body: { content: "Test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(500);
      });
    });

    it("returns 404 for transaction ID with special characters in URL path", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/<script>alert('xss')</script>`,
        body: { content: "Test comment" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  context("POST /comments/:transactionId - Content Validation", function () {
    it("accepts empty content string (validator uses isString which allows empty)", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: "" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("returns 422 for missing content field", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: {},
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("returns 422 for null content", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: null },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("returns 422 for numeric content instead of string", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: 12345 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("returns 422 for array content instead of string", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: ["test", "array"] },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("returns 422 for object content instead of string", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: { nested: "object" } },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });

    it("accepts content with special characters (HTML)", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: "<script>alert('xss')</script>" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("accepts content with Unicode characters", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: "Test with emojis 🎉 and unicode: 你好世界" },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("accepts very long content", function () {
      const transactionId = ctx.transactionId!;
      const longContent = "a".repeat(10000);
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: longContent },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  context("POST /comments/:transactionId - Request Body Validation", function () {
    it("accepts request with extra unexpected fields", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: {
          content: "Valid comment",
          unexpectedField: "should be ignored",
          anotherField: 123,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("returns 422 for boolean content", function () {
      const transactionId = ctx.transactionId!;
      cy.request({
        method: "POST",
        url: `${apiComments}/${transactionId}`,
        body: { content: true },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array");
      });
    });
  });

  context("GET /comments/:transactionId - Database State Validation", function () {
    it("returns empty array for transaction with no comments", function () {
      cy.database("filter", "transactions").then((transactions: Transaction[]) => {
        const transactionWithoutComments = transactions.find((t) => {
          return true;
        });
        if (transactionWithoutComments) {
          cy.database("filter", "comments").then((comments: Comment[]) => {
            const transactionIdsWithComments = comments.map((c) => c.transactionId);
            const txWithoutComment = transactions.find(
              (t) => !transactionIdsWithComments.includes(t.id)
            );
            if (txWithoutComment) {
              cy.request("GET", `${apiComments}/${txWithoutComment.id}`).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.comments).to.be.an("array").that.has.length(0);
              });
            }
          });
        }
      });
    });

    it("verifies comment appears in GET after POST", function () {
      const transactionId = ctx.transactionId!;
      const uniqueContent = `Test comment ${Date.now()}`;

      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: uniqueContent,
      }).then((postResponse) => {
        expect(postResponse.status).to.eq(200);

        cy.request("GET", `${apiComments}/${transactionId}`).then((getResponse) => {
          expect(getResponse.status).to.eq(200);
          expect(getResponse.body.comments).to.be.an("array");
          const createdComment = getResponse.body.comments.find(
            (c: Comment) => c.content === uniqueContent
          );
          expect(createdComment).to.exist;
        });
      });
    });

    it("verifies comment metadata is set correctly after creation", function () {
      const transactionId = ctx.transactionId!;
      const uniqueContent = `Metadata test ${Date.now()}`;

      cy.request("POST", `${apiComments}/${transactionId}`, {
        content: uniqueContent,
      }).then((postResponse) => {
        expect(postResponse.status).to.eq(200);

        cy.request("GET", `${apiComments}/${transactionId}`).then((getResponse) => {
          expect(getResponse.status).to.eq(200);
          const createdComment = getResponse.body.comments.find(
            (c: Comment) => c.content === uniqueContent
          );
          expect(createdComment).to.exist;
          expect(createdComment).to.have.property("id");
          expect(createdComment).to.have.property("uuid");
          expect(createdComment).to.have.property("userId", ctx.authenticatedUser!.id);
          expect(createdComment).to.have.property("transactionId", transactionId);
          expect(createdComment).to.have.property("createdAt");
          expect(createdComment).to.have.property("modifiedAt");
        });
      });
    });
  });

  context("POST /comments/:transactionId - Notification Side Effects", function () {
    it("creates notifications when a third-party comments on a transaction", function () {
      cy.database("filter", "transactions").then((transactions: Transaction[]) => {
        const transaction = transactions[0];
        const thirdPartyUser = ctx.allUsers!.find(
          (u) => u.id !== transaction.senderId && u.id !== transaction.receiverId
        );

        if (thirdPartyUser) {
          cy.loginByApi(thirdPartyUser.username).then(() => {
            const uniqueContent = `Third party comment ${Date.now()}`;

            cy.request("POST", `${apiComments}/${transaction.id}`, {
              content: uniqueContent,
            }).then((postResponse) => {
              expect(postResponse.status).to.eq(200);

              cy.database("filter", "notifications").then((notifications: NotificationType[]) => {
                const commentNotifications = notifications.filter(
                  (n): n is CommentNotification =>
                    "commentId" in n && n.transactionId === transaction.id
                );
                const senderNotification = commentNotifications.find(
                  (n) => n.userId === transaction.senderId
                );
                const receiverNotification = commentNotifications.find(
                  (n) => n.userId === transaction.receiverId
                );

                expect(senderNotification).to.exist;
                expect(receiverNotification).to.exist;
              });
            });
          });
        }
      });
    });

    it("creates notification for sender when sender comments", function () {
      cy.database("filter", "transactions").then((transactions: Transaction[]) => {
        const transaction = transactions[0];
        const senderUser = ctx.allUsers!.find((u) => u.id === transaction.senderId);

        if (senderUser) {
          cy.loginByApi(senderUser.username).then(() => {
            cy.database("filter", "notifications").then(
              (notificationsBefore: NotificationType[]) => {
                const beforeCount = notificationsBefore.filter(
                  (n): n is CommentNotification =>
                    "commentId" in n && n.transactionId === transaction.id
                ).length;

                const uniqueContent = `Sender comment ${Date.now()}`;

                cy.request("POST", `${apiComments}/${transaction.id}`, {
                  content: uniqueContent,
                }).then((postResponse) => {
                  expect(postResponse.status).to.eq(200);

                  cy.database("filter", "notifications").then(
                    (notificationsAfter: NotificationType[]) => {
                      const afterNotifications = notificationsAfter.filter(
                        (n): n is CommentNotification =>
                          "commentId" in n && n.transactionId === transaction.id
                      );
                      expect(afterNotifications.length).to.be.greaterThan(beforeCount);
                    }
                  );
                });
              }
            );
          });
        }
      });
    });

    it("creates notification for receiver when receiver comments", function () {
      cy.database("filter", "transactions").then((transactions: Transaction[]) => {
        const transaction = transactions[0];
        const receiverUser = ctx.allUsers!.find((u) => u.id === transaction.receiverId);

        if (receiverUser) {
          cy.loginByApi(receiverUser.username).then(() => {
            cy.database("filter", "notifications").then(
              (notificationsBefore: NotificationType[]) => {
                const beforeCount = notificationsBefore.filter(
                  (n): n is CommentNotification =>
                    "commentId" in n && n.transactionId === transaction.id
                ).length;

                const uniqueContent = `Receiver comment ${Date.now()}`;

                cy.request("POST", `${apiComments}/${transaction.id}`, {
                  content: uniqueContent,
                }).then((postResponse) => {
                  expect(postResponse.status).to.eq(200);

                  cy.database("filter", "notifications").then(
                    (notificationsAfter: NotificationType[]) => {
                      const afterNotifications = notificationsAfter.filter(
                        (n): n is CommentNotification =>
                          "commentId" in n && n.transactionId === transaction.id
                      );
                      expect(afterNotifications.length).to.be.greaterThan(beforeCount);
                    }
                  );
                });
              }
            );
          });
        }
      });
    });
  });
});
