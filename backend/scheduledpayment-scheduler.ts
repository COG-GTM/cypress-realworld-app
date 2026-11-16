import { processDueScheduledPayments } from "./database";

export const SCHEDULED_PAYMENTS_INTERVAL_MS = 60 * 1000;

// Off under NODE_ENV=test so Cypress runs stay deterministic; tests run due schedules through
// POST /testData/scheduledPayments/run, or opt in with SCHEDULED_PAYMENTS_SCHEDULER=true
export const isSchedulerEnabled = (env: NodeJS.ProcessEnv = process.env) =>
  env.NODE_ENV !== "test" || env.SCHEDULED_PAYMENTS_SCHEDULER === "true";

export const runScheduledPaymentsTick = (now: Date = new Date()) => {
  try {
    return processDueScheduledPayments(now);
  } catch (error) {
    console.error("Scheduled payments run failed", error);
    return [];
  }
};

export const startScheduledPaymentsScheduler = (
  intervalMs: number = SCHEDULED_PAYMENTS_INTERVAL_MS
): NodeJS.Timeout => {
  runScheduledPaymentsTick();
  return setInterval(() => runScheduledPaymentsTick(), intervalMs);
};
