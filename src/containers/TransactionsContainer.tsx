import React from "react";
import { useMachine } from "@xstate/react";
import { useLocation } from "react-router-dom";
import { TransactionDateRangePayload, TransactionAmountRangePayload } from "../models";
import TransactionListFilters from "../components/TransactionListFilters";
import TransactionContactsList from "../components/TransactionContactsList";
import { transactionFiltersMachine } from "../machines/transactionFiltersMachine";
import { getDateQueryFields, getAmountQueryFields } from "../utils/transactionUtils";
import TransactionPersonalList from "../components/TransactionPersonalList";
import TransactionPublicList from "../components/TransactionPublicList";

const TransactionsContainer: React.FC = () => {
  const [currentFilters, sendFilterEvent] = useMachine(transactionFiltersMachine);
  const location = useLocation();

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

  if (location.pathname === "/contacts") {
    return (
      <TransactionContactsList
        filterComponent={Filters}
        dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
        amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
      />
    );
  }

  if (location.pathname === "/personal") {
    return (
      <TransactionPersonalList
        filterComponent={Filters}
        dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
        amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
      />
    );
  }

  return (
    <TransactionPublicList
      filterComponent={Filters}
      dateRangeFilters={dateRangeFilters as TransactionDateRangePayload}
      amountRangeFilters={amountRangeFilters as TransactionAmountRangePayload}
    />
  );
};

export default TransactionsContainer;
