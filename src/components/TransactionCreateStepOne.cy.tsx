import TransactionCreateStepOne from "./TransactionCreateStepOne";
import { User } from "../models";

const users: User[] = [
  {
    id: "user1",
    uuid: "uuid-1",
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    password: "hashed",
    email: "john@example.com",
    phoneNumber: "555-0001",
    avatar: "https://example.com/avatar1.png",
    defaultPrivacyLevel: "public",
    balance: 10000,
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: "user2",
    uuid: "uuid-2",
    firstName: "Jane",
    lastName: "Smith",
    username: "janesmith",
    password: "hashed",
    email: "jane@example.com",
    phoneNumber: "555-0002",
    avatar: "https://example.com/avatar2.png",
    defaultPrivacyLevel: "public",
    balance: 20000,
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
];

describe("TransactionCreateStepOne", () => {
  it("renders user search and user list", () => {
    const setReceiver = cy.stub().as("setReceiver");
    const userListSearch = cy.stub().as("userListSearch");

    cy.mount(
      <TransactionCreateStepOne
        setReceiver={setReceiver}
        userListSearch={userListSearch}
        users={users}
      />
    );

    cy.get("[data-test=user-list-search-input]").should("exist");
    cy.get("[data-test=users-list]").should("exist");
    cy.get(`[data-test=user-list-item-${users[0].id}]`).should("exist");
    cy.get(`[data-test=user-list-item-${users[1].id}]`).should("exist");
  });

  it("calls setReceiver when a user is clicked", () => {
    const setReceiver = cy.stub().as("setReceiver");

    cy.mount(
      <TransactionCreateStepOne
        setReceiver={setReceiver}
        userListSearch={cy.stub()}
        users={users}
      />
    );

    cy.get(`[data-test=user-list-item-${users[0].id}]`).click();
    cy.get("@setReceiver").should("have.been.calledOnce");
  });

  it("calls userListSearch on input change", () => {
    const userListSearch = cy.stub().as("userListSearch");

    cy.mount(
      <TransactionCreateStepOne
        setReceiver={cy.stub()}
        userListSearch={userListSearch}
        users={users}
      />
    );

    cy.get("[data-test=user-list-search-input]").type("Jane");
    cy.get("@userListSearch").should("have.been.called");
  });
});
