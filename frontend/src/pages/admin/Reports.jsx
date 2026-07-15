import { useEffect, useState, useMemo, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  DollarSign, ShoppingBag, Coins, Zap, Megaphone, TrendingUp,
  BarChart3, PieChart as PieIcon, Activity, Users, Star,
  Package, Calendar, Clock, Target, Award, ChevronUp,
  ChevronDown, ArrowUpRight, Info, Cpu,
  AlertTriangle, CheckCircle2, Circle, Ban, Timer
} from "lucide-react";
import { fetchReports } from "../../services/reports";
import "./Reports.css";

// ─── Colour palette ───────────────────────────────────────
const COLORS = ["#38bdf8", "#a78bfa", "#34d399", "#fb923c", "#f472b6", "#facc15", "#818cf8"];



// ─── Formatters ────────────────────────────────────────────
const fmtCurrency = (v) =>
  v >= 100000
    ? `₹${(v / 100000).toFixed(1)}L`
    : v >= 1000
    ? `₹${(v / 1000).toFixed(1)}K`
    : `₹${v.toFixed(0)}`;

const fmtNum = (v) =>
  v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v);

const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return d; }
};

// ─── Sparkline ─────────────────────────────────────────────
function Sparkline({ data, color = "#38bdf8" }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 100, H = 36;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    H - ((v - min) / range) * (H - 4) - 2,
  ]);
  const d =
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="rpt-sparkline" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L ${W} ${H} L 0 ${H} Z`}
        fill={`url(#sg-${color.replace("#","")})`}
      />
      <path d={d} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── Custom Tooltip ────────────────────────────────────────
function ChartTooltip({ active, payload, label, formatValue }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rpt-tooltip">
      <div className="rpt-tooltip-label">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="rpt-tooltip-row">
          <span className="rpt-tooltip-dot" style={{ background: entry.color }} />
          <span className="rpt-tooltip-name">{entry.name}</span>
          <span className="rpt-tooltip-val">
            {formatValue ? formatValue(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}



// ─── Loading skeleton ──────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="rpt-loading">
      <div className="rpt-skel-row rpt-skel-row--6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rpt-skel-card rpt-skel-card--sm" />
        ))}
      </div>
      <div className="rpt-skel-row rpt-skel-row--2">
        <div className="rpt-skel-card rpt-skel-card--lg" />
        <div className="rpt-skel-card rpt-skel-card--lg" />
      </div>
      <div className="rpt-skel-row rpt-skel-row--2">
        <div className="rpt-skel-card rpt-skel-card--xl" />
        <div className="rpt-skel-card rpt-skel-card--lg" />
      </div>
      <div className="rpt-skel-card rpt-skel-card--tbl" />
      <div className="rpt-skel-card rpt-skel-card--xl" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// KPI SUMMARY STRIP
// ══════════════════════════════════════════════════════════
const KPI_CONFIG = [
  {
    key: "total_revenue",
    label: "Total Revenue",
    icon: DollarSign,
    glow: "#34d399",
    iconBg: "rgba(52,211,153,0.12)",
    format: fmtCurrency,
    sparkKey: "revenue",
  },
  {
    key: "total_packages_purchased",
    label: "Packages Purchased",
    icon: ShoppingBag,
    glow: "#38bdf8",
    iconBg: "rgba(56,189,248,0.12)",
    format: fmtNum,
    sparkKey: "packages_purchased",
  },
  {
    key: "total_credits_sold",
    label: "Credits Sold",
    icon: Coins,
    glow: "#a78bfa",
    iconBg: "rgba(167,139,250,0.12)",
    format: fmtNum,
    sparkKey: "credits_sold",
  },
  {
    key: "total_credits_consumed",
    label: "Credits Consumed",
    icon: Zap,
    glow: "#fb923c",
    iconBg: "rgba(251,146,60,0.12)",
    format: fmtNum,
    sparkKey: "credits_consumed",
  },
  {
    key: "total_campaigns",
    label: "Campaigns Booked",
    icon: Megaphone,
    glow: "#f472b6",
    iconBg: "rgba(244,114,182,0.12)",
    format: fmtNum,
    sparkKey: "bookings",
  },
  {
    key: "avg_revenue_per_brand",
    label: "Avg Revenue / Brand",
    icon: TrendingUp,
    glow: "#facc15",
    iconBg: "rgba(250,204,21,0.12)",
    format: fmtCurrency,
    sparkKey: "revenue",
  },
];

function KpiStrip({ summary, revenueTrend, campaignPerf }) {
  const getSparkData = (sparkKey) => {
    if (sparkKey === "credits_consumed") {
      return revenueTrend?.map((r) => r.credits_sold) ?? [];
    }
    if (sparkKey === "bookings") {
      return campaignPerf?.map((m) =>
        (m.pending ?? 0) + (m.approved ?? 0) + (m.completed ?? 0) + (m.rejected ?? 0)
      ) ?? [];
    }
    return revenueTrend?.map((r) => r[sparkKey] ?? 0) ?? [];
  };

  return (
    <div className="rpt-kpi-grid">
      {KPI_CONFIG.map((cfg) => {
        const Icon = cfg.icon;
        const value = summary?.[cfg.key] ?? 0;
        const sparkData = getSparkData(cfg.sparkKey);

        return (
          <div
            key={cfg.key}
            className="rpt-kpi-card"
            style={{ "--kpi-glow": cfg.glow, "--kpi-icon-bg": cfg.iconBg }}
          >
            <div className="rpt-kpi-glow" />
            <div className="rpt-kpi-header">
              <div className="rpt-kpi-icon">
                <Icon size={18} />
              </div>
              <span className="rpt-kpi-trend rpt-kpi-trend--up">
                <ArrowUpRight size={11} /> Live
              </span>
            </div>
            <div className="rpt-kpi-label">{cfg.label}</div>
            <div className="rpt-kpi-value">{cfg.format(value)}</div>
            <Sparkline data={sparkData} color={cfg.glow} />
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// REVENUE TREND CHART
// ══════════════════════════════════════════════════════════
function RevenueTrendChart({ data }) {
  const tooltipFormatter = (value, name) => {
    if (name === "Revenue") return fmtCurrency(value);
    return fmtNum(value);
  };

  return (
    <div className="rpt-card" style={{ "--glow": "#34d399" }}>
      <div className="rpt-card-glow" />
      <div className="rpt-card-title">
        <TrendingUp size={17} />
        Revenue Trend
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 400, marginLeft: "auto" }}>
          Last 12 months
        </span>
      </div>
      <div className="rpt-recharts">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtCurrency}
              width={60}
            />
            <Tooltip
              content={<ChartTooltip formatValue={tooltipFormatter} />}
              cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.5)", paddingTop: 16 }}
            />
            <Line
              type="monotone" dataKey="revenue" name="Revenue"
              stroke="#34d399" strokeWidth={2.5} dot={false}
              activeDot={{ r: 4, fill: "#34d399", strokeWidth: 0 }}
            />
            <Line
              type="monotone" dataKey="packages_purchased" name="Packages Purchased"
              stroke="#38bdf8" strokeWidth={2} dot={false}
              activeDot={{ r: 4, fill: "#38bdf8", strokeWidth: 0 }}
            />
            <Line
              type="monotone" dataKey="credits_sold" name="Credits Sold"
              stroke="#a78bfa" strokeWidth={2} dot={false}
              activeDot={{ r: 4, fill: "#a78bfa", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// PACKAGE PERFORMANCE (horizontal bar chart)
// ══════════════════════════════════════════════════════════
function PackagePerformanceChart({ data }) {
  return (
    <div className="rpt-card" style={{ "--glow": "#38bdf8" }}>
      <div className="rpt-card-glow" />
      <div className="rpt-card-title">
        <Package size={17} />
        Package Performance
      </div>
      <div className="rpt-recharts">
        <ResponsiveContainer width="100%" height={Math.max(240, data.length * 56)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtCurrency}
            />
            <YAxis
              dataKey="package_name"
              type="category"
              width={130}
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTooltip formatValue={(v, n) => n === "Revenue" ? fmtCurrency(v) : fmtNum(v)} />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.5)", paddingTop: 12 }} />
            <Bar dataKey="revenue" name="Revenue" fill="#38bdf8" radius={[0, 6, 6, 0]} />
            <Bar dataKey="purchases" name="Purchases" fill="#a78bfa" radius={[0, 6, 6, 0]} />
            <Bar dataKey="avg_credits" name="Avg Credits" fill="#34d399" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// REVENUE DISTRIBUTION (donut chart)
// ══════════════════════════════════════════════════════════
function RevenueDonut({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="rpt-card" style={{ "--glow": "#a78bfa" }}>
      <div className="rpt-card-glow" />
      <div className="rpt-card-title">
        <PieIcon size={17} />
        Revenue Distribution
      </div>
      <div className="rpt-donut-wrap">
        <div className="rpt-recharts">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                paddingAngle={3}
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    opacity={activeIndex === null || activeIndex === i ? 1 : 0.5}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rpt-tooltip">
                      <div className="rpt-tooltip-label">{d.name}</div>
                      <div className="rpt-tooltip-row">
                        <span className="rpt-tooltip-dot" style={{ background: payload[0].payload.fill }} />
                        <span className="rpt-tooltip-name">Revenue</span>
                        <span className="rpt-tooltip-val">{fmtCurrency(d.value)}</span>
                      </div>
                      <div className="rpt-tooltip-row">
                        <span className="rpt-tooltip-name" style={{ paddingLeft: 16 }}>Share</span>
                        <span className="rpt-tooltip-val">{d.percent}%</span>
                      </div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rpt-donut-legend">
          {data.map((d, i) => (
            <div key={i} className="rpt-donut-legend-item">
              <span
                className="rpt-donut-legend-dot"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="rpt-donut-legend-name">{d.name}</span>
              <span className="rpt-donut-legend-pct">{d.percent}%</span>
              <span className="rpt-donut-legend-rev">{fmtCurrency(d.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// CAMPAIGN PERFORMANCE (stacked bar chart)
// ══════════════════════════════════════════════════════════
function CampaignPerformanceChart({ data }) {
  return (
    <div className="rpt-card" style={{ "--glow": "#fb923c" }}>
      <div className="rpt-card-glow" />
      <div className="rpt-card-title">
        <Megaphone size={17} />
        Campaign Performance
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 400, marginLeft: "auto" }}>
          Last 12 months · monthly
        </span>
      </div>
      <div className="rpt-recharts">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.5)", paddingTop: 12 }} />
            <Bar dataKey="pending"   name="Pending"   stackId="a" fill="#fbbf24" radius={[0,0,0,0]} />
            <Bar dataKey="approved"  name="Approved"  stackId="a" fill="#38bdf8" radius={[0,0,0,0]} />
            <Bar dataKey="completed" name="Completed" stackId="a" fill="#34d399" radius={[0,0,0,0]} />
            <Bar dataKey="rejected"  name="Rejected"  stackId="a" fill="#f87171" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// CREDITS ANALYTICS (dual line chart)
// ══════════════════════════════════════════════════════════
function CreditsAnalyticsChart({ data }) {
  return (
    <div className="rpt-card" style={{ "--glow": "#a78bfa" }}>
      <div className="rpt-card-glow" />
      <div className="rpt-card-title">
        <Coins size={17} />
        Credits Analytics
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 400, marginLeft: "auto" }}>
          Purchased vs Consumed
        </span>
      </div>
      <div className="rpt-recharts">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtNum}
              width={48}
            />
            <Tooltip content={<ChartTooltip formatValue={fmtNum} />} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
            <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.5)", paddingTop: 12 }} />
            <Line
              type="monotone" dataKey="credits_purchased" name="Credits Purchased"
              stroke="#a78bfa" strokeWidth={2.5} dot={false}
              activeDot={{ r: 4, fill: "#a78bfa", strokeWidth: 0 }}
            />
            <Line
              type="monotone" dataKey="credits_consumed" name="Credits Consumed"
              stroke="#fb923c" strokeWidth={2} dot={false}
              strokeDasharray="5 3"
              activeDot={{ r: 4, fill: "#fb923c", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// BRAND PERFORMANCE LEADERBOARD
// ══════════════════════════════════════════════════════════
const LEADERBOARD_COLS = [
  { key: "rank",               label: "#",                  sortKey: null },
  { key: "brand_name",         label: "Brand Name",         sortKey: "brand_name" },
  { key: "packages_purchased", label: "Packages",           sortKey: "packages_purchased" },
  { key: "campaigns_booked",   label: "Campaigns",          sortKey: "campaigns_booked" },
  { key: "credits_purchased",  label: "Credits Purchased",  sortKey: "credits_purchased" },
  { key: "credits_consumed",   label: "Credits Consumed",   sortKey: "credits_consumed" },
  { key: "revenue_generated",  label: "Revenue Generated",  sortKey: "revenue_generated" },
  { key: "last_activity",      label: "Last Activity",      sortKey: "last_activity" },
];

function BrandLeaderboard({ data }) {
  const [sortKey, setSortKey] = useState("revenue_generated");
  const [sortDir, setSortDir] = useState("desc");

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [data, sortKey, sortDir]);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="rpt-card" style={{ "--glow": "#facc15" }}>
      <div className="rpt-card-glow" />
      <div className="rpt-card-title">
        <Award size={17} />
        Brand Performance Leaderboard
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 400, marginLeft: "auto" }}>
          {sorted.length} brands · click column to sort
        </span>
      </div>
      <div className="rpt-table-wrap">
        <table className="rpt-table">
          <thead>
            <tr>
              {LEADERBOARD_COLS.map((col) => (
                <th
                  key={col.key}
                  className={sortKey === col.sortKey ? "rpt-th--active" : ""}
                  onClick={() => handleSort(col.sortKey)}
                >
                  {col.label}
                  {col.sortKey && (
                    <span className="rpt-sort-icon">
                      {sortKey === col.sortKey ? (
                        sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                      ) : (
                        <ChevronDown size={13} style={{ opacity: 0.3 }} />
                      )}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={LEADERBOARD_COLS.length} style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>
                  No brands found
                </td>
              </tr>
            ) : (
              sorted.map((brand, idx) => {
                const rankClass =
                  idx === 0 ? "rpt-table-rank--1"
                  : idx === 1 ? "rpt-table-rank--2"
                  : idx === 2 ? "rpt-table-rank--3"
                  : "";
                return (
                  <tr key={brand.brand_id}>
                    <td>
                      <span className={`rpt-table-rank ${rankClass}`}>{idx + 1}</span>
                    </td>
                    <td className="rpt-brand-name">{brand.brand_name}</td>
                    <td>{brand.packages_purchased}</td>
                    <td>{brand.campaigns_booked}</td>
                    <td>{fmtNum(brand.credits_purchased)}</td>
                    <td>{fmtNum(brand.credits_consumed)}</td>
                    <td className="rpt-revenue-val">{fmtCurrency(brand.revenue_generated)}</td>
                    <td className="rpt-last-activity">{fmtDate(brand.last_activity)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════
// AD FORMAT ANALYTICS
// ══════════════════════════════════════════════════════════
const AF_METRICS = [
  {
    key: "most_booked",
    label: "Most Booked Format",
    iconColor: "#34d399",
    iconBg: "rgba(52,211,153,0.12)",
    icon: TrendingUp,
  },
  {
    key: "least_booked",
    label: "Least Booked Format",
    iconColor: "#f87171",
    iconBg: "rgba(239,68,68,0.1)",
    icon: Activity,
  },
  {
    key: "highest_revenue_format",
    label: "Highest Revenue Format",
    iconColor: "#fbbf24",
    iconBg: "rgba(251,191,36,0.12)",
    icon: DollarSign,
  },
  {
    key: "lowest_revenue_format",
    label: "Lowest Revenue Format",
    iconColor: "#fb923c",
    iconBg: "rgba(251,146,60,0.1)",
    icon: DollarSign,
  },
  {
    key: "avg_utilization",
    label: "Avg Inventory Utilization",
    iconColor: "#a78bfa",
    iconBg: "rgba(167,139,250,0.12)",
    icon: Target,
    suffix: "%",
  },
];

function AdFormatAnalytics({ data }) {
  if (!data) return null;
  return (
    <div className="rpt-card" style={{ "--glow": "#fb923c" }}>
      <div className="rpt-card-glow" />
      <div className="rpt-card-title">
        <Cpu size={17} />
        Ad Format Analytics
      </div>
      <div className="rpt-adformat-grid">
        {AF_METRICS.map((m) => {
          const Icon = m.icon;
          const raw = data[m.key];
          const display = raw != null ? `${raw}${m.suffix ?? ""}` : "—";
          return (
            <div key={m.key} className="rpt-adformat-metric">
              <div
                className="rpt-adformat-metric-icon"
                style={{ "--af-icon-bg": m.iconBg, "--af-icon-color": m.iconColor }}
              >
                <Icon size={17} />
              </div>
              <div className="rpt-adformat-metric-label">{m.label}</div>
              <div className="rpt-adformat-metric-value">{display}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// BUSINESS INSIGHTS
// ══════════════════════════════════════════════════════════
const INSIGHT_ICON_MAP = {
  package:  { icon: Package,    color: "#38bdf8", bg: "rgba(56,189,248,0.12)" },
  brand:    { icon: Users,      color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  activity: { icon: Activity,   color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  format:   { icon: Megaphone,  color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  revenue:  { icon: DollarSign, color: "#facc15", bg: "rgba(250,204,21,0.12)" },
  credits:  { icon: Coins,      color: "#f472b6", bg: "rgba(244,114,182,0.12)" },
  calendar: { icon: Calendar,   color: "#38bdf8", bg: "rgba(56,189,248,0.12)" },
  clock:    { icon: Clock,      color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  inventory:{ icon: BarChart3,  color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
};

function BusinessInsights({ data }) {
  if (!data?.length) return null;
  return (
    <div>
      <div className="rpt-card" style={{ "--glow": "#f472b6" }}>
        <div className="rpt-card-glow" />
        <div className="rpt-card-title">
          <Star size={17} />
          Business Insights
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 400, marginLeft: "auto" }}>
            Auto-generated from live data
          </span>
        </div>
        <div className="rpt-insights-grid">
          {data.map((ins) => {
            const cfg = INSIGHT_ICON_MAP[ins.icon] ?? INSIGHT_ICON_MAP.revenue;
            const Icon = cfg.icon;
            return (
              <div key={ins.key} className="rpt-insight-card">
                <div
                  className="rpt-insight-icon"
                  style={{ "--ins-bg": cfg.bg, "--ins-color": cfg.color }}
                >
                  <Icon size={17} />
                </div>
                <div className="rpt-insight-body">
                  <div className="rpt-insight-label">{ins.label}</div>
                  <div className="rpt-insight-value">{ins.value}</div>
                  <div className="rpt-insight-sub">{ins.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ROOT PAGE COMPONENT
// ══════════════════════════════════════════════════════════
export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchReports()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.detail || "Failed to load reports data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="rpt-page">
      {/* ── Header ── */}
      <div className="rpt-header">
        <div className="rpt-header-left">
          <h1>Business Intelligence</h1>
          <p>Revenue · Packages · Campaigns · Brands · Ad Formats</p>
        </div>
        <div className="rpt-live-badge">
          <span className="rpt-live-dot" />
          Live Data
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rpt-error">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && <LoadingSkeleton />}

      {/* ── Content ── */}
      {!loading && !error && data && (
        <>
          {/* 1 · KPI Summary */}
          <div>
            <div className="rpt-section-title">
              <Info size={13} /> Summary
            </div>
            <KpiStrip
              summary={data.summary}
              revenueTrend={data.revenue_trend}
              campaignPerf={data.campaign_performance}
            />
          </div>

          {/* 2 · Revenue Trend (full width) */}
          <div>
            <div className="rpt-section-title">
              <TrendingUp size={13} /> Revenue Trend
            </div>
            <RevenueTrendChart data={data.revenue_trend ?? []} />
          </div>

          {/* 3 · Package Performance + Revenue Distribution */}
          <div>
            <div className="rpt-section-title">
              <Package size={13} /> Package Analytics
            </div>
            <div className="rpt-row-3col">
              <PackagePerformanceChart data={data.package_performance ?? []} />
              <RevenueDonut data={data.revenue_distribution ?? []} />
            </div>
          </div>

          {/* 4 · Campaign Performance + Credits Analytics */}
          <div>
            <div className="rpt-section-title">
              <Megaphone size={13} /> Campaign & Credits
            </div>
            <div className="rpt-row-2col">
              <CampaignPerformanceChart data={data.campaign_performance ?? []} />
              <CreditsAnalyticsChart data={data.credits_analytics ?? []} />
            </div>
          </div>

          {/* 5 · Brand Performance Leaderboard */}
          <div>
            <div className="rpt-section-title">
              <Award size={13} /> Brand Leaderboard
            </div>
            <BrandLeaderboard data={data.brand_leaderboard ?? []} />
          </div>


          {/* 7 · Ad Format Analytics */}
          <div>
            <div className="rpt-section-title">
              <Cpu size={13} /> Ad Format Analytics
            </div>
            <AdFormatAnalytics data={data.ad_format_analytics} />
          </div>

          {/* 8 · Business Insights */}
          <div>
            <div className="rpt-section-title">
              <Star size={13} /> Business Insights
            </div>
            <BusinessInsights data={data.insights ?? []} />
          </div>
        </>
      )}
    </div>
  );
}
