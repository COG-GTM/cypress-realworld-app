import NotificationBadge from "./NotificationBadge";

describe("NotificationBadge", () => {
  describe("badge visibility", () => {
    it("hides the badge when count is 0", () => {
      cy.mount(<NotificationBadge count={0} data-test="notification-badge" />);
      cy.get("[data-test=notification-badge-count]")
        .find(".MuiBadge-badge")
        .should("have.class", "MuiBadge-invisible");
    });

    it("hides the badge when count is undefined", () => {
      cy.mount(<NotificationBadge data-test="notification-badge" />);
      cy.get("[data-test=notification-badge-count]")
        .find(".MuiBadge-badge")
        .should("have.class", "MuiBadge-invisible");
    });

    it("shows the badge when count is greater than 0", () => {
      cy.mount(<NotificationBadge count={5} data-test="notification-badge" />);
      cy.get("[data-test=notification-badge-count]")
        .find(".MuiBadge-badge")
        .should("not.have.class", "MuiBadge-invisible");
    });
  });

  describe("badge count display", () => {
    it("displays count of 1 correctly", () => {
      cy.mount(<NotificationBadge count={1} data-test="notification-badge" />);
      cy.get("[data-test=notification-badge-count]").find(".MuiBadge-badge").should("contain", "1");
    });

    it("displays count of 5 correctly", () => {
      cy.mount(<NotificationBadge count={5} data-test="notification-badge" />);
      cy.get("[data-test=notification-badge-count]").find(".MuiBadge-badge").should("contain", "5");
    });

    it("displays count of 99 correctly", () => {
      cy.mount(<NotificationBadge count={99} data-test="notification-badge" />);
      cy.get("[data-test=notification-badge-count]")
        .find(".MuiBadge-badge")
        .should("contain", "99");
    });

    it("displays large count (100+) correctly", () => {
      cy.mount(<NotificationBadge count={150} data-test="notification-badge" />);
      cy.get("[data-test=notification-badge-count]").find(".MuiBadge-badge").should("be.visible");
    });
  });

  describe("badge styling", () => {
    it("has the notification icon", () => {
      cy.mount(<NotificationBadge count={3} data-test="notification-badge" />);
      cy.get("[data-test=notification-badge]").find("svg").should("exist");
    });

    it("applies custom badge styling with red background", () => {
      cy.mount(<NotificationBadge count={3} data-test="notification-badge" />);
      cy.get("[data-test=notification-badge-count]")
        .find(".MuiBadge-badge")
        .should("have.css", "background-color", "rgb(255, 0, 0)");
    });
  });

  describe("click handler", () => {
    it("calls onClick when clicked", () => {
      const onClickSpy = cy.spy().as("onClickSpy");
      cy.mount(<NotificationBadge count={3} data-test="notification-badge" onClick={onClickSpy} />);
      cy.get("[data-test=notification-badge]").click();
      cy.get("@onClickSpy").should("have.been.calledOnce");
    });
  });
});
