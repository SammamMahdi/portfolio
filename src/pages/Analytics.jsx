import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

const chartContainerStyle = {
  background: "#181a20",
  borderRadius: "1rem",
  padding: "2rem",
  boxShadow: "0 0 24px 2px #111",
  margin: "2rem auto",
  maxWidth: 700,
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
        setRawData(res.visits.map(v => ({ ...v, lastVisit: new Date(v.lastVisit) })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Get available years, months, weeks, days from data
  const years = Array.from(new Set(rawData.map(v => v.lastVisit.getFullYear()))).sort((a, b) => b - a);
  const months = Array.from(new Set(rawData.filter(v => v.lastVisit.getFullYear() === selectedYear).map(v => v.lastVisit.getMonth() + 1))).sort((a, b) => a - b);
  const days = Array.from(new Set(rawData.filter(v => v.lastVisit.getFullYear() === selectedYear && v.lastVisit.getMonth() + 1 === selectedMonth).map(v => v.lastVisit.getDate()))).sort((a, b) => a - b);
  const weeks = Array.from(new Set(rawData.filter(v => v.lastVisit.getFullYear() === selectedYear).map(v => getWeekNumber(v.lastVisit)))).sort((a, b) => a - b);

  // Group data for chart
  let chartData = [];
  if (view === "Yearly") {
    // Visits per month in selected year
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
    // Visits per day in selected month
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
    // Visits per day in selected week
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
    // Visits per hour in selected day
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

  return (
    <div style={{ minHeight: "100vh", background: "#181a20", color: "#fff" }}>
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          style={{
            background: "#ff1744",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "0.5rem 1.2rem",
            fontWeight: 600,
            marginBottom: "2rem",
            boxShadow: "0 0 8px #ff1744",
            cursor: "pointer"
          }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem", textAlign: "center" }}>
          Visitor Analytics
        </h1>
        {view === "Daily" && (
          <div style={{ textAlign: "center", color: "#ff1744", marginBottom: 12, fontWeight: 500 }}>
            {`Visits for ${pad(selectedDay)}/${pad(selectedMonth)}/${selectedYear}`}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          {VIEWS.map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                background: view === v ? "#ff1744" : "#222",
                color: view === v ? "#fff" : "#ff1744",
                border: "none",
                borderRadius: 6,
                padding: "0.4rem 1.1rem",
                fontWeight: 600,
                boxShadow: view === v ? "0 0 8px #ff1744" : "none",
                cursor: "pointer"
              }}
            >
              {v}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24 }}>
          {/* Year selector */}
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ padding: 6, borderRadius: 4, background: "#222", color: "#fff", border: "1px solid #ff1744" }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {/* Month selector for Monthly, Daily */}
          {(view === "Monthly" || view === "Daily") && (
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={{ padding: 6, borderRadius: 4, background: "#222", color: "#fff", border: "1px solid #ff1744" }}>
              {months.map(m => <option key={m} value={m}>{pad(m)}</option>)}
            </select>
          )}
          {/* Day selector for Daily */}
          {view === "Daily" && (
            <select value={selectedDay} onChange={e => setSelectedDay(Number(e.target.value))} style={{ padding: 6, borderRadius: 4, background: "#222", color: "#fff", border: "1px solid #ff1744" }}>
              {days.map(d => <option key={d} value={d}>{pad(d)}</option>)}
            </select>
          )}
          {/* Week selector for Weekly */}
          {view === "Weekly" && (
            <select value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))} style={{ padding: 6, borderRadius: 4, background: "#222", color: "#fff", border: "1px solid #ff1744" }}>
              {weeks.map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
          )}
        </div>
        <div style={chartContainerStyle}>
          {loading ? (
            <div style={{ textAlign: "center", color: "#ff1744" }}>Loading chart...</div>
          ) : chartData.every(d => d.count === 0) ? (
            <div style={{ textAlign: "center", color: "#ff1744" }}>No visits for this {view.toLowerCase()}.</div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  stroke="#fff"
                  tick={{ fill: "#fff" }}
                  interval={view === "Daily" ? 1 : 0}
                  ticks={view === "Daily" ? chartData.filter(d => d.count > 0).map(d => d.label) : undefined}
                />
                <YAxis
                  stroke="#fff"
                  tick={{ fill: "#fff" }}
                  allowDecimals={false}
                  label={{ value: 'Visits', angle: -90, position: 'insideLeft', fill: '#fff', fontSize: 14 }}
                />
                <Tooltip
                  contentStyle={{ background: "#222", border: "1px solid #ff1744", color: "#fff" }}
                  labelStyle={{ color: "#ff1744" }}
                  formatter={(value) => [value, 'Visits']}
                  labelFormatter={(label) => view === "Daily" ? `Hour: ${label}` : label}
                />
                <Line type="monotone" dataKey="count" stroke="#ff1744" strokeWidth={3} dot={{ r: 5, fill: "#ff1744", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7 }} style={neonLineStyle} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
} 