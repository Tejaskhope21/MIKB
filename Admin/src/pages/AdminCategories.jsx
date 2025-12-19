import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Upload,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const AdminCategories = () => {
  // State for categories and subcategories
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Aggregates & Sand",
      slug: "aggregates-sand",
      image: "https://via.placeholder.com/150",
      description: "Construction aggregates and sand materials",
      status: "active",
      featured: true,
      sortOrder: 1,
      createdAt: "2024-01-15",
      subcategories: [
        {
          id: 101,
          name: "River Sand",
          slug: "river-sand",
          image: "https://via.placeholder.com/150",
          description: "Natural river sand for construction",
          status: "active",
          featured: false,
          sortOrder: 1,
          productCount: 45,
        },
        {
          id: 102,
          name: "M Sand",
          slug: "m-sand",
          image: "https://via.placeholder.com/150",
          description: "Manufactured sand",
          status: "active",
          featured: true,
          sortOrder: 2,
          productCount: 32,
        },
      ],
    },
    {
      id: 2,
      name: "Cement & Binding Materials",
      slug: "cement-binding-materials",
      image: "https://via.placeholder.com/150",
      description: "Cement and binding materials for construction",
      status: "active",
      featured: true,
      sortOrder: 2,
      createdAt: "2024-01-10",
      subcategories: [
        {
          id: 201,
          name: "Portland Cement",
          slug: "portland-cement",
          image: "https://via.placeholder.com/150",
          description: "Ordinary Portland Cement",
          status: "active",
          featured: true,
          sortOrder: 1,
          productCount: 78,
        },
        {
          id: 202,
          name: "PPC Cement",
          slug: "ppc-cement",
          image: "https://via.placeholder.com/150",
          description: "Portland Pozzolana Cement",
          status: "active",
          featured: false,
          sortOrder: 2,
          productCount: 56,
        },
      ],
    },
  ]);

  // State for form
  const [formData, setFormData] = useState({
    type: "category", // 'category' or 'subcategory'
    categoryId: "",
    name: "",
    slug: "",
    description: "",
    image: "",
    status: "active",
    featured: false,
    sortOrder: 0,
  });

  // UI states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState("add"); // 'add' or 'edit'
  const [currentImage, setCurrentImage] = useState(null);

  // Filter categories based on search and filter
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || category.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Auto-generate slug from name
    if (name === "name" && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-");
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  // Handle category selection for subcategory
  const handleCategoryChange = (e) => {
    setFormData({
      ...formData,
      categoryId: e.target.value,
    });
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  // Open modal for adding/editing
  const openModal = (type, item = null) => {
    setActionType(item ? "edit" : "add");
    setFormData({
      type,
      categoryId: "",
      name: "",
      slug: "",
      description: "",
      image: "",
      status: "active",
      featured: false,
      sortOrder: 0,
    });
    
    if (item) {
      if (type === "category") {
        setFormData({
          type: "category",
          categoryId: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          image: item.image,
          status: item.status,
          featured: item.featured,
          sortOrder: item.sortOrder,
        });
        setSelectedItem(item);
      } else if (type === "subcategory") {
        // For editing subcategory, we need to find its parent
        const parentCategory = categories.find(cat => 
          cat.subcategories?.some(sub => sub.id === item.id)
        );
        if (parentCategory) {
          setFormData({
            type: "subcategory",
            categoryId: parentCategory.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            image: item.image,
            status: item.status,
            featured: item.featured,
            sortOrder: item.sortOrder,
          });
          setSelectedItem(item);
        }
      }
    } else {
      setSelectedItem(null);
      if (type === "subcategory") {
        // When adding subcategory, auto-select first category
        if (categories.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
        }
      }
    }
    setIsModalOpen(true);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({
          ...formData,
          image: e.target.result,
        });
        setCurrentImage({
          preview: e.target.result,
          name: file.name,
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (actionType === "add") {
        // Add new category/subcategory
        if (formData.type === "category") {
          const newCategory = {
            id: Date.now(),
            name: formData.name,
            slug: formData.slug,
            image: formData.image || "https://via.placeholder.com/150",
            description: formData.description,
            status: formData.status,
            featured: formData.featured,
            sortOrder: formData.sortOrder || categories.length + 1,
            createdAt: new Date().toISOString().split('T')[0],
            subcategories: [],
          };
          setCategories([...categories, newCategory]);
        } else {
          // Add subcategory
          const updatedCategories = categories.map(category => {
            if (category.id === parseInt(formData.categoryId)) {
              const newSubcategory = {
                id: Date.now(),
                name: formData.name,
                slug: formData.slug,
                image: formData.image || "https://via.placeholder.com/150",
                description: formData.description,
                status: formData.status,
                featured: formData.featured,
                sortOrder: formData.sortOrder || (category.subcategories?.length || 0) + 1,
                productCount: 0,
              };
              return {
                ...category,
                subcategories: [...(category.subcategories || []), newSubcategory],
              };
            }
            return category;
          });
          setCategories(updatedCategories);
        }
      } else {
        // Edit existing category/subcategory
        if (formData.type === "category") {
          const updatedCategories = categories.map(category => {
            if (category.id === selectedItem.id) {
              return {
                ...category,
                name: formData.name,
                slug: formData.slug,
                image: formData.image || category.image,
                description: formData.description,
                status: formData.status,
                featured: formData.featured,
                sortOrder: formData.sortOrder,
              };
            }
            return category;
          });
          setCategories(updatedCategories);
        } else {
          // Edit subcategory
          const updatedCategories = categories.map(category => {
            if (category.id === parseInt(formData.categoryId)) {
              const updatedSubcategories = category.subcategories?.map(sub => {
                if (sub.id === selectedItem.id) {
                  return {
                    ...sub,
                    name: formData.name,
                    slug: formData.slug,
                    image: formData.image || sub.image,
                    description: formData.description,
                    status: formData.status,
                    featured: formData.featured,
                    sortOrder: formData.sortOrder,
                  };
                }
                return sub;
              });
              return {
                ...category,
                subcategories: updatedSubcategories,
              };
            }
            return category;
          });
          setCategories(updatedCategories);
        }
      }

      setLoading(false);
      setIsModalOpen(false);
      setFormData({
        type: "category",
        categoryId: "",
        name: "",
        slug: "",
        description: "",
        image: "",
        status: "active",
        featured: false,
        sortOrder: 0,
      });
      setCurrentImage(null);
    }, 1000);
  };

  // Handle delete
  const handleDelete = () => {
    setLoading(true);

    setTimeout(() => {
      if (selectedItem) {
        if (actionType === "category") {
          // Delete category (and all its subcategories)
          setCategories(categories.filter(category => category.id !== selectedItem.id));
        } else {
          // Delete subcategory
          const updatedCategories = categories.map(category => {
            if (category.subcategories?.some(sub => sub.id === selectedItem.id)) {
              return {
                ...category,
                subcategories: category.subcategories.filter(sub => sub.id !== selectedItem.id),
              };
            }
            return category;
          });
          setCategories(updatedCategories);
        }
      }

      setLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    }, 1000);
  };

  // Toggle status
  const toggleStatus = (item, type) => {
    if (type === "category") {
      const updatedCategories = categories.map(category => {
        if (category.id === item.id) {
          return {
            ...category,
            status: category.status === "active" ? "inactive" : "active",
          };
        }
        return category;
      });
      setCategories(updatedCategories);
    } else {
      const updatedCategories = categories.map(category => {
        if (category.subcategories?.some(sub => sub.id === item.id)) {
          const updatedSubcategories = category.subcategories.map(sub => {
            if (sub.id === item.id) {
              return {
                ...sub,
                status: sub.status === "active" ? "inactive" : "active",
              };
            }
            return sub;
          });
          return {
            ...category,
            subcategories: updatedSubcategories,
          };
        }
        return category;
      });
      setCategories(updatedCategories);
    }
  };

  // Toggle featured
  const toggleFeatured = (item, type) => {
    if (type === "category") {
      const updatedCategories = categories.map(category => {
        if (category.id === item.id) {
          return {
            ...category,
            featured: !category.featured,
          };
        }
        return category;
      });
      setCategories(updatedCategories);
    } else {
      const updatedCategories = categories.map(category => {
        if (category.subcategories?.some(sub => sub.id === item.id)) {
          const updatedSubcategories = category.subcategories.map(sub => {
            if (sub.id === item.id) {
              return {
                ...sub,
                featured: !sub.featured,
              };
            }
            return sub;
          });
          return {
            ...category,
            subcategories: updatedSubcategories,
          };
        }
        return category;
      });
      setCategories(updatedCategories);
    }
  };

  // Open delete confirmation
  const openDeleteModal = (item, type) => {
    setSelectedItem(item);
    setActionType(type);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
              <p className="text-gray-600 mt-2">Manage product categories and subcategories</p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button
                onClick={() => openModal("category")}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </button>
              <button
                onClick={() => openModal("subcategory")}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subcategory
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sort Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <React.Fragment key={category.id}>
                    {/* Main Category Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {category.image ? (
                              <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                            ) : (
                              <Folder className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div
                                onClick={() => toggleCategoryExpansion(category.id)}
                                className="cursor-pointer mr-2 text-gray-500 hover:text-gray-700"
                              >
                                {expandedCategories.includes(category.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                <div className="text-xs text-gray-500">/{category.slug}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{category.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(category, "category")}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            category.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {category.status === "active" ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleFeatured(category, "category")}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            category.featured
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {category.featured ? "Yes" : "No"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.sortOrder}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openModal("category", category)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(category, "category")}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openModal("subcategory")}
                            className="text-green-600 hover:text-green-900"
                            title="Add Subcategory"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Subcategories (if expanded) */}
                    {expandedCategories.includes(category.id) && category.subcategories?.map((subcategory) => (
                      <tr key={subcategory.id} className="bg-gray-50 hover:bg-gray-100">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center pl-12">
                            <div className="flex-shrink-0 h-8 w-8 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                              {subcategory.image ? (
                                <img src={subcategory.image} alt={subcategory.name} className="h-full w-full object-cover" />
                              ) : (
                                <FolderOpen className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{subcategory.name}</div>
                              <div className="text-xs text-gray-500">/{subcategory.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{subcategory.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleStatus(subcategory, "subcategory")}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              subcategory.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {subcategory.status === "active" ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleFeatured(subcategory, "subcategory")}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              subcategory.featured
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {subcategory.featured ? "Yes" : "No"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subcategory.sortOrder}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="mr-2">Products:</span>
                            <span className="font-medium">{subcategory.productCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openModal("subcategory", subcategory)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(subcategory, "subcategory")}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Folder className="h-10 w-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Categories</p>
                <p className="text-2xl font-bold">
                  {categories.filter(c => c.status === "active").length}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Featured Categories</p>
                <p className="text-2xl font-bold">
                  {categories.filter(c => c.featured).length}
                </p>
              </div>
              <FolderOpen className="h-10 w-10 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Subcategories</p>
                <p className="text-2xl font-bold">
                  {categories.reduce((total, cat) => total + (cat.subcategories?.length || 0), 0)}
                </p>
              </div>
              <Eye className="h-10 w-10 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsModalOpen(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {actionType === "add" ? "Add New" : "Edit"} {formData.type === "category" ? "Category" : "Subcategory"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {actionType === "add" 
                            ? `Create a new ${formData.type} for your products`
                            : `Update ${formData.type} details`}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      {formData.type === "subcategory" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Parent Category *
                          </label>
                          <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleCategoryChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Slug *
                          </label>
                          <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category Image
                        </label>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            {formData.image ? (
                              <div className="relative group">
                                <img
                                  src={formData.image}
                                  alt="Preview"
                                  className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, image: "" });
                                    setCurrentImage(null);
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <input
                              type="file"
                              id="image-upload"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                            <label
                              htmlFor="image-upload"
                              className="cursor-pointer flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Image
                            </label>
                            <p className="text-xs text-gray-500 mt-1">Recommended: 800x800px, max 5MB</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sort Order
                          </label>
                          <input
                            type="number"
                            name="sortOrder"
                            value={formData.sortOrder}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="featured"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                          Mark as Featured
                        </label>
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              {actionType === "add" ? "Adding..." : "Saving..."}
                            </span>
                          ) : (
                            <>
                              <Save className="inline h-4 w-4 mr-2" />
                              {actionType === "add" ? "Add" : "Save Changes"}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsDeleteModalOpen(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete {actionType === "category" ? "Category" : "Subcategory"}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
                        {actionType === "category" && selectedItem?.subcategories?.length > 0 && (
                          <span className="block mt-2 text-red-600">
                            Warning: This will also delete {selectedItem.subcategories.length} subcategories!
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;