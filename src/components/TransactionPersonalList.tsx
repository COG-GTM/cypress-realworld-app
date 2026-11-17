import React, { useEffect, ReactNode } from "react";
import { useMachine } from "@xstate/react";
import { Grid } from "@mui/material";
import {
  TransactionPagination,
  TransactionResponseItem,
  TransactionDateRangePayload,
  TransactionAmountRangePayload,
} from "../models";
import TransactionList from "./TransactionList";
import TransactionDownloadCsvButton from "./TransactionDownloadCsvButton";
import { personalTransactionsMachine } from "../machines/personalTransactionsMachine";

export interface TransactionPersonalListProps {
  filterComponent: ReactNode;
  dateRangeFilters: TransactionDateRangePayload;
  amountRangeFilters: TransactionAmountRangePayload;
}

const TransactionPersonalList: React.FC<TransactionPersonalListProps> = ({
  filterComponent,
  dateRangeFilters,
  amountRangeFilters,
}) => {
  const [current, send, personalTransactionService] = useMachine(personalTransactionsMachine);
  const { pageData, results } = current.context;

  // @ts-ignore
  if (window.Cypress) {
    // @ts-ignore
    window.personalTransactionService = personalTransactionService;
  }

  useEffect(() => {
    send("FETCH", { ...dateRangeFilters, ...amountRangeFilters });
  }, [send, dateRangeFilters, amountRangeFilters]);

  const loadNextPage = (page: number) =>
    send("FETCH", { page, ...dateRangeFilters, ...amountRangeFilters });

  return (
    <>
      <TransactionList
        filterComponent={
          <Grid container direction="row" justifyContent="space-between" alignItems="center">
            <Grid item>{filterComponent}</Grid>
            <Grid item sx={{ pr: 2 }}>
              <TransactionDownloadCsvButton
                dateRangeFilters={dateRangeFilters}
                amountRangeFilters={amountRangeFilters}
              />
            </Grid>
          </Grid>
        }
        header="Personal"
        transactions={results as TransactionResponseItem[]}
        isLoading={current.matches("loading")}
        loadNextPage={loadNextPage}
        pagination={pageData as TransactionPagination}
        showCreateButton={true}
      />
    </>
  );
};

export default TransactionPersonalList;
