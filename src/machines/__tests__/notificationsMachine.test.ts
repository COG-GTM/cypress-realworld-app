import { describe, expect, it, beforeEach, vi } from "vitest";
import { interpret, InterpreterFrom } from "xstate";

vi.mock("../../utils/asyncUtils", () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("../../utils/portUtils", () => ({
  backendPort: 3001,
}));

import { notificationsMachine } from "../notificationsMachine";
import { httpClient } from "../../utils/asyncUtils";

describe("notificationsMachine", () => {
  let service: InterpreterFrom<typeof notificationsMachine>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = interpret(notificationsMachine).start();
  });

  it("should start in the idle state", () => {
    expect(service.state.matches("idle")).toBe(true);
  });

  it("should have initial context with empty results and pageData", () => {
    expect(service.state.context.results).toEqual([]);
    expect(service.state.context.pageData).toEqual({});
    expect(service.state.context.message).toBeUndefined();
  });

  it("should transition to loading on FETCH event", () => {
    service.send("FETCH");
    expect(service.state.matches("loading")).toBe(true);
  });

  it("should transition to success with data on successful fetch", async () => {
    const mockNotifications = {
      results: [
        { id: "1", message: "Notification 1", isRead: false },
        { id: "2", message: "Notification 2", isRead: true },
      ],
      pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
    };

    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockNotifications });

    service.send("FETCH");
    expect(service.state.matches("loading")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches({ success: "withData" })).toBe(true);
    });

    expect(service.state.context.results).toEqual(mockNotifications.results);
    expect(service.state.context.pageData).toEqual(mockNotifications.pageData);
  });

  it("should transition to success.withoutData when fetch returns empty results", async () => {
    const emptyResponse = {
      results: [],
      pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 0 },
    };

    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: emptyResponse });

    service.send("FETCH");

    await vi.waitFor(() => {
      expect(service.state.matches({ success: "withoutData" })).toBe(true);
    });

    expect(service.state.context.results).toEqual([]);
  });

  it("should transition to failure on fetch error", async () => {
    vi.mocked(httpClient.get).mockRejectedValueOnce(new Error("Network error"));

    service.send("FETCH");
    expect(service.state.matches("loading")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches("failure")).toBe(true);
    });
  });

  it("should transition to updating on UPDATE event from idle", () => {
    service.send("UPDATE");
    expect(service.state.matches("updating")).toBe(true);
  });

  it("should transition through loading after successful update", async () => {
    vi.mocked(httpClient.patch).mockResolvedValueOnce({
      data: { id: "1", isRead: true },
    });

    const fetchResponse = {
      results: [{ id: "1", isRead: true }],
      pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
    };
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: fetchResponse });

    service.send("UPDATE");
    expect(service.state.matches("updating")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches({ success: "withData" })).toBe(true);
    });
  });

  it("should transition to failure on update error", async () => {
    vi.mocked(httpClient.patch).mockRejectedValueOnce(new Error("Update failed"));

    service.send("UPDATE");
    expect(service.state.matches("updating")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches("failure")).toBe(true);
    });
  });

  it("should allow FETCH from failure state to retry", async () => {
    vi.mocked(httpClient.get).mockRejectedValueOnce(new Error("Network error"));

    service.send("FETCH");

    await vi.waitFor(() => {
      expect(service.state.matches("failure")).toBe(true);
    });

    const retryData = {
      results: [{ id: "1", message: "Notification" }],
      pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
    };
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: retryData });

    service.send("FETCH");
    expect(service.state.matches("loading")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches({ success: "withData" })).toBe(true);
    });

    expect(service.state.context.results).toEqual(retryData.results);
  });

  it("should allow FETCH from success state", async () => {
    const firstResponse = {
      results: [{ id: "1", message: "First" }],
      pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
    };
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: firstResponse });

    service.send("FETCH");

    await vi.waitFor(() => {
      expect(service.state.matches({ success: "withData" })).toBe(true);
    });

    const secondResponse = {
      results: [{ id: "1", message: "First" }, { id: "2", message: "Second" }],
      pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
    };
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: secondResponse });

    service.send("FETCH");
    expect(service.state.matches("loading")).toBe(true);

    await vi.waitFor(() => {
      expect(service.state.matches({ success: "withData" })).toBe(true);
    });

    expect(service.state.context.results).toEqual(secondResponse.results);
  });

  it("should transition to creating on CREATE event", () => {
    service.send("CREATE");
    expect(service.state.matches("creating")).toBe(true);
  });

  it("should transition to deleting on DELETE event", () => {
    service.send("DELETE");
    expect(service.state.matches("deleting")).toBe(true);
  });

  it("should allow UPDATE from success state", async () => {
    const fetchResponse = {
      results: [{ id: "1", message: "Notification", isRead: false }],
      pageData: { page: 1, limit: 10, hasNextPages: false, totalPages: 1 },
    };
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: fetchResponse });

    service.send("FETCH");

    await vi.waitFor(() => {
      expect(service.state.matches({ success: "withData" })).toBe(true);
    });

    service.send("UPDATE");
    expect(service.state.matches("updating")).toBe(true);
  });
});
