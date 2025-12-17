import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register chart components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

export default function SalesChart() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Sales",
        data: [1200, 1900, 3000, 2500, 3200],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)", // Fill color with transparency
        fill: true, // Explicitly enable fill
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    maintainAspectRatio: false, // Allows custom height control
  };

  return (
    <div
      className="p-[2rem] bg-white shadow rounded-lg"
      style={{ maxHeight: "350px" }}
    >
      <h2 className="text-lg  font-bold ">Monthly Sales</h2>
      <Line data={data} options={options} />
    </div>
  );
}
