import React from 'react';

const SellerProfile = () => {
  // Static seller profile data
  const profileData = {
    user: {
      name: "John Construction Supplies",
      email: "john@demomaterials.com",
      mobile: "+91 9876543210"
    },
    businessName: "John Construction Supplies",
    businessType: "Construction Materials Retailer",
    panNumber: "ABCDE1234F",
    gstin: "27ABCDE1234F1Z5",
    enrollmentId: "ENR-2023-001",
    uin: "UIN-2023-MH-001",
    pickupAddress: {
      name: "John Doe",
      phone: "+91 9876543210",
      pincode: "400001",
      city: "Mumbai",
      address: "123 Business Street, Industrial Area, Andheri East",
      state: "Maharashtra"
    },
    bankDetails: {
      accountHolderName: "John Construction Supplies",
      accountNumber: "123456789012",
      ifscCode: "SBIN0001234",
      bankName: "State Bank of India"
    },
    documents: {
      panCard: "/docs/pan.jpg",
      aadhaarCard: "/docs/aadhaar.jpg",
      gstCertificate: "/docs/gst.jpg",
      bankStatement: "/docs/bank.jpg"
    },
    kycStatus: "approved",
    kycRejectionReason: "",
    isActive: true,
    products: [
      { _id: "1", name: "Premium Cement 50kg", price: 350, stock: 150 },
      { _id: "2", name: "Steel TMT Bars", price: 65000, stock: 45 },
      { _id: "3", name: "Sand Fine Grade", price: 1200, stock: 80 },
      { _id: "4", name: "Bricks Red Clay", price: 8, stock: 5000 },
      { _id: "5", name: "Paint Emulsion", price: 850, stock: 120 },
      { _id: "6", name: "Plywood 18mm", price: 1200, stock: 60 },
      { _id: "7", name: "PVC Pipes 4inch", price: 450, stock: 200 },
      { _id: "8", name: "Electrical Wires", price: 280, stock: 300 }
    ],
    ratings: {
      average: 4.7,
      count: 234
    },
    totalSales: 2456,
    createdAt: "2023-06-15T10:30:00.000Z",
    updatedAt: "2023-12-15T14:45:00.000Z"
  };

  const { user, businessName, businessType, panNumber, gstin, enrollmentId, uin, pickupAddress, bankDetails, documents, kycStatus, kycRejectionReason, isActive, products, ratings, totalSales, createdAt, updatedAt } = profileData;

  const StatusBadge = ({ status }) => {
    const getStatusStyle = () => {
      switch (status) {
        case 'approved': return 'bg-green-100 text-green-800 border border-green-200';
        case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        case 'rejected': return 'bg-red-100 text-red-800 border border-red-200';
        default: return 'bg-gray-100 text-gray-800 border border-gray-200';
      }
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle()}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seller Profile</h1>
              <p className="text-gray-600 mt-2">Business account information and details</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
                Edit Profile
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                JS
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">₹1.2Cr</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Customer Rating</p>
                <p className="text-2xl font-bold text-gray-900">{ratings.average}/5</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <div className="mt-1">
                  <StatusBadge status={kycStatus} />
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
                <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">Edit</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Full Name</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-gray-900 font-medium">{user.name}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Mobile Number</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className="text-gray-900 font-medium">{user.mobile}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Email Address</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-900 font-medium">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
                <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">Edit</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Business Name</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{businessName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Business Type</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{businessType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">PAN Number</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{panNumber}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">GSTIN</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{gstin}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Enrollment ID</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{enrollmentId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">UIN</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{uin}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Address */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Pickup Address</h2>
                <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">Edit</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Contact Name</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{pickupAddress.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Phone</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{pickupAddress.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Pincode</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{pickupAddress.pincode}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">City</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{pickupAddress.city}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">State</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{pickupAddress.state}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500 block mb-1">Address</label>
                  <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{pickupAddress.address}</p>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Bank Details</h2>
                <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">Edit</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Account Holder Name</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{bankDetails.accountHolderName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Account Number</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{bankDetails.accountNumber}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">IFSC Code</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{bankDetails.ifscCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">Bank Name</label>
                    <p className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg">{bankDetails.bankName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Account Status Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Status</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700">Account Status</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${kycStatus === 'approved' ? 'bg-green-500' : kycStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700">KYC Status</span>
                  </div>
                  <StatusBadge status={kycStatus} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Verification Level</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Level 3</span>
                </div>
              </div>
            </div>

            {/* Documents Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Documents</h2>
              <div className="space-y-4">
                {Object.entries(documents).map(([docName, docUrl]) => (
                  <div key={docName} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {docName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-500">Uploaded: Dec 15, 2023</p>
                      </div>
                    </div>
                    <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Average Rating</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">{ratings.average}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`w-4 h-4 ${star <= Math.floor(ratings.average) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Reviews</span>
                  <span className="text-xl font-bold text-gray-900">{ratings.count}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Sales</span>
                  <span className="text-xl font-bold text-gray-900">{totalSales}</span>
                </div>
              </div>
            </div>

            {/* Products Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
                <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">View All</span>
              </div>
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{product.stock} in stock</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₹{product.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Price</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">{new Date(createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">{new Date(updatedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Seller ID</span>
                  <span className="text-sm font-medium text-gray-900">BK-SELLER-001</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;