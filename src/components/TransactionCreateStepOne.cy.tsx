import TransactionCreateStepOne from "./TransactionCreateStepOne";
import { User, DefaultPrivacyLevel } from "../models";

const users: User[] = [
  {
    id: "user1",
    uuid: "uuid-1",
    firstName: "John",
    lastName: "Smith",
    username: "johnsmith",
    password: "hashed",
    email: "john@example.com",
    phoneNumber: "555-1234",
    balance: 50000,
    avatar: "https://example.com/avatar1.png",
    defaultPrivacyLevel: DefaultPrivacyLevel.public,
    createdAt: new Date("2024-01-01"),
    modifiedAt: new Date("2024-01-01"),
  },
  {
    id: "user2",
    uuid: "uuid-2",
    firstName: "Jane",
    lastName: "Doe",
    username: "janedoe",
    password: "hashed",
    email: "jane@example.com",
    phoneNumber: "555-5678",
    balance: 30000,
    avatar: "https://example.com/avatar2.png",
    defaultPrivacyLevel: DefaultPrivacyLevel.public,
    createdAt: new Date("2024-01-01"),
    modifiedAt: new Date("2024-01-01"),
  },
];

describe("TransactionCreateStepOne", () => {
  it("renders user search input and user list", () => {
    const setReceiver = cy.stub();
    const userListSearch = cy.stub();

    cy.mount(
      <TransactionCreateStepOne
        setReceiver={setReceiver}
        userListSearch={userListSearch}
        users={users}
      />
    );

    cy.get("[data-test='user-list-search-input']").should("exist");
    cy.get("[data-test='users-list']").should("exist");
    cy.get("[data-test='user-list-item-user1']").should("exist");
    cy.get("[data-test='user-list-item-user2']").should("exist");
  });

  it("calls setReceiver when a user is clicked", () => {
    const setReceiver = cy.stub();
    const userListSearch = cy.stub();

    cy.mount(
      <TransactionCreateStepOne
        setReceiver={setReceiver}
        userListSearch={userListSearch}
        users={users}
      />
    );

    cy.get("[data-test='user-list-item-user1']")
      .click()
      .then(() => {
        expect(setReceiver).to.have.been.calledWith(users[0]);
      });
  });

  it("calls userListSearch when typing in search", () => {
    const setReceiver = cy.stub();
    const userListSearch = cy.stub();

    cy.mount(
      <TransactionCreateStepOne
        setReceiver={setReceiver}
        userListSearch={userListSearch}
        users={users}
      />
    );

    cy.get("[data-test='user-list-search-input']").type("John");
    cy.then(() => {
      expect(userListSearch).to.have.been.called;
    });
  });

  it("renders empty list when no users", () => {
    cy.mount(
      <TransactionCreateStepOne setReceiver={cy.stub()} userListSearch={cy.stub()} users={[]} />
    );

    cy.get("[data-test='users-list']").should("exist");
    cy.get("[data-test^='user-list-item-']").should("not.exist");
  });
});
