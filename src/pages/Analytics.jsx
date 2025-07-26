import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { StarBackground } from "../components/StarBackground";

const chartContainerStyle = {
  maxWidth: "100%",
  minHeight: 400,
  margin: "2rem auto",
  position: "relative",
  zIndex: 1,
};

const glassStyle = {
  background: "rgba(24, 26, 32, 0.18)",
  borderRadius: "1rem",
  border: "1.5px solid rgba(255,255,255,0.04)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  padding: "1.5rem",
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/visitor-analytics")
      .then((res) => res.json())
      .then((res) => {
        console.log("Analytics response:", res);
        setRawData(res.visits.map(v => ({ ...v, lastVisit: new Date(v.lastVisit || v.timestamp) })));
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

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center bg-transparent">
      <StarBackground />
      <div className="container mx-auto px-4 py-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={() => navigate("/")}
            className="bg-red-600 hover:bg-red-700 text-white border-none rounded-md px-4 py-2 font-semibold text-lg shadow-lg cursor-pointer transition-colors mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            Visitor Analytics
          </h1>
        </div>

        {/* View Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {VIEWS.map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-2 rounded-md font-semibold text-sm md:text-base transition-colors ${
                view === v 
                  ? "bg-red-600 text-white border-2 border-red-600 shadow-lg" 
                  : "bg-gray-800 text-red-600 border-2 border-gray-800"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Date Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(Number(e.target.value))} 
            className="px-3 py-2 rounded-md bg-gray-800 text-white border border-red-600 text-sm md:text-base"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          
          {(view === "Monthly" || view === "Daily") && (
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(Number(e.target.value))} 
              className="px-3 py-2 rounded-md bg-gray-800 text-white border border-red-600 text-sm md:text-base"
            >
              {months.map(m => <option key={m} value={m}>{pad(m)}</option>)}
            </select>
          )}
          
          {view === "Daily" && (
            <select 
              value={selectedDay} 
              onChange={e => setSelectedDay(Number(e.target.value))} 
              className="px-3 py-2 rounded-md bg-gray-800 text-white border border-red-600 text-sm md:text-base"
            >
              {days.map(d => <option key={d} value={d}>{pad(d)}</option>)}
            </select>
          )}
          
          {view === "Weekly" && (
            <select 
              value={selectedWeek} 
              onChange={e => setSelectedWeek(Number(e.target.value))} 
              className="px-3 py-2 rounded-md bg-gray-800 text-white border border-red-600 text-sm md:text-base"
            >
              {weeks.map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
          )}
        </div>

        {/* Date Display */}
        {view === "Daily" && (
          <div className="text-center text-red-600 mb-4 font-medium text-lg">
            {`Visits for ${pad(selectedDay)}/${pad(selectedMonth)}/${selectedYear}`}
          </div>
        )}

        {/* Chart Container */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-lg overflow-hidden" style={{ ...chartContainerStyle, ...glassStyle }}>
          <div className="w-full h-full">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-red-600 text-lg">
                Loading chart...
              </div>
            ) : chartData.every(d => d.count === 0) ? (
              <div className="flex items-center justify-center h-64 text-red-600 text-lg">
                No visits for this {view.toLowerCase()}.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid stroke="#ff1744" strokeOpacity={0.25} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    stroke="#fff"
                    tick={{ fill: "#fff", fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    stroke="#fff"
                    tick={{ fill: "#fff", fontSize: 14 }}
                    allowDecimals={false}
                    label={{ value: 'Unique Visitors', angle: -90, position: 'insideLeft', fill: '#fff', fontSize: 16 }}
                  />
                  <Tooltip
                    contentStyle={{ background: "#222", border: "1px solid #ff1744", color: "#fff" }}
                    labelStyle={{ color: "#ff1744" }}
                    formatter={(value) => [value, 'Unique Visitors']}
                    labelFormatter={(label) => view === "Daily" ? `Hour: ${label}` : label}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#ff1744" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "#ff1744", stroke: "#fff", strokeWidth: 2 }} 
                    activeDot={{ r: 6 }} 
                    style={neonLineStyle} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 