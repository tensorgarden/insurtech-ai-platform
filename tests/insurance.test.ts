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

  it("tracks required evidence checklists before claims look adjuster-ready", () => {
    const validRequirementStatuses = new Set([
      "received",
      "pending_customer",
      "pending_third_party",
      "needs_adjuster_review",
    ]);
    const validOwnerRoles = new Set(["adjuster", "supervisor", "legal", "customer", "third_party"]);

    for (const claim of demoClaims) {
      expect(claim.evidenceRequirements.length).toBeGreaterThanOrEqual(2);
      expect(claim.evidenceRequirements.some((item) => item.status === "received")).toBe(true);

      for (const item of claim.evidenceRequirements) {
        expect(item.label.length).toBeGreaterThan(10);
        expect(validRequirementStatuses.has(item.status)).toBe(true);
        expect(validOwnerRoles.has(item.ownerRole)).toBe(true);

        if (item.status !== "received") {
          expect(item.dueAt).toBeDefined();
          expect(Number.isNaN(Date.parse(item.dueAt ?? ""))).toBe(false);
        }
      }

      if (claim.documentStatus === "complete") {
        expect(claim.evidenceRequirements.every((item) => item.status === "received")).toBe(true);
      }
    }
  });

  it("keeps unresolved evidence requirements in the right owner lane", () => {
    const reviewerRoles = new Set(["adjuster", "supervisor", "legal"]);

    for (const claim of demoClaims.filter((c) => c.documentStatus !== "complete")) {
      const unresolved = claim.evidenceRequirements.filter((item) => item.status !== "received");
      expect(unresolved.length).toBeGreaterThan(0);

      for (const item of unresolved) {
        const lastUpdated = Date.parse(claim.lastUpdated);
        const dueAt = Date.parse(item.dueAt ?? "");
        expect(dueAt).toBeGreaterThan(lastUpdated);
        expect(dueAt - lastUpdated).toBeLessThanOrEqual(5 * 24 * 60 * 60 * 1000);
      }

      if (claim.documentStatus === "pending_third_party") {
        expect(
          unresolved.some(
            (item) => item.status === "pending_third_party" && item.ownerRole === "third_party",
          ),
        ).toBe(true);
      }

      if (claim.documentStatus === "pending_customer") {
        expect(
          unresolved.some(
            (item) => item.status === "pending_customer" && item.ownerRole === "customer",
          ),
        ).toBe(true);
      }

      if (claim.documentStatus === "needs_review") {
        expect(
          unresolved.some(
            (item) => item.status === "needs_adjuster_review" && reviewerRoles.has(item.ownerRole),
          ),
        ).toBe(true);
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

  it("keeps each claim tied to a dated governance checkpoint", () => {
    const validOwnerRoles = new Set(["adjuster", "supervisor", "legal", "customer", "third_party"]);

    for (const claim of demoClaims) {
      expect(validOwnerRoles.has(claim.governanceCheckpoint.ownerRole)).toBe(true);
      expect(claim.governanceCheckpoint.nextAction.length).toBeGreaterThan(40);
      expect(Number.isNaN(Date.parse(claim.governanceCheckpoint.dueAt))).toBe(false);
    }
  });

  it("assigns missing-info and adverse decisions to accountable follow-up", () => {
    for (const claim of demoClaims) {
      if (claim.triageLane === "missing_information") {
        expect(["customer", "third_party"]).toContain(claim.governanceCheckpoint.ownerRole);
        expect(claim.governanceCheckpoint.nextAction).toMatch(
          /collect|pending|estimate|reconcile|document/i,
        );
      }

      if (claim.adverseActionNoticeRequired) {
        expect(["supervisor", "legal"]).toContain(claim.governanceCheckpoint.ownerRole);
        expect(claim.governanceCheckpoint.nextAction).toMatch(/notice|policy|supervisor|legal/i);
      }
    }
  });

  it("keeps missing-information claims out of adjuster-ready queues until recontact blockers are resolved", () => {
    for (const claim of demoClaims.filter((c) => c.triageLane === "missing_information")) {
      expect(claim.documentStatus).not.toBe("complete");
      expect(claim.reviewGate).not.toBe("auto_clear");
      expect(claim.governanceCheckpoint.nextAction).toMatch(
        /collect|pending|reconcile|document|estimate/i,
      );

      const lastUpdated = Date.parse(claim.lastUpdated);
      const followUpDue = Date.parse(claim.governanceCheckpoint.dueAt);
      expect(followUpDue).toBeGreaterThan(lastUpdated);
      expect(followUpDue - lastUpdated).toBeLessThanOrEqual(5 * 24 * 60 * 60 * 1000);
    }
  });

  it("routes third-party evidence gaps to third-party follow-up instead of customer recontact", () => {
    const thirdPartyDependencyClaims = demoClaims.filter((c) =>
      c.triageSignals.includes("third_party_dependency"),
    );

    expect(thirdPartyDependencyClaims.length).toBeGreaterThan(0);

    for (const claim of thirdPartyDependencyClaims) {
      expect(claim.governanceCheckpoint.ownerRole).toBe("third_party");
      expect(`${claim.aiDecisionRationale} ${claim.notes}`).toMatch(
        /third-party|estimate|fire|restoration/i,
      );
      expect(claim.triageLane).toBe("missing_information");
    }
  });

  it("keeps customer and third-party communication checkpoints current", () => {
    const validAudiences = new Set(["customer", "third_party", "internal"]);
    const validStatuses = new Set(["sent", "scheduled", "waiting_on_response", "not_required"]);

    expect(demoClaims.some((c) => c.communicationCheckpoint.audience === "third_party")).toBe(true);

    for (const claim of demoClaims) {
      const checkpoint = claim.communicationCheckpoint;
      expect(validAudiences.has(checkpoint.audience)).toBe(true);
      expect(validStatuses.has(checkpoint.status)).toBe(true);
      expect(checkpoint.message.length).toBeGreaterThan(40);

      if (checkpoint.lastSentAt) {
        expect(Number.isNaN(Date.parse(checkpoint.lastSentAt))).toBe(false);
      }

      if (["new", "under_review"].includes(claim.status)) {
        expect(checkpoint.nextDueAt).toBeDefined();
        const lastUpdated = Date.parse(claim.lastUpdated);
        const nextDueAt = Date.parse(checkpoint.nextDueAt ?? "");
        expect(nextDueAt).toBeGreaterThan(lastUpdated);
        expect(nextDueAt - lastUpdated).toBeLessThanOrEqual(3 * 24 * 60 * 60 * 1000);
      }

      if (claim.documentStatus === "pending_third_party") {
        expect(checkpoint.audience).toBe("third_party");
        expect(checkpoint.status).toBe("waiting_on_response");
        expect(checkpoint.message).toMatch(/third-party|vendor|estimate|blocker/i);
      }
    }
  });

  it("uses each claimant's preferred channel for customer updates", () => {
    const customerPreferences = new Map(
      demoCustomers.map((customer) => [customer.id, customer.preferredCommunicationChannel]),
    );
    const validChannels = new Set(["email", "sms", "phone", "customer_portal", "vendor_portal"]);

    expect(demoClaims.some((claim) => claim.communicationCheckpoint.channel === "sms")).toBe(true);
    expect(
      demoClaims.some((claim) => claim.communicationCheckpoint.channel === "customer_portal"),
    ).toBe(true);

    for (const claim of demoClaims) {
      const checkpoint = claim.communicationCheckpoint;
      expect(validChannels.has(checkpoint.channel)).toBe(true);

      if (checkpoint.audience === "customer") {
        expect(checkpoint.channel).toBe(customerPreferences.get(claim.customerId));
      }

      if (checkpoint.audience === "third_party") {
        expect(checkpoint.channel).toBe("vendor_portal");
      }
    }
  });

  it("spells out human escalation before automated claim recommendations are trusted", () => {
    const escalationSignals = new Set([
      "large_loss",
      "high_fraud_score",
      "coverage_dispute",
      "legal_exposure",
      "adverse_action_risk",
      "liability_review",
    ]);
    const accountableOwnerRoles = new Set(["adjuster", "supervisor", "legal", "third_party"]);
    const thresholdClaims = demoClaims.filter((claim) =>
      claim.triageSignals.some((signal) => escalationSignals.has(signal)) ||
      claim.aiFraudScore >= 70 ||
      claim.amount >= 80000,
    );

    expect(thresholdClaims.length).toBeGreaterThan(0);

    for (const claim of thresholdClaims) {
      const reviewPacket = `${claim.governanceCheckpoint.nextAction} ${claim.aiDecisionRationale}`;
      expect(claim.reviewGate).not.toBe("auto_clear");
      expect(accountableOwnerRoles.has(claim.governanceCheckpoint.ownerRole)).toBe(true);
      expect(reviewPacket).toMatch(
        /adjuster|supervisor|legal|review|confirm|validate|reconcile|settlement|liability|policy/i,
      );
      expect(claim.communicationCheckpoint.status).not.toBe("not_required");
    }
  });

  it("keeps adverse customer notices behind reviewer validation", () => {
    const adverseClaims = demoClaims.filter((claim) => claim.adverseActionNoticeRequired);

    expect(adverseClaims.length).toBeGreaterThan(0);

    for (const claim of adverseClaims) {
      expect(["supervisor", "legal"]).toContain(claim.governanceCheckpoint.ownerRole);
      expect(claim.communicationCheckpoint.audience).toBe("customer");
      expect(claim.communicationCheckpoint.status).toBe("scheduled");
      expect(claim.communicationCheckpoint.message).toMatch(/supervisor|legal|validates|notice/i);
      expect(Date.parse(claim.communicationCheckpoint.nextDueAt ?? "")).toBeGreaterThanOrEqual(
        Date.parse(claim.governanceCheckpoint.dueAt),
      );
    }
  });

  it("keeps adverse decisions contestable through a named human review path", () => {
    const adverseClaims = demoClaims.filter((claim) => claim.adverseActionNoticeRequired);

    expect(adverseClaims.length).toBeGreaterThan(0);

    for (const claim of adverseClaims) {
      const checkpoint = claim.claimantReviewCheckpoint;
      expect(checkpoint).toBeDefined();
      expect(["supervisor", "legal"]).toContain(checkpoint?.reviewerRole);
      expect(checkpoint?.requestChannels).toEqual(
        expect.arrayContaining(["customer_portal", "claims_phone", "written_request"]),
      );
      expect(checkpoint?.decisionBasisSummary).toMatch(/policy|evidence|coverage|statement/i);
      expect(checkpoint?.ruleReference).toMatch(/carrier-configured.+reconsideration workflow/i);
    }

    for (const claim of demoClaims.filter((item) => !item.adverseActionNoticeRequired)) {
      expect(claim.claimantReviewCheckpoint).toBeUndefined();
    }
  });

  it("does not start a claimant review deadline before the reviewed notice is sent", () => {
    for (const claim of demoClaims.filter((item) => item.adverseActionNoticeRequired)) {
      const checkpoint = claim.claimantReviewCheckpoint;
      expect(checkpoint?.status).toBe("pending_notice");
      expect(checkpoint?.requestBy).toBeUndefined();
      expect(claim.communicationCheckpoint.status).toBe("scheduled");
      expect(claim.complianceCheckpoint.obligation).toBe("decision_notice");
    }
  });

  it("tracks temporary mitigation evidence on property-damage claims", () => {
    const propertyDamageClaims = demoClaims.filter((claim) => claim.type === "home_fire");

    expect(propertyDamageClaims.length).toBeGreaterThan(0);

    for (const claim of propertyDamageClaims) {
      const checkpoint = claim.lossMitigationCheckpoint;
      expect(checkpoint).toBeDefined();
      expect(["customer", "third_party", "adjuster"]).toContain(checkpoint?.ownerRole);
      expect(checkpoint?.action).toMatch(/temporary|prevent|damage|repair|weather/i);
      expect(checkpoint?.evidenceItems.some((item) => /photo/i.test(item.label))).toBe(true);
      expect(checkpoint?.evidenceItems.some((item) => /receipt/i.test(item.label))).toBe(true);
    }
  });

  it("keeps permanent repairs blocked until carrier inspection is complete", () => {
    const mitigationCheckpoints = demoClaims.flatMap((claim) =>
      claim.lossMitigationCheckpoint ? [claim.lossMitigationCheckpoint] : [],
    );

    expect(mitigationCheckpoints.some((checkpoint) => checkpoint.inspectionStatus === "pending")).toBe(
      true,
    );

    for (const checkpoint of mitigationCheckpoints) {
      if (checkpoint.inspectionStatus === "pending") {
        expect(checkpoint.permanentRepairsAuthorized).toBe(false);
      }

      if (checkpoint.permanentRepairsAuthorized) {
        expect(checkpoint.inspectionStatus).toBe("completed");
        expect(checkpoint.evidenceItems.every((item) => item.status === "received")).toBe(true);
      }
    }
  });

  it("gives pending property inspections a visible appointment before repairs can proceed", () => {
    const pendingInspectionClaims = demoClaims.filter(
      (claim) => claim.lossMitigationCheckpoint?.inspectionStatus === "pending",
    );

    expect(pendingInspectionClaims.length).toBeGreaterThan(0);

    for (const claim of pendingInspectionClaims) {
      const checkpoint = claim.lossMitigationCheckpoint;
      expect(checkpoint?.inspectionScheduledAt).toBeDefined();
      expect(Number.isNaN(Date.parse(checkpoint?.inspectionScheduledAt ?? ""))).toBe(false);
      const appointmentAt = Date.parse(checkpoint?.inspectionScheduledAt ?? "");
      const filedAt = Date.parse(claim.filedDate);
      expect(appointmentAt).toBeGreaterThan(Date.parse(claim.lastUpdated));
      expect(appointmentAt - filedAt).toBeLessThanOrEqual(30 * 24 * 60 * 60 * 1000);
      expect(checkpoint?.permanentRepairsAuthorized).toBe(false);
    }
  });

  it("keeps a jurisdiction-aware compliance diary on every claim", () => {
    const validObligations = new Set([
      "claim_acknowledgment",
      "status_update",
      "decision_notice",
      "settlement_payment",
    ]);
    const validStatuses = new Set(["met", "due", "at_risk"]);
    const customerStates = new Map(demoCustomers.map((customer) => [customer.id, customer.state]));

    for (const claim of demoClaims) {
      const checkpoint = claim.complianceCheckpoint;
      expect(checkpoint.jurisdiction).toBe(customerStates.get(claim.customerId));
      expect(validObligations.has(checkpoint.obligation)).toBe(true);
      expect(validStatuses.has(checkpoint.status)).toBe(true);
      expect(Number.isNaN(Date.parse(checkpoint.dueAt))).toBe(false);
      expect(checkpoint.ruleReference).toMatch(/carrier-configured.+diary/i);

      if (checkpoint.status === "met") {
        expect(checkpoint.completedAt).toBeDefined();
        expect(Date.parse(checkpoint.completedAt ?? "")).toBeLessThanOrEqual(
          Date.parse(checkpoint.dueAt),
        );
      } else {
        expect(checkpoint.completedAt).toBeUndefined();
        expect(Date.parse(checkpoint.dueAt)).toBeGreaterThan(Date.parse(claim.lastUpdated));
      }
    }
  });

  it("does not mark open or adverse-action compliance obligations complete", () => {
    for (const claim of demoClaims.filter(
      (item) => ["new", "under_review"].includes(item.status) || item.adverseActionNoticeRequired,
    )) {
      expect(claim.complianceCheckpoint.status).not.toBe("met");
    }

    for (const claim of demoClaims.filter((item) => item.adverseActionNoticeRequired)) {
      expect(claim.complianceCheckpoint.obligation).toBe("decision_notice");
      expect(claim.communicationCheckpoint.status).toBe("scheduled");
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
