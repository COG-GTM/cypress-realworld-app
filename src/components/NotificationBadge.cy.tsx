import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("hides badge when count is 0", () => {
    cy.mount(<NotificationBadge count={0} />);
    cy.get("[data-test=nav-top-notifications-count]")
      .find(".MuiBadge-badge")
      .should("have.class", "MuiBadge-invisible");
  });

  it("hides badge when count is undefined", () => {
    cy.mount(<NotificationBadge />);
    cy.get("[data-test=nav-top-notifications-count]")
      .find(".MuiBadge-badge")
      .should("have.class", "MuiBadge-invisible");
  });

  it("displays badge with count of 1", () => {
    cy.mount(<NotificationBadge count={1} />);
    cy.get("[data-test=nav-top-notifications-count]")
      .find(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "1");
  });

  it("displays badge with count of 5", () => {
    cy.mount(<NotificationBadge count={5} />);
    cy.get("[data-test=nav-top-notifications-count]")
      .find(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "5");
  });

  it("displays badge with count of 99", () => {
    cy.mount(<NotificationBadge count={99} />);
    cy.get("[data-test=nav-top-notifications-count]")
      .find(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "99");
  });

  it("displays badge with large count (100+)", () => {
    cy.mount(<NotificationBadge count={150} />);
    cy.get("[data-test=nav-top-notifications-count]")
      .find(".MuiBadge-badge")
      .should("not.have.class", "MuiBadge-invisible")
      .and("contain", "99+");
  });
});
