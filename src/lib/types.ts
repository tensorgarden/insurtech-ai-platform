export type PolicyType = "auto" | "home" | "life" | "commercial";

export type PolicyStatus = "active" | "pending_renewal" | "expiring" | "lapsed" | "cancelled";

export type ClaimStatus = "new" | "under_review" | "approved" | "paid" | "denied";

export type ClaimType = "auto_collision" | "auto_theft" | "home_theft" | "home_fire" | "life_payout" | "commercial_liability";

export type FnolChannel = "mobile_app" | "agent_portal" | "call_center" | "web_form";

export type ClaimDocumentStatus = "complete" | "pending_customer" | "pending_third_party" | "needs_review";

export type ClaimReviewGate = "auto_clear" | "adjuster_review" | "supervisor_review" | "legal_review";

export type ClaimGovernanceOwnerRole = "adjuster" | "supervisor" | "legal" | "customer" | "third_party";

export type ClaimTriageLane = "standard" | "fast_attention" | "specialist_review" | "missing_information";

export type ClaimTriageSignal =
  | "complete_evidence"
  | "missing_required_documents"
  | "third_party_dependency"
  | "large_loss"
  | "high_fraud_score"
  | "coverage_dispute"
  | "legal_exposure"
  | "adverse_action_risk"
  | "liability_review";

export type ClaimEvidenceSource =
  | "police_report"
  | "photos"
  | "repair_estimate"
  | "fire_report"
  | "policy_record"
  | "medical_bill"
  | "customer_statement";

export type ClaimEvidenceRequirementStatus =
  | "received"
  | "pending_customer"
  | "pending_third_party"
  | "needs_adjuster_review";

export interface ClaimEvidenceRequirement {
  label: string;
  status: ClaimEvidenceRequirementStatus;
  ownerRole: ClaimGovernanceOwnerRole;
  dueAt?: string;
}

export type CustomerTier = "platinum" | "gold" | "silver" | "standard";

export type RiskLevel = "low" | "moderate" | "elevated" | "high";

export interface Policy {
  id: string;
  policyNumber: string;
  customerId: string;
  type: PolicyType;
  status: PolicyStatus;
  coverageAmount: number;
  monthlyPremium: number;
  annualPremium: number;
  deductible: number;
  startDate: string;
  endDate: string;
  aiRiskScore: number;
  aiRiskLevel: RiskLevel;
  tags: string[];
}

export interface ClaimEvidenceAnchor {
  label: string;
  sourceType: ClaimEvidenceSource;
  receivedAt: string;
}

export interface ClaimGovernanceCheckpoint {
  ownerRole: ClaimGovernanceOwnerRole;
  dueAt: string;
  nextAction: string;
}

export type ClaimCommunicationAudience = "customer" | "third_party" | "internal";

export type CustomerCommunicationChannel = "email" | "sms" | "phone" | "customer_portal";

export type ClaimCommunicationChannel = CustomerCommunicationChannel | "vendor_portal";

export type ClaimCommunicationStatus = "sent" | "scheduled" | "waiting_on_response" | "not_required";

export interface ClaimCommunicationCheckpoint {
  audience: ClaimCommunicationAudience;
  channel: ClaimCommunicationChannel;
  status: ClaimCommunicationStatus;
  lastSentAt?: string;
  nextDueAt?: string;
  message: string;
}

export type ClaimComplianceObligation =
  | "claim_acknowledgment"
  | "status_update"
  | "decision_notice"
  | "settlement_payment";

export type ClaimComplianceStatus = "met" | "due" | "at_risk";

export interface ClaimComplianceCheckpoint {
  jurisdiction: string;
  obligation: ClaimComplianceObligation;
  status: ClaimComplianceStatus;
  dueAt: string;
  completedAt?: string;
  ruleReference: string;
}

export type ClaimantReviewStatus = "pending_notice" | "available" | "requested" | "resolved";

export type ClaimantReviewChannel = "customer_portal" | "claims_phone" | "written_request";

export interface ClaimantReviewCheckpoint {
  status: ClaimantReviewStatus;
  reviewerRole: "supervisor" | "legal";
  requestChannels: ClaimantReviewChannel[];
  decisionBasisSummary: string;
  requestBy?: string;
  ruleReference: string;
}

export type ClaimLossMitigationStatus = "required" | "in_progress" | "documented";

export type ClaimPropertyInspectionStatus = "pending" | "completed";

export type ClaimLossMitigationEvidenceStatus = "received" | "pending";

export interface ClaimLossMitigationEvidenceItem {
  label: string;
  status: ClaimLossMitigationEvidenceStatus;
}

export interface ClaimLossMitigationCheckpoint {
  status: ClaimLossMitigationStatus;
  ownerRole: ClaimGovernanceOwnerRole;
  action: string;
  evidenceItems: ClaimLossMitigationEvidenceItem[];
  inspectionStatus: ClaimPropertyInspectionStatus;
  inspectionScheduledAt?: string;
  permanentRepairsAuthorized: boolean;
}

export type ClaimAdditionalLivingExpenseStatus =
  | "collecting_receipts"
  | "ready_for_review"
  | "reimbursed";

export type ClaimAdditionalLivingExpenseReceiptStatus = "received" | "pending";

export interface ClaimAdditionalLivingExpenseItem {
  label: string;
  claimedAmount: number;
  normalExpenseBaseline: number;
  eligibleIncrease: number;
  receiptStatus: ClaimAdditionalLivingExpenseReceiptStatus;
}

export interface ClaimAdditionalLivingExpenseCheckpoint {
  status: ClaimAdditionalLivingExpenseStatus;
  ownerRole: ClaimGovernanceOwnerRole;
  policyLimit: number;
  reimbursedAmount: number;
  nextReviewAt: string;
  action: string;
  items: ClaimAdditionalLivingExpenseItem[];
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  customerId: string;
  type: ClaimType;
  status: ClaimStatus;
  amount: number;
  deductibleApplied: number;
  payoutAmount: number;
  reserveAmount: number;
  filedDate: string;
  lastUpdated: string;
  fnolChannel: FnolChannel;
  documentStatus: ClaimDocumentStatus;
  reviewGate: ClaimReviewGate;
  triageLane: ClaimTriageLane;
  triageSignals: ClaimTriageSignal[];
  adverseActionNoticeRequired: boolean;
  governanceCheckpoint: ClaimGovernanceCheckpoint;
  communicationCheckpoint: ClaimCommunicationCheckpoint;
  complianceCheckpoint: ClaimComplianceCheckpoint;
  claimantReviewCheckpoint?: ClaimantReviewCheckpoint;
  lossMitigationCheckpoint?: ClaimLossMitigationCheckpoint;
  additionalLivingExpenseCheckpoint?: ClaimAdditionalLivingExpenseCheckpoint;
  aiDecisionRationale: string;
  evidenceAnchors: ClaimEvidenceAnchor[];
  evidenceRequirements: ClaimEvidenceRequirement[];
  aiFraudScore: number;
  adjuster: string;
  notes: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  preferredCommunicationChannel: CustomerCommunicationChannel;
  tier: CustomerTier;
  activePolicies: number;
  totalPremiumVolume: number;
  lifetimeValue: number;
  claimsHistory: number;
  satisfactionScore: number;
  joinedDate: string;
}

export interface RiskAssessment {
  customerId: string;
  overallScore: number;
  level: RiskLevel;
  factors: RiskFactor[];
  lastAssessed: string;
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface AgencyMetrics {
  activePolicies: number;
  policiesExpiring30d: number;
  claimsOpen: number;
  claimsPaidThisMonth: number;
  monthlyPremiumVolume: number;
  annualPremiumVolume: number;
  avgPolicyValue: number;
  avgRiskScore: number;
  avgClaimResolutionDays: number;
  fraudDetectionRate: number;
  customerRetentionRate: number;
  npsScore: number;
}

export interface ClaimsPipelineStage {
  id: string;
  name: string;
  order: number;
  claimCount: number;
  totalAmount: number;
}
