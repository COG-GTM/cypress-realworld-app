import React from "react";
import { useMachine } from "@xstate/react";
import { TransactionDateRangePayload, TransactionAmountRangePayload } from "../models";
import TransactionListFilters from "../components/TransactionListFilters";
import TransactionContactsList from "../components/TransactionContactsList";
import { transactionFiltersMachine } from "../machines/transactionFiltersMachine";
import { getDateQueryFields, getAmountQueryFields } from "../utils/transactionUtils";
import TransactionPersonalList from "../components/TransactionPersonalList";
import TransactionPublicList from "../components/TransactionPublicList";

export interface TransactionsContainerProps {
  tab?: "public" | "contacts" | "personal";
}

const TransactionsContainer: React.FC<TransactionsContainerProps> = ({ tab = "public" }) => {
  const [currentFilters, sendFilterEvent] = useMachine(transactionFiltersMachine);

  const hasDateRangeFilter = currentFilters.matches({ dateRange: "filter" });
  const hasAmountRangeFilter = currentFilters.matches({
    amountRange: "filter",
  });

  const dateRangeFilters = hasDateRangeFilter && getDateQueryFields(currentFilters.context);
  const amountRangeFilters = hasAmountRangeFilter && getAmountQueryFields(currentFilters.context);

  const Filters = (
    <TransactionListFilters
      dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
      amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
      sendFilterEvent={sendFilterEvent}
    />
  );

  const filterProps = {
    filterComponent: Filters,
    dateRangeFilters: dateRangeFilters as TransactionDateRangePayload,
    amountRangeFilters: amountRangeFilters as TransactionAmountRangePayload,
  };

  if (tab === "contacts") {
    return <TransactionContactsList {...filterProps} />;
  }

  if (tab === "personal") {
    return <TransactionPersonalList {...filterProps} />;
  }

  return <TransactionPublicList {...filterProps} />;
};

export default TransactionsContainer;
