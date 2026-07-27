import React, { useMemo } from "react";
import { Text, Heading, Skeleton, Button } from "@vibe/core";
import { Calendar, Check, Warning, Time } from "@vibe/icons";
import styles from "./BillingDashboard.module.css";
import { BillingSummary, BillingCredits } from "../../types";
import mondaySdk from "monday-sdk-js";
import { useKonnectify } from "@/hooks";
import { EmptyPlaceholder } from "../common/EmptyPlaceholder";
const monday = mondaySdk();

// ─── Types ───────────────────────────────────────────────────────────────────
// Mirrors the shape returned by the /plan-details (or similar) endpoint.

interface BillingDashboardProps {
  data: BillingSummary | null;
  loading?: boolean;
  error?: string;
  billingCredits: BillingCredits | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const daysUntil = (iso: string | null): number | null => {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const diffMs = target - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const billingCycleLabel = (cycle: string): string =>
  cycle === "month" ? "Monthly" : cycle === "year" ? "Yearly" : cycle;

const statusMeta: Record<string, { label: string; className: string }> = {
  trialing: { label: "Trialing", className: "badgeTrialing" },
  active: { label: "Active", className: "badgeActive" },
  past_due: { label: "Past Due", className: "badgeWarning" },
  canceled: { label: "Canceled", className: "badgeCanceled" },
};

// ─── DonutChart (self-contained, no extra deps) ─────────────────────────────

interface DonutChartProps {
  percent: number; // 0-100
  size?: number;
  stroke?: number;
  label: string;
  sublabel: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  percent,
  size = 220,
  stroke = 18,
  label,
  sublabel,
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const dash = (clamped / 100) * circumference;

  return (
    <div className={styles.donutWrapper} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--layer-selected-color, #e6e9ef)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--positive-color, #00854d)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 0.4s ease" }}
        />
      </svg>
      <div className={styles.donutCenter}>
        <span className={styles.donutPercent}>{clamped.toFixed(clamped % 1 === 0 ? 0 : 1)}%</span>
        <span className={styles.donutSub}>{sublabel}</span>
      </div>
      <Text type="text2" color="secondary" className={styles.donutLabel}>
        {label}
      </Text>
    </div>
  );
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const meta = statusMeta[status] ?? { label: status, className: "badgeDefault" };
  return <span className={`${styles.badge} ${styles[meta.className]}`}>{meta.label}</span>;
};

// ─── InfoRow ─────────────────────────────────────────────────────────────────

const InfoRow: React.FC<{ icon?: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <div className={styles.infoRow}>
    <div className={styles.infoRowLabel}>
      {icon}
      <Text type="text2" color="secondary">
        {label}
      </Text>
    </div>
    <Text type="text1" element="span" className={styles.infoRowValue}>
      {value}
    </Text>
  </div>
);

// ─── BillingDashboardSkeleton ────────────────────────────────────────────────

const BillingDashboardSkeleton: React.FC = () => (
  <div className={styles.dashboard}>
    {/* Task consumption card skeleton */}
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Skeleton type="text" width={220} />
        <Skeleton type="text" width={160} />
      </div>

      <div className={styles.usageBody}>
        <Skeleton type="rectangle" width={220} height={220} />

        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <Skeleton type="text" width={100} />
            <Skeleton type="text" width={140} />
          </div>
          <div className={styles.stat}>
            <Skeleton type="text" width={100} />
            <Skeleton type="text" width={140} />
          </div>
          <div className={styles.stat}>
            <Skeleton type="text" width={100} />
            <Skeleton type="text" width={140} />
          </div>
        </div>
      </div>

      <div className={styles.usageFooter}>
        <Skeleton type="text" width={120} />
      </div>
    </div>

    {/* Plan / subscription card skeleton */}
    <div className={styles.card}>
      <div className={styles.cardHeaderRow}>
        <div style={{ flex: 1 }}>
          <Skeleton type="text" width={120} />
          <Skeleton type="text" width={240} />
        </div>
        <Skeleton type="rectangle" width={80} height={24} />
      </div>

      <div className={styles.divider} />

      {/* No `count` prop exists on SkeletonProps — render each row explicitly */}
      <div className={styles.infoGrid}>
        <Skeleton type="text" fullWidth />
        <Skeleton type="text" fullWidth />
        <Skeleton type="text" fullWidth />
        <Skeleton type="text" fullWidth />
        <Skeleton type="text" fullWidth />
      </div>
    </div>
  </div>
);

// ─── BillingDashboard ────────────────────────────────────────────────────────

export const BillingDashboard: React.FC<BillingDashboardProps> = ({ data, loading, error, billingCredits }) => {
  const { isConfigured } = useKonnectify();

  // ── All hooks must run unconditionally, on every render, in the same order ──
  const taskUsed = useMemo(() => {
    if (!billingCredits?.total) return 0;
    return billingCredits.total - billingCredits.remaining;
  }, [billingCredits]);

  const usagePercent = useMemo(() => {
    if (!billingCredits?.total) return 0;
    return (taskUsed / billingCredits.total) * 100;
  }, [billingCredits, taskUsed]);

  const remaining = useMemo(() => {
    if (!billingCredits) return 0;
    return billingCredits.remaining;
  }, [billingCredits]);

  const daysLeft = useMemo(() => {
    if (!data) return null;
    return daysUntil(data.inTrial ? data.billing.trialEnd : data.billing?.subscriptionEnd);
  }, [data]);

  // ── Config check comes first — before loading/error/data branching ──
  // This ensures that logging out (isConfigured -> false) immediately shows
  // the "Not configured" state instead of getting stuck on a stale skeleton
  // or stale data render.
  if (!isConfigured) {
    return (
      <EmptyPlaceholder
        title="Not configured"
        description="Configure Konnectify in Account Settings to view billing."
      />
    );
  }

  if (loading) {
    return <BillingDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className={styles.errorAlert}>
        <Warning size={16} />
        <span>{error}</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.centered}>
        <Text type="text2" color="secondary">
          No billing information available.
        </Text>
      </div>
    );
  }

  const { billing, task } = data;

  async function handleUpgradePlan() {
    const context = (await monday.get("context")).data;
    const location = (await monday.get("location")).data;
    const mondayUrl = new URL(location.href).hostname; // konnectify7.monday.com
    const appId = context.app.id;
    const url = `https://${mondayUrl}/apps/installed_apps/${appId}/billing?plans_selection=true`;
    window.open(url, "_blank");
  }

  return (
    <div className={styles.dashboard}>
      {/* ── Task consumption card ─────────────────────────────────────── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Heading type="h2">
            Task Consumption Breakdown
          </Heading>
          <Text type="text2" color="secondary">
            Your usage of task allocation for the current period
          </Text>
        </div>

        <div className={styles.usageBody}>
          <DonutChart
            percent={usagePercent}
            label={billing.plan}
            sublabel="Used"
          />

          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <Text type="text2" color="secondary">Annual Allocation</Text>
              <Text type="text1" weight="bold" className={styles.statValue}>
                {billingCredits?.total.toLocaleString()}
              </Text>
            </div>
            <div className={styles.stat}>
              <Text type="text2" color="secondary">Total Used</Text>
              <Text type="text1" weight="bold" className={`${styles.statValue} ${styles.usedValue}`}>
                {taskUsed}
              </Text>
            </div>
            <div className={styles.stat}>
              <Text type="text2" color="secondary">Usage Rate</Text>
              <Text type="text1" weight="bold" className={styles.statValue}>
                {usagePercent.toFixed(1)}%
              </Text>
            </div>
          </div>
        </div>

        <div className={styles.usageFooter}>
          <Text type="text2" color="secondary">
            {remaining.toLocaleString()} / {billingCredits?.total.toLocaleString()} left
          </Text>
        </div>
      </div>

      {/* ── Plan / subscription card ─────────────────────────────────── */}
      <div className={styles.card}>
        <div className={styles.cardHeaderRow}>
          <div>
            <Heading type="h2">{billing.plan}</Heading>
            <Text type="text2" color="secondary">
              For those who need the full power of the automation platform
            </Text>
          </div>
          <StatusBadge status={billing.status} />
        </div>

        <div className={styles.divider} />

        <div className={styles.infoGrid}>
          <InfoRow label="Plan" value={billing.plan} />
          <InfoRow label="Billing Cycle" value={billingCycleLabel(billing.billingCycle)} />
          <InfoRow
            icon={<Calendar size={16} />}
            label={data.inTrial ? "Trial Ends" : "Subscription Ends"}
            value={formatDate(data.inTrial ? billing.trialEnd : billing?.subscriptionEnd)}
          />
          {daysLeft !== null && (
            <InfoRow
              icon={<Time size={16} />}
              label="Time Remaining"
              value={
                daysLeft > 0 ? (
                  `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                ) : (
                  <span className={styles.expiredText}>Expired</span>
                )
              }
            />
          )}
        </div>

        {data.inTrial && (
          <div className={styles.trialNotice}>
            <Check size={16} />
            <Text type="text2">
              You're currently in a free trial.
            </Text>
          </div>
        )}
      </div>

      <div className={styles.upgradeButtonWrapper}>
        <Button onClick={handleUpgradePlan}>Upgrade Plan</Button>
      </div>
    </div>
  );
};

export default BillingDashboard;