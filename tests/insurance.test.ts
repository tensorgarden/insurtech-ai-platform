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

  it("captures FNOL intake channel and document readiness for every claim", () => {
    for (const claim of demoClaims) {
      expect(claim.fnolChannel).toMatch(/^(mobile_app|agent_portal|call_center|web_form)$/);
      expect(claim.documentStatus).toMatch(/^(complete|pending_customer|pending_third_party|needs_review)$/);
    }
  });

  it("keeps claims ready for payout free of intake document blockers", () => {
    for (const claim of demoClaims.filter((c) => ["approved", "paid"].includes(c.status))) {
      expect(claim.documentStatus).toBe("complete");
    }
  });

  it("records explainable AI rationale and evidence anchors for every claim", () => {
    const validEvidenceSources = new Set([
      "police_report",
      "photos",
      "repair_estimate",
      "fire_report",
      "policy_record",
      "medical_bill",
      "customer_statement",
    ]);

    for (const claim of demoClaims) {
      expect(claim.aiDecisionRationale.length).toBeGreaterThan(50);
      expect(claim.evidenceAnchors.length).toBeGreaterThanOrEqual(2);
      for (const anchor of claim.evidenceAnchors) {
        expect(anchor.label.length).toBeGreaterThan(10);
        expect(validEvidenceSources.has(anchor.sourceType)).toBe(true);
        expect(Number.isNaN(Date.parse(anchor.receivedAt))).toBe(false);
      }
    }
  });

  it("routes denied or adverse claim recommendations through human review", () => {
    const elevatedReviewGates = new Set(["supervisor_review", "legal_review"]);
    for (const claim of demoClaims.filter((c) => c.status === "denied" || c.adverseActionNoticeRequired)) {
      expect(claim.adverseActionNoticeRequired).toBe(true);
      expect(elevatedReviewGates.has(claim.reviewGate)).toBe(true);
      expect(claim.evidenceAnchors.some((a) => a.sourceType === "policy_record")).toBe(true);
    }
  });

  it("does not auto-clear high-fraud or large-loss claim decisions", () => {
    for (const claim of demoClaims.filter((c) => c.aiFraudScore >= 70 || c.amount >= 80000)) {
      expect(claim.reviewGate).not.toBe("auto_clear");
      expect(claim.aiDecisionRationale).toMatch(/review|policy|reserve|loss|settlement/i);
    }
  });

  it("keeps AI triage lane routing evidence-linked and governed", () => {
    for (const claim of demoClaims) {
      expect(claim.triageSignals.length).toBeGreaterThan(0);

      if (["pending_customer", "pending_third_party"].includes(claim.documentStatus)) {
        expect(claim.triageLane).toBe("missing_information");
        expect(
          claim.triageSignals.some((signal) =>
            ["missing_required_documents", "third_party_dependency"].includes(signal),
          ),
        ).toBe(true);
      }

      if (claim.amount >= 80000 || claim.aiFraudScore >= 70 || claim.adverseActionNoticeRequired) {
        expect(["missing_information", "specialist_review"]).toContain(claim.triageLane);
        expect(claim.reviewGate).not.toBe("auto_clear");
      }

      if (claim.triageLane === "standard") {
        expect(claim.documentStatus).toBe("complete");
        expect(claim.adverseActionNoticeRequired).toBe(false);
        expect(claim.aiFraudScore).toBeLessThan(40);
      }
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

  it("claim reserves are positive and cover expected payout when resolved", () => {
    for (const claim of demoClaims) {
      expect(claim.reserveAmount).toBeGreaterThan(0);
      // Paid claims: reserve should cover the payout (no reserve deficiency on closed claims)
      if (claim.status === "paid") {
        expect(claim.reserveAmount).toBeGreaterThanOrEqual(claim.payoutAmount);
      }
      // Denied claims: reserve was set but payout is zero (reserve released)
      if (claim.status === "denied") {
        expect(claim.payoutAmount).toBe(0);
        expect(claim.reserveAmount).toBeGreaterThan(0);
      }
    }
  });

  it("open claims under review carry conservative reserves", () => {
    const openClaims = demoClaims.filter((c) =>
      ["new", "under_review"].includes(c.status)
    );
    for (const claim of openClaims) {
      // Open claims should have reserves at or above the expected payout floor
      const expectedPayoutFloor = claim.amount - claim.deductibleApplied;
      expect(claim.reserveAmount).toBeGreaterThanOrEqual(expectedPayoutFloor);
    }
  });
});
