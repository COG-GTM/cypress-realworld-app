import TransactionCreateStepOne from "./TransactionCreateStepOne";
import { User, DefaultPrivacyLevel } from "../models";

const users: User[] = [
  {
    id: "user1",
    uuid: "user1-uuid",
    firstName: "Alice",
    lastName: "Smith",
    username: "alicesmith",
    password: "hashed",
    email: "alice@example.com",
    phoneNumber: "555-0001",
    balance: 50000,
    avatar: "https://example.com/avatar1.png",
    defaultPrivacyLevel: DefaultPrivacyLevel.public,
    createdAt: new Date("2024-01-01"),
    modifiedAt: new Date("2024-01-01"),
  },
  {
    id: "user2",
    uuid: "user2-uuid",
    firstName: "Bob",
    lastName: "Jones",
    username: "bobjones",
    password: "hashed",
    email: "bob@example.com",
    phoneNumber: "555-0002",
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
  });

  it("triggers search on input change", () => {
    const setReceiver = cy.stub();
    const userListSearch = cy.stub();

    cy.mount(
      <TransactionCreateStepOne
        setReceiver={setReceiver}
        userListSearch={userListSearch}
        users={users}
      />
    );

    cy.get("[data-test='user-list-search-input']").type("Alice");
    cy.wrap(userListSearch).should("have.been.called");
  });

  it("renders user list items for selection", () => {
    const setReceiver = cy.stub();
    const userListSearch = cy.stub();

    cy.mount(
      <TransactionCreateStepOne
        setReceiver={setReceiver}
        userListSearch={userListSearch}
        users={users}
      />
    );

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
        expect(setReceiver).to.have.been.called;
      });
  });
});
