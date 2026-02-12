import UserSettingsForm from "./UserSettingsForm";
import { User, DefaultPrivacyLevel } from "../models";

const userProfile: User = {
  id: "t45AiwidW",
  uuid: "6383f84e-b511-44c5-a835-3ece1d781fa8",
  firstName: "Edgar",
  lastName: "Johns",
  username: "Katharina_Bernier",
  password: "$2a$10$5PXHGtcsckWtAprT5/JmluhR13f16BL8SIGhvAKNP.Dhxkt69FfzW",
  email: "Norene39@yahoo.com",
  phoneNumber: "625-316-9882",
  avatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/t45AiwidW.svg",
  defaultPrivacyLevel: DefaultPrivacyLevel.public,
  balance: 168137,
  createdAt: new Date("2019-08-27T23:47:05.637Z"),
  modifiedAt: new Date("2020-05-21T11:02:22.857Z"),
};

describe("UserSettingsForm", () => {
  it("renders with existing user data", () => {
    const updateUser = cy.stub();
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUser} />);

    cy.get("[data-test=user-settings-firstName-input]").should("have.value", "Edgar");
    cy.get("[data-test=user-settings-lastName-input]").should("have.value", "Johns");
    cy.get("[data-test=user-settings-email-input]").should("have.value", "Norene39@yahoo.com");
    cy.get("[data-test=user-settings-phoneNumber-input]").should("have.value", "625-316-9882");
  });

  it("shows validation errors for empty required fields", () => {
    const updateUser = cy.stub();
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUser} />);

    cy.get("[data-test=user-settings-firstName-input]").clear();
    cy.get("[data-test=user-settings-firstName-input]").blur();
    cy.get("[data-test=user-settings-form]").should("contain", "Enter a first name");

    cy.get("[data-test=user-settings-lastName-input]").clear();
    cy.get("[data-test=user-settings-lastName-input]").blur();
    cy.get("[data-test=user-settings-form]").should("contain", "Enter a last name");

    cy.get("[data-test=user-settings-email-input]").clear();
    cy.get("[data-test=user-settings-email-input]").blur();
    cy.get("[data-test=user-settings-form]").should("contain", "Enter an email address");

    cy.get("[data-test=user-settings-phoneNumber-input]").clear();
    cy.get("[data-test=user-settings-phoneNumber-input]").blur();
    cy.get("[data-test=user-settings-form]").should("contain", "Enter a phone number");
  });

  it("shows error for invalid email", () => {
    const updateUser = cy.stub();
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUser} />);

    cy.get("[data-test=user-settings-email-input]").clear().type("notanemail");
    cy.get("[data-test=user-settings-email-input]").blur();
    cy.get("[data-test=user-settings-form]").should(
      "contain",
      "Must contain a valid email address"
    );
  });

  it("shows error for invalid phone number", () => {
    const updateUser = cy.stub();
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUser} />);

    cy.get("[data-test=user-settings-phoneNumber-input]").clear().type("abc");
    cy.get("[data-test=user-settings-phoneNumber-input]").blur();
    cy.get("[data-test=user-settings-form]").should("contain", "Phone number is not valid");
  });

  it("submits updated data", () => {
    const updateUser = cy.stub().as("updateUser");
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUser} />);

    cy.get("[data-test=user-settings-firstName-input]").clear().type("Updated");
    cy.get("[data-test=user-settings-lastName-input]").clear().type("Name");
    cy.get("[data-test=user-settings-email-input]").clear().type("updated@test.com");
    cy.get("[data-test=user-settings-phoneNumber-input]").clear().type("555-555-5555");

    cy.get("[data-test=user-settings-submit]").should("not.be.disabled");
    cy.get("[data-test=user-settings-submit]").click();

    cy.get("@updateUser").should("have.been.calledOnce");
    cy.get("@updateUser").should(
      "have.been.calledWithMatch",
      Cypress.sinon.match({
        id: "t45AiwidW",
        firstName: "Updated",
        lastName: "Name",
        email: "updated@test.com",
        phoneNumber: "555-555-5555",
      })
    );
  });
});
