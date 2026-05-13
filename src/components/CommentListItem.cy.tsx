import CommentListItem from "./CommentListItem";
import { Comment } from "../models";

describe("CommentListItem", () => {
  it("renders individual comment content", () => {
    const comment: Comment = {
      id: "comment1",
      uuid: "c-uuid-1",
      content: "Great transaction!",
      userId: "user1",
      transactionId: "tx1",
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    cy.mount(<CommentListItem comment={comment} />);
    cy.get("[data-test=comment-list-item-comment1]").should("contain", "Great transaction!");
  });
});
