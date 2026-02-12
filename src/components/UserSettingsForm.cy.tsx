import UserSettingsForm from "./UserSettingsForm";
import { User, DefaultPrivacyLevel } from "../models";

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

  it("renders with existing user data", () => {
    const updateUser = cy.stub();
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUser} />);

    cy.get("[data-test=user-settings-firstName-input]").should("have.value", "Edgar");
    cy.get("[data-test=user-settings-lastName-input]").should("have.value", "Johns");
    cy.get("[data-test=user-settings-email-input]").should("have.value", "Norene39@yahoo.com");
    cy.get("[data-test=user-settings-phoneNumber-input]").should("have.value", "625-316-9882");
  });

  it("has a save button", () => {
    const updateUser = cy.stub();
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUser} />);

    cy.get("[data-test=user-settings-submit]").should("be.visible").and("contain", "Save");
  });

  it("validates required fields", () => {
    const updateUser = cy.stub();
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUser} />);

    cy.get("[data-test=user-settings-firstName-input]").clear();
    cy.get("[data-test=user-settings-lastName-input]").click();
    cy.contains("Enter a first name").should("be.visible");
  });
});
