import React, { useState } from 'react';

const BricksITInvestorPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        investorType: '',
        investmentAmount: '',
        message: '',
        heardAboutUs: '',
        agreeTerms: false
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Investor form submitted:', formData);
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                investorType: '',
                investmentAmount: '',
                message: '',
                heardAboutUs: '',
                agreeTerms: false
            });
        }, 4000);
    };

    // Company data specific to BricksIT
    const companyInfo = {
        name: "BricksIT",
        tagline: "Nagpur's Premier Construction Materials Platform",
        founded: "2022",
        location: "Nagpur, Maharashtra",
        mission: "To revolutionize construction materials procurement through technology, ensuring quality, transparency, and timely delivery.",
        vision: "To become India's most trusted construction materials platform, connecting builders, contractors, and suppliers efficiently."
    };

    const financialProjections = [
        { year: "2023", revenue: "₹2.5 Cr", growth: "Base Year" },
        { year: "2024", revenue: "₹8 Cr", growth: "220% projected" },
        { year: "2025", revenue: "₹20 Cr", growth: "150% projected" },
        { year: "2026", revenue: "₹45 Cr", growth: "125% projected" }
    ];

    const marketOpportunity = {
        size: "₹15,000 Cr",
        description: "Nagpur construction materials market",
        growthRate: "12% annually",
        digitalPenetration: "<5% currently, target 30% in 5 years"
    };

    const businessModel = {
        revenueStreams: [
            { name: "Commission on Sales", percentage: "3-5%", contribution: "60%" },
            { name: "Subscription Fees", percentage: "₹5,000-50,000/month", contribution: "25%" },
            { name: "Logistics Services", percentage: "Additional 2%", contribution: "10%" },
            { name: "Value-added Services", percentage: "Quality certification, etc.", contribution: "5%" }
        ],
        keyMetrics: [
            { metric: "Supplier Partners", value: "85+", description: "Across Nagpur region" },
            { metric: "Active Buyers", value: "320+", description: "Contractors & Builders" },
            { metric: "Monthly GMV", value: "₹85 Lakh", description: "Gross Merchandise Value" },
            { metric: "Repeat Rate", value: "78%", description: "Customer retention" }
        ]
    };

    const team = [
        { name: "Rohan Deshmukh", role: "Founder & CEO", background: "Ex-L&T Construction, Civil Engineering from VNIT Nagpur", focus: "Operations & Strategy" },
        { name: "Priya Sharma", role: "CTO", background: "IIT Bombay CS, Ex-Infosys", focus: "Technology & Platform" },
        { name: "Vikram Joshi", role: "Head of Supply", background: "15 years in construction materials business", focus: "Supplier Relations" },
        { name: "Anjali Patel", role: "Marketing Head", background: "MBA Marketing, Ex-JSW Steel", focus: "Customer Acquisition" }
    ];

    const competitiveAdvantages = [
        "Deep local knowledge of Nagpur construction ecosystem",
        "Quality verification system for all materials",
        "Real-time pricing and availability tracking",
        "Integrated logistics and delivery network",
        "Trusted relationships with both suppliers and builders"
    ];

    const fundingNeeds = [
        { round: "Seed Round", amount: "₹2 Cr", valuation: "₹12 Cr", use: ["Platform enhancement", "Team expansion", "Marketing"], timeline: "Immediate" },
        { round: "Series A", amount: "₹8 Cr", valuation: "₹50 Cr", use: ["Expansion to 3 new cities", "Technology upgrade", "Supply chain strengthening"], timeline: "2024" }
    ];

    const milestones = [
        { date: "Jan 2022", event: "Company Founded" },
        { date: "Jun 2022", event: "Platform Beta Launch" },
        { date: "Dec 2022", event: "100+ Supplier Onboarding" },
        { date: "Mar 2023", event: "₹1 Cr Monthly GMV" },
        { date: "Present", event: "Seeding Funding Round" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
            {/* Main Container */}
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* Company Header */}
                <div className="bg-gradient-to-r from-amber-900 to-brown-800 rounded-2xl shadow-2xl p-8 mb-10 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">Bricks<span className="text-amber-300">IT</span></h1>
                            <p className="text-xl text-amber-100">{companyInfo.tagline}</p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <span className="bg-amber-700 px-3 py-1 rounded-full text-sm">Construction Tech</span>
                                <span className="bg-brown-700 px-3 py-1 rounded-full text-sm">B2B Platform</span>
                                <span className="bg-amber-700 px-3 py-1 rounded-full text-sm">Nagpur Based</span>
                                <span className="bg-brown-700 px-3 py-1 rounded-full text-sm">Founded {companyInfo.founded}</span>
                            </div>
                        </div>
                        <div className="mt-6 md:mt-0 text-center md:text-right">
                            <p className="text-2xl font-bold">Investment Opportunity</p>
                            <p className="text-amber-200">Seed Round Open</p>
                            <div className="mt-4 bg-amber-800/50 p-4 rounded-xl">
                                <p className="text-sm">Seeking: <span className="font-bold text-lg">₹2 Crore</span></p>
                                <p className="text-sm">Valuation: <span className="font-bold">₹12 Crore</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {isSubmitted && (
                    <div className="mb-8 p-4 bg-green-100 border border-green-400 text-green-800 rounded-xl">
                        <div className="flex items-center">
                            <svg className="w-6 h-6 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="font-semibold">Thank you for your interest in BricksIT! Our team will contact you within 24 hours.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Company Information */}
                    <div className="lg:col-span-2">

                        {/* Navigation Tabs */}
                        <div className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="flex flex-wrap border-b">
                                {['overview', 'business', 'market', 'team', 'financials', 'milestones'].map((tab) => (
                                    <button
                                        key={tab}
                                        className={`px-6 py-3 font-medium capitalize ${activeTab === tab ? 'bg-amber-600 text-white' : 'text-brown-800 hover:bg-amber-50'}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {activeTab === 'overview' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-brown-900 mb-4">Company Overview</h2>
                                        <p className="text-gray-700 mb-6">{companyInfo.mission}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                                                <h3 className="font-bold text-brown-800 text-lg mb-3">Our Vision</h3>
                                                <p className="text-gray-700">{companyInfo.vision}</p>
                                            </div>
                                            <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                                                <h3 className="font-bold text-brown-800 text-lg mb-3">Location Advantage</h3>
                                                <p className="text-gray-700 mb-2">Based in Nagpur - Central India's construction hub with:</p>
                                                <ul className="list-disc pl-5 text-gray-700">
                                                    <li>Strategic geographical location</li>
                                                    <li>Growing infrastructure projects</li>
                                                    <li>Proximity to raw materials</li>
                                                    <li>Supportive startup ecosystem</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'business' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-brown-900 mb-6">Business Model</h2>

                                        <div className="mb-8">
                                            <h3 className="font-bold text-brown-800 text-xl mb-4">Revenue Streams</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {businessModel.revenueStreams.map((stream, idx) => (
                                                    <div key={idx} className="bg-white border border-amber-200 p-4 rounded-lg">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h4 className="font-bold text-brown-800">{stream.name}</h4>
                                                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm">{stream.contribution}</span>
                                                        </div>
                                                        <p className="text-gray-700">{stream.percentage}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-brown-800 text-xl mb-4">Key Metrics</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {businessModel.keyMetrics.map((metric, idx) => (
                                                    <div key={idx} className="bg-amber-50 p-4 rounded-xl text-center">
                                                        <p className="text-3xl font-bold text-amber-700">{metric.value}</p>
                                                        <p className="font-medium text-brown-800 mt-1">{metric.metric}</p>
                                                        <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'market' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-brown-900 mb-6">Market Opportunity</h2>

                                        <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-6 rounded-xl mb-6">
                                            <div className="text-center">
                                                <p className="text-5xl font-bold text-amber-800">{marketOpportunity.size}</p>
                                                <p className="text-xl text-brown-800 mt-2">{marketOpportunity.description}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                <div className="bg-white p-4 rounded-lg text-center">
                                                    <p className="text-lg font-bold text-brown-800">Annual Growth</p>
                                                    <p className="text-2xl text-amber-700">{marketOpportunity.growthRate}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg text-center">
                                                    <p className="text-lg font-bold text-brown-800">Digital Penetration</p>
                                                    <p className="text-2xl text-amber-700">{marketOpportunity.digitalPenetration}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-brown-800 text-xl mb-4">Competitive Advantages</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {competitiveAdvantages.map((advantage, idx) => (
                                                    <div key={idx} className="flex items-start">
                                                        <svg className="w-5 h-5 text-amber-600 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-gray-700">{advantage}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'team' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-brown-900 mb-6">Founding Team</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {team.map((member, idx) => (
                                                <div key={idx} className="bg-white border border-amber-200 rounded-xl p-6">
                                                    <h3 className="font-bold text-brown-800 text-xl">{member.name}</h3>
                                                    <p className="text-amber-700 font-medium mb-2">{member.role}</p>
                                                    <p className="text-gray-600 text-sm mb-3">{member.background}</p>
                                                    <div className="mt-4 pt-4 border-t border-amber-100">
                                                        <span className="text-sm font-medium text-brown-700">Focus: </span>
                                                        <span className="text-sm text-gray-600">{member.focus}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'financials' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-brown-900 mb-6">Financial Projections</h2>

                                        <div className="mb-8">
                                            <h3 className="font-bold text-brown-800 text-xl mb-4">Revenue Forecast</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {financialProjections.map((projection, idx) => (
                                                    <div key={idx} className="bg-gradient-to-b from-amber-50 to-white border border-amber-200 p-4 rounded-xl text-center">
                                                        <p className="text-2xl font-bold text-amber-800">{projection.year}</p>
                                                        <p className="text-3xl font-bold text-brown-800 mt-2">{projection.revenue}</p>
                                                        <p className="text-sm text-amber-600 mt-1">{projection.growth}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-brown-800 text-xl mb-4">Funding Requirements</h3>
                                            <div className="space-y-6">
                                                {fundingNeeds.map((funding, idx) => (
                                                    <div key={idx} className="border-l-4 border-amber-600 pl-4 py-2">
                                                        <div className="flex flex-wrap justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold text-brown-800 text-xl">{funding.round}</h4>
                                                                <ul className="list-disc pl-5 mt-2 text-gray-700">
                                                                    {funding.use.map((use, i) => (
                                                                        <li key={i} className="text-sm">{use}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-2xl font-bold text-amber-700">{funding.amount}</p>
                                                                <p className="text-gray-600">at {funding.valuation} valuation</p>
                                                                <div className="mt-2">
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
                                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                        </svg>
                                                                        {funding.timeline}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'milestones' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-brown-900 mb-6">Company Journey</h2>
                                        <div className="relative">
                                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-amber-300"></div>
                                            <div className="space-y-8">
                                                {milestones.map((milestone, idx) => (
                                                    <div key={idx} className="relative flex items-start">
                                                        <div className="absolute left-0 w-8 h-8 rounded-full bg-amber-600 border-4 border-white"></div>
                                                        <div className="ml-12">
                                                            <div className="bg-white border border-amber-200 p-4 rounded-xl shadow">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="font-bold text-brown-800">{milestone.event}</p>
                                                                    </div>
                                                                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                                                                        {milestone.date}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-gradient-to-r from-amber-800 to-brown-800 rounded-xl shadow-lg p-6 text-white">
                            <h2 className="text-2xl font-bold mb-4">Contact Our Team</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 text-amber-300 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="font-bold">Headquarters</p>
                                        <p className="text-amber-100">Nagpur, Maharashtra</p>
                                        <p className="text-sm text-amber-200">Startup Hub, IT Park</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 text-amber-300 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="font-bold">Phone</p>
                                        <p className="text-amber-100">+91 71234 56789</p>
                                        <p className="text-sm text-amber-200">Investor Relations</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 text-amber-300 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="font-bold">Email</p>
                                        <p className="text-amber-100">investors@bricksit.com</p>
                                        <p className="text-sm text-amber-200">For investment inquiries</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Investor Form */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <div className="bg-white rounded-xl shadow-xl p-6 border border-amber-200">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-brown-900">Invest in BricksIT</h2>
                                    <p className="text-gray-600 mt-2">Join our seed funding round</p>
                                    <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                                        <p className="text-sm text-brown-800">Current Round: <span className="font-bold">Seed</span></p>
                                        <p className="text-2xl font-bold text-amber-700 mt-1">₹2 Crore</p>
                                        <p className="text-sm text-gray-600">at ₹12 Crore valuation</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-brown-800 text-sm font-medium mb-1">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                placeholder="Enter your name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-brown-800 text-sm font-medium mb-1">
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
                                            <label className="block text-brown-800 text-sm font-medium mb-1">
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
                                            <label className="block text-brown-800 text-sm font-medium mb-1">
                                                Investor Type *
                                            </label>
                                            <select
                                                name="investorType"
                                                value={formData.investorType}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                            >
                                                <option value="">Select type</option>
                                                <option value="angel">Angel Investor</option>
                                                <option value="vc">Venture Capital</option>
                                                <option value="family">Family Office</option>
                                                <option value="individual">Individual Investor</option>
                                                <option value="corporate">Corporate Investor</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-brown-800 text-sm font-medium mb-1">
                                                Investment Interest
                                            </label>
                                            <select
                                                name="investmentAmount"
                                                value={formData.investmentAmount}
                                                onChange={handleChange}
                                                className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                            >
                                                <option value="">Select range</option>
                                                <option value="10-25">₹10-25 Lakh</option>
                                                <option value="25-50">₹25-50 Lakh</option>
                                                <option value="50-100">₹50 Lakh - 1 Cr</option>
                                                <option value="1-2">₹1-2 Crore</option>
                                                <option value="2+">Above ₹2 Crore</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-brown-800 text-sm font-medium mb-1">
                                                How did you hear about us?
                                            </label>
                                            <select
                                                name="heardAboutUs"
                                                value={formData.heardAboutUs}
                                                onChange={handleChange}
                                                className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                            >
                                                <option value="">Select option</option>
                                                <option value="referral">Referral</option>
                                                <option value="event">Industry Event</option>
                                                <option value="media">News/Media</option>
                                                <option value="online">Online Search</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-brown-800 text-sm font-medium mb-1">
                                                Message / Questions
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows="3"
                                                className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                placeholder="Tell us about your investment interests or ask questions..."
                                            ></textarea>
                                        </div>

                                        <div className="flex items-start">
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
                                                I agree to receive information about BricksIT investment opportunity. I understand this is not a commitment to invest.
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-amber-600 to-brown-700 hover:from-amber-700 hover:to-brown-800 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md"
                                        >
                                            Submit Interest
                                            <svg className="w-5 h-5 inline ml-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-6 pt-6 border-t border-amber-200">
                                    <h3 className="font-bold text-brown-800 mb-3">Why Invest in BricksIT?</h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start">
                                            <svg className="w-4 h-4 text-amber-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span>High-growth construction tech market</span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="w-4 h-4 text-amber-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span>Experienced local team with industry expertise</span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="w-4 h-4 text-amber-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span>Proven traction in Nagpur market</span>
                                        </li>
                                        <li className="flex items-start">
                                            <svg className="w-4 h-4 text-amber-600 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span>Clear expansion roadmap to other cities</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Download Section */}
                            <div className="mt-6 bg-gradient-to-r from-amber-700 to-brown-800 rounded-xl shadow-lg p-6 text-white">
                                <h3 className="font-bold text-xl mb-4">Investor Materials</h3>
                                <div className="space-y-3">
                                    <a href="#" className="flex items-center p-3 bg-amber-800/50 hover:bg-amber-800 rounded-lg transition">
                                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Pitch Deck</p>
                                            <p className="text-sm text-amber-200">PDF • 4.2 MB</p>
                                        </div>
                                    </a>
                                    <a href="#" className="flex items-center p-3 bg-amber-800/50 hover:bg-amber-800 rounded-lg transition">
                                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Financial Model</p>
                                            <p className="text-sm text-amber-200">Excel • 2.1 MB</p>
                                        </div>
                                    </a>
                                    <a href="#" className="flex items-center p-3 bg-amber-800/50 hover:bg-amber-800 rounded-lg transition">
                                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Business Plan Summary</p>
                                            <p className="text-sm text-amber-200">PDF • 1.8 MB</p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-10 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-brown-700 text-center">
                        <span className="font-bold">Disclaimer:</span> This is not an offer to sell or a solicitation of an offer to buy securities. Investment opportunities are available only to accredited investors. Past performance is not indicative of future results. All investments involve risk.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BricksITInvestorPage;