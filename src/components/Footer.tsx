import React from "react";
import { Container, Typography, Box } from "@mui/material";

export default function Footer() {
  return (
    <Container maxWidth="sm" style={{ marginTop: 50 }}>
      <Box
        sx={{
          borderTop: "1px solid #EBEBEB",
          paddingTop: 3,
          paddingBottom: 3,
          textAlign: "center",
        }}
      >
        <Typography
          variant="body2"
          align="center"
          sx={{
            fontFamily: "'Nunito', sans-serif",
            color: "#717171",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Built with care by{" "}
          <a
            style={{
              textDecoration: "none",
              color: "#FF385C",
              fontWeight: 700,
            }}
            target="_blank"
            rel="noopener noreferrer"
            href="https://cypress.io"
          >
            Cypress
          </a>
        </Typography>
      </Box>
    </Container>
  );
}
