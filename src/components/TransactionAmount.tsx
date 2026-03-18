import React from "react";
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { TransactionResponseItem } from "../models";
import { isRequestTransaction, formatAmount } from "../utils/transactionUtils";

const PREFIX = "TransactionAmount";

const classes = {
  amountPositive: `${PREFIX}-amountPositive`,
  amountNegative: `${PREFIX}-amountNegative`,
};

const StyledTypography = styled(Typography)(({ theme }) => ({
  [`&.${classes.amountPositive}`]: {
    fontSize: 18,
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 800,
    [theme.breakpoints.down("md")]: {
      fontSize: theme.typography.body1.fontSize,
    },
    color: "#008A05",
    backgroundColor: "rgba(0, 138, 5, 0.08)",
    padding: "4px 12px",
    borderRadius: 20,
  },

  [`&.${classes.amountNegative}`]: {
    fontSize: 18,
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 800,
    [theme.breakpoints.down("md")]: {
      fontSize: theme.typography.body1.fontSize,
    },
    color: "#C13515",
    backgroundColor: "rgba(193, 53, 21, 0.08)",
    padding: "4px 12px",
    borderRadius: 20,
  },
})) as typeof Typography;

const TransactionAmount: React.FC<{
  transaction: TransactionResponseItem;
}> = ({ transaction }) => {
  return (
    <StyledTypography
      data-test={`transaction-amount-${transaction.id}`}
      className={
        isRequestTransaction(transaction) ? classes.amountPositive : classes.amountNegative
      }
      display="inline"
      component="span"
      color="primary"
    >
      {isRequestTransaction(transaction) ? "+" : "-"}
      {transaction.amount && formatAmount(transaction.amount)}
    </StyledTypography>
  );
};

export default TransactionAmount;
