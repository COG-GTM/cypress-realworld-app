import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { Link, useRouteMatch } from "react-router-dom";
import {
  Public as PublicIcon,
  People as PeopleIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

export default function TransactionNavTabs() {
  const match = useRouteMatch();

  const navUrls: any = {
    "/": 0,
    "/public": 0,
    "/contacts": 1,
    "/personal": 2,
  };

  const [value, setValue] = React.useState(navUrls[match.url]);

  const handleChange = (event: React.SyntheticEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        borderTop: "1px solid #EBEBEB",
        backgroundColor: "#ffffff",
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        data-test="nav-transaction-tabs"
        sx={{
          "& .MuiTabs-indicator": {
            backgroundColor: "#222222",
            height: 3,
            borderRadius: "3px 3px 0 0",
          },
          "& .MuiTab-root": {
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: "#717171",
            textTransform: "none",
            minHeight: 56,
            padding: "12px 20px",
            gap: "6px",
            letterSpacing: "0.02em",
            transition: "color 0.2s ease, border-color 0.2s ease",
            borderBottom: "3px solid transparent",
            "&:hover": {
              color: "#222222",
              borderBottom: "3px solid #DDDDDD",
            },
            "&.Mui-selected": {
              color: "#222222",
              fontWeight: 700,
            },
          },
        }}
      >
        <Tab
          icon={<PublicIcon sx={{ fontSize: 22 }} />}
          label="Everyone"
          component={Link}
          to="/"
          data-test="nav-public-tab"
          iconPosition="top"
        />
        <Tab
          icon={<PeopleIcon sx={{ fontSize: 22 }} />}
          label="Friends"
          component={Link}
          to="/contacts"
          data-test="nav-contacts-tab"
          iconPosition="top"
        />
        <Tab
          icon={<PersonIcon sx={{ fontSize: 22 }} />}
          label="Mine"
          component={Link}
          to="/personal"
          data-test="nav-personal-tab"
          iconPosition="top"
        />
      </Tabs>
    </Box>
  );
}
