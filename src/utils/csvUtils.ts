import { TransactionDateRangePayload, TransactionResponseItem } from "../models";

export const transactionCsvColumns = [
  "date",
  "description",
  "sender",
  "receiver",
  "amount",
  "status",
] as const;

const csvFormulaPrefix = /^[=+\-@\t\r]/;
const csvSpecialChars = /[",\r\n]/;

export const escapeCsvField = (value: unknown): string => {
  let field = value === undefined || value === null ? "" : String(value);

  // Neutralize spreadsheet formula injection
  if (csvFormulaPrefix.test(field)) {
    field = `'${field}`;
  }

  return csvSpecialChars.test(field) ? `"${field.replace(/"/g, '""')}"` : field;
};

export const toCsvRow = (fields: unknown[]): string =>
  `${fields.map(escapeCsvField).join(",")}\r\n`;

export const formatCsvAmount = (amountInCents: number) => (amountInCents / 100).toFixed(2);

export const transactionToCsvRow = (transaction: TransactionResponseItem): string =>
  toCsvRow([
    new Date(transaction.createdAt).toISOString(),
    transaction.description,
    transaction.senderName,
    transaction.receiverName,
    formatCsvAmount(transaction.amount),
    transaction.status,
  ]);

export const transactionCsvHeaderRow = () => toCsvRow([...transactionCsvColumns]);

const toFilenameDate = (isoDate?: string) => {
  const date = isoDate ? new Date(isoDate) : undefined;
  return date && !isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : undefined;
};

export const getTransactionsCsvFilename = (dateRange?: TransactionDateRangePayload) => {
  const start = toFilenameDate(dateRange?.dateRangeStart);
  const end = toFilenameDate(dateRange?.dateRangeEnd);

  return start && end ? `transactions_${start}_to_${end}.csv` : "transactions_all-dates.csv";
};
