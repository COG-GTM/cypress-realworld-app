import { describe, it, expect } from "vitest";
import { httpClient } from "../asyncUtils";

describe("asyncUtils", () => {
  it("exports an httpClient axios instance", () => {
    expect(httpClient).toBeDefined();
    expect(typeof httpClient.get).toBe("function");
    expect(typeof httpClient.post).toBe("function");
    expect(typeof httpClient.patch).toBe("function");
    expect(typeof httpClient.delete).toBe("function");
  });

  it("httpClient has withCredentials set to true", () => {
    expect(httpClient.defaults.withCredentials).toBe(true);
  });
});
