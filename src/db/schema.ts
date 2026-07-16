import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["owner", "trainer", "member"]);

export const billingPeriodEnum = pgEnum("billing_period", ["monthly", "yearly"]);

export const gymSubscriptionStatusEnum = pgEnum("gym_subscription_status", [
  "created",
  "active",
  "halted",
  "cancelled",
  "expired",
]);

export const gymAccessStatusEnum = pgEnum("gym_access_status", [
  "trial",
  "active",
  "halted",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", ["success", "failed"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  username: text("username").unique(),
  role: roleEnum("role"), // null until onboarding completes
  gymId: uuid("gym_id"), // references gyms.id, null until onboarding completes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gyms = pgTable("gyms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // invite code trainers/members join with
  address: text("address"),
  ownerId: uuid("owner_id").notNull(), // references users.id

  // --- Razorpay subscription access gate ---
  subscriptionStatus: gymAccessStatusEnum("subscription_status")
    .notNull()
    .default("trial"),
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionId: uuid("subscription_id"), // references gymSubscriptions.id, nullable — current active one

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // 'basic', 'pro'
  razorpayPlanId: text("razorpay_plan_id").notNull().unique(), // 'plan_xxxxx'
  priceInr: integer("price_inr").notNull(),
  billingPeriod: billingPeriodEnum("billing_period").notNull(),
  features: jsonb("features"), // { maxTrainers: 5, maxMembers: 200, ... }
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gymSubscriptions = pgTable("gym_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  gymId: uuid("gym_id")
    .notNull()
    .references(() => gyms.id),
  planId: uuid("plan_id")
    .notNull()
    .references(() => subscriptionPlans.id),
  razorpaySubId: text("razorpay_sub_id").notNull().unique(), // 'sub_xxxxx'
  razorpayPaymentId: text("razorpay_payment_id"), // from first payment / latest charge
  status: gymSubscriptionStatusEnum("status").notNull().default("created"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentLogs = pgTable("payment_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  gymSubscriptionId: uuid("gym_subscription_id")
    .notNull()
    .references(() => gymSubscriptions.id),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpayEvent: text("razorpay_event").notNull(), // 'subscription.charged' | 'subscription.halted' etc.
  amountInr: integer("amount_inr"),
  status: paymentStatusEnum("status").notNull(),
  payload: jsonb("payload"), // raw webhook body
  createdAt: timestamp("created_at").defaultNow().notNull(),
});