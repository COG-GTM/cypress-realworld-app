import UserSettingsForm from "./UserSettingsForm";
import { User, DefaultPrivacyLevel } from "../models";

describe("UserSettingsForm", () => {
  const userProfile: User = {
    id: "test-user-id",
    uuid: "test-uuid",
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    password: "password",
    email: "john@example.com",
    phoneNumber: "555-555-5555",
    balance: 100000,
    avatar: "https://example.com/avatar.png",
    defaultPrivacyLevel: DefaultPrivacyLevel.public,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  it("renders the user settings form with all fields", () => {
    const updateUserSpy = cy.spy().as("updateUser");

    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserSpy} />);

    cy.get("[data-test='user-settings-form']").should("be.visible");
    cy.get("[data-test='user-settings-firstName-input']").should("be.visible");
    cy.get("[data-test='user-settings-lastName-input']").should("be.visible");
    cy.get("[data-test='user-settings-email-input']").should("be.visible");
    cy.get("[data-test='user-settings-phoneNumber-input']").should("be.visible");
    cy.get("[data-test='user-settings-submit']").should("be.visible");
  });

  it("pre-fills form with user profile data", () => {
    const updateUserSpy = cy.spy().as("updateUser");

    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserSpy} />);

    cy.get("[data-test='user-settings-firstName-input']").should(
      "have.value",
      userProfile.firstName
    );
    cy.get("[data-test='user-settings-lastName-input']").should("have.value", userProfile.lastName);
    cy.get("[data-test='user-settings-email-input']").should("have.value", userProfile.email);
    cy.get("[data-test='user-settings-phoneNumber-input']").should(
      "have.value",
      userProfile.phoneNumber
    );
  });

  it("displays first name required error when field is cleared", () => {
    const updateUserSpy = cy.spy().as("updateUser");

    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserSpy} />);

    cy.get("[data-test='user-settings-firstName-input']").clear().blur();
    cy.get("#user-settings-firstName-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter a first name");
  });

  it("displays last name required error when field is cleared", () => {
    const updateUserSpy = cy.spy().as("updateUser");

    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserSpy} />);

    cy.get("[data-test='user-settings-lastName-input']").clear().blur();
    cy.get("#user-settings-lastName-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter a last name");
  });

  it("displays email required error when field is cleared", () => {
    const updateUserSpy = cy.spy().as("updateUser");

    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserSpy} />);

    cy.get("[data-test='user-settings-email-input']").clear().blur();
    cy.get("#user-settings-email-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter an email address");
  });

  it("displays invalid email error", () => {
    const updateUserSpy = cy.spy().as("updateUser");

    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserSpy} />);

    cy.get("[data-test='user-settings-email-input']").clear().type("invalid-email").blur();
    cy.get("#user-settings-email-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain a valid email address");
  });

  it("displays phone number required error when field is cleared", () => {
    const updateUserSpy = cy.spy().as("updateUser");

    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserSpy} />);

    cy.get("[data-test='user-settings-phoneNumber-input']").clear().blur();
    cy.get("#user-settings-phoneNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter a phone number");
  });

  it("displays invalid phone number error", () => {
    const updateUserSpy = cy.spy().as("updateUser");

    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserSpy} />);

    cy.get("[data-test='user-settings-phoneNumber-input']").clear().type("abc").blur();
    cy.get("#user-settings-phoneNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Phone number is not valid");
  });

  it("submit button is disabled when form has validation errors", () => {
    const updateUserSpy = cy.spy().as("updateUser");

    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserSpy} />);

    cy.get("[data-test='user-settings-firstName-input']").clear();
    cy.get("[data-test='user-settings-submit']").should("be.disabled");
  });

  it("submit button is enabled when form is valid", () => {
    const updateUserSpy = cy.spy().as("updateUser");

    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserSpy} />);

    cy.get("[data-test='user-settings-submit']").should("not.be.disabled");
  });

  it("calls updateUser with form data on submit", () => {
    const updateUserSpy = cy.spy().as("updateUser");

    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserSpy} />);

    cy.get("[data-test='user-settings-firstName-input']").clear().type("Jane");
    cy.get("[data-test='user-settings-submit']").click();

    cy.get("@updateUser").should("have.been.calledOnce");
  });

  it("allows updating all fields", () => {
    const updateUserSpy = cy.spy().as("updateUser");

    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserSpy} />);

    cy.get("[data-test='user-settings-firstName-input']").clear().type("Jane");
    cy.get("[data-test='user-settings-lastName-input']").clear().type("Smith");
    cy.get("[data-test='user-settings-email-input']").clear().type("jane@example.com");
    cy.get("[data-test='user-settings-phoneNumber-input']").clear().type("555-123-4567");
    cy.get("[data-test='user-settings-submit']").click();

    cy.get("@updateUser").should("have.been.calledOnce");
  });
});
