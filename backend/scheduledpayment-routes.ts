///<reference path="types.ts" />

import express from "express";

import {
  createScheduledPayment,
  formatScheduledPaymentForApiResponse,
  getScheduledPaymentById,
  getScheduledPaymentsByUserIdForApi,
  updateScheduledPaymentById,
} from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import {
  isScheduledPaymentPatchValidator,
  isScheduledPaymentPayloadValidator,
  shortIdValidation,
} from "./validators";
import { ScheduledPaymentStatus } from "../src/models";
const router = express.Router();

// Routes

//GET /scheduledPayments (scoped-user)
router.get("/", ensureAuthenticated, (req, res) => {
  /* istanbul ignore next */
  const scheduledPayments = getScheduledPaymentsByUserIdForApi(req.user?.id!);

  res.status(200);
  res.json({ results: scheduledPayments });
});

//POST /scheduledPayments (scoped-user)
router.post(
  "/",
  ensureAuthenticated,
  validateMiddleware(isScheduledPaymentPayloadValidator),
  (req, res) => {
    /* istanbul ignore next */
    const scheduledPayment = createScheduledPayment(req.user?.id!, req.body);

    res.status(200);
    res.json({ scheduledPayment: formatScheduledPaymentForApiResponse(scheduledPayment) });
  }
);

//PATCH /scheduledPayments/:scheduledPaymentId (scoped-user)
router.patch(
  "/:scheduledPaymentId",
  ensureAuthenticated,
  validateMiddleware([
    shortIdValidation("scheduledPaymentId"),
    ...isScheduledPaymentPatchValidator,
  ]),
  (req, res) => {
    const { scheduledPaymentId } = req.params;
    const scheduledPayment = getScheduledPaymentById(scheduledPaymentId);

    if (!scheduledPayment) {
      return res.status(404).json({ error: "Scheduled payment not found" });
    }

    /* istanbul ignore next */
    if (scheduledPayment.senderId !== req.user?.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (scheduledPayment.status !== ScheduledPaymentStatus.active) {
      return res.status(422).json({
        errors: [
          {
            msg: `cannot cancel a ${scheduledPayment.status} scheduled payment`,
            param: "status",
            location: "body",
          },
        ],
      });
    }

    const canceled = updateScheduledPaymentById(scheduledPaymentId, {
      status: ScheduledPaymentStatus.canceled,
      nextRunAt: null,
    });

    res.status(200);
    res.json({ scheduledPayment: formatScheduledPaymentForApiResponse(canceled) });
  }
);

export default router;
