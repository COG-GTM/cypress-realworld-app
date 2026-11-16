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
} from "../../backend/database";
import {
  User,
  DefaultPrivacyLevel,
  ScheduledPaymentFrequency,
  ScheduledPaymentPayload,
  ScheduledPaymentStatus,
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
});
