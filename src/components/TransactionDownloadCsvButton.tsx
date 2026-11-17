import React, { useState } from "react";
import { Button } from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import { TransactionDateRangePayload, TransactionAmountRangePayload } from "../models";
import { httpClient } from "../utils/asyncUtils";
import { backendPort } from "../utils/portUtils";
import { getTransactionsCsvFilename } from "../utils/csvUtils";

export interface TransactionDownloadCsvButtonProps {
  dateRangeFilters: TransactionDateRangePayload;
  amountRangeFilters: TransactionAmountRangePayload;
}

const TransactionDownloadCsvButton: React.FC<TransactionDownloadCsvButtonProps> = ({
  dateRangeFilters,
  amountRangeFilters,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCsv = async () => {
    setIsDownloading(true);
    try {
      const resp = await httpClient.get(`http://localhost:${backendPort}/transactions/export`, {
        params: { ...dateRangeFilters, ...amountRangeFilters },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([resp.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = getTransactionsCsvFilename(dateRangeFilters || undefined);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      data-test="transaction-list-download-csv"
      variant="outlined"
      color="primary"
      size="small"
      startIcon={<DownloadIcon />}
      onClick={downloadCsv}
      disabled={isDownloading}
    >
      Download CSV
    </Button>
  );
};

export default TransactionDownloadCsvButton;
