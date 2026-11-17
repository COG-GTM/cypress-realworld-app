import { describe, expect, it } from "vitest";
import {
  escapeCsvField,
  toCsvRow,
  transactionToCsvRow,
  transactionCsvHeaderRow,
  getTransactionsCsvFilename,
} from "../utils/csvUtils";
import { TransactionResponseItem } from "../models";

describe("CSV utils", () => {
  it("leaves plain fields untouched", () => {
    expect(escapeCsvField("Coffee")).toBe("Coffee");
    expect(escapeCsvField(42)).toBe("42");
    expect(escapeCsvField(undefined)).toBe("");
  });

  it("quotes fields containing commas, quotes and newlines", () => {
    expect(escapeCsvField("Rent, March")).toBe('"Rent, March"');
    expect(escapeCsvField('The "big" dinner')).toBe('"The ""big"" dinner"');
    expect(escapeCsvField("line1\nline2")).toBe('"line1\nline2"');
  });

  it("neutralizes spreadsheet formulas", () => {
    expect(escapeCsvField("=SUM(A1:A2)")).toBe("'=SUM(A1:A2)");
    expect(escapeCsvField("@cmd")).toBe("'@cmd");
  });

  it("builds the header and a transaction row", () => {
    expect(transactionCsvHeaderRow()).toBe("date,description,sender,receiver,amount,status\r\n");

    const transaction = {
      createdAt: "2026-03-04T05:06:07.000Z",
      description: 'Pizza, "extra" cheese',
      senderName: "Edgar Johns",
      receiverName: "Kaylin Homenick",
      amount: 12345,
      status: "complete",
    } as unknown as TransactionResponseItem;

    expect(transactionToCsvRow(transaction)).toBe(
      '2026-03-04T05:06:07.000Z,"Pizza, ""extra"" cheese",Edgar Johns,Kaylin Homenick,123.45,complete\r\n'
    );
    expect(toCsvRow(["a", "b"])).toBe("a,b\r\n");
  });

  it("puts the date range in the filename", () => {
    expect(
      getTransactionsCsvFilename({
        dateRangeStart: "2026-01-01T00:00:00.000Z",
        dateRangeEnd: "2026-01-31T23:59:59.999Z",
      })
    ).toBe("transactions_2026-01-01_to_2026-01-31.csv");
    expect(getTransactionsCsvFilename()).toBe("transactions_all-dates.csv");
    expect(getTransactionsCsvFilename({ dateRangeStart: "nope", dateRangeEnd: "nope" })).toBe(
      "transactions_all-dates.csv"
    );
  });
});
