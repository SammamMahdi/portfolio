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

export default function Analytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/visitor-analytics")
      .then((res) => res.json())
      .then((res) => {
        // Group by date (YYYY-MM-DD)
        const grouped = {};
        res.visits.forEach((v) => {
          const date = new Date(v.lastVisit).toLocaleDateString();
          grouped[date] = (grouped[date] || 0) + 1;
        });
        const chartData = Object.entries(grouped).map(([date, count]) => ({ date, count }));
        setData(chartData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem", textAlign: "center" }}>
          Visitor Analytics
        </h1>
        <div style={chartContainerStyle}>
          {loading ? (
            <div style={{ textAlign: "center", color: "#ff1744" }}>Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#fff" tick={{ fill: "#fff" }} />
                <YAxis stroke="#fff" tick={{ fill: "#fff" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#222", border: "1px solid #ff1744", color: "#fff" }} labelStyle={{ color: "#ff1744" }} />
                <Line type="monotone" dataKey="count" stroke="#ff1744" strokeWidth={3} dot={{ r: 5, fill: "#ff1744", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7 }} style={neonLineStyle} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
} 