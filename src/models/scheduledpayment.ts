import { DefaultPrivacyLevel } from "./user";

export enum ScheduledPaymentFrequency {
  once = "once",
  weekly = "weekly",
  monthly = "monthly",
}

export enum ScheduledPaymentStatus {
  active = "active",
  completed = "completed",
  canceled = "canceled",
}

export interface ScheduledPayment {
  id: string;
  uuid: string;
  senderId: string;
  receiverId: string;
  amount: number; // cents, same as Transaction.amount
  description: string;
  privacyLevel: DefaultPrivacyLevel;
  source?: string; // BankAccount ID, mirrors Transaction.source
  frequency: ScheduledPaymentFrequency;
  startDate: string; // ISO date (YYYY-MM-DD)
  endDate?: string; // ISO date (YYYY-MM-DD), inclusive; recurring only
  nextRunAt: string | null; // ISO date (YYYY-MM-DD) of next run; null when finished
  lastRunAt?: string;
  status: ScheduledPaymentStatus;
  createdAt: Date;
  modifiedAt: Date;
}

export type ScheduledPaymentPayload = Pick<
  ScheduledPayment,
  "receiverId" | "amount" | "description" | "frequency" | "startDate"
> &
  Partial<Pick<ScheduledPayment, "privacyLevel" | "source" | "endDate">>;
