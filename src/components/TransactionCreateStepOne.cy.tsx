import TransactionCreateStepOne from "./TransactionCreateStepOne";
import { User, DefaultPrivacyLevel } from "../models";

const users: User[] = [
  {
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
  },
  {
    id: "qywYp6hS0U",
    uuid: "b5e3e29d-1f97-4ed7-a7ae-e1b7e1e4f536",
    firstName: "Devon",
    lastName: "Becker",
    username: "Tavares_Barrows",
    password: "$2a$10$5PXHGtcsckWtAprT5/JmluhR13f16BL8SIGhvAKNP.Dhxkt69FfzW",
    email: "Aniya_Bernier@gmail.com",
    phoneNumber: "556-210-9052",
    avatar: "https://cypress-realworld-app-svgs.s3.amazonaws.com/qywYp6hS0U.svg",
    defaultPrivacyLevel: DefaultPrivacyLevel.public,
    balance: 120000,
    createdAt: new Date("2019-08-27T23:47:05.637Z"),
    modifiedAt: new Date("2020-05-21T11:02:22.857Z"),
  },
];

describe("TransactionCreateStepOne", () => {
  let setReceiverStub: ReturnType<typeof cy.stub>;
  let userListSearchStub: ReturnType<typeof cy.stub>;

  beforeEach(() => {
    setReceiverStub = cy.stub();
    userListSearchStub = cy.stub();
  });

  it("renders search form and user list", () => {
    cy.mount(
      <TransactionCreateStepOne
        setReceiver={setReceiverStub}
        userListSearch={userListSearchStub}
        users={users}
      />
    );
    cy.get("[data-test=users-list]").should("exist");
    cy.get("[data-test=users-list]").find("li").should("have.length", 2);
  });

  it("empty users array renders empty list", () => {
    cy.mount(
      <TransactionCreateStepOne
        setReceiver={setReceiverStub}
        userListSearch={userListSearchStub}
        users={[]}
      />
    );
    cy.get("[data-test=users-list]").find("li").should("have.length", 0);
  });

  it("clicking a user calls setReceiver", () => {
    cy.mount(
      <TransactionCreateStepOne
        setReceiver={setReceiverStub}
        userListSearch={userListSearchStub}
        users={users}
      />
    );
    cy.get(`[data-test=user-list-item-${users[0].id}]`).click();
    cy.wrap(setReceiverStub).should("be.calledOnce");
    cy.wrap(setReceiverStub).should("be.calledWithMatch", Cypress.sinon.match({ id: users[0].id }));
  });
});
