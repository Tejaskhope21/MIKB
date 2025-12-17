import React from "react";
import logo from "/BricksKart.png"; // Make sure this path matches your logo file

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



            {/* Why Shop with us? Section */}
            <div className="bg-white py-8 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                    <h3 className="text-2xl font-bold text-center mb-8 text-[#800000]">
                        Why Shop with us?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-300 border border-gray-200">
                            <div className="mb-4 flex justify-center">
                                <svg className="w-12 h-12 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h4 className="font-bold text-lg mb-2 text-gray-800">Wide Selection of Brands & Products</h4>
                            <p className="text-gray-600 text-sm">Extensive range of quality construction materials from trusted brands</p>
                        </div>

                        <div className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-300 border border-gray-200">
                            <div className="mb-4 flex justify-center">
                                <svg className="w-12 h-12 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="font-bold text-lg mb-2 text-gray-800">Transparent & Competitive Pricing</h4>
                            <p className="text-gray-600 text-sm">No hidden costs with the best market prices guaranteed</p>
                        </div>

                        <div className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-300 border border-gray-200">
                            <div className="mb-4 flex justify-center">
                                <svg className="w-12 h-12 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h4 className="font-bold text-lg mb-2 text-gray-800">Fast & On-time Delivery</h4>
                            <p className="text-gray-600 text-sm">Reliable and prompt delivery services to your construction site</p>
                        </div>

                        <div className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-300 border border-gray-200">
                            <div className="mb-4 flex justify-center">
                                <svg className="w-12 h-12 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h4 className="font-bold text-lg mb-2 text-gray-800">100% Authentic Products</h4>
                            <p className="text-gray-600 text-sm">Genuine quality materials with proper certification and warranty</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Meet Our Leadership Team Section */}
            <div className="bg-gray-900 pt-16 pb-20 px-4 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-orange-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#800000] rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <span className="text-orange-400 font-semibold tracking-wider uppercase text-sm mb-2 block">
                            Leadership
                        </span>
                        <h3 className="text-4xl font-bold text-white mb-4">
                            Meet Our Leadership Team
                        </h3>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Experienced professionals dedicated to revolutionizing the construction materials industry
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {teamMembers.map((member) => (
                            <div
                                key={member.name}
                                className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700/50 group hover:border-orange-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10"
                            >
                                <div className="relative w-44 h-44 mx-auto mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-[#800000]/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="relative w-full h-full object-cover rounded-full border-4 border-gray-700 group-hover:border-orange-500/50 transition-all duration-500"
                                        loading="lazy"
                                    />
                                </div>
                                <h4 className="font-bold text-2xl text-white mb-2">{member.name}</h4>
                                <p className="text-orange-300 font-semibold text-lg mb-3">{member.role}</p>
                                <div className="h-px w-20 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto my-4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Company Info with Logo */}
                    <div className="flex flex-col items-start">
                        <img
                            src={logo}
                            alt="Brick's Kart Logo"
                            className="h-24 w-auto mb-4 object-contain"
                        />
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Your trusted partner for construction materials. Quality, Price, and Service guaranteed.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-orange-400">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="text-gray-300 hover:text-orange-400 cursor-pointer transition duration-200">
                                Home
                            </li>
                            <li className="text-gray-300 hover:text-orange-400 cursor-pointer transition duration-200">
                                Products
                            </li>
                            <li className="text-gray-300 hover:text-orange-400 cursor-pointer transition duration-200">
                                Categories
                            </li>
                            <li className="text-gray-300 hover:text-orange-400 cursor-pointer transition duration-200">
                                Brands
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-orange-400">Contact Us</h3>
                        <div className="space-y-2 text-sm text-gray-300">
                            <p>Lokesh Dwivedi: 8767594856, 9730458972</p>
                            <p>Shashank Raut: 9370600857</p>
                            <p>Email: info@brickskart.in</p>
                            <p>For Investment: lokeshramjid@gmail.com</p>
                            <p>Nagpur, Maharashtra</p>
                        </div>
                    </div>

                    {/* Policies */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-orange-400">Policies</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="text-gray-300 hover:text-orange-400 cursor-pointer transition duration-200">
                                Privacy Policy
                            </li>
                            <li className="text-gray-300 hover:text-orange-400 cursor-pointer transition duration-200">
                                Terms & Conditions
                            </li>
                            <li className="text-gray-300 hover:text-orange-400 cursor-pointer transition duration-200">
                                Return Policy
                            </li>
                            <li className="text-gray-300 hover:text-orange-400 cursor-pointer transition duration-200">
                                Shipping Policy
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-8 border-t border-red-800 text-center">
                    <p className="text-gray-400 text-sm">
                        © 2025 Brick's Kart. All rights reserved. | Building Trust, One Brick at a Time.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;