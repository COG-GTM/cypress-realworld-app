import React from "react";
import { Tabs, Tab } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

export default function TransactionNavTabs() {
  const location = useLocation();

  // Route Lookup for tabs
  const navUrls: any = {
    "/": 0,
    "/public": 0,
    "/contacts": 1,
    "/personal": 2,
  };

  // Derive selected tab directly from current URL
  const value = navUrls[location.pathname] ?? 0;

  return (
    <Tabs
      value={value}
      indicatorColor="secondary"
      textColor="inherit"
      centered
      data-test="nav-transaction-tabs"
    >
      <Tab label="Everyone" component={Link} to="/" data-test="nav-public-tab" />
      <Tab label="Friends" component={Link} to="/contacts" data-test="nav-contacts-tab" />
      <Tab label="Mine" component={Link} to="/personal" data-test="nav-personal-tab" />
    </Tabs>
  );
}
