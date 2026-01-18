import { interpret } from "xstate";
import { MemoryRouter, Route } from "react-router-dom";
import BankAccountsContainer from "./BankAccountsContainer";
import { authMachine } from "../machines/authMachine";
import { bankAccountsMachine } from "../machines/bankAccountsMachine";
import { User, BankAccount } from "../models";

describe("BankAccountsContainer", () => {
  let authService: ReturnType<typeof interpret>;
  let bankAccountsService: ReturnType<typeof interpret>;

  const mockUser: User = {
    id: "test-user-id",
    uuid: "test-uuid",
    firstName: "Test",
    lastName: "User",
    username: "testuser",
    password: "password",
    email: "test@example.com",
    phoneNumber: "555-555-5555",
    avatar: "https://example.com/avatar.png",
    defaultPrivacyLevel: "public",
    balance: 10000,
    createdAt: new Date("2023-01-01"),
    modifiedAt: new Date("2023-01-01"),
  };

  const mockBankAccounts: BankAccount[] = [
    {
      id: "bank-1",
      uuid: "uuid-1",
      userId: "test-user-id",
      bankName: "First National Bank",
      accountNumber: "123456789",
      routingNumber: "987654321",
      isDeleted: false,
      createdAt: new Date("2023-01-01"),
      modifiedAt: new Date("2023-01-01"),
    },
    {
      id: "bank-2",
      uuid: "uuid-2",
      userId: "test-user-id",
      bankName: "Second Bank",
      accountNumber: "987654321",
      routingNumber: "123456789",
      isDeleted: false,
      createdAt: new Date("2023-01-02"),
      modifiedAt: new Date("2023-01-02"),
    },
  ];

  beforeEach(() => {
    authService = interpret(
      authMachine.withContext({
        user: mockUser,
        message: undefined,
      })
    );
    authService.start();

    cy.intercept("POST", "http://localhost:3001/graphql", (req) => {
      const { body } = req;

      if (body.operationName === "ListBankAccount") {
        req.alias = "gqlListBankAccountQuery";
        req.reply({
          data: {
            listBankAccount: mockBankAccounts,
          },
        });
      }

      if (body.operationName === "CreateBankAccount") {
        req.alias = "gqlCreateBankAccountMutation";
        req.reply({
          data: {
            createBankAccount: {
              id: "new-bank-id",
              uuid: "new-uuid",
              userId: "test-user-id",
              bankName: body.variables.bankName,
              accountNumber: body.variables.accountNumber,
              routingNumber: body.variables.routingNumber,
              isDeleted: false,
              createdAt: new Date().toISOString(),
            },
          },
        });
      }

      if (body.operationName === "DeleteBankAccount") {
        req.alias = "gqlDeleteBankAccountMutation";
        req.reply({
          data: {
            deleteBankAccount: true,
          },
        });
      }
    });

    bankAccountsService = interpret(bankAccountsMachine);
    bankAccountsService.start();
  });

  afterEach(() => {
    authService.stop();
    bankAccountsService.stop();
  });

  describe("Bank Accounts List View", () => {
    it("renders the bank accounts list view", () => {
      cy.mount(
        <MemoryRouter initialEntries={["/bankaccounts"]}>
          <Route path="/bankaccounts">
            <BankAccountsContainer
              authService={authService as any}
              bankAccountsService={bankAccountsService as any}
            />
          </Route>
        </MemoryRouter>
      );

      cy.wait("@gqlListBankAccountQuery");
      cy.contains("Bank Accounts").should("be.visible");
      cy.get("[data-test=bankaccount-new]").should("be.visible");
    });

    it("displays the Create button", () => {
      cy.mount(
        <MemoryRouter initialEntries={["/bankaccounts"]}>
          <Route path="/bankaccounts">
            <BankAccountsContainer
              authService={authService as any}
              bankAccountsService={bankAccountsService as any}
            />
          </Route>
        </MemoryRouter>
      );

      cy.wait("@gqlListBankAccountQuery");
      cy.get("[data-test=bankaccount-new]").should("contain", "Create");
    });

    it("fetches and displays bank accounts from GraphQL", () => {
      cy.mount(
        <MemoryRouter initialEntries={["/bankaccounts"]}>
          <Route path="/bankaccounts">
            <BankAccountsContainer
              authService={authService as any}
              bankAccountsService={bankAccountsService as any}
            />
          </Route>
        </MemoryRouter>
      );

      cy.wait("@gqlListBankAccountQuery");
      cy.get("[data-test=bankaccount-list]").should("exist");
      cy.get("[data-test^=bankaccount-list-item]").should("have.length", 2);
    });

    it("displays bank account names in the list", () => {
      cy.mount(
        <MemoryRouter initialEntries={["/bankaccounts"]}>
          <Route path="/bankaccounts">
            <BankAccountsContainer
              authService={authService as any}
              bankAccountsService={bankAccountsService as any}
            />
          </Route>
        </MemoryRouter>
      );

      cy.wait("@gqlListBankAccountQuery");
      cy.contains("First National Bank").should("be.visible");
      cy.contains("Second Bank").should("be.visible");
    });
  });

  describe("Create Button Navigation", () => {
    it("Create button links to /bankaccounts/new", () => {
      cy.mount(
        <MemoryRouter initialEntries={["/bankaccounts"]}>
          <Route path="/bankaccounts">
            <BankAccountsContainer
              authService={authService as any}
              bankAccountsService={bankAccountsService as any}
            />
          </Route>
        </MemoryRouter>
      );

      cy.wait("@gqlListBankAccountQuery");
      cy.get("[data-test=bankaccount-new]").should("have.attr", "href", "/bankaccounts/new");
    });
  });

  describe("Delete Bank Account", () => {
    it("calls DeleteBankAccount mutation when delete button is clicked", () => {
      cy.mount(
        <MemoryRouter initialEntries={["/bankaccounts"]}>
          <Route path="/bankaccounts">
            <BankAccountsContainer
              authService={authService as any}
              bankAccountsService={bankAccountsService as any}
            />
          </Route>
        </MemoryRouter>
      );

      cy.wait("@gqlListBankAccountQuery");
      cy.get("[data-test=bankaccount-delete]").first().click();

      cy.wait("@gqlDeleteBankAccountMutation").then((interception) => {
        expect(interception.request.body.variables).to.have.property("id");
      });
    });
  });

  describe("Empty State", () => {
    it("displays empty state when no bank accounts exist", () => {
      cy.intercept("POST", "http://localhost:3001/graphql", (req) => {
        const { body } = req;
        if (body.operationName === "ListBankAccount") {
          req.alias = "gqlEmptyListQuery";
          req.reply({
            data: {
              listBankAccount: [],
            },
          });
        }
      });

      cy.mount(
        <MemoryRouter initialEntries={["/bankaccounts"]}>
          <Route path="/bankaccounts">
            <BankAccountsContainer
              authService={authService as any}
              bankAccountsService={bankAccountsService as any}
            />
          </Route>
        </MemoryRouter>
      );

      cy.wait("@gqlEmptyListQuery");
      cy.get("[data-test=empty-list-header]").should("contain", "No Bank Accounts");
    });
  });

  describe("XState Integration", () => {
    it("sends FETCH event to bankAccountsService on mount", () => {
      const fetchSpy = cy.spy().as("fetchSpy");
      const originalSend = bankAccountsService.send.bind(bankAccountsService);
      bankAccountsService.send = (event: any) => {
        if (event === "FETCH" || event.type === "FETCH") {
          fetchSpy();
        }
        return originalSend(event);
      };

      cy.mount(
        <MemoryRouter initialEntries={["/bankaccounts"]}>
          <Route path="/bankaccounts">
            <BankAccountsContainer
              authService={authService as any}
              bankAccountsService={bankAccountsService as any}
            />
          </Route>
        </MemoryRouter>
      );

      cy.get("@fetchSpy").should("have.been.called");
    });
  });
});
