import {
  demoPolicies,
  demoClaims,
  demoCustomers,
  demoRiskAssessments,
  demoClaimsPipeline,
  demoAgencyMetrics,
} from "@/lib/demo-data";
import type { Policy, Claim, Customer, RiskAssessment, ClaimsPipelineStage } from "@/lib/types";

// --- Reusable inline components ---

function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "green" | "red" | "amber" | "blue" | "purple" | "indigo";
}) {
  const tones: Record<string, string> = {
    slate: "border-slate-200 bg-white text-slate-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
  };
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}
    >
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur ${className}`}
    >
      {children}
    </section>
  );
}

function ProgressBar({ value, color = "indigo" }: { value: number; color?: string }) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
  };
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
      <div
        className={`h-full rounded-full ${colors[color] || colors.indigo}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-400",
    pending_renewal: "bg-amber-400",
    expiring: "bg-red-400",
    lapsed: "bg-slate-400",
    cancelled: "bg-red-500",
    new: "bg-blue-400",
    under_review: "bg-amber-400",
    approved: "bg-indigo-400",
    paid: "bg-emerald-400",
    denied: "bg-red-400",
  };
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${map[status] || "bg-slate-400"}`}
    />
  );
}

function StatCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  const borders: Record<string, string> = {
    slate: "border-l-slate-300",
    green: "border-l-emerald-300",
    amber: "border-l-amber-300",
    red: "border-l-red-300",
    blue: "border-l-blue-300",
    indigo: "border-l-indigo-300",
  };
  return (
    <div
      className={`rounded-2xl bg-white/90 p-5 shadow-sm border-l-4 ${borders[tone] || borders.slate}`}
    >
      <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function FindCustomer(id: string): Customer | undefined {
  return demoCustomers.find((c) => c.id === id);
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// --- Policy table ---

function PolicyRow({ policy }: { policy: Policy }) {
  const customer = FindCustomer(policy.customerId);
  const statusTone =
    policy.status === "active"
      ? "green"
      : policy.status === "pending_renewal"
        ? "amber"
        : policy.status === "expiring"
          ? "red"
          : policy.status === "lapsed"
            ? "slate"
            : "red";

  const riskTone =
    policy.aiRiskLevel === "low"
      ? "green"
      : policy.aiRiskLevel === "moderate"
        ? "blue"
        : policy.aiRiskLevel === "elevated"
          ? "amber"
          : "red";

  const typeLabel: Record<string, string> = {
    auto: "Auto",
    home: "Home",
    life: "Life",
    commercial: "Commercial",
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <StatusDot status={policy.status} />
          <span className="font-semibold text-slate-900">{policy.policyNumber}</span>
        </div>
        <div className="text-xs text-slate-500 ml-6">
          {typeLabel[policy.type] || policy.type} -- {customer?.fullName || policy.customerId}
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge tone={statusTone}>{policy.status.replace("_", " ")}</Badge>
      </td>
      <td className="py-3 px-4">
        <Badge tone={riskTone}>
          {policy.aiRiskScore}/100
        </Badge>
      </td>
      <td className="py-3 px-4 font-semibold text-slate-800">
        {formatCurrency(policy.coverageAmount)}
      </td>
      <td className="py-3 px-4 text-slate-700">{formatCurrency(policy.annualPremium)}/yr</td>
      <td className="py-3 px-4 text-sm text-slate-500">
        {new Date(policy.endDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>
    </tr>
  );
}

function PolicyTable() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">Policy Book</h2>
        <span className="text-xs text-slate-500">{demoPolicies.length} policies</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-2 px-4">Policy</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Risk</th>
              <th className="py-2 px-4">Coverage</th>
              <th className="py-2 px-4">Premium</th>
              <th className="py-2 px-4">Expires</th>
            </tr>
          </thead>
          <tbody>
            {[...demoPolicies]
              .sort((a, b) => a.aiRiskScore - b.aiRiskScore)
              .map((p) => (
                <PolicyRow key={p.id} policy={p} />
              ))}
        </tbody>
        </table>
      </div>
    </Card>
  );
}

// --- Claims pipeline ---

function ClaimsPipelineStageBar({ stage }: { stage: ClaimsPipelineStage }) {
  const maxAmount = Math.max(...demoClaimsPipeline.map((s) => s.totalAmount));
  const pct = maxAmount > 0 ? (stage.totalAmount / maxAmount) * 100 : 0;
  const stageColors: Record<number, string> = {
    1: "blue",
    2: "amber",
    3: "indigo",
    4: "emerald",
    5: "red",
  };
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-slate-800">{stage.name}</span>
        <span className="text-slate-500">{stage.claimCount} claims</span>
      </div>
      <ProgressBar value={pct} color={stageColors[stage.order] || "indigo"} />
      <div className="text-xs text-slate-400">{formatCurrency(stage.totalAmount)}</div>
    </div>
  );
}

function ClaimsPipeline() {
  return (
    <Card>
      <h2 className="text-lg font-bold text-slate-900 mb-4">Claims Pipeline</h2>
      <div className="space-y-5">
        {demoClaimsPipeline.map((s) => (
          <ClaimsPipelineStageBar key={s.name} stage={s} />
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
        Total claims value:{" "}
        <span className="font-bold text-slate-800">
          {formatCurrency(demoClaimsPipeline.reduce((sum, s) => sum + s.totalAmount, 0))}
        </span>{" "}
        -- Avg resolution:{" "}
        <span className="font-bold text-emerald-600">
          {demoAgencyMetrics.avgClaimResolutionDays}d
        </span>
      </div>
    </Card>
  );
}

// --- Claim cards ---

function ClaimCard({ claim }: { claim: Claim }) {
  const policy = demoPolicies.find((p) => p.id === claim.policyId);
  const customer = demoCustomers.find((c) => c.id === claim.customerId);
  const statusTone =
    claim.status === "new"
      ? "blue"
      : claim.status === "under_review"
        ? "amber"
        : claim.status === "approved"
          ? "indigo"
          : claim.status === "paid"
            ? "green"
            : "red";
  const fraudColor =
    claim.aiFraudScore >= 70 ? "red" : claim.aiFraudScore >= 40 ? "amber" : "green";
  const reviewGateTone: Record<Claim["reviewGate"], "green" | "blue" | "amber" | "purple"> = {
    auto_clear: "green",
    adjuster_review: "blue",
    supervisor_review: "amber",
    legal_review: "purple",
  };
  const reviewGateLabel = claim.reviewGate.split("_").join(" ");

  const typeLabel: Record<string, string> = {
    auto_collision: "Auto Collision",
    auto_theft: "Auto Theft",
    home_theft: "Home Theft",
    home_fire: "Home Fire",
    life_payout: "Life Payout",
    commercial_liability: "Commercial Liability",
  };

  return (
    <div className="rounded-xl border bg-white/80 p-4 border-l-4 border-l-slate-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusDot status={claim.status} />
          <span className="font-bold text-sm text-slate-900">{claim.claimNumber}</span>
          <Badge tone={statusTone}>{claim.status.replace("_", " ")}</Badge>
        </div>
        <span className="text-sm font-semibold text-slate-800">
          {formatCurrency(claim.amount)}
        </span>
      </div>
      <div className="text-xs text-slate-500 mb-2">
        {typeLabel[claim.type] || claim.type} -- {customer?.fullName || claim.customerId} --{" "}
        {policy?.policyNumber || claim.policyId}
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Adjuster: {claim.adjuster}</span>
          <Badge tone={fraudColor}>Fraud: {claim.aiFraudScore}/100</Badge>
          <Badge tone={reviewGateTone[claim.reviewGate]}>{reviewGateLabel}</Badge>
        </div>
        <span className="text-slate-400">
          {new Date(claim.filedDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      {claim.reserveAmount > 0 && (
        <div className="mt-1.5 flex items-center gap-2 text-xs">
          <span className="text-slate-400">Reserve:</span>
          <span className="font-semibold text-slate-700">
            {formatCurrency(claim.reserveAmount)}
          </span>
          {claim.status === "paid" && claim.payoutAmount > 0 && (
            <span
              className={
                claim.reserveAmount > claim.payoutAmount
                  ? "text-amber-600"
                  : claim.reserveAmount < claim.payoutAmount
                    ? "text-red-600"
                    : "text-emerald-600"
              }
            >
              ({claim.reserveAmount > claim.payoutAmount
                ? `+${formatCurrency(claim.reserveAmount - claim.payoutAmount)} over`
                : claim.reserveAmount < claim.payoutAmount
                  ? `-${formatCurrency(claim.payoutAmount - claim.reserveAmount)} under`
                  : "accurate"}
              )
            </span>
          )}
          {claim.status === "denied" && (
            <span className="text-red-600">
              (released {formatCurrency(claim.reserveAmount)})
            </span>
          )}
        </div>
      )}
      <div className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
        <div className="font-semibold text-slate-700">AI rationale</div>
        <p>{claim.aiDecisionRationale}</p>
        <div className="mt-1 text-slate-400">
          {claim.evidenceAnchors.length} evidence anchors --{" "}
          {claim.adverseActionNoticeRequired ? "adverse notice required" : "no adverse notice"}
        </div>
      </div>
      {claim.status === "denied" && (
        <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg p-2">{claim.notes}</p>
      )}
    </div>
  );
}

function ClaimsList() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">Recent Claims</h2>
        <div className="flex gap-2">
          <Badge tone="blue">{demoClaims.filter((c) => c.status === "new").length} new</Badge>
          <Badge tone="amber">
            {demoClaims.filter((c) => c.status === "under_review").length} in review
          </Badge>
        </div>
      </div>
      <div className="space-y-3">
        {[...demoClaims]
          .sort((a, b) => new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime())
          .map((c) => (
            <ClaimCard key={c.id} claim={c} />
          ))}
      </div>
    </Card>
  );
}

// --- Customer portal preview ---

function CustomerCard({ customer }: { customer: Customer }) {
  const tierColors: Record<string, string> = {
    platinum: "border-l-indigo-400",
    gold: "border-l-amber-400",
    silver: "border-l-slate-400",
    standard: "border-l-slate-300",
  };
  const tierTone: Record<string, "purple" | "amber" | "slate" | "slate"> = {
    platinum: "purple",
    gold: "amber",
    silver: "slate",
    standard: "slate",
  };
  return (
    <div
      className={`rounded-xl border bg-white/90 p-4 border-l-4 ${tierColors[customer.tier] || "border-l-slate-300"}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-sm text-slate-900">{customer.fullName}</span>
        <Badge tone={tierTone[customer.tier] || "slate"}>{customer.tier}</Badge>
      </div>
      <div className="text-xs text-slate-500 mb-2">
        {customer.city}, {customer.state}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-sm font-bold text-slate-800">{customer.activePolicies}</div>
          <div className="text-xs text-slate-400">policies</div>
        </div>
        <div>
          <div className="text-sm font-bold text-slate-800">
            {formatCurrency(customer.totalPremiumVolume)}
          </div>
          <div className="text-xs text-slate-400">premium</div>
        </div>
        <div>
          <div
            className={`text-sm font-bold ${customer.satisfactionScore >= 85 ? "text-emerald-600" : customer.satisfactionScore >= 70 ? "text-amber-600" : "text-red-600"}`}
          >
            {customer.satisfactionScore}%
          </div>
          <div className="text-xs text-slate-400">satisfaction</div>
        </div>
      </div>
    </div>
  );
}

function CustomerPortal() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">Customer Portal</h2>
        <span className="text-xs text-slate-500">{demoCustomers.length} customers</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[...demoCustomers]
          .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
          .map((c) => (
            <CustomerCard key={c.id} customer={c} />
          ))}
      </div>
    </Card>
  );
}

// --- Risk analytics ---

function RiskCard({ assessment }: { assessment: RiskAssessment }) {
  const customer = demoCustomers.find((c) => c.id === assessment.customerId);
  const levelColor =
    assessment.level === "low"
      ? "text-emerald-600"
      : assessment.level === "moderate"
        ? "text-blue-600"
        : assessment.level === "elevated"
          ? "text-amber-600"
          : "text-red-600";
  const levelBg =
    assessment.level === "low"
      ? "bg-emerald-50"
      : assessment.level === "moderate"
        ? "bg-blue-50"
        : assessment.level === "elevated"
          ? "bg-amber-50"
          : "bg-red-50";

  return (
    <div className="rounded-xl border bg-white/90 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-sm text-slate-900">
          {customer?.fullName || assessment.customerId}
        </span>
        <span className={`text-sm font-bold ${levelColor} ${levelBg} rounded-full px-3 py-1`}>
          {assessment.overallScore}/100 -- {assessment.level}
        </span>
      </div>
      <div className="space-y-2">
        {assessment.factors.map((f) => (
          <div key={f.name} className="flex items-center gap-2 text-xs">
            <span className="w-28 text-slate-600 truncate">{f.name}</span>
            <div className="flex-1">
              <ProgressBar value={f.score} color={f.score >= 70 ? "red" : f.score >= 40 ? "amber" : "emerald"} />
            </div>
            <span className="w-10 text-right font-semibold text-slate-700">{f.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskAnalytics() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">Risk Analytics</h2>
        <Badge tone="blue">AI-powered</Badge>
      </div>
      <div className="space-y-3">
        {demoRiskAssessments.map((a) => (
          <RiskCard key={a.customerId} assessment={a} />
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-bold text-emerald-600">
            {demoRiskAssessments.filter((r) => r.level === "low").length}
          </div>
          <div className="text-xs text-slate-400">low risk</div>
        </div>
        <div>
          <div className="font-bold text-amber-600">
            {demoRiskAssessments.filter((r) => r.level === "elevated").length}
          </div>
          <div className="text-xs text-slate-400">elevated risk</div>
        </div>
        <div>
          <div className="font-bold text-red-600">
            {demoRiskAssessments.filter((r) => r.level === "high").length}
          </div>
          <div className="text-xs text-slate-400">high risk</div>
        </div>
      </div>
    </Card>
  );
}

// --- Main page ---

export default function Home() {
  const openClaims = demoClaims.filter(
    (c) => c.status === "new" || c.status === "under_review",
  ).length;
  const expiringCount = demoPolicies.filter(
    (p) => p.status === "expiring" || p.status === "pending_renewal",
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 px-6 py-8 font-sans text-slate-900 antialiased">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          InsurTech AI Platform
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Policy management -- claims automation -- customer portal -- risk analytics -- demo
          dashboard
        </p>
      </header>

      {/* Hero stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Active Policies"
          value={String(demoAgencyMetrics.activePolicies)}
          tone="blue"
        />
        <StatCard label="Claims Open" value={String(openClaims)} tone="amber" />
        <StatCard
          label="Premium Volume"
          value={formatCurrency(demoAgencyMetrics.annualPremiumVolume)}
          tone="green"
        />
        <StatCard
          label="Avg Risk Score"
          value={`${demoAgencyMetrics.avgRiskScore}/100`}
          tone="indigo"
        />
        <StatCard label="Expiring Soon" value={String(expiringCount)} tone="red" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: main content */}
        <div className="lg:col-span-2 space-y-6">
          <PolicyTable />
          <ClaimsList />
          <CustomerPortal />
        </div>
        {/* Right column: sidebar */}
        <div className="space-y-6">
          <ClaimsPipeline />

          {/* Additional metrics card */}
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Agency Metrics</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Customer Retention</span>
                <span className="font-bold text-emerald-600">
                  {demoAgencyMetrics.customerRetentionRate}%
                </span>
              </div>
              <ProgressBar value={demoAgencyMetrics.customerRetentionRate} color="emerald" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Fraud Detection Rate</span>
                <span className="font-bold text-indigo-600">
                  {demoAgencyMetrics.fraudDetectionRate}%
                </span>
              </div>
              <ProgressBar value={demoAgencyMetrics.fraudDetectionRate} color="indigo" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">NPS Score</span>
                <span className="font-bold text-blue-600">{demoAgencyMetrics.npsScore}</span>
              </div>
              <ProgressBar value={demoAgencyMetrics.npsScore} color="blue" />
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                <div>
                  <div className="text-xs text-slate-400">Expiring in 30d</div>
                  <div className="font-bold text-red-600">{demoAgencyMetrics.policiesExpiring30d}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Paid This Month</div>
                  <div className="font-bold text-emerald-600">
                    {demoAgencyMetrics.claimsPaidThisMonth}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Monthly Premium</div>
                  <div className="font-bold text-slate-800">
                    {formatCurrency(demoAgencyMetrics.monthlyPremiumVolume)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Avg Policy Value</div>
                  <div className="font-bold text-slate-800">
                    {formatCurrency(demoAgencyMetrics.avgPolicyValue)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <RiskAnalytics />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-400">
        InsurTech AI Platform -- Portfolio demonstration -- All data is fictional -- No production keys
        or network calls
      </footer>
    </div>
  );
}
