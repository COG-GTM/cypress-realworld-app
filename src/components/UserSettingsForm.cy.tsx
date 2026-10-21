import UserSettingsForm from "./UserSettingsForm";
import { DefaultPrivacyLevel, User } from "../models";

const userProfile: User = {
  id: "t45AiwidW",
  uuid: "6383f84e-b511-44c5-a835-3ece1d781fa8",
  firstName: "Edgar",
  lastName: "Johns",
  username: "Katharina_Bernier",
  password: "",
  email: "Norene39@yahoo.com",
  phoneNumber: "625-316-9882",
  avatar: "",
  defaultPrivacyLevel: DefaultPrivacyLevel.public,
  balance: 168137,
  createdAt: new Date("2019-08-27T23:47:05.637Z"),
  modifiedAt: new Date("2020-05-21T11:02:22.857Z"),
};

describe("UserSettingsForm", () => {
  beforeEach(() => {
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={cy.spy().as("updateUser")} />);
  });

  it("is pre-filled with the user profile", () => {
    cy.get("[data-test=user-settings-firstName-input]").should("have.value", "Edgar");
    cy.get("[data-test=user-settings-lastName-input]").should("have.value", "Johns");
    cy.get("[data-test=user-settings-email-input]").should("have.value", "Norene39@yahoo.com");
    cy.get("[data-test=user-settings-phoneNumber-input]").should("have.value", "625-316-9882");
  });

  it("submits the updated profile with the user id", () => {
    cy.get("[data-test=user-settings-firstName-input]").clear().type("Ed");
    cy.get("[data-test=user-settings-email-input]").clear().type("ed@example.com");
    cy.get("[data-test=user-settings-submit]").click();

    cy.get("@updateUser").should("have.been.calledOnceWith", {
      id: userProfile.id,
      firstName: "Ed",
      lastName: "Johns",
      email: "ed@example.com",
      phoneNumber: "625-316-9882",
      defaultPrivacyLevel: DefaultPrivacyLevel.public,
    });
  });

  it("displays required field errors and disables submit", () => {
    cy.get("[data-test=user-settings-firstName-input]").clear().blur();
    cy.get("#user-settings-firstName-input-helper-text").should("contain", "Enter a first name");
    cy.get("[data-test=user-settings-lastName-input]").clear().blur();
    cy.get("#user-settings-lastName-input-helper-text").should("contain", "Enter a last name");
    cy.get("[data-test=user-settings-email-input]").clear().blur();
    cy.get("#user-settings-email-input-helper-text").should("contain", "Enter an email address");
    cy.get("[data-test=user-settings-phoneNumber-input]").clear().blur();
    cy.get("#user-settings-phoneNumber-input-helper-text").should(
      "contain",
      "Enter a phone number"
    );

    cy.get("[data-test=user-settings-submit]").should("be.disabled");
    cy.get("@updateUser").should("not.have.been.called");
  });

  it("validates email and phone number formats", () => {
    cy.get("[data-test=user-settings-email-input]").clear().type("not-an-email").blur();
    cy.get("#user-settings-email-input-helper-text").should(
      "contain",
      "Must contain a valid email address"
    );
    cy.get("[data-test=user-settings-phoneNumber-input]").clear().type("615-555-").blur();
    cy.get("#user-settings-phoneNumber-input-helper-text").should(
      "contain",
      "Phone number is not valid"
    );
    cy.get("[data-test=user-settings-submit]").should("be.disabled");
  });
});
