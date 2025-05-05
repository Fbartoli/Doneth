import { onchainTable, relations } from "ponder";
import { zeroAddress } from "viem";

export const Campaign = onchainTable("Campaign", (t) => ({
  address: t.hex().primaryKey(),
  name: t.text(),
  beneficiary: t.hex(),
  goal: t.bigint(),
  deadline: t.bigint(),
  currency: t.hex().default(zeroAddress),
  totalContributions: t.bigint().default(0n),
  withdrawalPeriod: t.bigint(),
  createdAt: t.bigint(),
  updatedAt: t.bigint(),
}));

export const Contributor = onchainTable("Contributor", (t) => ({
  address: t.hex().primaryKey(),
  createdAt: t.bigint(),
  updatedAt: t.bigint(),
}));

export const Contribution = onchainTable("Contribution", (t) => ({
  id: t.hex().primaryKey(),
  campaignAddress: t.hex(),
  contributor: t.hex(),
  amount: t.bigint(),
  currency: t.hex().default(zeroAddress),
  createdAt: t.bigint(),
  updatedAt: t.bigint(),
}));

// Campaign: one-to-many with Contribution
export const CampaignRelations = relations(Campaign, ({ many }) => ({
  contributions: many(Contribution, { relationName: "contributions" }),
}));

// Contribution: one-to-one with Campaign, one-to-one with Contributor
export const ContributionRelations = relations(Contribution, ({ one }) => ({
  campaign: one(Campaign, { fields: [Contribution.campaignAddress], references: [Campaign.address] }),
  contributor: one(Contributor, { fields: [Contribution.contributor], references: [Contributor.address] }),
}));

// Contributor: one-to-many with Contribution
export const ContributorRelations = relations(Contributor, ({ many }) => ({
  contributions: many(Contribution, { relationName: "contributions" }),
}));

