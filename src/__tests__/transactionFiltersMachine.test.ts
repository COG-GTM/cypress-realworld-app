import { describe, expect, it } from "vitest";
import { interpret } from "xstate";
import { transactionFiltersMachine } from "../machines/transactionFiltersMachine";

const dateRange = {
  dateRangeStart: "2019-12-01T06:00:00.000Z",
  dateRangeEnd: "2019-12-05T05:59:59.999Z",
};

describe("transactionFiltersMachine", () => {
  it("starts with no date or amount filters", () => {
    const service = interpret(transactionFiltersMachine).start();

    expect(service.state.value).toEqual({ dateRange: "none", amountRange: "none" });
    expect(service.state.context).toEqual({
      dateRangeStart: undefined,
      dateRangeEnd: undefined,
      amountMin: undefined,
      amountMax: undefined,
    });
    service.stop();
  });

  it("applies and resets a date range filter", () => {
    const service = interpret(transactionFiltersMachine).start();

    service.send({ type: "DATE_FILTER", ...dateRange });
    expect(service.state.matches({ dateRange: "filter" })).toBe(true);
    expect(service.state.context).toMatchObject(dateRange);

    service.send("DATE_RESET");
    expect(service.state.matches({ dateRange: "none" })).toBe(true);
    expect(service.state.context).toMatchObject({
      dateRangeStart: undefined,
      dateRangeEnd: undefined,
    });
    service.stop();
  });

  it("applies, updates and resets an amount range filter", () => {
    const service = interpret(transactionFiltersMachine).start();

    service.send({ type: "AMOUNT_FILTER", amountMin: "200", amountMax: "800" });
    expect(service.state.matches({ amountRange: "filter" })).toBe(true);
    expect(service.state.context).toMatchObject({ amountMin: "200", amountMax: "800" });

    service.send({ type: "AMOUNT_FILTER", amountMin: "0", amountMax: "100" });
    expect(service.state.matches({ amountRange: "filter" })).toBe(true);
    expect(service.state.context).toMatchObject({ amountMin: "0", amountMax: "100" });

    service.send("AMOUNT_RESET");
    expect(service.state.matches({ amountRange: "none" })).toBe(true);
    expect(service.state.context).toMatchObject({ amountMin: undefined, amountMax: undefined });
    service.stop();
  });

  it("keeps date and amount filters independent", () => {
    const service = interpret(transactionFiltersMachine).start();

    service.send({ type: "DATE_FILTER", ...dateRange });
    service.send({ type: "AMOUNT_FILTER", amountMin: "200", amountMax: "800" });
    expect(service.state.value).toEqual({ dateRange: "filter", amountRange: "filter" });

    service.send("AMOUNT_RESET");
    expect(service.state.value).toEqual({ dateRange: "filter", amountRange: "none" });
    expect(service.state.context).toMatchObject(dateRange);
    service.stop();
  });

  it("ignores reset events when no filter is applied", () => {
    const service = interpret(transactionFiltersMachine).start();

    expect(service.send("DATE_RESET").changed).toBe(false);
    expect(service.send("AMOUNT_RESET").changed).toBe(false);
    expect(service.state.value).toEqual({ dateRange: "none", amountRange: "none" });
    service.stop();
  });

  it("ignores a second DATE_FILTER until the date range is reset", () => {
    const service = interpret(transactionFiltersMachine).start();

    service.send({ type: "DATE_FILTER", ...dateRange });
    service.send({
      type: "DATE_FILTER",
      dateRangeStart: "2020-01-01T00:00:00.000Z",
      dateRangeEnd: "2020-01-02T00:00:00.000Z",
    });

    expect(service.state.context).toMatchObject(dateRange);
    service.stop();
  });
});
