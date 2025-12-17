import React, { useState } from "react";

const ProductQualityDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [sortBy, setSortBy] = useState("relevance");

  // Mock data for demonstration
  const qualityMetrics = {
    score: "N/A",
    status: "No score available",
    message: "Since you don't have enough ratings.",
    feedback: "No feedback available",
    encouragement: "Great work! Continue listing good quality products",
    views: {
      l6x: "0:15%",
      dx: "0.6X VIEWS",
      qx: "0.5X VIEWS",
      noViews: "0.2X VIEWS",
    },
    ranges: [
      { color: "green", range: "0 - 15%" },
      { color: "yellow", range: "15 - 22%" },
      { color: "red", range: "22 - 25%" },
      { color: "blocked", range: "More than 25%" },
    ],
    recommendations: [],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Product Quality
        </h1>

        {/* Quality Score Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Quality Score
              </h2>
              <p className="text-sm text-gray-600 mb-4">1 and 2 star ratings</p>

              <div className="flex items-center mb-4">
                <div className="text-3xl font-bold text-gray-800 mr-4">
                  Quality Score = {qualityMetrics.score}
                </div>
                <div className="text-sm text-gray-500">
                  {qualityMetrics.status}
                </div>
              </div>

              <p className="text-sm text-gray-600">{qualityMetrics.message}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Total Ratings
              </h2>
              <div className="h-40 flex items-center justify-center bg-gray-100 rounded-lg">
                <span className="text-gray-500">Chart would appear here</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Customer Feedback */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Top Customer Feedback
          </h2>
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">{qualityMetrics.feedback}</p>
            <p className="text-green-600 font-medium mt-2">
              {qualityMetrics.encouragement}
            </p>
          </div>
        </div>

        {/* Views Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Views Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="font-semibold">L6X VIEWS</div>
              <div className="text-blue-600">{qualityMetrics.views.l6x}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="font-semibold">DX VIEWS</div>
              <div className="text-blue-600">{qualityMetrics.views.dx}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="font-semibold">QX VIEWS</div>
              <div className="text-blue-600">{qualityMetrics.views.qx}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="font-semibold">NO VIEWS</div>
              <div className="text-blue-600">
                {qualityMetrics.views.noViews}
              </div>
            </div>
          </div>

          {/* Quality Ranges */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {qualityMetrics.ranges.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg text-center text-white
                ${item.color === "green" ? "bg-green-500" : ""}
                ${item.color === "yellow" ? "bg-yellow-500" : ""}
                ${item.color === "red" ? "bg-red-500" : ""}
                ${item.color === "blocked" ? "bg-gray-800" : ""}
              `}
              >
                <div className="font-semibold">
                  {item.color.charAt(0).toUpperCase() + item.color.slice(1)}
                </div>
                <div>{item.range}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 md:mb-0">
              Quality Recommendations
            </h2>

            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "pending"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setActiveTab("pending")}
              >
                Action Pending (0)
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "fixed"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setActiveTab("fixed")}
              >
                Fixed (0)
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-gray-600">Sort by:</span>
              <select
                className="border rounded-lg p-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="score">Quality Score</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <div className="border rounded-lg p-2 flex items-center">
                <input
                  type="text"
                  placeholder="Search By Style / SKU / Catalog ID"
                  className="outline-none"
                />
                <i className="fas fa-search text-gray-400 ml-2"></i>
              </div>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg">
                View Blocked Products
              </button>
            </div>
          </div>

          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No products as of now</p>
            <p className="text-gray-500 text-sm mt-2">
              Products that have poor quality or listing issues will appear
              here.
            </p>
          </div>

          <div className="mt-4 text-sm text-gray-500 flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>
              Growth for fixed products takes around 1.5 months to reflect
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQualityDashboard;
