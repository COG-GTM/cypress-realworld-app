import { describe, it, expect, vi } from "vitest";
import { interpret } from "xstate";
import { dataMachine } from "../../machines/dataMachine";

const createTestMachine = (serviceOverrides: Record<string, any> = {}) => {
  return dataMachine("test").withConfig({
    services: {
      fetchData: vi.fn().mockResolvedValue({ results: [{ id: 1 }], pageData: { page: 1 } }),
      createData: vi.fn().mockResolvedValue({}),
      updateData: vi.fn().mockResolvedValue({}),
      deleteData: vi.fn().mockResolvedValue({}),
      ...serviceOverrides,
    },
  });
};

describe("dataMachine", () => {
  it("should start in idle state", () => {
    const machine = createTestMachine();
    expect(machine.initialState.value).toBe("idle");
  });

  it("should have empty initial context", () => {
    const machine = createTestMachine();
    const ctx = machine.initialState.context;
    expect(ctx.results).toEqual([]);
    expect(ctx.message).toBeUndefined();
  });

  it("should transition from idle to loading on FETCH", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("idle", "FETCH");
    expect(nextState.value).toBe("loading");
  });

  it("should transition from idle to creating on CREATE", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("idle", "CREATE");
    expect(nextState.value).toBe("creating");
  });

  it("should transition from idle to updating on UPDATE", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("idle", "UPDATE");
    expect(nextState.value).toBe("updating");
  });

  it("should transition from idle to deleting on DELETE", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("idle", "DELETE");
    expect(nextState.value).toBe("deleting");
  });

  it("should transition from failure to loading on FETCH (retry)", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("failure", "FETCH");
    expect(nextState.value).toBe("loading");
  });

  it("should ignore CREATE in failure state", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("failure", "CREATE");
    expect(nextState.value).toBe("failure");
  });

  it("should transition from success to loading on FETCH", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("success", "FETCH");
    expect(nextState.value).toBe("loading");
  });

  it("should transition from success to creating on CREATE", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("success", "CREATE");
    expect(nextState.value).toBe("creating");
  });

  it("should transition from success to updating on UPDATE", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("success", "UPDATE");
    expect(nextState.value).toBe("updating");
  });

  it("should transition from success to deleting on DELETE", () => {
    const machine = createTestMachine();
    const nextState = machine.transition("success", "DELETE");
    expect(nextState.value).toBe("deleting");
  });

  it("should reach success.withData after successful fetch with data", async () => {
    const machine = createTestMachine();
    const state = await new Promise<any>((resolve) => {
      const service = interpret(machine).onTransition((state) => {
        if (state.matches("success.withData")) {
          service.stop();
          resolve(state);
        }
      });
      service.start();
      service.send("FETCH");
    });

    expect(state.context.results).toEqual([{ id: 1 }]);
    expect(state.context.pageData).toEqual({ page: 1 });
  });

  it("should reach success.withoutData after successful fetch with empty results", async () => {
    const machine = createTestMachine({
      fetchData: vi.fn().mockResolvedValue({ results: [], pageData: { page: 1 } }),
    });
    const state = await new Promise<any>((resolve) => {
      const service = interpret(machine).onTransition((state) => {
        if (state.matches("success.withoutData")) {
          service.stop();
          resolve(state);
        }
      });
      service.start();
      service.send("FETCH");
    });

    expect(state.context.results).toEqual([]);
  });

  it("should reach failure state on fetch error", async () => {
    const machine = createTestMachine({
      fetchData: vi.fn().mockRejectedValue({ message: "Network error" }),
    });
    await new Promise<void>((resolve) => {
      const service = interpret(machine).onTransition((state) => {
        if (state.matches("failure")) {
          service.stop();
          resolve();
        }
      });
      service.start();
      service.send("FETCH");
    });
  });

  it("should concatenate results when page > 1", async () => {
    let fetchCount = 0;
    const machine = createTestMachine({
      fetchData: vi.fn().mockImplementation(() => {
        fetchCount++;
        if (fetchCount === 1) {
          return Promise.resolve({ results: [{ id: 1 }], pageData: { page: 1 } });
        }
        return Promise.resolve({ results: [{ id: 2 }], pageData: { page: 2 } });
      }),
    });

    const state = await new Promise<any>((resolve) => {
      let firstFetchDone = false;
      const service = interpret(machine).onTransition((state) => {
        if (state.matches("success.withData") && !firstFetchDone) {
          firstFetchDone = true;
          service.send("FETCH");
        } else if (state.matches("success.withData") && firstFetchDone) {
          service.stop();
          resolve(state);
        }
      });
      service.start();
      service.send("FETCH");
    });

    expect(state.context.results).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("should replace results when page is 1", async () => {
    let fetchCount = 0;
    const machine = createTestMachine({
      fetchData: vi.fn().mockImplementation(() => {
        fetchCount++;
        if (fetchCount === 1) {
          return Promise.resolve({ results: [{ id: 1 }], pageData: { page: 1 } });
        }
        return Promise.resolve({ results: [{ id: 3 }], pageData: { page: 1 } });
      }),
    });

    const state = await new Promise<any>((resolve) => {
      let firstFetchDone = false;
      const service = interpret(machine).onTransition((state) => {
        if (state.matches("success.withData") && !firstFetchDone) {
          firstFetchDone = true;
          service.send("FETCH");
        } else if (state.matches("success.withData") && firstFetchDone) {
          service.stop();
          resolve(state);
        }
      });
      service.start();
      service.send("FETCH");
    });

    expect(state.context.results).toEqual([{ id: 3 }]);
  });

  it("should go back to loading after create succeeds", async () => {
    const machine = createTestMachine();
    await new Promise<void>((resolve) => {
      let wasCreating = false;
      const service = interpret(machine).onTransition((state) => {
        if (state.value === "creating") {
          wasCreating = true;
        }
        if (state.value === "loading" && wasCreating) {
          service.stop();
          resolve();
        }
      });
      service.start();
      service.send("CREATE");
    });
  });

  it("should go back to loading after update succeeds", async () => {
    const machine = createTestMachine();
    await new Promise<void>((resolve) => {
      let wasUpdating = false;
      const service = interpret(machine).onTransition((state) => {
        if (state.value === "updating") {
          wasUpdating = true;
        }
        if (state.value === "loading" && wasUpdating) {
          service.stop();
          resolve();
        }
      });
      service.start();
      service.send("UPDATE");
    });
  });

  it("should go back to loading after delete succeeds", async () => {
    const machine = createTestMachine();
    await new Promise<void>((resolve) => {
      let wasDeleting = false;
      const service = interpret(machine).onTransition((state) => {
        if (state.value === "deleting") {
          wasDeleting = true;
        }
        if (state.value === "loading" && wasDeleting) {
          service.stop();
          resolve();
        }
      });
      service.start();
      service.send("DELETE");
    });
  });

  it("should go to failure when create fails", async () => {
    const machine = createTestMachine({
      createData: vi.fn().mockRejectedValue({ message: "Create failed" }),
    });
    await new Promise<void>((resolve) => {
      const service = interpret(machine).onTransition((state) => {
        if (state.matches("failure")) {
          service.stop();
          resolve();
        }
      });
      service.start();
      service.send("CREATE");
    });
  });

  it("should retry from failure on FETCH", async () => {
    let fetchCount = 0;
    const machine = createTestMachine({
      fetchData: vi.fn().mockImplementation(() => {
        fetchCount++;
        if (fetchCount === 1) {
          return Promise.reject({ message: "Temporary error" });
        }
        return Promise.resolve({ results: [{ id: 1 }], pageData: { page: 1 } });
      }),
    });

    const state = await new Promise<any>((resolve) => {
      let wasInFailure = false;
      const service = interpret(machine).onTransition((state) => {
        if (state.matches("failure")) {
          wasInFailure = true;
          service.send("FETCH");
        }
        if (state.matches("success.withData") && wasInFailure) {
          service.stop();
          resolve(state);
        }
      });
      service.start();
      service.send("FETCH");
    });

    expect(state.context.results).toEqual([{ id: 1 }]);
  });
});
