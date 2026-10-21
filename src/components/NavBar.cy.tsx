import { interpret } from "xstate";
import { MemoryRouter } from "react-router-dom";
import NavBar from "./NavBar";
import { notificationsMachine } from "../machines/notificationsMachine";

describe("NavBar", () => {
  let notificationsService;
  beforeEach(() => {
    cy.viewport(1000, 660);
    notificationsService = interpret(notificationsMachine);
    notificationsService.start();

    cy.intercept("GET", "http://localhost:3001/notifications*", {
      results: [
        { id: "n1", likeId: "l1", userFullName: "Kaden Sears" },
        { id: "n2", commentId: "c1", userFullName: "Kaden Sears" },
        { id: "n3", status: "requested", userFullName: "Kaden Sears" },
      ],
    }).as("getNotifications");
  });

  const mountNavBar = (path = "/", drawerOpen = true) => {
    const toggleDrawer = cy.spy().as("toggleDrawer");
    cy.mount(
      <MemoryRouter initialEntries={[path]}>
        <NavBar
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
          notificationsService={notificationsService}
        />
      </MemoryRouter>
    );
  };

  it("shows the notification count fetched from the backend", () => {
    mountNavBar();
    cy.get("[data-test=nav-top-notifications-count]").should("not.contain", "3");

    cy.then(() => notificationsService.send("FETCH"));
    cy.wait("@getNotifications");

    cy.get("[data-test=nav-top-notifications-count]").should("contain", "3");
  });

  it("toggles the drawer from the menu button", () => {
    mountNavBar();

    cy.get("[data-test=sidenav-toggle]").click();

    cy.get("@toggleDrawer").should("have.been.calledOnce");
  });

  it("links to new transaction and notifications", () => {
    mountNavBar();

    cy.get("[data-test=nav-top-new-transaction]")
      .should("have.attr", "href", "/transaction/new")
      .and("contain", "New");
    cy.get("[data-test=nav-top-notifications-link]").should("have.attr", "href", "/notifications");
    cy.get("[data-test=app-name-logo]").find("a").should("have.attr", "href", "/");
  });

  ["/", "/public", "/contacts", "/personal"].forEach((path) => {
    it(`shows the transaction tabs on ${path}`, () => {
      mountNavBar(path);
      cy.get("[data-test=nav-transaction-tabs]").should("be.visible");
    });
  });

  ["/notifications", "/bankaccounts", "/user/settings"].forEach((path) => {
    it(`hides the transaction tabs on ${path}`, () => {
      mountNavBar(path);
      cy.get("[data-test=nav-transaction-tabs]").should("not.exist");
    });
  });

  it("shifts the app bar when the drawer is open", () => {
    mountNavBar("/", true);
    cy.get(".NavBar-appBar").should("have.class", "NavBar-appBarShift");
  });

  it("does not shift the app bar when the drawer is closed", () => {
    mountNavBar("/", false);
    cy.get(".NavBar-appBar").should("not.have.class", "NavBar-appBarShift");
  });
});
