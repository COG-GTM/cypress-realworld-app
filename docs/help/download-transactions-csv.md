# Download your transactions as CSV

You can save the transactions on the **Mine** tab to a CSV file and open it in Excel, Google Sheets, Numbers or any other spreadsheet app. The file holds exactly the transactions your current filters show.

## Download a file

1. Sign in and open the **Mine** tab at the top of the transaction feed.
2. Optional: narrow the list.
   - Click **Date: ALL** and pick a start day and an end day on the calendar.
   - Click the **Amount** chip and drag the slider to the range you want.
3. Click **Download CSV** at the right of the filter bar.

Your browser saves the file to its usual downloads folder. The button is greyed out for a moment while the file is being prepared.

The button is only on the **Mine** tab. The **Everyone** and **Friends** tabs don't have it.

## What's in the file

The file includes every transaction that matches your filters, not just the ones you have scrolled to on screen.

| Column        | What it holds                                        | Example                            |
| ------------- | ---------------------------------------------------- | ---------------------------------- |
| `date`        | When the transaction was created, as a UTC timestamp | `2023-08-29T18:56:16.181Z`         |
| `description` | The note on the payment or request                   | `Payment: WHjJ4qR2R2 to uBmeaz5pX` |
| `sender`      | Full name of the person who sent the money           | `Lia Rosenbaum`                    |
| `receiver`    | Full name of the person who received it              | `Ted Parisian`                     |
| `amount`      | Amount in dollars, two decimals, no currency sign    | `440.19`                           |
| `status`      | `pending`, `incomplete` or `complete`                | `complete`                         |

A file looks like this:

```csv
date,description,sender,receiver,amount,status
2023-08-29T18:56:16.181Z,Payment: WHjJ4qR2R2 to uBmeaz5pX,Lia Rosenbaum,Ted Parisian,440.19,complete
2023-10-22T18:36:47.425Z,Request: WHjJ4qR2R2 to uBmeaz5pX,Ted Parisian,Lia Rosenbaum,159.28,pending
```

Amounts are always positive. To tell money in from money out, check whether your name is in the `sender` or the `receiver` column.

## File name

The file name carries the date range you picked:

| Date filter                    | File name                                   |
| ------------------------------ | ------------------------------------------- |
| June 1 to June 30, 2023        | `transactions_2023-06-01_to_2023-06-30.csv` |
| No date filter (**Date: ALL**) | `transactions_all-dates.csv`                |

The amount filter doesn't change the file name, so two downloads with different amount ranges and the same dates get the same name. Your browser may add `(1)` to the second one.

## Special characters in descriptions

Descriptions can contain commas, quotation marks and line breaks. The file keeps them intact, so every spreadsheet app reads each transaction as one row with six columns:

- A description with a comma, a quotation mark or a line break is wrapped in double quotes, and any quotation mark inside it is doubled. `Dinner, drinks and "dessert"` is stored as `"Dinner, drinks and ""dessert"""` and shows up in the spreadsheet as `Dinner, drinks and "dessert"`.
- A value that starts with `=`, `+`, `-` or `@` gets a leading apostrophe (`'=SUM(A1:A2)`). This stops spreadsheet apps from running it as a formula. The apostrophe may show in the cell; delete it if you need the original text.

The file is UTF-8, so names and descriptions with accents or emoji come through unchanged.

## Troubleshooting

**The file has fewer rows than I expected.** Check the date and amount chips above the list. The file follows them: clear the date filter with the **x** on its chip, or widen the amount slider, to include more transactions.

**The file has only the header row.** No transactions match your filters. The feed shows the same empty list.

**A date in the file is one day off from the feed.** The `date` column is in UTC. A transaction made late in the evening in the Americas, or early in the morning in Asia or Australia, can fall on the neighbouring day in UTC.

**Nothing downloads.** Make sure you are still signed in: the download needs the same sign-in as the feed. Sign in again and retry.

## For developers

The button calls `GET /transactions/export` with the feed's filter parameters (`dateRangeStart`, `dateRangeEnd`, `amountMin`, `amountMax`). The route sits next to `GET /transactions` in `backend/transaction-routes.ts`, uses the same sign-in check, and streams the rows as `text/csv` with a `Content-Disposition: attachment` header. It returns `401` when you aren't signed in.
