import { describe, expect, it } from "vitest";
import { dataMachine } from "../../machines/dataMachine";

describe("dataMachine", () => {
  const machine = dataMachine("test");

  it("should create a machine with the given id", () => {
    expect(machine.id).toBe("test");
  });

  it("should have correct initial state", () => {
    const initialState = machine.initialState;
    expect(initialState.value).toBe("idle");
    expect(initialState.context).toEqual({
      pageData: {},
      results: [],
      message: undefined,
    });
  });

  describe("idle state transitions", () => {
    it("should transition from idle to loading on FETCH", () => {
      const nextState = machine.transition("idle", "FETCH");
      expect(nextState.value).toBe("loading");
    });

    it("should transition from idle to creating on CREATE", () => {
      const nextState = machine.transition("idle", "CREATE");
      expect(nextState.value).toBe("creating");
    });

    it("should transition from idle to updating on UPDATE", () => {
      const nextState = machine.transition("idle", "UPDATE");
      expect(nextState.value).toBe("updating");
    });

    it("should transition from idle to deleting on DELETE", () => {
      const nextState = machine.transition("idle", "DELETE");
      expect(nextState.value).toBe("deleting");
    });
  });

  describe("success state", () => {
    it("should transition from success to loading on FETCH", () => {
      const nextState = machine.transition("success", "FETCH");
      expect(nextState.value).toBe("loading");
    });

    it("should transition from success to creating on CREATE", () => {
      const nextState = machine.transition("success", "CREATE");
      expect(nextState.value).toBe("creating");
    });

    it("should transition from success to updating on UPDATE", () => {
      const nextState = machine.transition("success", "UPDATE");
      expect(nextState.value).toBe("updating");
    });

    it("should transition from success to deleting on DELETE", () => {
      const nextState = machine.transition("success", "DELETE");
      expect(nextState.value).toBe("deleting");
    });
  });

  describe("failure state", () => {
    it("should transition from failure to loading on FETCH", () => {
      const nextState = machine.transition("failure", "FETCH");
      expect(nextState.value).toBe("loading");
    });
  });

  describe("guards", () => {
    it("hasData guard returns true when results exist", () => {
      const guard = machine.options.guards!.hasData;
      const result = (guard as Function)(
        { results: [{ id: 1 }], pageData: {}, message: undefined },
        { type: "FETCH" }
      );
      expect(result).toBe(true);
    });

    it("hasData guard returns false when results are empty", () => {
      const guard = machine.options.guards!.hasData;
      const result = (guard as Function)(
        { results: [], pageData: {}, message: undefined },
        { type: "FETCH" }
      );
      expect(result).toBe(false);
    });

    it("hasData guard returns false when results are undefined", () => {
      const guard = machine.options.guards!.hasData;
      const result = (guard as Function)(
        { results: undefined, pageData: {}, message: undefined },
        { type: "FETCH" }
      );
      expect(result).toBe(false);
    });
  });

  describe("multiple machine instances", () => {
    it("should create independent machines with different ids", () => {
      const machine1 = dataMachine("machine1");
      const machine2 = dataMachine("machine2");
      expect(machine1.id).toBe("machine1");
      expect(machine2.id).toBe("machine2");
    });
  });
});
