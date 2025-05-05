import { sql } from "drizzle-orm";
import { ponder } from "ponder:registry";
import { Campaign, Contribution, Contributor } from "ponder:schema";
import { zeroAddress } from "viem";
ponder.on("Campaign:CampaignStarted", async ({ event, context }) => {
  const {beneficiary, goal, deadline, withdrawalPeriod, name } = event.args;

  await context.db.insert(Campaign).values({
    address: event.log.address,
    name: name,
    beneficiary,
    currency: zeroAddress,
    goal: BigInt(goal),
    deadline: BigInt(deadline),
    withdrawalPeriod: BigInt(withdrawalPeriod),
  });
});


ponder.on("Campaign:Contribution", async ({ event, context }) => {
  const { contributor, amount } = event.args;
  console.log("contributor", contributor);

  const contributorRow = await context.db.insert(Contributor).values({
    address: contributor,
  }).onConflictDoUpdate({updatedAt: event.block.timestamp})

  await context.db.insert(Contribution).values({
    id: contributor + event.block.timestamp.toString() as `0x${string}`,
    campaignAddress: event.log.address,
    contributor: contributorRow.address,
    amount: BigInt(amount),
    currency: zeroAddress,
  });

  await context.db.update(Campaign, {address: event.log.address}).set((row) => ({
    totalContributions: row.totalContributions! + BigInt(amount)
  }))
});
