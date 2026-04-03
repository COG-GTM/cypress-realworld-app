import React, { useEffect } from "react";
import { Routes, Route } from "react-router";
import {
  BaseActionObject,
  Interpreter,
  ResolveTypegenMeta,
  ServiceMap,
  TypegenDisabled,
} from "xstate";
import MainLayout from "../components/MainLayout";
import PrivateRoute from "../components/PrivateRoute";
import TransactionsContainer from "./TransactionsContainer";
import UserSettingsContainer from "./UserSettingsContainer";
import NotificationsContainer from "./NotificationsContainer";
import BankAccountsContainer from "./BankAccountsContainer";
import TransactionCreateContainer from "./TransactionCreateContainer";
import TransactionDetailContainer from "./TransactionDetailContainer";
import { DataContext, DataSchema, DataEvents } from "../machines/dataMachine";
import { AuthMachineContext, AuthMachineEvents, AuthMachineSchema } from "../machines/authMachine";
import { SnackbarContext, SnackbarSchema, SnackbarEvents } from "../machines/snackbarMachine";
import { useActor } from "@xstate/react";
import UserOnboardingContainer from "./UserOnboardingContainer";

export interface Props {
  isLoggedIn: boolean;
  authService: Interpreter<AuthMachineContext, AuthMachineSchema, AuthMachineEvents, any, any>;
  notificationsService: Interpreter<
    DataContext,
    DataSchema,
    DataEvents,
    any,
    ResolveTypegenMeta<TypegenDisabled, DataEvents, BaseActionObject, ServiceMap>
  >;
  snackbarService: Interpreter<
    SnackbarContext,
    SnackbarSchema,
    SnackbarEvents,
    any,
    ResolveTypegenMeta<TypegenDisabled, SnackbarEvents, BaseActionObject, ServiceMap>
  >;
  bankAccountsService: Interpreter<
    DataContext,
    DataSchema,
    DataEvents,
    any,
    ResolveTypegenMeta<TypegenDisabled, DataEvents, BaseActionObject, ServiceMap>
  >;
}

const PrivateRoutesContainer: React.FC<Props> = ({
  isLoggedIn,
  authService,
  notificationsService,
  snackbarService,
  bankAccountsService,
}) => {
  const [, sendNotifications] = useActor(notificationsService);

  useEffect(() => {
    sendNotifications({ type: "FETCH" });
  }, [sendNotifications]);

  return (
    <MainLayout notificationsService={notificationsService} authService={authService}>
      <UserOnboardingContainer
        authService={authService}
        bankAccountsService={bankAccountsService}
      />
      <Routes>
        <Route element={<PrivateRoute isLoggedIn={isLoggedIn} />}>
          <Route index element={<TransactionsContainer />} />
          <Route path="public" element={<TransactionsContainer />} />
          <Route path="contacts" element={<TransactionsContainer />} />
          <Route path="personal" element={<TransactionsContainer />} />
          <Route
            path="user/settings"
            element={<UserSettingsContainer authService={authService} />}
          />
          <Route
            path="notifications"
            element={
              <NotificationsContainer
                authService={authService}
                notificationsService={notificationsService}
              />
            }
          />
          <Route
            path="bankaccounts/*"
            element={
              <BankAccountsContainer
                authService={authService}
                bankAccountsService={bankAccountsService}
              />
            }
          />
          <Route
            path="transaction/new"
            element={
              <TransactionCreateContainer
                authService={authService}
                snackbarService={snackbarService}
              />
            }
          />
          <Route
            path="transaction/:transactionId"
            element={<TransactionDetailContainer authService={authService} />}
          />
        </Route>
      </Routes>
    </MainLayout>
  );
};

export default PrivateRoutesContainer;
