import { DefaultPrivacyLevel, User } from "../models";
import UserSettingsForm from "./UserSettingsForm";

describe("UserSettingsForm", () => {
  it("renders initial user data and submits updates", () => {
    const userProfile: User = {
      id: "t45AiwidW",
      uuid: "6383f84e-b511-44c5-a835-3ece1d781fa8",
      firstName: "Edgar",
      lastName: "Johns",
      username: "Katharina_Bernier",
      password: "hashed",
      email: "Norene39@yahoo.com",
      phoneNumber: "625-316-9882",
      avatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/t45AiwidW.svg",
      defaultPrivacyLevel: DefaultPrivacyLevel.public,
      balance: 168137,
      createdAt: new Date("2019-08-27T23:47:05.637Z"),
      modifiedAt: new Date("2020-05-21T11:02:22.857Z"),
    };

    const updateUser = cy.stub().as("updateUser");

    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUser} />);

    cy.get("[data-test=user-settings-firstName-input]").should("have.value", "Edgar");
    cy.get("[data-test=user-settings-lastName-input]").should("have.value", "Johns");

    cy.get("[data-test=user-settings-firstName-input]").clear().type("New");
    cy.get("[data-test=user-settings-submit]").click();

    cy.get("@updateUser").should("have.been.calledOnce");
    cy.get("@updateUser").should("have.been.calledWithMatch", {
      id: "t45AiwidW",
      firstName: "New",
    });
  });
});
