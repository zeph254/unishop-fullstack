import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const LiveChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulate live data fetching
    const interval = setInterval(() => {
      const newData = {
        time: new Date().toLocaleTimeString(),
        sales: Math.floor(Math.random() * 1000), // Simulated sales data
      };

      setData((prevData) => [...prevData.slice(-9), newData]); // Keep only the last 10 points
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <div className="p-6 bg-white shadow-xl rounded-2xl border border-gray-200">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center py-4 rounded-t-2xl">
        <h2 className="text-2xl font-bold">Live Sales Data</h2>
        <p className="text-sm opacity-90">Updated every 2 seconds</p>
      </div>

      {/* Chart Container */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="time" tick={{ fill: "#4B5563" }} />
            <YAxis tick={{ fill: "#4B5563" }} />
            <Tooltip 
              contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: "8px" }} 
              itemStyle={{ color: "#3b82f6" }} 
            />
            <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="text-center py-2">
        <p className="text-gray-600 text-sm">📊 Real-time analytics powered by UniShop</p>
      </div>
    </div>
  );
};

export default LiveChart;
