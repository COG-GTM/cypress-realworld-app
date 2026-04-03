import React, { useEffect } from "react";
import { styled } from "@mui/material/styles";
import { useSelector } from "@xstate/react";
import type { AnyActorRef } from "xstate";
import { Link as RouterLink, useRouteMatch } from "react-router-dom";
import { Grid, Button, Paper, Typography } from "@mui/material";

import BankAccountForm from "../components/BankAccountForm";
import BankAccountList from "../components/BankAccountList";

export interface Props {
  authService: AnyActorRef;
  bankAccountsService: AnyActorRef;
}
const PREFIX = "BankAccountsContainer";

const classes = {
  paper: `${PREFIX}-paper`,
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.paper}`]: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

const BankAccountsContainer: React.FC<Props> = ({ authService, bankAccountsService }) => {
  const match = useRouteMatch();

  const authState = useSelector(authService, (s: any) => s);
  const bankAccountsState = useSelector(bankAccountsService, (s: any) => s);

  const currentUser = authState?.context.user;

  const createBankAccount = (payload: any) => {
    bankAccountsService.send({ type: "CREATE", ...payload });
  };

  const deleteBankAccount = (payload: any) => {
    bankAccountsService.send({ type: "DELETE", ...payload });
  };

  useEffect(() => {
    bankAccountsService.send({ type: "FETCH" });
  }, [bankAccountsService]);

  if (match.url === "/bankaccounts/new" && currentUser?.id) {
    return (
      <StyledPaper className={classes.paper}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          Create Bank Account
        </Typography>
        <BankAccountForm userId={currentUser?.id} createBankAccount={createBankAccount} />
      </StyledPaper>
    );
  }

  return (
    <StyledPaper className={classes.paper}>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Bank Accounts
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/bankaccounts/new"
            data-test="bankaccount-new"
          >
            Create
          </Button>
        </Grid>
      </Grid>
      <BankAccountList
        bankAccounts={bankAccountsState?.context.results!}
        deleteBankAccount={deleteBankAccount}
      />
    </StyledPaper>
  );
};
export default BankAccountsContainer;
