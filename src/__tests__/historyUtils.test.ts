import { describe, expect, it } from "vitest";
import { history } from "../utils/historyUtils";

describe("historyUtils", () => {
  it("creates a browser history bound to window.location", () => {
    expect(history.location.pathname).toBe(window.location.pathname);
  });

  it("pushes new locations onto the browser history", () => {
    history.push("/signin");

    expect(history.location.pathname).toBe("/signin");
    expect(window.location.pathname).toBe("/signin");
    expect(history.action).toBe("PUSH");
  });

  it("replaces the current location and supports search strings", () => {
    history.replace("/transaction/new?step=2");

    expect(history.action).toBe("REPLACE");
    expect(history.location.pathname).toBe("/transaction/new");
    expect(history.location.search).toBe("?step=2");
  });

  it("notifies listeners on navigation", () => {
    const visited: string[] = [];
    const unlisten = history.listen((location) => visited.push(location.pathname));

    history.push("/notifications");
    history.push("/bankaccounts");
    unlisten();
    history.push("/");

    expect(visited).toEqual(["/notifications", "/bankaccounts"]);
  });
});
