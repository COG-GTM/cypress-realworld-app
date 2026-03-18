import * as React from "react";
import Footer from "./Footer";

describe("Footer Airbnb Redesign", () => {
  it("renders with clean minimal design", () => {
    cy.mount(<Footer />);

    // Verify footer text
    cy.contains("Built with care by").should("be.visible");
    cy.contains("Cypress").should("be.visible");

    // Verify Cypress link has pink color
    cy.get("a[href='https://cypress.io']")
      .should("have.css", "color", "rgb(255, 56, 92)")
      .and("have.css", "text-decoration-line", "none");
  });

  it("uses Nunito font family", () => {
    cy.mount(<Footer />);

    cy.contains("Built with care by")
      .should("have.css", "font-family")
      .and("include", "Nunito");
  });
});
