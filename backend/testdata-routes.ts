///<reference path="types.ts" />

import express from "express";
import { getAllForEntity, seedDatabase } from "./database";
import { validateMiddleware } from "./helpers";
import { isSeedValidator, isValidEntityValidator } from "./validators";
import { DbSchema } from "../src/models/db-schema";
const router = express.Router();

// Routes

//POST /testData/seed
router.post("/seed", validateMiddleware(isSeedValidator), (req, res) => {
  seedDatabase(req.body?.seed);
  res.sendStatus(200);
});

//GET /testData/:entity
router.get("/:entity", validateMiddleware([...isValidEntityValidator]), (req, res) => {
  const { entity } = req.params;
  const results = getAllForEntity(entity as keyof DbSchema);

  res.status(200);
  res.json({ results });
});

export default router;
