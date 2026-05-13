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
  let updateUserStub: ReturnType<typeof cy.stub>;

  beforeEach(() => {
    updateUserStub = cy.stub();
  });

  it("renders pre-filled with userProfile values", () => {
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserStub} />);
    cy.get("[data-test=user-settings-firstName-input]").should("have.value", userProfile.firstName);
    cy.get("[data-test=user-settings-lastName-input]").should("have.value", userProfile.lastName);
    cy.get("[data-test=user-settings-email-input]").should("have.value", userProfile.email);
    cy.get("[data-test=user-settings-phoneNumber-input]").should(
      "have.value",
      userProfile.phoneNumber
    );
  });

  it("submit button enabled when form is valid", () => {
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserStub} />);
    cy.get("[data-test=user-settings-submit]").should("not.be.disabled");
  });

  it("invalid email shows error", () => {
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserStub} />);
    cy.get("[data-test=user-settings-email-input]").clear().type("not-an-email").blur();
    cy.contains("Must contain a valid email address").should("be.visible");
  });

  it("invalid phone shows error", () => {
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserStub} />);
    cy.get("[data-test=user-settings-phoneNumber-input]").clear().type("abc").blur();
    cy.contains("Phone number is not valid").should("be.visible");
  });

  it("clearing a required field shows error", () => {
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserStub} />);
    cy.get("[data-test=user-settings-firstName-input]").clear().blur();
    cy.contains("Enter a first name").should("be.visible");
  });

  it("successful submit calls updateUser with correct payload", () => {
    cy.mount(<UserSettingsForm userProfile={userProfile} updateUser={updateUserStub} />);
    cy.get("[data-test=user-settings-firstName-input]").clear().type("Updated");
    cy.get("[data-test=user-settings-submit]").click();
    cy.wrap(updateUserStub).should("be.calledOnce");
    cy.wrap(updateUserStub).should(
      "be.calledWithMatch",
      Cypress.sinon.match({ id: userProfile.id, firstName: "Updated" })
    );
  });
});
