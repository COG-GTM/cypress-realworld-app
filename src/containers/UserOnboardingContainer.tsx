import React, { useEffect } from "react";
import {
  Button,
  Box,
  useTheme,
  useMediaQuery,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import type { AnyActorRef } from "xstate";
import { isEmpty } from "lodash/fp";
import { useSelector, useMachine } from "@xstate/react";

import { userOnboardingMachine } from "../machines/userOnboardingMachine";
import BankAccountForm from "../components/BankAccountForm";
import NavigatorIllustration from "../components/SvgUndrawNavigatorA479";
import PersonalFinance from "../components/SvgUndrawPersonalFinanceTqcd";

export interface Props {
  authService: AnyActorRef;
  bankAccountsService: AnyActorRef;
}

const UserOnboardingContainer: React.FC<Props> = ({ authService, bankAccountsService }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const bankAccountsState = useSelector(bankAccountsService, (s: any) => s);
  const authState = useSelector(authService, (s: any) => s);
  const [userOnboardingState, sendUserOnboarding] = useMachine(userOnboardingMachine);

  const currentUser = authState?.context?.user;

  useEffect(() => {
    bankAccountsService.send({ type: "FETCH" });
  }, [bankAccountsService]);

  const noBankAccounts =
    bankAccountsState?.matches("success.withoutData") &&
    isEmpty(bankAccountsState?.context?.results);

  const dialogIsOpen =
    (userOnboardingState.matches("stepTwo") && !noBankAccounts) ||
    (userOnboardingState.matches("stepThree") && !noBankAccounts) ||
    (!userOnboardingState.matches("done") && noBankAccounts) ||
    false;

  const nextStep = () => sendUserOnboarding({ type: "NEXT" });

  const createBankAccountWithNextStep = (payload: any) => {
    bankAccountsService.send({ type: "CREATE", ...payload });
    nextStep();
  };

  return (
    <Dialog data-test="user-onboarding-dialog" fullScreen={fullScreen} open={dialogIsOpen}>
      <DialogTitle data-test="user-onboarding-dialog-title">
        {userOnboardingState.matches("stepOne") && "Get Started with Real World App"}
        {userOnboardingState.matches("stepTwo") && "Create Bank Account"}
        {userOnboardingState.matches("stepThree") && "Finished"}
      </DialogTitle>
      <DialogContent data-test="user-onboarding-dialog-content">
        <Box display="flex" alignItems="center" justifyContent="center">
          {userOnboardingState.matches("stepOne") && (
            <>
              <NavigatorIllustration />
              <br />
              <DialogContentText style={{ paddingLeft: 20 }}>
                Real World App requires a Bank Account to perform transactions.
                <br />
                <br />
                Click <b>Next</b> to begin setup of your Bank Account.
              </DialogContentText>
            </>
          )}
          {userOnboardingState.matches("stepTwo") && (
            <BankAccountForm
              userId={currentUser?.id!}
              createBankAccount={createBankAccountWithNextStep}
              onboarding
            />
          )}
          {userOnboardingState.matches("stepThree") && (
            <>
              <PersonalFinance />
              <br />
              <DialogContentText style={{ paddingLeft: 20 }}>
                You're all set!
                <br />
                <br />
                We're excited to have you aboard the Real World App!
              </DialogContentText>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Button
              style={{ paddingRight: "80%" }}
              onClick={/* istanbul ignore next */ () => authService.send({ type: "LOGOUT" })}
              color="secondary"
              data-test="user-onboarding-logout"
            >
              Logout
            </Button>
          </Grid>
          <Grid item>
            {!userOnboardingState.matches("stepTwo") && (
              <Button onClick={() => nextStep()} color="primary" data-test="user-onboarding-next">
                {userOnboardingState.matches("stepThree") ? "Done" : "Next"}
              </Button>
            )}
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default UserOnboardingContainer;
