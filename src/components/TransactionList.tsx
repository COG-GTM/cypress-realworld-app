import React, { ReactNode } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Button, ListSubheader, Grid, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { isEmpty } from "lodash/fp";

import SkeletonList from "./SkeletonList";
import { TransactionResponseItem, TransactionPagination } from "../models";
import EmptyList from "./EmptyList";
import TransactionInfiniteList from "./TransactionInfiniteList";
import TransferMoneyIllustration from "./SvgUndrawTransferMoneyRywa";

const PREFIX = "TransactionList";

const classes = {
  paper: `${PREFIX}-paper`,
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.paper}`]: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    backgroundColor: "transparent",
    boxShadow: "none",
  },
}));

export interface TransactionListProps {
  header: string;
  transactions: TransactionResponseItem[];
  isLoading: Boolean;
  showCreateButton?: Boolean;
  loadNextPage: Function;
  pagination: TransactionPagination;
  filterComponent: ReactNode;
}

const TransactionList: React.FC<TransactionListProps> = ({
  header,
  transactions,
  isLoading,
  showCreateButton,
  loadNextPage,
  pagination,
  filterComponent,
}) => {
  const showEmptyList = !isLoading && transactions?.length === 0;
  const showSkeleton = isLoading && isEmpty(pagination);

  return (
    <StyledPaper className={classes.paper} elevation={0}>
      {filterComponent}
      <ListSubheader
        component="div"
        sx={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: "#222222",
          backgroundColor: "transparent",
          lineHeight: "48px",
          paddingBottom: 1,
          letterSpacing: "-0.2px",
        }}
      >
        {header}
      </ListSubheader>
      {showSkeleton && <SkeletonList />}
      {transactions.length > 0 && (
        <TransactionInfiniteList
          transactions={transactions}
          loadNextPage={loadNextPage}
          pagination={pagination}
        />
      )}
      {showEmptyList && (
        <EmptyList entity="Transactions">
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
            style={{ width: "100%" }}
            spacing={2}
          >
            <Grid item>
              <TransferMoneyIllustration style={{ height: 200, width: 300, marginBottom: 30 }} />
            </Grid>
            <Grid item>
              {showCreateButton && (
                <Button
                  data-test="transaction-list-empty-create-transaction-button"
                  variant="contained"
                  component={RouterLink}
                  to="/transaction/new"
                  disableElevation
                  sx={{
                    backgroundColor: "#FF385C",
                    color: "#ffffff",
                    borderRadius: 6,
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    textTransform: "none",
                    padding: "10px 24px",
                    fontSize: 14,
                    "&:hover": {
                      backgroundColor: "#E31C5F",
                    },
                  }}
                >
                  Create A Transaction
                </Button>
              )}
            </Grid>
          </Grid>
        </EmptyList>
      )}
    </StyledPaper>
  );
};

export default TransactionList;
