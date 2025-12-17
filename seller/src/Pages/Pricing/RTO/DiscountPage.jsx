import React, { useState } from "react";

const discountData = [
  {
    id: 1,
    category: "All Products",
    priceRange: "₹53 - ₹249",
    products: 24,
  },
  {
    id: 2,
    category: "Unisex Personal Care > Unisex Perfumes",
    priceRange: "below ₹201",
    products: 7,
  },
  {
    id: 3,
    category: "Unisex Personal Care > Unisex Perfumes",
    priceRange: "₹201 - ₹500",
    products: 6,
  },
  {
    id: 4,
    category: "Mobiles, Electronics Accessories > Wired Headphones",
    priceRange: "₹201 - ₹500",
    products: 4,
  },
  {
    id: 5,
    category: "Men Sports Wear > Active Tshirts",
    priceRange: "₹201 - ₹500",
    products: 4,
  },
  {
    id: 6,
    category: "Men Top Wear > Tshirts",
    priceRange: "₹201 - ₹500",
    products: 4,
  },
  {
    id: 7,
    category: "Mobiles, Electronics Accessories > Bluetooth Headphones",
    priceRange: "below ₹201",
    products: 2,
  },
];

export default function DiscountPage() {
  const [activeTab, setActiveTab] = useState("add");
  const [selected, setSelected] = useState([]);
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);

  const handleSelect = (item) => {
    if (selected.includes(item.id)) {
      setSelected(selected.filter((id) => id !== item.id));
    } else {
      setSelected([...selected, item.id]);
    }
  };

  const handleApply = () => {
    const applied = discountData.filter((d) => selected.includes(d.id));
    setAppliedDiscounts(applied);
    setSelected([]);
    setActiveTab("applied"); // Switch to Applied tab after applying
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Reduce RTO & Returns</h1>

      {/* Tab Section */}
      <div className="bg-purple-50 p-4 mb-6 rounded-t-lg">
        <p className="text-purple-700 mb-2">
          <span className="mr-2">⚠</span> Sellers who apply both discounts see fewer RTOs and returns.
        </p>
      </div>
      <div className="border rounded-lg overflow-hidden shadow">
        <div className="flex border-b">
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === "add"
                ? "bg-purple-700 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("add")}
          >
            Add Discount (5)
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === "applied"
                ? "bg-purple-700 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("applied")}
          >
            Discounts Applied (0)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === "add" && (
            <div>
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Select</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Products</th>
                    <th className="p-2">Prepaid Discount</th>
                    <th className="p-2">WDRP Discount</th>
                  </tr>
                </thead>
                <tbody>
                  {discountData.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          onChange={() => handleSelect(item)}
                        />
                      </td>
                      <td className="p-2">{item.category}</td>
                      <td className="p-2">{item.priceRange}</td>
                      <td className="p-2">{item.products}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          placeholder="₹"
                          className="border rounded px-2 py-1 w-20"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          placeholder="₹"
                          className="border rounded px-2 py-1 w-20"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={handleApply}
                disabled={selected.length === 0}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
              >
                Apply Discount
              </button>
            </div>
          )}

          {activeTab === "applied" && (
            <div>
              <h2 className="font-semibold text-lg mb-3">Discounts Applied</h2>
              {appliedDiscounts.length === 0 ? (
                <p className="text-gray-500">No discounts applied yet.</p>
              ) : (
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2">Category</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Products</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliedDiscounts.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2">{item.category}</td>
                        <td className="p-2">{item.priceRange}</td>
                        <td className="p-2">{item.products}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}