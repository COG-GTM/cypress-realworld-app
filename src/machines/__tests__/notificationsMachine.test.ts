import { describe, it, expect, vi, beforeEach } from "vitest";
import { interpret } from "xstate";

vi.mock("../../utils/asyncUtils", () => ({
  httpClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("../../utils/portUtils", () => ({
  backendPort: "3001",
}));

import { notificationsMachine } from "../notificationsMachine";
import { httpClient } from "../../utils/asyncUtils";

describe("notificationsMachine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start in idle state", () => {
    const service = interpret(notificationsMachine).start();
    expect(service.state.value).toBe("idle");
    service.stop();
  });

  it("should transition to loading on FETCH", () => {
    const service = interpret(notificationsMachine).start();
    service.send("FETCH");
    expect(service.state.value).toBe("loading");
    service.stop();
  });

  it("should transition to success.withData on successful fetch with data", () => {
    const mockData = {
      results: [{ id: "n1", message: "Test notification" }],
      pageData: { page: 1, limit: 10 },
    };
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockData });

    return new Promise<void>((resolve) => {
      const service = interpret(notificationsMachine).onTransition((state) => {
        if (state.matches("success.withData")) {
          expect(state.context.results).toEqual(mockData.results);
          service.stop();
          resolve();
        }
      });

      service.start();
      service.send("FETCH");
    });
  });

  it("should transition to success.withoutData on successful fetch with empty data", () => {
    const mockData = {
      results: [],
      pageData: { page: 1, limit: 10 },
    };
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockData });

    return new Promise<void>((resolve) => {
      const service = interpret(notificationsMachine).onTransition((state) => {
        if (state.matches("success.withoutData")) {
          expect(state.context.results).toEqual([]);
          service.stop();
          resolve();
        }
      });

      service.start();
      service.send("FETCH");
    });
  });

  it("should transition to failure on fetch error", () => {
    vi.mocked(httpClient.get).mockRejectedValueOnce(new Error("Network error"));

    return new Promise<void>((resolve) => {
      const service = interpret(notificationsMachine).onTransition((state) => {
        if (state.matches("failure")) {
          service.stop();
          resolve();
        }
      });

      service.start();
      service.send("FETCH");
    });
  });

  it("should transition to updating on UPDATE from idle", () => {
    const service = interpret(notificationsMachine).start();
    service.send("UPDATE");
    expect(service.state.value).toBe("updating");
    service.stop();
  });

  it("should transition back to loading after successful update", () => {
    vi.mocked(httpClient.patch).mockResolvedValueOnce({ data: {} });

    return new Promise<void>((resolve) => {
      let passedThroughUpdating = false;

      const service = interpret(notificationsMachine).onTransition((state) => {
        if (state.matches("updating")) {
          passedThroughUpdating = true;
        }
        if (passedThroughUpdating && state.matches("loading")) {
          service.stop();
          resolve();
        }
      });

      service.start();
      service.send({ type: "UPDATE", id: "n1", isRead: true } as any);
    });
  });
});
