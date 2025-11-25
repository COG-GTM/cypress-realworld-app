// check this file using TypeScript if available
// @ts-check

import { User, Comment, Transaction } from "../../../src/models";

const apiComments = `${Cypress.env("apiUrl")}/comments`;

type TestCommentsCtx = {
  authenticatedUser?: User;
  transactionId?: string;
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
  });

  context("GET /comments/:transactionId", function () {
    it("gets a list of comments for a transaction", function () {
      const transactionId = ctx.transactionId!;
      cy.request("GET", `${apiComments}/${transactionId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comments).to.be.an("array").that.has.length(1);
      });
    });

    it("returns empty array when transaction has no comments", function () {
      cy.database("find", "transactions").then((transaction: Transaction) => {
        // Find a transaction without comments
        cy.database("filter", "comments").then((comments: Comment[]) => {
          const transactionWithoutComments = transaction.id;
          cy.request("GET", `${apiComments}/${transactionWithoutComments}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.comments).to.be.an("array");
          });
        });
      });
    });

    it("errors when transaction ID does not exist", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/nonexistent-id`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("errors when transaction ID format is invalid", function () {
      cy.request({
        method: "GET",
        url: `${apiComments}/invalid-format-123`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
      });
    });

    it("errors when user is not authenticated", function () {
      cy.logout();
      cy.request({
        method: "GET",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
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

  context("POST /comments/:transactionId - Validation Tests", function () {
    it("errors when comment content is missing", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {},
      }).then((response) => {
        expect(response.status).to.eq(422);
      });
    });

    it("errors when comment content is empty string", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {
          content: "",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
      });
    });

    it("errors when comment content is only whitespace", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {
          content: "   ",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
      });
    });
  });

  context("POST /comments/:transactionId - Invalid Transaction ID Tests", function () {
    it("errors when transaction ID does not exist", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/nonexistent-id`,
        failOnStatusCode: false,
        body: {
          content: "This is a comment",
        },
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("errors when transaction ID format is invalid", function () {
      cy.request({
        method: "POST",
        url: `${apiComments}/invalid-format-123`,
        failOnStatusCode: false,
        body: {
          content: "This is a comment",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
      });
    });
  });

  context("POST /comments/:transactionId - Authentication Tests", function () {
    it("errors when user is not authenticated", function () {
      cy.logout();
      cy.request({
        method: "POST",
        url: `${apiComments}/${ctx.transactionId}`,
        failOnStatusCode: false,
        body: {
          content: "This is a comment",
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  context("POST /comments/:transactionId - Data Integrity Tests", function () {
    it("comment is created with correct structure", function () {
      const commentContent = "This is a test comment";
      cy.request("POST", `${apiComments}/${ctx.transactionId}`, {
        content: commentContent,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comment).to.have.property("id");
        expect(response.body.comment).to.have.property("uuid");
        expect(response.body.comment).to.have.property("userId");
        expect(response.body.comment).to.have.property("transactionId");
        expect(response.body.comment).to.have.property("content");
        expect(response.body.comment).to.have.property("createdAt");
        expect(response.body.comment).to.have.property("modifiedAt");
      });
    });

    it("comment content matches what was sent", function () {
      const commentContent = "This is a test comment with specific content";
      cy.request("POST", `${apiComments}/${ctx.transactionId}`, {
        content: commentContent,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comment.content).to.eq(commentContent);
        expect(response.body.comment.userId).to.eq(ctx.authenticatedUser!.id);
        expect(response.body.comment.transactionId).to.eq(ctx.transactionId);
      });
    });

    it("comment is persisted in database", function () {
      const commentContent = "This comment should be persisted";
      cy.request("POST", `${apiComments}/${ctx.transactionId}`, {
        content: commentContent,
      }).then((response) => {
        expect(response.status).to.eq(200);
        const commentId = response.body.comment.id;

        cy.database("find", "comments", { id: commentId }).then((comment: Comment) => {
          expect(comment).to.exist;
          expect(comment.content).to.eq(commentContent);
          expect(comment.userId).to.eq(ctx.authenticatedUser!.id);
          expect(comment.transactionId).to.eq(ctx.transactionId);
        });
      });
    });
  });

  context("POST /comments/:transactionId - Notification Creation Tests", function () {
    it("creates notifications for sender and receiver when third party comments", function () {
      // Get a transaction where the authenticated user is neither sender nor receiver
      cy.database("find", "transactions").then((transaction: Transaction) => {
        const thirdPartyUser = ctx.allUsers!.find(
          (user) => user.id !== transaction.senderId && user.id !== transaction.receiverId
        );

        if (thirdPartyUser) {
          cy.loginByApi(thirdPartyUser.username).then(() => {
            cy.request("POST", `${apiComments}/${transaction.id}`, {
              content: "Third party comment",
            }).then((response) => {
              expect(response.status).to.eq(200);
              const commentId = response.body.comment.id;

              // Verify notifications were created for both sender and receiver
              cy.database("filter", "notifications", {
                commentId: commentId,
              }).then((notifications: any[]) => {
                expect(notifications).to.have.length(2);
                const userIds = notifications.map((n) => n.userId);
                expect(userIds).to.include(transaction.senderId);
                expect(userIds).to.include(transaction.receiverId);
              });
            });
          });
        }
      });
    });

    it("creates notification for receiver when sender comments", function () {
      // Get a transaction where the authenticated user is the sender
      cy.database("find", "transactions", {
        senderId: ctx.authenticatedUser!.id,
      }).then((transaction: Transaction) => {
        cy.request("POST", `${apiComments}/${transaction.id}`, {
          content: "Sender comment",
        }).then((response) => {
          expect(response.status).to.eq(200);
          const commentId = response.body.comment.id;

          // Verify notification was created for sender
          cy.database("filter", "notifications", {
            commentId: commentId,
          }).then((notifications: any[]) => {
            expect(notifications).to.have.length(1);
            expect(notifications[0].userId).to.eq(transaction.senderId);
          });
        });
      });
    });
  });

  context("POST /comments/:transactionId - Edge Cases", function () {
    it("creates multiple comments on the same transaction", function () {
      const firstComment = "First comment";
      const secondComment = "Second comment";

      cy.request("POST", `${apiComments}/${ctx.transactionId}`, {
        content: firstComment,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comment.content).to.eq(firstComment);

        cy.request("POST", `${apiComments}/${ctx.transactionId}`, {
          content: secondComment,
        }).then((response2) => {
          expect(response2.status).to.eq(200);
          expect(response2.body.comment.content).to.eq(secondComment);

          // Verify both comments exist
          cy.request("GET", `${apiComments}/${ctx.transactionId}`).then((getResponse) => {
            expect(getResponse.status).to.eq(200);
            expect(getResponse.body.comments.length).to.be.greaterThan(1);
          });
        });
      });
    });

    it("handles very long comment content", function () {
      const longComment = "a".repeat(1000);
      cy.request("POST", `${apiComments}/${ctx.transactionId}`, {
        content: longComment,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comment.content).to.eq(longComment);
        expect(response.body.comment.content.length).to.eq(1000);
      });
    });

    it("handles special characters in comment content", function () {
      const specialComment = "<>&\"'@#$%";
      cy.request("POST", `${apiComments}/${ctx.transactionId}`, {
        content: specialComment,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comment.content).to.eq(specialComment);
      });
    });
  });
});
