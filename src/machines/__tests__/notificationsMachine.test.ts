import { describe, expect, it, beforeEach } from "vitest";
import { interpret, InterpreterFrom } from "xstate";
import { notificationsMachine } from "../notificationsMachine";

const mockNotifications = [
  {
    id: "notif-1",
    uuid: "uuid-1",
    userId: "user-1",
    transactionId: "txn-1",
    isRead: false,
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  {
    id: "notif-2",
    uuid: "uuid-2",
    userId: "user-1",
    transactionId: "txn-2",
    isRead: true,
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
];

const createTestMachine = (serviceOverrides = {}) =>
  notificationsMachine.withConfig({
    services: {
      fetchData: async () => ({
        results: mockNotifications,
        pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
      }),
      updateData: async () => ({
        results: mockNotifications,
        pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
      }),
      createData: async () => ({}),
      deleteData: async () => ({}),
      ...serviceOverrides,
    },
  });

describe("notificationsMachine", () => {
  let service: InterpreterFrom<typeof notificationsMachine>;

  beforeEach(() => {
    service?.stop();
  });

  it("should start in the idle state", () => {
    const machine = createTestMachine();
    service = interpret(machine).start();
    expect(service.state.matches("idle")).toBe(true);
  });

  it("should have empty initial context", () => {
    const machine = createTestMachine();
    service = interpret(machine).start();
    expect(service.state.context.results).toEqual([]);
    expect(service.state.context.pageData).toEqual({});
    expect(service.state.context.message).toBeUndefined();
  });

  describe("FETCH", () => {
    it("should transition to loading on FETCH event", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("FETCH");
      expect(service.state.matches("loading")).toBe(true);
    });

    it("should transition to success and set results after successful fetch", async () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("FETCH");

      await new Promise<void>((resolve) => {
        service.onTransition((state) => {
          if (state.matches("success")) {
            expect(state.context.results).toEqual(mockNotifications);
            expect(state.context.pageData).toEqual({
              page: 1,
              limit: 10,
              hasNextPages: false,
              totalPages: 1,
            });
            resolve();
          }
        });
      });
    });

    it("should transition to success.withData when results are present", async () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("FETCH");

      await new Promise<void>((resolve) => {
        service.onTransition((state) => {
          if (state.matches({ success: "withData" })) {
            resolve();
          }
        });
      });
    });

    it("should transition to success.withoutData when results are empty", async () => {
      const machine = createTestMachine({
        fetchData: async () => ({
          results: [],
          pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 0 },
        }),
      });
      service = interpret(machine).start();
      service.send("FETCH");

      await new Promise<void>((resolve) => {
        service.onTransition((state) => {
          if (state.matches({ success: "withoutData" })) {
            expect(state.context.results).toEqual([]);
            resolve();
          }
        });
      });
    });

    it("should transition to failure on fetch error", async () => {
      const machine = createTestMachine({
        fetchData: async () => {
          throw new Error("Network error");
        },
      });
      service = interpret(machine).start();
      service.send("FETCH");

      await new Promise<void>((resolve) => {
        service.onTransition((state) => {
          if (state.matches("failure")) {
            resolve();
          }
        });
      });
    });

    it("should allow re-fetching from failure state", async () => {
      let fetchCount = 0;
      const machine = createTestMachine({
        fetchData: async () => {
          fetchCount++;
          if (fetchCount === 1) {
            throw new Error("Temporary error");
          }
          return {
            results: mockNotifications,
            pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
          };
        },
      });
      service = interpret(machine).start();
      service.send("FETCH");

      await new Promise<void>((resolve) => {
        service.onTransition((state) => {
          if (state.matches("failure")) {
            service.send("FETCH");
          }
          if (state.matches("success")) {
            expect(state.context.results).toEqual(mockNotifications);
            resolve();
          }
        });
      });
    });
  });

  describe("UPDATE", () => {
    it("should transition to updating on UPDATE event from idle", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("UPDATE");
      expect(service.state.matches("updating")).toBe(true);
    });

    it("should transition from updating to loading after successful update", async () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("UPDATE");

      await new Promise<void>((resolve) => {
        service.onTransition((state) => {
          if (state.matches("loading") && state.history?.matches("updating")) {
            resolve();
          }
        });
      });
    });

    it("should transition to failure on update error", async () => {
      const machine = createTestMachine({
        updateData: async () => {
          throw new Error("Update failed");
        },
      });
      service = interpret(machine).start();
      service.send("UPDATE");

      await new Promise<void>((resolve) => {
        service.onTransition((state) => {
          if (state.matches("failure")) {
            resolve();
          }
        });
      });
    });
  });

  describe("CREATE", () => {
    it("should transition to creating on CREATE event from idle", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("CREATE");
      expect(service.state.matches("creating")).toBe(true);
    });
  });

  describe("DELETE", () => {
    it("should transition to deleting on DELETE event from idle", () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("DELETE");
      expect(service.state.matches("deleting")).toBe(true);
    });
  });

  describe("re-fetch from success", () => {
    it("should allow FETCH from success state", async () => {
      const machine = createTestMachine();
      service = interpret(machine).start();
      service.send("FETCH");

      await new Promise<void>((resolve) => {
        let successCount = 0;
        service.onTransition((state) => {
          if (state.matches("success")) {
            successCount++;
            if (successCount === 1) {
              service.send("FETCH");
            }
            if (successCount === 2) {
              resolve();
            }
          }
        });
      });
    });
  });
});
