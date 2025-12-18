import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from "recharts";

const data1 = [
  { name: "Compressions", value: -179392.5 },
  { name: "Recoveries", value: 508922 },
];

const data2 = [
  { name: "Ads Spent", value: -200986.6 },
  { name: "Recovered", value: 420138.33 },
];

const data3 = [
  { name: "Total", value: 642051.7 },
];

const CustomBarChart = ({ data }) => (
  <BarChart
    width={300}
    height={80 + data.length * 30}
    data={data}
    layout="vertical"
    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
  >
    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
    <XAxis type="number" />
    <YAxis type="category" dataKey="name" width={100} />
    <Tooltip />
    <Bar dataKey="value" fill="#c084fc">
      <LabelList
        dataKey="value"
        position="right"
        formatter={(val) => val.toLocaleString()}
      />
    </Bar>
  </BarChart>
);

export default function Graphs() {
  return (
    <div className="flex flex-wrap gap-8">
      <div className="flex flex-col items-center">
        <h2 className="font-bold mb-2">Compensations & Recoveries</h2>
        <CustomBarChart data={data1} />
      </div>
      <div className="flex flex-col items-center">
        <h2 className="font-bold mb-2">Ads Costs</h2>
        <CustomBarChart data={data2} />
      </div>
      <div className="flex flex-col items-center">
        <h2 className="font-bold mb-2">Total</h2>
        <CustomBarChart data={data3} />
      </div>
    </div>
  );
}
