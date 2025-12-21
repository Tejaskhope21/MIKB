import React from "react";
import logo from "/BricksKart.png";

function Footer() {
    const teamMembers = [
        {
            name: "Lokesh Dwivedi",
            role: "CEO & Founder",
            image: "/CEO2.jpg",
        },
        {
            name: "Shashank Raut",
            role: "CTO & Co-Founder",
            image: "/CTO.jpg",
        },
        {
            name: "Vishal",
            role: "Lead Investor",
            image: "https://ui-avatars.com/api/?name=Vishal&background=7C3AED&color=fff&size=256&bold=true",
        },
    ];

    return (
        <footer className="bg-[#800000] text-white mt-10 border-t border-red-900">

            {/* WHY SHOP WITH US (UNCHANGED) */}
            <div className="bg-white py-8 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                    <h3 className="text-2xl font-bold text-center mb-8 text-[#800000]">
                        Why Shop with us?
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition border">
                            <svg className="w-12 h-12 mx-auto mb-4 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
                            </svg>
                            <h4 className="font-bold text-lg text-gray-800 mb-2">
                                Wide Selection of Brands & Products
                            </h4>
                            <p className="text-sm text-gray-600">
                                Quality construction materials from trusted brands
                            </p>
                        </div>

                        <div className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition border">
                            <svg className="w-12 h-12 mx-auto mb-4 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v-1m9-5a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h4 className="font-bold text-lg text-gray-800 mb-2">
                                Transparent & Competitive Pricing
                            </h4>
                            <p className="text-sm text-gray-600">
                                Best market prices with no hidden charges
                            </p>
                        </div>

                        <div className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition border">
                            <svg className="w-12 h-12 mx-auto mb-4 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <h4 className="font-bold text-lg text-gray-800 mb-2">
                                Fast & On-time Delivery
                            </h4>
                            <p className="text-sm text-gray-600">
                                Reliable delivery to your construction site
                            </p>
                        </div>

                        <div className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition border">
                            <svg className="w-12 h-12 mx-auto mb-4 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622z" />
                            </svg>
                            <h4 className="font-bold text-lg text-gray-800 mb-2">
                                100% Authentic Products
                            </h4>
                            <p className="text-sm text-gray-600">
                                Certified and genuine materials only
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* TEAM SECTION (SMALL) */}
            <div className="bg-gray-900 py-10 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-6">
                        <span className="text-orange-400 text-xs uppercase font-semibold">
                            Leadership
                        </span>
                        <h3 className="text-2xl font-bold text-white mt-1">
                            Our Leadership Team
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {teamMembers.map((member) => (
                            <div
                                key={member.name}
                                className="bg-gray-800/60 rounded-lg p-4 text-center border border-gray-700"
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-24 h-24 mx-auto rounded-full object-cover border-2 border-gray-700"
                                />
                                <h4 className="mt-3 text-lg font-semibold text-white">
                                    {member.name}
                                </h4>
                                <p className="text-orange-300 text-xs">
                                    {member.role}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN FOOTER */}
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <img src={logo} alt="Brick's Kart" className="h-20 mb-4" />
                        <p className="text-gray-300 text-sm">
                            Trusted construction material marketplace.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-orange-400 mb-3">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>Home</li>
                            <li>Products</li>
                            <li>Categories</li>
                            <li>Brands</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-orange-400 mb-3">Contact</h3>
                        <p className="text-sm text-gray-300">Nagpur, Maharashtra</p>
                        <p className="text-sm text-gray-300">info@brickskart.in</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-orange-400 mb-3">Policies</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>Privacy Policy</li>
                            <li>Terms & Conditions</li>
                            <li>Return Policy</li>
                            <li>Shipping Policy</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-red-800 text-center text-sm text-gray-400">
                    © 2025 BricksIT. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;
