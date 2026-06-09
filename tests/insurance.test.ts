import { describe, it, expect } from "vitest";
import {
  demoPolicies,
  demoClaims,
  demoCustomers,
  demoRiskAssessments,
  demoClaimsPipeline,
  demoAgencyMetrics,
} from "@/lib/demo-data";

describe("InsurTech AI Platform -- demo data integrity", () => {
  it("has at least 8 policies", () => {
    expect(demoPolicies.length).toBeGreaterThanOrEqual(8);
  });

  it("has at least 6 claims", () => {
    expect(demoClaims.length).toBeGreaterThanOrEqual(6);
  });

  it("has at least 10 customers", () => {
    expect(demoCustomers.length).toBeGreaterThanOrEqual(10);
  });

  it("every policy references a valid customer", () => {
    const customerIds = new Set(demoCustomers.map((c) => c.id));
    for (const policy of demoPolicies) {
      expect(customerIds.has(policy.customerId)).toBe(true);
    }
  });

  it("every claim references a valid policy and customer", () => {
    const policyIds = new Set(demoPolicies.map((p) => p.id));
    const customerIds = new Set(demoCustomers.map((c) => c.id));
    for (const claim of demoClaims) {
      expect(policyIds.has(claim.policyId)).toBe(true);
      expect(customerIds.has(claim.customerId)).toBe(true);
    }
  });

  it("claim amounts are positive and payouts do not exceed amount", () => {
    for (const claim of demoClaims) {
      expect(claim.amount).toBeGreaterThan(0);
      expect(claim.payoutAmount).toBeGreaterThanOrEqual(0);
      expect(claim.payoutAmount).toBeLessThanOrEqual(claim.amount);
    }
  });

  it("policy premium values are internally consistent", () => {
    for (const policy of demoPolicies) {
      expect(policy.annualPremium).toBe(policy.monthlyPremium * 12);
    }
  });

  it("claims pipeline stages are in order", () => {
    for (let i = 1; i < demoClaimsPipeline.length; i++) {
      expect(demoClaimsPipeline[i].order).toBeGreaterThan(demoClaimsPipeline[i - 1].order);
    }
  });

  it("agency metrics are sensible", () => {
    expect(demoAgencyMetrics.activePolicies).toBeGreaterThan(0);
    expect(demoAgencyMetrics.fraudDetectionRate).toBeGreaterThan(0);
    expect(demoAgencyMetrics.fraudDetectionRate).toBeLessThanOrEqual(100);
    expect(demoAgencyMetrics.customerRetentionRate).toBeGreaterThan(0);
    expect(demoAgencyMetrics.npsScore).toBeGreaterThanOrEqual(0);
    expect(demoAgencyMetrics.npsScore).toBeLessThanOrEqual(100);
  });

  it("risk assessments reference valid customers", () => {
    const customerIds = new Set(demoCustomers.map((c) => c.id));
    for (const assessment of demoRiskAssessments) {
      expect(customerIds.has(assessment.customerId)).toBe(true);
      const totalWeight = assessment.factors.reduce((sum, f) => sum + f.weight, 0);
      expect(totalWeight).toBeCloseTo(1.0, 1);
    }
  });
});
