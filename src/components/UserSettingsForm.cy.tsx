import UserSettingsForm from "./UserSettingsForm";
import { DefaultPrivacyLevel, User } from "../models";

describe("UserSettingsForm", () => {
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
  let updateUser: ReturnType<typeof cy.stub>;

  beforeEach(() => {
    updateUser = cy.stub();
  });

  it("renders with existing user data", () => {
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUser} />);
    cy.get("[data-test=user-settings-form]").should("be.visible");
    cy.get("[data-test=user-settings-firstName-input]").should("have.value", "Edgar");
    cy.get("[data-test=user-settings-lastName-input]").should("have.value", "Johns");
    cy.get("[data-test=user-settings-email-input]").should("have.value", "Norene39@yahoo.com");
    cy.get("[data-test=user-settings-phoneNumber-input]").should("have.value", "625-316-9882");
    cy.get("[data-test=user-settings-submit]").should("be.visible").and("not.be.disabled");
  });

  it("validates required fields", () => {
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUser} />);

    cy.get("[data-test=user-settings-firstName-input]").clear();
    cy.get("[data-test=user-settings-lastName-input]").focus();
    cy.get("#user-settings-firstName-input-helper-text").should(
      "contain",
      "Enter a first name"
    );

    cy.get("[data-test=user-settings-lastName-input]").clear();
    cy.get("[data-test=user-settings-email-input]").focus();
    cy.get("#user-settings-lastName-input-helper-text").should("contain", "Enter a last name");

    cy.get("[data-test=user-settings-email-input]").clear();
    cy.get("[data-test=user-settings-phoneNumber-input]").focus();
    cy.get("#user-settings-email-input-helper-text").should(
      "contain",
      "Enter an email address"
    );

    cy.get("[data-test=user-settings-phoneNumber-input]").clear();
    cy.get("[data-test=user-settings-firstName-input]").focus();
    cy.get("#user-settings-phoneNumber-input-helper-text").should(
      "contain",
      "Enter a phone number"
    );
  });

  it("validates email format", () => {
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUser} />);
    cy.get("[data-test=user-settings-email-input]").clear().type("invalid-email");
    cy.get("[data-test=user-settings-firstName-input]").focus();
    cy.get("#user-settings-email-input-helper-text").should(
      "contain",
      "Must contain a valid email address"
    );
  });

  it("submits updated data", () => {
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUser} />);

    cy.get("[data-test=user-settings-firstName-input]").clear().type("Updated");
    cy.get("[data-test=user-settings-lastName-input]").clear().type("Name");
    cy.get("[data-test=user-settings-email-input]").clear().type("new@email.com");
    cy.get("[data-test=user-settings-phoneNumber-input]").clear().type("555-555-5555");
    cy.get("[data-test=user-settings-submit]").should("not.be.disabled").click();

    cy.wrap(updateUser).should("be.calledOnce");
    cy.wrap(updateUser).should("be.calledWithMatch", {
      id: "t45AiwidW",
      firstName: "Updated",
      lastName: "Name",
      email: "new@email.com",
      phoneNumber: "555-555-5555",
    });
  });
});
