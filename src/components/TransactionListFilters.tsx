import React from "react";
import { styled } from "@mui/material/styles";
import { Paper, Grid, Box } from "@mui/material";
import { TransactionDateRangePayload, TransactionAmountRangePayload } from "../models";
import TransactionListDateRangeFilter from "./TransactionDateRangeFilter";
import TransactionListAmountRangeFilter from "./TransactionListAmountRangeFilter";
import { debounce } from "lodash/fp";

const PREFIX = "TransactionListFilters";

const classes = {
  paper: `${PREFIX}-paper`,
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.paper}`]: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    backgroundColor: "transparent",
    boxShadow: "none",
    "& .MuiChip-root": {
      borderRadius: 24,
      fontFamily: "'Nunito', sans-serif",
      fontWeight: 600,
      fontSize: 13,
      border: "1px solid #DDDDDD",
      backgroundColor: "#ffffff",
      color: "#222222",
      padding: "4px 8px",
      height: 36,
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: "#F7F7F7",
        borderColor: "#222222",
      },
    },
    "& .MuiButton-root": {
      borderRadius: 24,
      fontFamily: "'Nunito', sans-serif",
      fontWeight: 600,
      fontSize: 13,
      textTransform: "none",
      border: "1px solid #DDDDDD",
      color: "#222222",
      padding: "6px 16px",
      "&:hover": {
        backgroundColor: "#F7F7F7",
        borderColor: "#222222",
      },
    },
  },
}));

export type TransactionListFiltersProps = {
  sendFilterEvent: Function;
  dateRangeFilters: TransactionDateRangePayload;
  amountRangeFilters: TransactionAmountRangePayload;
};

const TransactionListFilters: React.FC<TransactionListFiltersProps> = ({
  sendFilterEvent,
  dateRangeFilters,
  amountRangeFilters,
}) => {
  const filterDateRange = (payload: TransactionDateRangePayload) =>
    sendFilterEvent("DATE_FILTER", payload);
  const resetDateRange = () => sendFilterEvent("DATE_RESET");

  const filterAmountRange = debounce(200, (payload: TransactionAmountRangePayload) =>
    sendFilterEvent("AMOUNT_FILTER", payload)
  );
  const resetAmountRange = () => sendFilterEvent("AMOUNT_RESET");

  return (
    <StyledPaper className={classes.paper} elevation={0}>
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        spacing={1}
      >
        <Grid item>
          <TransactionListDateRangeFilter
            filterDateRange={filterDateRange}
            dateRangeFilters={dateRangeFilters}
            resetDateRange={resetDateRange}
          />
        </Grid>
        <Grid item>
          <TransactionListAmountRangeFilter
            filterAmountRange={filterAmountRange}
            amountRangeFilters={amountRangeFilters}
            resetAmountRange={resetAmountRange}
          />
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default TransactionListFilters;
