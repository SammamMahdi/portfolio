import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { StarBackground } from "../components/StarBackground";

const chartContainerStyle = {
  maxWidth: 1400,
  minHeight: 700,
  margin: "4rem auto 4rem auto",
  position: "relative",
  zIndex: 1,
};

const glassStyle = {
  background: "rgba(24, 26, 32, 0.18)", // even more transparent
  borderRadius: "1.25rem",
  border: "1.5px solid rgba(255,255,255,0.04)", // even lighter border
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  padding: "2.5rem 2rem 2.5rem 2rem",
  overflow: "hidden",
};

const neonLineStyle = {
  filter: "drop-shadow(0 0 6px #ff1744) drop-shadow(0 0 12px #ff1744)"
};

const VIEWS = ["Daily", "Weekly", "Monthly", "Yearly"];

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}

function pad(n) { return n < 10 ? `0${n}` : n; }

export default function Analytics() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("Yearly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-based
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/visitor-analytics")
      .then((res) => res.json())
      .then((res) => {
        console.log("Analytics response:", res);
        setRawData(res.visits.map(v => ({ ...v, lastVisit: new Date(v.timestamp) })));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Analytics error:", error);
        setLoading(false);
      });
  }, []);

  // Get available years, months, weeks, days from data
  const years = Array.from(new Set(rawData.map(v => v.lastVisit.getFullYear()))).sort((a, b) => b - a);
  const months = Array.from(new Set(rawData.filter(v => v.lastVisit.getFullYear() === selectedYear).map(v => v.lastVisit.getMonth() + 1))).sort((a, b) => a - b);
  const days = Array.from(new Set(rawData.filter(v => v.lastVisit.getFullYear() === selectedYear && v.lastVisit.getMonth() + 1 === selectedMonth).map(v => v.lastVisit.getDate()))).sort((a, b) => a - b);
  const weeks = Array.from(new Set(rawData.filter(v => v.lastVisit.getFullYear() === selectedYear).map(v => getWeekNumber(v.lastVisit)))).sort((a, b) => a - b);

  // Group data for chart
  let chartData = [];
  if (view === "Yearly") {
    const grouped = {};
    for (let m = 1; m <= 12; m++) grouped[m] = 0;
    rawData.filter(v => v.lastVisit.getFullYear() === selectedYear).forEach(v => {
      const month = v.lastVisit.getMonth() + 1;
      grouped[month]++;
    });
    chartData = Object.entries(grouped).map(([month, count]) => ({
      label: `${pad(month)}/${selectedYear}`,
      count
    }));
  } else if (view === "Monthly") {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const grouped = {};
    for (let d = 1; d <= daysInMonth; d++) grouped[d] = 0;
    rawData.filter(v => v.lastVisit.getFullYear() === selectedYear && v.lastVisit.getMonth() + 1 === selectedMonth).forEach(v => {
      const day = v.lastVisit.getDate();
      grouped[day]++;
    });
    chartData = Object.entries(grouped).map(([day, count]) => ({
      label: `${pad(day)}/${pad(selectedMonth)}/${selectedYear}`,
      count
    }));
  } else if (view === "Weekly") {
    const grouped = {};
    for (let d = 0; d < 7; d++) grouped[d] = 0;
    rawData.filter(v => v.lastVisit.getFullYear() === selectedYear && getWeekNumber(v.lastVisit) === selectedWeek).forEach(v => {
      const day = v.lastVisit.getDay();
      grouped[day]++;
    });
    chartData = Object.entries(grouped).map(([day, count]) => ({
      label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day],
      count
    }));
  } else if (view === "Daily") {
    const grouped = {};
    for (let h = 0; h < 24; h++) grouped[h] = 0;
    rawData.filter(v => v.lastVisit.getFullYear() === selectedYear && v.lastVisit.getMonth() + 1 === selectedMonth && v.lastVisit.getDate() === selectedDay).forEach(v => {
      const hour = v.lastVisit.getHours();
      grouped[hour]++;
    });
    chartData = Object.entries(grouped).map(([hour, count]) => {
      const h = Number(hour);
      const ampm = h < 12 ? "AM" : "PM";
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      return {
        label: `${pad(hour12)}:00 ${ampm}`,
        count
      };
    });
  }

  // Responsive min width for chart area (for horizontal scroll)
  let minChartWidth = 900;
  if (view === "Daily") minChartWidth = 1200;
  if (view === "Monthly") minChartWidth = 1200;
  if (view === "Weekly") minChartWidth = 900;
  if (view === "Yearly") minChartWidth = 900;

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center bg-transparent">
      <StarBackground />
      <div className="container mx-auto px-2 py-8 relative z-10">
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 32, alignItems: 'center' }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#ff1744",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "0.6rem 1.4rem",
              fontWeight: 600,
              fontSize: "1.1rem",
              boxShadow: "0 0 8px #ff1744",
              cursor: "pointer",
              marginRight: 16,
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            ← Back
          </button>
          {VIEWS.map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                background: view === v ? "#ff1744" : "#222",
                color: view === v ? "#fff" : "#ff1744",
                border: view === v ? "2px solid #ff1744" : "2px solid #222",
                borderRadius: 6,
                padding: "0.6rem 1.4rem",
                fontWeight: 600,
                fontSize: "1.1rem",
                boxShadow: view === v ? "0 0 8px #ff1744" : "none",
                cursor: "pointer",
                marginRight: 0,
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {v}
            </button>
          ))}
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem", textAlign: "center" }}>
          Visitor Analytics
        </h1>
        {view === "Daily" && (
          <div style={{ textAlign: "center", color: "#ff1744", marginBottom: 12, fontWeight: 500, fontSize: "1.2rem" }}>
            {`Visits for ${pad(selectedDay)}/${pad(selectedMonth)}/${selectedYear}`}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 32 }}>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ padding: 8, borderRadius: 4, background: "#222", color: "#fff", border: "1px solid #ff1744", fontSize: "1.1rem" }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {(view === "Monthly" || view === "Daily") && (
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={{ padding: 8, borderRadius: 4, background: "#222", color: "#fff", border: "1px solid #ff1744", fontSize: "1.1rem" }}>
              {months.map(m => <option key={m} value={m}>{pad(m)}</option>)}
            </select>
          )}
          {view === "Daily" && (
            <select value={selectedDay} onChange={e => setSelectedDay(Number(e.target.value))} style={{ padding: 8, borderRadius: 4, background: "#222", color: "#fff", border: "1px solid #ff1744", fontSize: "1.1rem" }}>
              {days.map(d => <option key={d} value={d}>{pad(d)}</option>)}
            </select>
          )}
          {view === "Weekly" && (
            <select value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))} style={{ padding: 8, borderRadius: 4, background: "#222", color: "#fff", border: "1px solid #ff1744", fontSize: "1.1rem" }}>
              {weeks.map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
          )}
        </div>
        <div
          className="bg-card border border-border rounded-xl shadow-lg flex items-center justify-center overflow-x-auto"
          style={{ ...chartContainerStyle, ...glassStyle }}
        >
          <div style={{ minWidth: minChartWidth, width: "100%" }}>
            {loading ? (
              <div style={{ textAlign: "center", color: "#ff1744" }}>Loading chart...</div>
            ) : chartData.every(d => d.count === 0) ? (
              <div style={{ textAlign: "center", color: "#ff1744" }}>No visits for this {view.toLowerCase()}.</div>
            ) : (
              <ResponsiveContainer width="100%" height={600}>
                <LineChart data={chartData} margin={{ top: 60, right: 60, left: 20, bottom: 60 }}>
                  <CartesianGrid stroke="#ff1744" strokeOpacity={0.25} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    stroke="#fff"
                    tick={{ fill: "#fff", fontSize: 16 }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={70}
                    ticks={chartData.map(d => d.label)}
                  />
                  <YAxis
                    stroke="#fff"
                    tick={{ fill: "#fff", fontSize: 18 }}
                    allowDecimals={false}
                    label={{ value: 'Visits', angle: -90, position: 'insideLeft', fill: '#fff', fontSize: 20 }}
                  />
                  <Tooltip
                    contentStyle={{ background: "#222", border: "1px solid #ff1744", color: "#fff" }}
                    labelStyle={{ color: "#ff1744" }}
                    formatter={(value) => [value, 'Visits']}
                    labelFormatter={(label) => view === "Daily" ? `Hour: ${label}` : label}
                  />
                  <Line type="monotone" dataKey="count" stroke="#ff1744" strokeWidth={3} dot={{ r: 6, fill: "#ff1744", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 9 }} style={neonLineStyle} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 