import TransactionCreateStepOne from "./TransactionCreateStepOne";
import { User } from "../models";

describe("TransactionCreateStepOne", () => {
  const users: User[] = [
    {
      id: "user-1",
      uuid: "uuid-1",
      firstName: "Alice",
      lastName: "Smith",
      username: "alice",
      password: "hashed",
      email: "alice@test.com",
      phoneNumber: "111-111-1111",
      avatar: "https://example.com/alice.svg",
      defaultPrivacyLevel: "public" as any,
      balance: 100000,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: "user-2",
      uuid: "uuid-2",
      firstName: "Bob",
      lastName: "Jones",
      username: "bob",
      password: "hashed",
      email: "bob@test.com",
      phoneNumber: "222-222-2222",
      avatar: "https://example.com/bob.svg",
      defaultPrivacyLevel: "public" as any,
      balance: 50000,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ];

  it("renders the user list", () => {
    const setReceiver = cy.stub();
    const userListSearch = cy.stub();
    cy.mount(
      <TransactionCreateStepOne
        setReceiver={setReceiver}
        userListSearch={userListSearch}
        users={users}
      />
    );

    cy.get("[data-test*=user-list-item]").should("have.length", 2);
  });

  it("renders search form", () => {
    const setReceiver = cy.stub();
    const userListSearch = cy.stub();
    cy.mount(
      <TransactionCreateStepOne
        setReceiver={setReceiver}
        userListSearch={userListSearch}
        users={[]}
      />
    );

    cy.get("[data-test=user-list-search-input]").should("be.visible");
  });
});
