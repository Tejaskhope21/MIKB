import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Award, 
  Users, 
  Truck, 
  Shield, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Building,
  Factory,
  Briefcase,
  Star,
  TrendingUp,
  CheckCircle
} from "lucide-react";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group z-10"
        style={{ color: "#0A2540" }}
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-lg" style={{ backgroundColor: "#0A2540" }}>
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#0A2540" }}>
            Sam Equipment And Scientific Suppliers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leading Manufacturer of Professional Equipment since 2017
          </p>
        </div>

        {/* Company Overview Section */}
        <div className="bg-white rounded-2xl shadow-lg border mb-12 overflow-hidden" style={{ borderColor: "#0A254020" }}>
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-10">
              <h2 className="text-3xl font-bold mb-4" style={{ color: "#0A2540" }}>
                About Our Company
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Sam Equipment And Scientific Suppliers is a premier manufacturer and supplier of high-quality 
                professional equipment. Since our establishment in 2017, we have been committed to delivering 
                excellence in Hospital/Medical Furniture, Office Furniture, and School Furniture.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Led by our visionary CEO, Kamesh Manohar Bubna, we have built a reputation for quality, 
                reliability, and customer satisfaction. Our dedication to innovation and quality has made 
                us a trusted partner for businesses across India.
              </p>
            </div>
            <div className="md:w-1/2 p-8 md:p-10" style={{ backgroundColor: "#f8fafd" }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: "#0A2540" }}>
                Business Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Building className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: "#0A2540" }} />
                  <div>
                    <p className="font-semibold text-gray-800">Nature of Business</p>
                    <p className="text-gray-600 text-sm">Manufacturer</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Briefcase className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: "#0A2540" }} />
                  <div>
                    <p className="font-semibold text-gray-800">Additional Business</p>
                    <p className="text-gray-600 text-sm">Wholesale Business | Retail Business | Factory / Manufacturing</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: "#0A2540" }} />
                  <div>
                    <p className="font-semibold text-gray-800">Team Strength</p>
                    <p className="text-gray-600 text-sm">Upto 10 People</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <TrendingUp className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: "#0A2540" }} />
                  <div>
                    <p className="font-semibold text-gray-800">Annual Turnover</p>
                    <p className="text-gray-600 text-sm">₹ 40 Lakh - ₹ 1.5 Crore</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg border p-8" style={{ borderColor: "#0A254020" }}>
            <div className="flex items-center mb-6">
              <MapPin className="w-6 h-6 mr-2" style={{ color: "#0A2540" }} />
              <h2 className="text-2xl font-bold" style={{ color: "#0A2540" }}>Reach Us</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                <strong>Sam Equipment And Scientific Suppliers</strong><br />
                Shop No 7, Sai Complex, Opp Post Office,<br />
                Itwari, Nagpur-440002, Maharashtra, India
              </p>
              <div className="pt-4">
                <button
                  onClick={() => window.open("https://maps.google.com/?q=Shop+No+7,+Sai+Complex,+Opp+Post+Office,+Itwari,+Nagpur-440002", "_blank")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md"
                  style={{ backgroundColor: "#0A2540", color: "white" }}
                >
                  <MapPin className="w-4 h-4" />
                  Get Directions
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border p-8" style={{ borderColor: "#0A254020" }}>
            <div className="flex items-center mb-6">
              <Phone className="w-6 h-6 mr-2" style={{ color: "#0A2540" }} />
              <h2 className="text-2xl font-bold" style={{ color: "#0A2540" }}>Contact Details</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-800">K.M. Agrawal (Owner)</p>
                <button
                  onClick={() => window.location.href = "tel:+919876543210"}
                  className="text-gray-600 hover:text-orange-600 transition-colors flex items-center gap-2 mt-1"
                >
                  <Phone className="w-4 h-4" />
                  View Mobile Number
                </button>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-gray-800">Email</p>
                <a href="mailto:support@samequipment.com" className="text-gray-600 hover:text-orange-600 transition-colors">
                  support@samequipment.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg border p-8 mb-12" style={{ borderColor: "#0A254020" }}>
          <div className="flex items-center mb-6">
            <Shield className="w-6 h-6 mr-2" style={{ color: "#0A2540" }} />
            <h2 className="text-2xl font-bold" style={{ color: "#0A2540" }}>Statutory Profile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="font-semibold text-gray-800 mb-2">Legal Status of Firm</p>
              <p className="text-gray-600">Proprietorship</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">GST Registration Date</p>
              <p className="text-gray-600">01-07-2017</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">GST Partner Name</p>
              <p className="text-gray-600">Kamesh Manohar Bubna</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">Company CEO</p>
              <p className="text-gray-600">Kamesh Manohar Bubna</p>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-2xl shadow-lg border p-8 mb-12" style={{ borderColor: "#0A254020" }}>
          <div className="flex items-center mb-6">
            <Star className="w-6 h-6 mr-2" style={{ color: "#0A2540" }} />
            <h2 className="text-2xl font-bold" style={{ color: "#0A2540" }}>Our Product Range</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: "#f8fafd" }}>
              <Building className="w-12 h-12 mx-auto mb-3" style={{ color: "#0A2540" }} />
              <h3 className="font-bold text-lg mb-2" style={{ color: "#0A2540" }}>Hospital / Medical Furniture</h3>
              <p className="text-sm text-gray-600">Hospital beds, stretchers, examination tables, medical cabinets, and more</p>
            </div>
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: "#f8fafd" }}>
              <Briefcase className="w-12 h-12 mx-auto mb-3" style={{ color: "#0A2540" }} />
              <h3 className="font-bold text-lg mb-2" style={{ color: "#0A2540" }}>Office Furniture</h3>
              <p className="text-sm text-gray-600">Workstations, executive desks, office chairs, conference tables, storage solutions</p>
            </div>
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: "#f8fafd" }}>
              <Users className="w-12 h-12 mx-auto mb-3" style={{ color: "#0A2540" }} />
              <h3 className="font-bold text-lg mb-2" style={{ color: "#0A2540" }}>School Furniture</h3>
              <p className="text-sm text-gray-600">Desks, chairs, laboratory furniture, library furniture, classroom solutions</p>
            </div>
          </div>
        </div>

        {/* Quality Commitment Section */}
        <div className="rounded-2xl p-8 md:p-10 text-center mb-12" style={{ backgroundColor: "#0A2540" }}>
          <h2 className="text-3xl font-bold text-white mb-4">Our Commitment to Quality</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            We are committed to delivering premium quality furniture solutions that combine durability, 
            functionality, and aesthetic appeal. Every product is manufactured with precision and care 
            to meet the highest industry standards.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <CheckCircle className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Quality Assured</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <Truck className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Timely Delivery</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Warranty Support</span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-lg border p-8 text-center" style={{ borderColor: "#0A254020" }}>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "#0A2540" }}>Ready to Equip Your Space?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Contact us today for premium quality furniture solutions tailored to your needs
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
            style={{ backgroundColor: "#0A2540", color: "white" }}
          >
            Get in Touch
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;