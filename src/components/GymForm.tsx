import React, { useState, ChangeEvent, FormEvent } from "react";
import { Dumbbell, Mail, Phone, User, Building2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import BASE_API from "../api/baseurl";
import "./GymForm.css";

interface FormData {
    company_name: string;
    business_type: string;
    gst_number: string;
    owner_name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
}

interface FormErrors {
    company_name?: string;
    owner_name?: string;
    phone?: string;
    email?: string;
}

interface GymFormProps {
    onLogin: () => void;
}

const GymForm: React.FC<GymFormProps> = ({ onLogin }) => {

    const [formData, setFormData] = useState<FormData>({
        company_name: "",
        business_type: "",
        gst_number: "",
        owner_name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
    });

    const [otp, setOtp] = useState<string>("");
    const [showOtp, setShowOtp] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});

    // ✅ HANDLE CHANGE
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    // ✅ VALIDATION
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.company_name.trim())
            newErrors.company_name = "Company name is required";

        if (!formData.owner_name.trim())
            newErrors.owner_name = "Owner name is required";

        if (!formData.email.trim())
            newErrors.email = "Email is required";

        if (!formData.phone.trim())
            newErrors.phone = "Phone number is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ✅ SEND OTP
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);

            await axios.post(`${BASE_API}/gms/send-otp`, {
                email: formData.email,
            });

            setShowOtp(true);
            toast.success("OTP sent successfully to your email");

        } catch (err: any) {
            toast.error(err.response?.data?.message || "Error sending OTP");
        } finally {
            setLoading(false);
        }
    };

    // ✅ VERIFY OTP + CREATE COMPANY
    const handleVerifyOtp = async () => {
        try {
            setLoading(true);

            await axios.post(`${BASE_API}/gms/verify-otp`, {
                ...formData,
                otp,
            });

            toast.success("Company Created Successfully 🎉");

            setShowOtp(false);
            setOtp("");
            onLogin();

        } catch (err: any) {
            toast.error(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="GYMFORM-container">

            {/* LEFT SIDE */}
            <div className="GYMFORM-left">
                <h2>Smart Business Management</h2>
                <p>
                    Manage billing, GST, customers, and operations — all in one powerful platform designed for modern businesses.
                </p>
            </div>

            {/* RIGHT SIDE FORM */}
            <div className="GYMFORM-right">
                <div className="GYMFORM-card">

                    <div className="GYMFORM-card-header">
                        <div className="GYMFORM-icon-wrapper">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="GYMFORM-card-title">Create Company Demo Account</h3>
                        <p className="GYMFORM-card-description">
                            Start your free trial in seconds
                        </p>
                    </div>

                    <form className="GYMFORM-form" onSubmit={handleSubmit}>

                        {/* COMPANY NAME */}
                        <label className="GYMFORM-label">Company Name</label>
                        <div className="GYMFORM-input-wrapper">
                            <Building2 />
                            <input
                                className="GYMFORM-input"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.company_name && <span className="GYMFORM-error">{errors.company_name}</span>}

                        {/* BUSINESS TYPE */}
                        <label className="GYMFORM-label">Business Type</label>
                        <select
                            className="GYMFORM-input-wrapper"
                            name="business_type"
                            value={formData.business_type}
                            onChange={handleChange}
                        >
                            <option value="">Select Business Type</option>
                            <option value="Retail">Retail</option>
                            <option value="Wholesale">Wholesale</option>
                            <option value="Pharmacy">Pharmacy</option>
                            <option value="Distributor">Distributor</option>
                        </select>

                        {/* GST */}
                        <label className="GYMFORM-label">GST Number</label>
                        <input
                            className="GYMFORM-input-wrapper"
                            name="gst_number"
                            value={formData.gst_number}
                            onChange={handleChange}
                        />

                        {/* OWNER */}
                        <label className="GYMFORM-label">Owner Name</label>
                        <div className="GYMFORM-input-wrapper">
                            <User />
                            <input
                                className="GYMFORM-input"
                                name="owner_name"
                                value={formData.owner_name}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.owner_name && <span className="GYMFORM-error">{errors.owner_name}</span>}

                        {/* PHONE */}
                        <label className="GYMFORM-label">Phone</label>
                        <div className="GYMFORM-input-wrapper">
                            <Phone />
                            <input
                                className="GYMFORM-input"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.phone && <span className="GYMFORM-error">{errors.phone}</span>}

                        {/* EMAIL */}
                        <label className="GYMFORM-label">Email</label>
                        <div className="GYMFORM-input-wrapper">
                            <Mail />
                            <input
                                className="GYMFORM-input"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.email && <span className="GYMFORM-error">{errors.email}</span>}

                        {/* ADDRESS */}
                        <label className="GYMFORM-label">Address</label>
                        <textarea
                            className="GYMFORM-input-wrapper"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />

                        {/* CITY */}
                        <label className="GYMFORM-label">City</label>
                        <input
                            className="GYMFORM-input-wrapper"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                        />

                        {/* STATE */}
                        <label className="GYMFORM-label">State</label>
                        <input
                            className="GYMFORM-input-wrapper"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                        />

                        {/* SUBMIT */}
                        <button className="GYMFORM-button" type="submit">
                            {loading ? "Sending OTP..." : "Start Free Demo"}
                        </button>

                    </form>
                </div>
            </div>

            {/* OTP MODAL */}
            {showOtp && (
                <div className="GYMFORM-otp-modal">
                    <div className="GYMFORM-otp-card">
                        <h3>Verify OTP</h3>
                        <p>Enter the OTP sent to your email</p>

                        <input
                            className="GYMFORM-otp-input"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                        />

                        <button
                            className="GYMFORM-otp-button"
                            onClick={handleVerifyOtp}
                        >
                            Verify & Create Account
                        </button>

                        <button
                            className="GYMFORM-otp-cancel"
                            onClick={() => setShowOtp(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GymForm;