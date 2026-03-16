import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
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
        <Route
          path="/"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <TransactionsContainer />
            </PrivateRoute>
          }
        />
        <Route
          path="/public"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <TransactionsContainer />
            </PrivateRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <TransactionsContainer />
            </PrivateRoute>
          }
        />
        <Route
          path="/personal"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <TransactionsContainer />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/settings"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <UserSettingsContainer authService={authService} />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <NotificationsContainer
                authService={authService}
                notificationsService={notificationsService}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/bankaccounts/*"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <BankAccountsContainer
                authService={authService}
                bankAccountsService={bankAccountsService}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/transaction/new"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <TransactionCreateContainer
                authService={authService}
                snackbarService={snackbarService}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/transaction/:transactionId"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <TransactionDetailContainer authService={authService} />
            </PrivateRoute>
          }
        />
      </Routes>
    </MainLayout>
  );
};

export default PrivateRoutesContainer;
