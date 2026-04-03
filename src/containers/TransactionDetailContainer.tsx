import React, { useEffect } from "react";
import { useMachine, useSelector } from "@xstate/react";
import { useParams } from "react-router-dom";
import TransactionDetail from "../components/TransactionDetail";
import { Transaction } from "../models";
import { transactionDetailMachine } from "../machines/transactionDetailMachine";
import { first } from "lodash/fp";
import type { AnyActorRef } from "xstate";

export interface Props {
  authService: AnyActorRef;
}
interface Params {
  transactionId: string;
}

const TransactionDetailsContainer: React.FC<Props> = ({ authService }) => {
  const { transactionId }: Params = useParams();
  const authState = useSelector(authService, (s: any) => s);
  const [transactionDetailState, sendTransactionDetail] = useMachine(transactionDetailMachine);
  useEffect(() => {
    sendTransactionDetail({ type: "FETCH", transactionId });
  }, [sendTransactionDetail, transactionId]);

  const transactionLike = (transactionId: Transaction["id"]) =>
    sendTransactionDetail({ type: "CREATE", entity: "LIKE", transactionId });

  const transactionComment = (payload: any) =>
    sendTransactionDetail({ type: "CREATE", entity: "COMMENT", ...payload });

  const transactionUpdate = (payload: any) => sendTransactionDetail({ type: "UPDATE", ...payload });

  const transaction = first(transactionDetailState.context?.results);
  const currentUser = authState?.context?.user;

  return (
    <>
      {transactionDetailState.matches("idle") && (
        <div>
          Loading...
          <br />
        </div>
      )}
      {currentUser && transactionDetailState.matches("success") && (
        <TransactionDetail
          transaction={transaction}
          transactionLike={transactionLike}
          transactionComment={transactionComment}
          transactionUpdate={transactionUpdate}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default TransactionDetailsContainer;
