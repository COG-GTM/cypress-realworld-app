import { describe, expect, it } from "vitest";
import { ScheduledPaymentFrequency } from "../models";
import { dollarsToCents, formatScheduleSummary, tomorrowIsoDate } from "../utils/transactionUtils";

describe("Schedule summary helpers", () => {
  it("converts dollar amounts to whole cents", () => {
    expect(dollarsToCents("25")).toBe(2500);
    expect(dollarsToCents("0.29")).toBe(29);
    expect(dollarsToCents(1234.56)).toBe(123456);
  });

  it("returns tomorrow as an ISO date", () => {
    expect(tomorrowIsoDate(new Date(2026, 10, 30, 23, 59))).toBe("2026-12-01");
  });

  it("describes recurring and one-time schedules", () => {
    expect(
      formatScheduleSummary(
        2500,
        "Kristian Bradtke",
        ScheduledPaymentFrequency.monthly,
        "2026-12-01"
      )
    ).toBe("$25.00 to Kristian Bradtke, monthly starting Dec 1");
    expect(
      formatScheduleSummary(
        1050,
        "Kristian Bradtke",
        ScheduledPaymentFrequency.weekly,
        "2026-12-08"
      )
    ).toBe("$10.50 to Kristian Bradtke, weekly starting Dec 8");
    expect(
      formatScheduleSummary(999, "Kristian Bradtke", ScheduledPaymentFrequency.once, "2027-01-15")
    ).toBe("$9.99 to Kristian Bradtke, on Jan 15");
  });
});
