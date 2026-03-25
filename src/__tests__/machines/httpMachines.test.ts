import { describe, expect, it, vi } from "vitest";

// Mock httpClient to avoid actual HTTP calls
vi.mock("../../utils/asyncUtils", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../utils/portUtils", () => ({
  backendPort: 3001,
}));

import { bankAccountsMachine } from "../../machines/bankAccountsMachine";
import { notificationsMachine } from "../../machines/notificationsMachine";
import { personalTransactionsMachine } from "../../machines/personalTransactionsMachine";
import { publicTransactionsMachine } from "../../machines/publicTransactionsMachine";
import { contactsTransactionsMachine } from "../../machines/contactsTransactionsMachine";
import { transactionDetailMachine } from "../../machines/transactionDetailMachine";
import { usersMachine } from "../../machines/usersMachine";

describe("HTTP-based machines", () => {
  describe("bankAccountsMachine", () => {
    it("should be defined", () => {
      expect(bankAccountsMachine).toBeDefined();
    });

    it("should have id bankAccounts", () => {
      expect(bankAccountsMachine.id).toBe("bankAccounts");
    });

    it("should start in idle state", () => {
      const initialState = bankAccountsMachine.initialState;
      expect(initialState.value).toBe("idle");
    });

    it("should transition from idle to loading on FETCH", () => {
      const nextState = bankAccountsMachine.transition("idle", "FETCH");
      expect(nextState.value).toBe("loading");
    });

    it("should transition from idle to creating on CREATE", () => {
      const nextState = bankAccountsMachine.transition("idle", "CREATE");
      expect(nextState.value).toBe("creating");
    });

    it("should transition from idle to deleting on DELETE", () => {
      const nextState = bankAccountsMachine.transition("idle", "DELETE");
      expect(nextState.value).toBe("deleting");
    });

    it("should have fetchData service configured", () => {
      expect(bankAccountsMachine.options.services).toBeDefined();
      expect(bankAccountsMachine.options.services!.fetchData).toBeDefined();
    });

    it("should have deleteData service configured", () => {
      expect(bankAccountsMachine.options.services!.deleteData).toBeDefined();
    });

    it("should have createData service configured", () => {
      expect(bankAccountsMachine.options.services!.createData).toBeDefined();
    });
  });

  describe("notificationsMachine", () => {
    it("should be defined", () => {
      expect(notificationsMachine).toBeDefined();
    });

    it("should have id notifications", () => {
      expect(notificationsMachine.id).toBe("notifications");
    });

    it("should start in idle state", () => {
      const initialState = notificationsMachine.initialState;
      expect(initialState.value).toBe("idle");
    });

    it("should transition from idle to loading on FETCH", () => {
      const nextState = notificationsMachine.transition("idle", "FETCH");
      expect(nextState.value).toBe("loading");
    });

    it("should transition from idle to updating on UPDATE", () => {
      const nextState = notificationsMachine.transition("idle", "UPDATE");
      expect(nextState.value).toBe("updating");
    });

    it("should have fetchData service configured", () => {
      expect(notificationsMachine.options.services!.fetchData).toBeDefined();
    });

    it("should have updateData service configured", () => {
      expect(notificationsMachine.options.services!.updateData).toBeDefined();
    });
  });

  describe("personalTransactionsMachine", () => {
    it("should be defined", () => {
      expect(personalTransactionsMachine).toBeDefined();
    });

    it("should have id personalTransactions", () => {
      expect(personalTransactionsMachine.id).toBe("personalTransactions");
    });

    it("should start in idle state", () => {
      expect(personalTransactionsMachine.initialState.value).toBe("idle");
    });

    it("should transition from idle to loading on FETCH", () => {
      const nextState = personalTransactionsMachine.transition("idle", "FETCH");
      expect(nextState.value).toBe("loading");
    });

    it("should have fetchData service configured", () => {
      expect(personalTransactionsMachine.options.services!.fetchData).toBeDefined();
    });
  });

  describe("publicTransactionsMachine", () => {
    it("should be defined", () => {
      expect(publicTransactionsMachine).toBeDefined();
    });

    it("should have id publicTransactions", () => {
      expect(publicTransactionsMachine.id).toBe("publicTransactions");
    });

    it("should start in idle state", () => {
      expect(publicTransactionsMachine.initialState.value).toBe("idle");
    });

    it("should transition from idle to loading on FETCH", () => {
      const nextState = publicTransactionsMachine.transition("idle", "FETCH");
      expect(nextState.value).toBe("loading");
    });

    it("should have fetchData service configured", () => {
      expect(publicTransactionsMachine.options.services!.fetchData).toBeDefined();
    });
  });

  describe("contactsTransactionsMachine", () => {
    it("should be defined", () => {
      expect(contactsTransactionsMachine).toBeDefined();
    });

    it("should have id contactsTransactions", () => {
      expect(contactsTransactionsMachine.id).toBe("contactsTransactions");
    });

    it("should start in idle state", () => {
      expect(contactsTransactionsMachine.initialState.value).toBe("idle");
    });

    it("should transition from idle to loading on FETCH", () => {
      const nextState = contactsTransactionsMachine.transition("idle", "FETCH");
      expect(nextState.value).toBe("loading");
    });

    it("should have fetchData service configured", () => {
      expect(contactsTransactionsMachine.options.services!.fetchData).toBeDefined();
    });
  });

  describe("transactionDetailMachine", () => {
    it("should be defined", () => {
      expect(transactionDetailMachine).toBeDefined();
    });

    it("should have id transactionData", () => {
      expect(transactionDetailMachine.id).toBe("transactionData");
    });

    it("should start in idle state", () => {
      expect(transactionDetailMachine.initialState.value).toBe("idle");
    });

    it("should transition from idle to loading on FETCH", () => {
      const nextState = transactionDetailMachine.transition("idle", "FETCH");
      expect(nextState.value).toBe("loading");
    });

    it("should transition from idle to creating on CREATE", () => {
      const nextState = transactionDetailMachine.transition("idle", "CREATE");
      expect(nextState.value).toBe("creating");
    });

    it("should transition from idle to updating on UPDATE", () => {
      const nextState = transactionDetailMachine.transition("idle", "UPDATE");
      expect(nextState.value).toBe("updating");
    });

    it("should have fetchData service configured", () => {
      expect(transactionDetailMachine.options.services!.fetchData).toBeDefined();
    });

    it("should have createData service configured", () => {
      expect(transactionDetailMachine.options.services!.createData).toBeDefined();
    });

    it("should have updateData service configured", () => {
      expect(transactionDetailMachine.options.services!.updateData).toBeDefined();
    });
  });

  describe("usersMachine", () => {
    it("should be defined", () => {
      expect(usersMachine).toBeDefined();
    });

    it("should have id users", () => {
      expect(usersMachine.id).toBe("users");
    });

    it("should start in idle state", () => {
      expect(usersMachine.initialState.value).toBe("idle");
    });

    it("should transition from idle to loading on FETCH", () => {
      const nextState = usersMachine.transition("idle", "FETCH");
      expect(nextState.value).toBe("loading");
    });

    it("should have fetchData service configured", () => {
      expect(usersMachine.options.services!.fetchData).toBeDefined();
    });
  });
});
