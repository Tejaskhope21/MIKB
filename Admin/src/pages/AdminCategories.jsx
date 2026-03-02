// src/pages/admin/AdminCategoryTreePage.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminCategories = () => {
  const [category, setCategory] = useState({
    name: "",
    image: "", // BASE64 STRING
    position: 0,
  });

  const [subCategories, setSubCategories] = useState([
    { title: "", position: 0, items: [""] },
  ]);

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const token = localStorage.getItem("token");

  /* ---------------- IMAGE TO BASE64 ---------------- */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PNG, JPEG, JPG, GIF files allowed");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCategory((prev) => ({ ...prev, image: reader.result }));
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- SUB CATEGORY ---------------- */
  const handleSubChange = (index, field, value) => {
    const updated = [...subCategories];
    updated[index][field] = value;
    setSubCategories(updated);
  };

  const addSubCategory = () => {
    setSubCategories([
      ...subCategories,
      { title: "", position: 0, items: [""] },
    ]);
  };

  const removeSubCategory = (index) => {
    if (subCategories.length === 1) return;
    setSubCategories(subCategories.filter((_, i) => i !== index));
  };

  /* ---------------- ITEM TYPES ---------------- */
  const handleItemChange = (subIndex, itemIndex, value) => {
    const updated = [...subCategories];
    updated[subIndex].items[itemIndex] = value;
    setSubCategories(updated);
  };

  const addItem = (subIndex) => {
    const updated = [...subCategories];
    updated[subIndex].items.push("");
    setSubCategories(updated);
  };

  const removeItem = (subIndex, itemIndex) => {
    const updated = [...subCategories];
    if (updated[subIndex].items.length === 1) return;
    updated[subIndex].items.splice(itemIndex, 1);
    setSubCategories(updated);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Login required");
      return;
    }

    if (!category.name || !category.image) {
      toast.error("Category name & image required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        category: {
          name: category.name.trim(),
          image: category.image, // BASE64 ✔
          position: Number(category.position),
        },
        subCategories: subCategories.map((sub) => ({
          title: sub.title.trim(),
          position: Number(sub.position),
          items: sub.items.filter((i) => i.trim() !== ""),
        })),
      };

      const res = await axios.post(
        "https://bricks-backend-qyea.onrender.com/api/v1/categories/admin/category-tree",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      toast.success("Category tree created successfully");

      setCategory({ name: "", image: "", position: 0 });
      setImagePreview(null);
      setSubCategories([{ title: "", position: 0, items: [""] }]);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI (UNCHANGED) ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 lg:p-10">
          <h1 className="text-3xl font-bold mb-10 text-center">
            Create New Category Tree
          </h1>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* CATEGORY */}
            <section className="bg-gray-50 p-8 rounded-xl border">
              <input
                type="text"
                name="name"
                value={category.name}
                onChange={handleCategoryChange}
                placeholder="Category Name"
                className="w-full mb-4 px-5 py-3 border rounded-lg"
              />

              <input
                type="number"
                name="position"
                value={category.position}
                onChange={handleCategoryChange}
                className="w-full mb-4 px-5 py-3 border rounded-lg"
              />

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                onChange={handleImageChange}
              />

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-40 h-40 mt-4 object-cover rounded-lg"
                />
              )}
            </section>

            {/* SUB CATEGORIES */}
            <section className="bg-gray-50 p-8 rounded-xl border">
              <button type="button" onClick={addSubCategory}>
                + Add Subcategory
              </button>

              {subCategories.map((sub, i) => (
                <div key={i} className="mt-6">
                  <input
                    value={sub.title}
                    onChange={(e) =>
                      handleSubChange(i, "title", e.target.value)
                    }
                    placeholder="Subcategory"
                    className="w-full mb-2 px-4 py-2 border rounded"
                  />

                  {sub.items.map((item, j) => (
                    <input
                      key={j}
                      value={item}
                      onChange={(e) => handleItemChange(i, j, e.target.value)}
                      placeholder="Item type"
                      className="w-full mb-2 px-4 py-2 border rounded"
                    />
                  ))}

                  <button type="button" onClick={() => addItem(i)}>
                    + Add Item
                  </button>

                  <button type="button" onClick={() => removeSubCategory(i)}>
                    Remove Subcategory
                  </button>
                </div>
              ))}
            </section>

            <button
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-pink-600 text-white rounded-xl"
            >
              {loading ? "Creating..." : "Create Category Tree"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
