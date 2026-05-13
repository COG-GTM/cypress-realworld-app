import CommentsList from "./CommentList";
import { Comment } from "../models";

const comments: Comment[] = [
  {
    id: "comment1",
    uuid: "c-uuid-1",
    content: "Great transaction!",
    userId: "user1",
    transactionId: "tx1",
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: "comment2",
    uuid: "c-uuid-2",
    content: "Thanks for the payment",
    userId: "user2",
    transactionId: "tx1",
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
];

describe("CommentsList", () => {
  it("renders list of comments", () => {
    cy.mount(<CommentsList comments={comments} />);
    cy.get("[data-test=comments-list]").should("exist");
    cy.get("[data-test=comments-list]").find("li").should("have.length", 2);
  });

  it("empty comments array renders empty list", () => {
    cy.mount(<CommentsList comments={[]} />);
    cy.get("[data-test=comments-list]").should("exist");
    cy.get("[data-test=comments-list]").find("li").should("have.length", 0);
  });
});
