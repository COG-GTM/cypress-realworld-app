import { describe, expect, it, beforeEach } from "vitest";
import {
  seedDatabase,
  getAllUsers,
  getAllForEntity,
  createScheduledPayment,
  getScheduledPaymentById,
  getScheduledPaymentsByUserId,
  updateScheduledPaymentById,
  getDueScheduledPayments,
  processDueScheduledPayments,
  getUserById,
  createTransaction,
} from "../../backend/database";
import { isSchedulerEnabled } from "../../backend/scheduledpayment-scheduler";
import {
  User,
  DefaultPrivacyLevel,
  ScheduledPaymentFrequency,
  ScheduledPaymentPayload,
  ScheduledPaymentStatus,
  Transaction,
  TransactionStatus,
} from "../../src/models";

describe("Scheduled Payments", () => {
  let sender: User;
  let receiver: User;

  const buildPayload = (overrides: Partial<ScheduledPaymentPayload> = {}) => ({
    receiverId: receiver.id,
    amount: 2500,
    description: "Rent 🏠",
    frequency: ScheduledPaymentFrequency.monthly,
    startDate: "2026-12-01",
    ...overrides,
  });

  beforeEach(() => {
    seedDatabase();
    [sender, receiver] = getAllUsers();
  });

  it("seeds an empty scheduledpayments table", () => {
    expect(getAllForEntity("scheduledpayments")).toEqual([]);
  });

  describe("createScheduledPayment", () => {
    it("creates an active schedule whose next run is the start date", () => {
      const scheduledPayment = createScheduledPayment(
        sender.id,
        buildPayload({ endDate: "2027-06-01" })
      );

      expect(scheduledPayment.id).toBeDefined();
      expect(scheduledPayment.uuid).toBeDefined();
      expect(scheduledPayment).toMatchObject({
        senderId: sender.id,
        receiverId: receiver.id,
        amount: 2500,
        description: "Rent 🏠",
        frequency: ScheduledPaymentFrequency.monthly,
        startDate: "2026-12-01",
        endDate: "2027-06-01",
        nextRunAt: "2026-12-01",
        status: ScheduledPaymentStatus.active,
      });
      expect(scheduledPayment.lastRunAt).toBeUndefined();
      expect(scheduledPayment.createdAt).toBeDefined();
      expect(scheduledPayment.modifiedAt).toBeDefined();
      expect(getAllForEntity("scheduledpayments")).toHaveLength(1);
    });

    it("defaults privacyLevel to the sender's default privacy level", () => {
      const scheduledPayment = createScheduledPayment(sender.id, buildPayload());
      expect(scheduledPayment.privacyLevel).toBe(sender.defaultPrivacyLevel);
    });

    it("keeps an explicit privacyLevel and source", () => {
      const scheduledPayment = createScheduledPayment(
        sender.id,
        buildPayload({ privacyLevel: DefaultPrivacyLevel.private, source: "bankAccount1" })
      );
      expect(scheduledPayment.privacyLevel).toBe(DefaultPrivacyLevel.private);
      expect(scheduledPayment.source).toBe("bankAccount1");
    });
  });

  describe("getScheduledPaymentById", () => {
    it("returns the schedule with that id", () => {
      const created = createScheduledPayment(sender.id, buildPayload());
      expect(getScheduledPaymentById(created.id)).toEqual(created);
    });

    it("returns undefined for an unknown id", () => {
      expect(getScheduledPaymentById("does-not-exist")).toBeUndefined();
    });
  });

  describe("getScheduledPaymentsByUserId", () => {
    it("returns only the sender's schedules sorted by nextRunAt, finished ones last", () => {
      const later = createScheduledPayment(sender.id, buildPayload({ startDate: "2027-01-15" }));
      const finished = createScheduledPayment(sender.id, buildPayload({ startDate: "2026-11-01" }));
      updateScheduledPaymentById(finished.id, {
        nextRunAt: null,
        status: ScheduledPaymentStatus.completed,
      });
      const sooner = createScheduledPayment(sender.id, buildPayload({ startDate: "2026-12-01" }));
      createScheduledPayment(receiver.id, buildPayload({ receiverId: sender.id }));

      const result = getScheduledPaymentsByUserId(sender.id);

      expect(result.map((scheduledPayment) => scheduledPayment.id)).toEqual([
        sooner.id,
        later.id,
        finished.id,
      ]);
    });

    it("does not include schedules where the user is only the receiver", () => {
      createScheduledPayment(sender.id, buildPayload());
      expect(getScheduledPaymentsByUserId(receiver.id)).toEqual([]);
    });
  });

  describe("updateScheduledPaymentById", () => {
    it("applies edits, bumps modifiedAt and persists them", async () => {
      const created = createScheduledPayment(
        sender.id,
        buildPayload({ frequency: ScheduledPaymentFrequency.weekly })
      );
      const createdModifiedAt = new Date(created.modifiedAt).getTime();
      await new Promise((resolve) => setTimeout(resolve, 5));

      const updated = updateScheduledPaymentById(created.id, {
        lastRunAt: "2026-12-01",
        nextRunAt: "2026-12-08",
      });

      expect(updated).toMatchObject({
        id: created.id,
        lastRunAt: "2026-12-01",
        nextRunAt: "2026-12-08",
        status: ScheduledPaymentStatus.active,
      });
      expect(new Date(updated.modifiedAt).getTime()).toBeGreaterThan(createdModifiedAt);
      expect(getScheduledPaymentById(created.id)).toEqual(updated);
    });

    it("cancels a schedule", () => {
      const created = createScheduledPayment(sender.id, buildPayload());
      const canceled = updateScheduledPaymentById(created.id, {
        status: ScheduledPaymentStatus.canceled,
      });
      expect(canceled.status).toBe(ScheduledPaymentStatus.canceled);
    });
  });

  describe("getDueScheduledPayments", () => {
    const now = new Date(2026, 11, 1, 9, 30); // Dec 1 2026, 09:30 server local time

    it("returns active schedules whose nextRunAt is on or before now, oldest first", () => {
      const today = createScheduledPayment(sender.id, buildPayload({ startDate: "2026-12-01" }));
      const missed = createScheduledPayment(sender.id, buildPayload({ startDate: "2026-11-20" }));
      createScheduledPayment(sender.id, buildPayload({ startDate: "2026-12-02" }));

      const due = getDueScheduledPayments(now);

      expect(due.map((scheduledPayment) => scheduledPayment.id)).toEqual([missed.id, today.id]);
    });

    it("includes schedules from every sender", () => {
      const fromSender = createScheduledPayment(sender.id, buildPayload());
      const fromReceiver = createScheduledPayment(
        receiver.id,
        buildPayload({ receiverId: sender.id })
      );

      const dueIds = getDueScheduledPayments(now).map((scheduledPayment) => scheduledPayment.id);

      expect(dueIds).toHaveLength(2);
      expect(dueIds).toEqual(expect.arrayContaining([fromSender.id, fromReceiver.id]));
    });

    it("skips canceled, completed and finished schedules", () => {
      const canceled = createScheduledPayment(sender.id, buildPayload());
      updateScheduledPaymentById(canceled.id, { status: ScheduledPaymentStatus.canceled });
      const completed = createScheduledPayment(sender.id, buildPayload());
      updateScheduledPaymentById(completed.id, {
        status: ScheduledPaymentStatus.completed,
        nextRunAt: null,
      });
      const finishedButActive = createScheduledPayment(sender.id, buildPayload());
      updateScheduledPaymentById(finishedButActive.id, { nextRunAt: null });

      expect(getDueScheduledPayments(now)).toEqual([]);
    });

    it("returns nothing when no schedules exist", () => {
      expect(getDueScheduledPayments(now)).toEqual([]);
    });
  });

  describe("processDueScheduledPayments", () => {
    // Server local time, matching how due dates are compared
    const at = (isoDate: string) => new Date(`${isoDate}T09:30:00`);

    const transactionsFor = (scheduledPaymentId: string): Transaction[] =>
      (getAllForEntity("transactions") as Transaction[]).filter(
        (transaction) => transaction.scheduledPaymentId === scheduledPaymentId
      );

    it("creates one completed payment per due schedule, stamped with scheduledPaymentId", () => {
      const scheduledPayment = createScheduledPayment(
        sender.id,
        buildPayload({ frequency: ScheduledPaymentFrequency.once, startDate: "2026-12-01" })
      );

      const [transaction] = processDueScheduledPayments(at("2026-12-01"));

      expect(transaction).toMatchObject({
        senderId: sender.id,
        receiverId: receiver.id,
        amount: 2500,
        description: "Rent 🏠",
        privacyLevel: scheduledPayment.privacyLevel,
        scheduledPaymentId: scheduledPayment.id,
      });
      expect(transactionsFor(scheduledPayment.id)).toHaveLength(1);
      expect(transactionsFor(scheduledPayment.id)[0].status).toBe("complete");
    });

    it("completes a one-time schedule after it runs", () => {
      const scheduledPayment = createScheduledPayment(
        sender.id,
        buildPayload({ frequency: ScheduledPaymentFrequency.once, startDate: "2026-12-01" })
      );

      processDueScheduledPayments(at("2026-12-01"));

      expect(getScheduledPaymentById(scheduledPayment.id)).toMatchObject({
        status: ScheduledPaymentStatus.completed,
        nextRunAt: null,
        lastRunAt: "2026-12-01",
      });
    });

    it("does nothing before the start date", () => {
      const scheduledPayment = createScheduledPayment(sender.id, buildPayload());

      expect(processDueScheduledPayments(at("2026-11-30"))).toEqual([]);
      expect(getScheduledPaymentById(scheduledPayment.id).nextRunAt).toBe("2026-12-01");
    });

    it("moves a weekly schedule on by 7 days", () => {
      const scheduledPayment = createScheduledPayment(
        sender.id,
        buildPayload({ frequency: ScheduledPaymentFrequency.weekly })
      );

      processDueScheduledPayments(at("2026-12-01"));

      expect(getScheduledPaymentById(scheduledPayment.id)).toMatchObject({
        status: ScheduledPaymentStatus.active,
        nextRunAt: "2026-12-08",
        lastRunAt: "2026-12-01",
      });
    });

    it("moves a monthly schedule to the same day next month", () => {
      const scheduledPayment = createScheduledPayment(
        sender.id,
        buildPayload({ startDate: "2026-12-15" })
      );

      processDueScheduledPayments(at("2026-12-15"));

      expect(getScheduledPaymentById(scheduledPayment.id).nextRunAt).toBe("2027-01-15");
    });

    it("clamps monthly runs on the 31st to month end and returns to the 31st after", () => {
      const scheduledPayment = createScheduledPayment(
        sender.id,
        buildPayload({ startDate: "2027-01-31" })
      );

      processDueScheduledPayments(at("2027-01-31"));
      expect(getScheduledPaymentById(scheduledPayment.id).nextRunAt).toBe("2027-02-28");

      processDueScheduledPayments(at("2027-02-28"));
      expect(getScheduledPaymentById(scheduledPayment.id).nextRunAt).toBe("2027-03-31");

      processDueScheduledPayments(at("2027-03-31"));
      expect(getScheduledPaymentById(scheduledPayment.id).nextRunAt).toBe("2027-04-30");
      expect(transactionsFor(scheduledPayment.id)).toHaveLength(3);
    });

    it("clamps Jan 31 to Feb 29 in a leap year", () => {
      const scheduledPayment = createScheduledPayment(
        sender.id,
        buildPayload({ startDate: "2028-01-31" })
      );

      processDueScheduledPayments(at("2028-01-31"));

      expect(getScheduledPaymentById(scheduledPayment.id).nextRunAt).toBe("2028-02-29");
    });

    it("keeps a run that falls on the end date and completes the schedule after it", () => {
      const scheduledPayment = createScheduledPayment(
        sender.id,
        buildPayload({ frequency: ScheduledPaymentFrequency.weekly, endDate: "2026-12-08" })
      );

      processDueScheduledPayments(at("2026-12-01"));
      expect(getScheduledPaymentById(scheduledPayment.id)).toMatchObject({
        status: ScheduledPaymentStatus.active,
        nextRunAt: "2026-12-08",
      });

      processDueScheduledPayments(at("2026-12-08"));
      expect(getScheduledPaymentById(scheduledPayment.id)).toMatchObject({
        status: ScheduledPaymentStatus.completed,
        nextRunAt: null,
        lastRunAt: "2026-12-08",
      });
      expect(transactionsFor(scheduledPayment.id)).toHaveLength(2);
    });

    it("completes the schedule when the next run would be past the end date", () => {
      const scheduledPayment = createScheduledPayment(
        sender.id,
        buildPayload({ endDate: "2026-12-20" })
      );

      processDueScheduledPayments(at("2026-12-01"));

      expect(getScheduledPaymentById(scheduledPayment.id)).toMatchObject({
        status: ScheduledPaymentStatus.completed,
        nextRunAt: null,
      });
    });

    it("does not run canceled schedules", () => {
      const scheduledPayment = createScheduledPayment(sender.id, buildPayload());
      updateScheduledPaymentById(scheduledPayment.id, {
        status: ScheduledPaymentStatus.canceled,
        nextRunAt: null,
      });

      expect(processDueScheduledPayments(at("2026-12-01"))).toEqual([]);
      expect(transactionsFor(scheduledPayment.id)).toEqual([]);
    });

    it("is idempotent for the same now", () => {
      const scheduledPayment = createScheduledPayment(
        sender.id,
        buildPayload({ frequency: ScheduledPaymentFrequency.weekly })
      );

      expect(processDueScheduledPayments(at("2026-12-01"))).toHaveLength(1);
      expect(processDueScheduledPayments(at("2026-12-01"))).toEqual([]);
      expect(processDueScheduledPayments(new Date("2026-12-01T23:59:00"))).toEqual([]);
      expect(transactionsFor(scheduledPayment.id)).toHaveLength(1);
    });

    it("runs missed runs once and skips ahead to the next future date", () => {
      const scheduledPayment = createScheduledPayment(
        sender.id,
        buildPayload({ frequency: ScheduledPaymentFrequency.weekly })
      );

      // Due Dec 1, 8 and 15; the server comes back on Dec 17
      processDueScheduledPayments(at("2026-12-17"));

      expect(transactionsFor(scheduledPayment.id)).toHaveLength(1);
      expect(getScheduledPaymentById(scheduledPayment.id)).toMatchObject({
        nextRunAt: "2026-12-22",
        lastRunAt: "2026-12-17",
      });
    });

    it("moves balances the same way as an immediate payment", () => {
      const senderBalance = getUserById(sender.id).balance;
      const receiverBalance = getUserById(receiver.id).balance;
      expect(senderBalance).toBeGreaterThanOrEqual(2501);
      createScheduledPayment(sender.id, buildPayload({ amount: 2501 }));

      const [transaction] = processDueScheduledPayments(at("2026-12-01"));

      expect(transaction.amount).toBe(2501);
      expect(getUserById(sender.id).balance).toBe(senderBalance - 2501);
      expect(getUserById(receiver.id).balance).toBe(receiverBalance + 2501);
    });

    it("ignores a scheduledPaymentId sent in a regular payment payload", () => {
      const scheduledPayment = createScheduledPayment(sender.id, buildPayload());

      const transaction = createTransaction(sender.id, "payment", {
        senderId: sender.id,
        receiverId: receiver.id,
        amount: 10,
        description: "Not scheduled",
        privacyLevel: DefaultPrivacyLevel.public,
        source: "",
        status: TransactionStatus.pending,
        scheduledPaymentId: scheduledPayment.id,
      });

      expect(transaction.scheduledPaymentId).toBeUndefined();
    });

    it("runs every due schedule in one pass", () => {
      createScheduledPayment(sender.id, buildPayload());
      createScheduledPayment(receiver.id, buildPayload({ receiverId: sender.id }));

      expect(processDueScheduledPayments(at("2026-12-01"))).toHaveLength(2);
    });
  });

  describe("isSchedulerEnabled", () => {
    it("is on outside the test environment", () => {
      expect(isSchedulerEnabled({ NODE_ENV: "development" })).toBe(true);
      expect(isSchedulerEnabled({})).toBe(true);
    });

    it("is off under NODE_ENV=test unless opted in", () => {
      expect(isSchedulerEnabled({ NODE_ENV: "test" })).toBe(false);
      expect(isSchedulerEnabled({ NODE_ENV: "test", SCHEDULED_PAYMENTS_SCHEDULER: "true" })).toBe(
        true
      );
    });
  });
});
