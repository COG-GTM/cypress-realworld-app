///<reference path="types.ts" />

import express from "express";
import { getAllForEntity, processDueScheduledPayments, seedDatabase } from "./database";
import { validateMiddleware } from "./helpers";
import { isValidEntityValidator, isScheduledPaymentsRunValidator } from "./validators";
import { DbSchema } from "../src/models/db-schema";
const router = express.Router();

// Routes

//POST /testData/seed
router.post("/seed", (req, res) => {
  seedDatabase();
  res.sendStatus(200);
});

//POST /testData/scheduledPayments/run
router.post(
  "/scheduledPayments/run",
  validateMiddleware(isScheduledPaymentsRunValidator),
  (req, res) => {
    const now = req.body.now ? new Date(req.body.now) : new Date();
    const results = processDueScheduledPayments(now);

    res.set("Cache-Control", "no-store");
    res.status(200);
    res.json({ results });
  }
);

//GET /testData/:entity
router.get("/:entity", validateMiddleware([...isValidEntityValidator]), (req, res) => {
  const { entity } = req.params;
  const results = getAllForEntity(entity as keyof DbSchema);

  res.status(200);
  res.json({ results });
});

export default router;
