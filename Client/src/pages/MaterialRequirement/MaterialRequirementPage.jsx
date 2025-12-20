import React, { useState } from 'react';

const MaterialRequirementPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        phone: '',
        email: '',
        projectType: '',
        projectLocation: '',
        deliveryDate: '',
        budgetRange: '',
        materials: [
            { id: 1, type: '', quantity: '', unit: 'MT', specification: '' }
        ],
        additionalNotes: '',
        urgencyLevel: 'normal',
        siteVisitRequired: false,
        agreeTerms: false
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [activeStep, setActiveStep] = useState(1);

    const materialCategories = [
        'Cement',
        'Steel/Rebar',
        'Bricks/Blocks',
        'Aggregates (Sand, Stone)',
        'Ready Mix Concrete',
        'Tiles (Floor, Wall)',
        'Sanitaryware',
        'Paints & Coatings',
        'Electrical Items',
        'Plumbing Materials',
        'Doors & Windows',
        'Hardware & Fittings',
        'Other'
    ];

    const unitOptions = [
        'MT', 'KG', 'Ton', 'Cubic Meter', 'Square Feet', 'Number', 'Set', 'Bag'
    ];

    const projectTypes = [
        'Residential Building',
        'Commercial Complex',
        'Industrial Project',
        'Infrastructure (Road/Bridge)',
        'Renovation/Remodeling',
        'Individual House',
        'Apartment Complex',
        'Other'
    ];

    const budgetRanges = [
        'Under ₹1 Lakh',
        '₹1-5 Lakh',
        '₹5-10 Lakh',
        '₹10-25 Lakh',
        '₹25-50 Lakh',
        '₹50 Lakh - 1 Cr',
        'Above ₹1 Cr'
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMaterialChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials.map(material =>
                material.id === id ? { ...material, [field]: value } : material
            )
        }));
    };

    const addMaterialRow = () => {
        const newId = formData.materials.length + 1;
        setFormData(prev => ({
            ...prev,
            materials: [...prev.materials, { id: newId, type: '', quantity: '', unit: 'MT', specification: '' }]
        }));
    };

    const removeMaterialRow = (id) => {
        if (formData.materials.length > 1) {
            setFormData(prev => ({
                ...prev,
                materials: prev.materials.filter(material => material.id !== id)
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Material requirement submitted:', formData);
        setIsSubmitted(true);

        // Reset form after 5 seconds
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({
                name: '',
                company: '',
                phone: '',
                email: '',
                projectType: '',
                projectLocation: '',
                deliveryDate: '',
                budgetRange: '',
                materials: [
                    { id: 1, type: '', quantity: '', unit: 'MT', specification: '' }
                ],
                additionalNotes: '',
                urgencyLevel: 'normal',
                siteVisitRequired: false,
                agreeTerms: false
            });
            setActiveStep(1);
        }, 5000);
    };

    const nextStep = () => {
        setActiveStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => {
        setActiveStep(prev => Math.max(prev - 1, 1));
    };

    const calculateEstimatedTotal = () => {
        // This is a simplified calculation
        const quantity = formData.materials.reduce((sum, material) => {
            const qty = parseFloat(material.quantity) || 0;
            return sum + qty;
        }, 0);

        if (quantity === 0) return 'Add quantity to estimate';

        let multiplier = 1;
        switch (formData.budgetRange) {
            case 'Under ₹1 Lakh': multiplier = 50000; break;
            case '₹1-5 Lakh': multiplier = 300000; break;
            case '₹5-10 Lakh': multiplier = 750000; break;
            case '₹10-25 Lakh': multiplier = 1750000; break;
            case '₹25-50 Lakh': multiplier = 3750000; break;
            case '₹50 Lakh - 1 Cr': multiplier = 7500000; break;
            case 'Above ₹1 Cr': multiplier = 15000000; break;
            default: multiplier = 0;
        }

        if (multiplier === 0) return 'Select budget range';

        const estimated = Math.round(quantity * (multiplier / formData.materials.length));
        return `₹${estimated.toLocaleString('en-IN')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="bg-gradient-to-r from-amber-900 to-brown-800 rounded-2xl shadow-2xl p-8 mb-10 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Submit Material Requirement</h1>
                            <p className="text-xl text-amber-100">Get competitive quotes from verified suppliers in Nagpur</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <div className="bg-amber-800/50 p-4 rounded-xl">
                                <p className="text-sm">Average Response Time</p>
                                <p className="text-2xl font-bold">2-4 Hours</p>
                                <p className="text-sm text-amber-200">From verified suppliers</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {isSubmitted && (
                    <div className="mb-8 p-6 bg-green-100 border border-green-400 text-green-800 rounded-xl">
                        <div className="flex items-center">
                            <svg className="w-8 h-8 mr-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-xl font-bold">Requirement Submitted Successfully!</p>
                                <p className="mt-2">We've received your material requirements. Our team will contact you shortly with quotes from verified suppliers.</p>
                                <p className="mt-1 text-sm">You'll receive quotes on your phone and email.</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2">
                        {/* Progress Steps */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                {[1, 2, 3].map((step) => (
                                    <div key={step} className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                      ${activeStep >= step ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                            {step}
                                        </div>
                                        <span className="mt-2 text-sm font-medium">
                                            {step === 1 && 'Project Details'}
                                            {step === 2 && 'Materials'}
                                            {step === 3 && 'Review'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full">
                                <div className="h-full bg-amber-600 rounded-full transition-all duration-300"
                                    style={{ width: `${(activeStep - 1) * 50}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                            <form onSubmit={handleSubmit}>
                                {/* Step 1: Project Details */}
                                {activeStep === 1 && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-brown-900 mb-6">Project Details</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-brown-800 font-medium mb-2">
                                                    Your Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-brown-800 font-medium mb-2">
                                                    Company/Organization
                                                </label>
                                                <input
                                                    type="text"
                                                    name="company"
                                                    value={formData.company}
                                                    onChange={handleChange}
                                                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                    placeholder="Enter company name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-brown-800 font-medium mb-2">
                                                    Phone Number *
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                    placeholder="+91 98765 43210"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-brown-800 font-medium mb-2">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                    placeholder="you@example.com"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-brown-800 font-medium mb-2">
                                                    Project Type *
                                                </label>
                                                <select
                                                    name="projectType"
                                                    value={formData.projectType}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                >
                                                    <option value="">Select project type</option>
                                                    {projectTypes.map((type, idx) => (
                                                        <option key={idx} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-brown-800 font-medium mb-2">
                                                    Project Location *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="projectLocation"
                                                    value={formData.projectLocation}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                    placeholder="Enter site address in Nagpur"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-brown-800 font-medium mb-2">
                                                    Expected Delivery Date *
                                                </label>
                                                <input
                                                    type="date"
                                                    name="deliveryDate"
                                                    value={formData.deliveryDate}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-brown-800 font-medium mb-2">
                                                    Estimated Budget Range *
                                                </label>
                                                <select
                                                    name="budgetRange"
                                                    value={formData.budgetRange}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                >
                                                    <option value="">Select budget range</option>
                                                    {budgetRanges.map((range, idx) => (
                                                        <option key={idx} value={range}>{range}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <label className="block text-brown-800 font-medium mb-2">
                                                Urgency Level
                                            </label>
                                            <div className="flex space-x-4">
                                                {[
                                                    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
                                                    { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
                                                    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
                                                    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
                                                ].map((level) => (
                                                    <label key={level.value} className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="urgencyLevel"
                                                            value={level.value}
                                                            checked={formData.urgencyLevel === level.value}
                                                            onChange={handleChange}
                                                            className="mr-2"
                                                        />
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${level.color}`}>
                                                            {level.label}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="siteVisitRequired"
                                                    checked={formData.siteVisitRequired}
                                                    onChange={handleChange}
                                                    className="mr-2"
                                                />
                                                <span className="text-brown-800">Site visit required for assessment</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Materials */}
                                {activeStep === 2 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-brown-900">Material Requirements</h2>
                                            <button
                                                type="button"
                                                onClick={addMaterialRow}
                                                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                                Add Material
                                            </button>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-amber-50">
                                                    <tr>
                                                        <th className="p-3 text-left text-brown-800 font-medium">Material Type *</th>
                                                        <th className="p-3 text-left text-brown-800 font-medium">Quantity *</th>
                                                        <th className="p-3 text-left text-brown-800 font-medium">Unit</th>
                                                        <th className="p-3 text-left text-brown-800 font-medium">Specifications</th>
                                                        <th className="p-3 text-left text-brown-800 font-medium">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {formData.materials.map((material) => (
                                                        <tr key={material.id} className="border-b border-amber-100">
                                                            <td className="p-3">
                                                                <select
                                                                    value={material.type}
                                                                    onChange={(e) => handleMaterialChange(material.id, 'type', e.target.value)}
                                                                    required
                                                                    className="w-full p-2 border border-amber-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                                >
                                                                    <option value="">Select material</option>
                                                                    {materialCategories.map((category, idx) => (
                                                                        <option key={idx} value={category}>{category}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="p-3">
                                                                <input
                                                                    type="number"
                                                                    value={material.quantity}
                                                                    onChange={(e) => handleMaterialChange(material.id, 'quantity', e.target.value)}
                                                                    required
                                                                    min="0"
                                                                    step="0.01"
                                                                    className="w-full p-2 border border-amber-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                                    placeholder="0.00"
                                                                />
                                                            </td>
                                                            <td className="p-3">
                                                                <select
                                                                    value={material.unit}
                                                                    onChange={(e) => handleMaterialChange(material.id, 'unit', e.target.value)}
                                                                    className="w-full p-2 border border-amber-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                                >
                                                                    {unitOptions.map((unit, idx) => (
                                                                        <option key={idx} value={unit}>{unit}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="p-3">
                                                                <input
                                                                    type="text"
                                                                    value={material.specification}
                                                                    onChange={(e) => handleMaterialChange(material.id, 'specification', e.target.value)}
                                                                    className="w-full p-2 border border-amber-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                                    placeholder="Grade, Size, Brand, etc."
                                                                />
                                                            </td>
                                                            <td className="p-3">
                                                                {formData.materials.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeMaterialRow(material.id)}
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="mt-6">
                                            <label className="block text-brown-800 font-medium mb-2">
                                                Additional Notes / Special Requirements
                                            </label>
                                            <textarea
                                                name="additionalNotes"
                                                value={formData.additionalNotes}
                                                onChange={handleChange}
                                                rows="3"
                                                className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                placeholder="Any special instructions, quality requirements, delivery instructions, etc."
                                            ></textarea>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Review */}
                                {activeStep === 3 && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-brown-900 mb-6">Review Your Requirement</h2>

                                        <div className="space-y-6">
                                            <div className="bg-amber-50 p-6 rounded-xl">
                                                <h3 className="font-bold text-brown-800 text-lg mb-4">Project Information</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Name</p>
                                                        <p className="font-medium">{formData.name || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Phone</p>
                                                        <p className="font-medium">{formData.phone || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Project Type</p>
                                                        <p className="font-medium">{formData.projectType || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Location</p>
                                                        <p className="font-medium">{formData.projectLocation || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Delivery Date</p>
                                                        <p className="font-medium">{formData.deliveryDate || 'Not provided'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Budget Range</p>
                                                        <p className="font-medium">{formData.budgetRange || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-amber-50 p-6 rounded-xl">
                                                <h3 className="font-bold text-brown-800 text-lg mb-4">Material Requirements</h3>
                                                <div className="space-y-3">
                                                    {formData.materials.map((material, idx) => (
                                                        <div key={material.id} className="flex justify-between items-center p-3 bg-white rounded border border-amber-200">
                                                            <div>
                                                                <p className="font-medium">{material.type || 'Material not specified'}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    {material.quantity ? `${material.quantity} ${material.unit}` : 'Quantity not specified'}
                                                                    {material.specification && ` • ${material.specification}`}
                                                                </p>
                                                            </div>
                                                            <span className="text-amber-700 font-medium">
                                                                {material.quantity ? `${material.quantity} ${material.unit}` : ''}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {formData.additionalNotes && (
                                                    <div className="mt-4 p-3 bg-white rounded border border-amber-200">
                                                        <p className="text-sm text-gray-600">Additional Notes</p>
                                                        <p className="mt-1">{formData.additionalNotes}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-start mt-6">
                                                <input
                                                    type="checkbox"
                                                    id="agreeTerms"
                                                    name="agreeTerms"
                                                    checked={formData.agreeTerms}
                                                    onChange={handleChange}
                                                    required
                                                    className="mt-1 mr-2"
                                                />
                                                <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                                                    I agree to share my requirement with verified suppliers on BricksIT platform. I understand that suppliers may contact me with quotes and I'm interested in receiving competitive offers.
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-8 pt-6 border-t border-amber-200">
                                    {activeStep > 1 ? (
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-6 py-3 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50"
                                        >
                                            ← Back
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}

                                    {activeStep < 3 ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                                        >
                                            Continue →
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={!formData.agreeTerms}
                                            className={`px-8 py-3 rounded-lg font-bold ${formData.agreeTerms ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                        >
                                            Submit Requirement
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column - Info & Benefits */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            {/* Estimated Summary */}
                            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-amber-200">
                                <h3 className="font-bold text-brown-800 text-xl mb-4">Requirement Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Items</span>
                                        <span className="font-bold">{formData.materials.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Project Type</span>
                                        <span className="font-medium text-brown-800">{formData.projectType || 'Not specified'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery Date</span>
                                        <span className="font-medium">{formData.deliveryDate || 'Not specified'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Urgency</span>
                                        <span className={`font-medium px-2 py-1 rounded text-sm ${formData.urgencyLevel === 'urgent' ? 'bg-red-100 text-red-800' :
                                                formData.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    formData.urgencyLevel === 'normal' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'
                                            }`}>
                                            {formData.urgencyLevel?.toUpperCase() || 'Normal'}
                                        </span>
                                    </div>
                                    <div className="pt-4 border-t border-amber-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-brown-800">Estimated Value</span>
                                            <span className="text-2xl font-bold text-amber-700">{calculateEstimatedTotal()}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Based on your budget range and quantities</p>
                                    </div>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="bg-gradient-to-r from-amber-700 to-brown-800 rounded-xl shadow-lg p-6 text-white mb-6">
                                <h3 className="font-bold text-xl mb-4">Why Use BricksIT?</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-amber-300 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Verified Suppliers</p>
                                            <p className="text-sm text-amber-200">Quality-checked suppliers in Nagpur</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-amber-300 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Competitive Quotes</p>
                                            <p className="text-sm text-amber-200">Get multiple quotes to compare</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-amber-300 mt=1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Time Saving</p>
                                            <p className="text-sm text-amber-200">One submission, multiple responses</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-amber-300 mt=1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Quality Assurance</p>
                                            <p className="text-sm text-amber-200">Material quality verification available</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Support */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-200">
                                <h3 className="font-bold text-brown-800 text-xl mb-4">Need Help?</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center p-3 bg-amber-50 rounded-lg">
                                        <svg className="w-6 h-6 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Common Materials</p>
                                            <p className="text-sm text-gray-600">Cement, Steel, Bricks, Sand, Tiles, etc.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-amber-50 rounded-lg">
                                        <svg className="w-6 h-6 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Email Support</p>
                                            <p className="text-sm text-gray-600">support@bricksit.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-amber-50 rounded-lg">
                                        <svg className="w-6 h-6 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Call Us</p>
                                            <p className="text-sm text-gray-600">+91 71234 56789</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-medium">
                                    Chat with Support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaterialRequirementPage;