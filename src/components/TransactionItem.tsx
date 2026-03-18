import React from "react";
import { styled } from "@mui/material/styles";
import { useHistory } from "react-router";
import {
  ListItem,
  Typography,
  Grid,
  Avatar,
  ListItemAvatar,
  Paper,
  Badge,
  Theme,
  Box,
} from "@mui/material";
import { ThumbUpAltOutlined as LikeIcon, CommentRounded as CommentIcon } from "@mui/icons-material";
import { TransactionResponseItem } from "../models";
import TransactionTitle from "./TransactionTitle";
import TransactionAmount from "./TransactionAmount";

const PREFIX = "TransactionItem";

const classes = {
  root: `${PREFIX}-root`,
  paper: `${PREFIX}-paper`,
  avatar: `${PREFIX}-avatar`,
  socialStats: `${PREFIX}-socialStats`,
  countIcons: `${PREFIX}-countIcons`,
  countText: `${PREFIX}-countText`,
};

const StyledListItem = styled(ListItem)(({ theme }) => ({
  [`& .${classes.root}`]: {
    flexGrow: 1,
  },

  [`& .${classes.paper}`]: {
    padding: theme.spacing(2),
    margin: "auto",
    width: "100%",
    borderRadius: 16,
    border: "1px solid #EBEBEB",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
      transform: "translateY(-2px)",
    },
  },

  [`& .${classes.avatar}`]: {
    width: theme.spacing(2),
  },

  [`& .${classes.socialStats}`]: {
    [theme.breakpoints.down("md")]: {
      marginTop: theme.spacing(2),
    },
  },

  [`& .${classes.countIcons}`]: {
    color: "#717171",
    fontSize: 18,
  },

  [`& .${classes.countText}`]: {
    color: "#717171",
    marginTop: 2,
    height: theme.spacing(2),
    width: theme.spacing(2),
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 600,
    fontSize: 13,
  },

  padding: "6px 0",
}));

type TransactionProps = {
  transaction: TransactionResponseItem;
};

const SmallAvatar = styled(Avatar)(({ theme }: { theme: Theme }) => {
  return {
    width: 24,
    height: 24,
    border: `2px solid #ffffff`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
  };
});

const TransactionItem: React.FC<TransactionProps> = ({ transaction }) => {
  const history = useHistory();

  const showTransactionDetail = (transactionId: string) => {
    history.push(`/transaction/${transactionId}`);
  };

  return (
    <StyledListItem
      data-test={`transaction-item-${transaction.id}`}
      alignItems="flex-start"
      onClick={() => showTransactionDetail(transaction.id)}
    >
      <Paper className={classes.paper} elevation={0}>
        <Grid container spacing={2}>
          <Grid item>
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                badgeContent={
                  <SmallAvatar
                    src={transaction.receiverAvatar}
                    classes={{
                      root: classes.root,
                    }}
                  />
                }
              >
                <Avatar
                  src={transaction.senderAvatar}
                  sx={{
                    width: 48,
                    height: 48,
                    border: "2px solid #F7F7F7",
                  }}
                />
              </Badge>
            </ListItemAvatar>
          </Grid>
          <Grid item xs={12} sm container>
            <Grid item xs container direction="column" spacing={2}>
              <Grid item xs>
                <TransactionTitle transaction={transaction} />
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{
                    color: "#717171",
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 13,
                  }}
                >
                  {transaction.description}
                </Typography>
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="flex-start"
                  spacing={1}
                  className={classes.socialStats}
                >
                  <Grid item>
                    <LikeIcon className={classes.countIcons} />
                  </Grid>
                  <Grid item>
                    <Typography data-test="transaction-like-count" className={classes.countText}>
                      {transaction.likes.length}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <CommentIcon className={classes.countIcons} />
                  </Grid>
                  <Grid item>
                    <Typography data-test="transaction-comment-count" className={classes.countText}>
                      {transaction.comments.length}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <TransactionAmount transaction={transaction} />
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </StyledListItem>
  );
};

export default TransactionItem;
