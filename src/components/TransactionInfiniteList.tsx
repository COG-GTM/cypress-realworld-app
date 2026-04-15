import type { FC } from "react";
import { get } from "lodash/fp";
import { useTheme, useMediaQuery, Divider } from "@mui/material";
import { FixedSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";

import TransactionItem from "./TransactionItem";
import { TransactionResponseItem, TransactionPagination } from "../models";

export interface TransactionListProps {
  transactions: TransactionResponseItem[];
  loadNextPage: Function;
  pagination: TransactionPagination;
}

const TransactionInfiniteList: FC<TransactionListProps> = ({
  transactions,
  loadNextPage,
  pagination,
}) => {
  const theme = useTheme();
  const isXsBreakpoint = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const itemCount = pagination.hasNextPages ? transactions.length + 1 : transactions.length;

  const loadMoreItems = () => {
    return new Promise<void>((resolve) => {
      if (pagination.hasNextPages) {
        loadNextPage(pagination.page + 1);
      }
      resolve();
    });
  };

  const isItemLoaded = (index: number) =>
    !pagination.hasNextPages || index < transactions.length;

  const removePx = (str: string) => +str.slice(0, str.length - 2);

  const height = isXsBreakpoint ? removePx(theme.spacing(74)) : removePx(theme.spacing(88));
  const width = isXsBreakpoint ? removePx(theme.spacing(38)) : removePx(theme.spacing(90));
  const itemSize = isXsBreakpoint ? removePx(theme.spacing(28)) : removePx(theme.spacing(16));

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      loadMoreItems={loadMoreItems}
      itemCount={itemCount}
      threshold={2}
    >
      {({ onItemsRendered, ref }) => (
        <div data-test="transaction-list" style={{
          width: "100%",
          minHeight: "80vh",
          display: "flex",
          overflow: "auto",
          flexDirection: "column",
        }}>
          <FixedSizeList
            height={height}
            width={width}
            itemCount={itemCount}
            itemSize={itemSize}
            onItemsRendered={onItemsRendered}
            ref={ref}
          >
            {({ index, style }) => {
              const transaction = get(index, transactions);

              if (index < transactions.length) {
                return (
                  <div style={style}>
                    <TransactionItem transaction={transaction} />
                    <Divider variant={isMobile ? "fullWidth" : "inset"} />
                  </div>
                );
              }
              return <div style={style} />;
            }}
          </FixedSizeList>
        </div>
      )}
    </InfiniteLoader>
  );
};

export default TransactionInfiniteList;
