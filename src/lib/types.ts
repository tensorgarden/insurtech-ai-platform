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
  aiDecisionRationale: string;
  evidenceAnchors: ClaimEvidenceAnchor[];
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
