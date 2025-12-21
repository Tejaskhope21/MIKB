import React, { useState, useEffect } from 'react';
import { Save, Store, Mail, Phone, MapPin, Globe, Banknote, Truck, Shield, CreditCard } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://bricks-com-backend.vercel.app/api';

const StoreSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const [storeSettings, setStoreSettings] = useState({
        // General Settings
        general: {
            storeName: 'My Store',
            storeEmail: 'contact@mystore.com',
            storePhone: '+91 9876543210',
            storeAddress: '123 Business Street, Mumbai',
            storeDescription: 'Quality products at great prices',
            storeLogo: '',
            storeBanner: '',
            timezone: 'Asia/Kolkata',
            currency: 'INR'
        },

        // Shipping Settings
        shipping: {
            enableShipping: true,
            shippingMethods: [
                { name: 'Standard Shipping', price: 49, deliveryDays: '5-7', enabled: true },
                { name: 'Express Shipping', price: 99, deliveryDays: '2-3', enabled: true },
                { name: 'Free Shipping', price: 0, minOrder: 999, deliveryDays: '7-10', enabled: true }
            ],
            processingTime: '1-2 business days',
            shippingZones: [
                { name: 'Local', countries: ['India'], rates: { standard: 49, express: 99 } },
                { name: 'International', countries: ['All'], rates: { standard: 499, express: 999 } }
            ]
        },

        // Payment Settings
        payment: {
            acceptedMethods: ['cod', 'online', 'wallet'],
            razorpayKey: '',
            stripeKey: '',
            paypalEmail: '',
            codEnabled: true,
            codMinOrder: 0,
            codMaxOrder: 5000,
            autoConfirmOrders: false,
            refundPolicy: '7 days'
        },

        // Tax Settings
        tax: {
            enableTax: true,
            taxRate: 18,
            taxInclusive: true,
            gstNumber: '',
            panNumber: ''
        },

        // Notification Settings
        notifications: {
            emailNotifications: true,
            orderConfirmation: true,
            orderShipped: true,
            orderDelivered: true,
            lowStockAlerts: true,
            newReviewAlerts: true,
            marketingEmails: true
        }
    });

    useEffect(() => {
        fetchStoreSettings();
    }, []);

    const fetchStoreSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/seller/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStoreSettings(response.data.settings);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/seller/settings`,
                storeSettings,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Settings saved successfully');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (section, field, value) => {
        setStoreSettings({
            ...storeSettings,
            [section]: {
                ...storeSettings[section],
                [field]: value
            }
        });
    };

    const handleShippingMethodChange = (index, field, value) => {
        const updatedMethods = [...storeSettings.shipping.shippingMethods];
        updatedMethods[index] = { ...updatedMethods[index], [field]: value };

        setStoreSettings({
            ...storeSettings,
            shipping: {
                ...storeSettings.shipping,
                shippingMethods: updatedMethods
            }
        });
    };

    const addShippingMethod = () => {
        setStoreSettings({
            ...storeSettings,
            shipping: {
                ...storeSettings.shipping,
                shippingMethods: [
                    ...storeSettings.shipping.shippingMethods,
                    { name: 'New Method', price: 0, deliveryDays: '3-5', enabled: true }
                ]
            }
        });
    };

    const removeShippingMethod = (index) => {
        const updatedMethods = storeSettings.shipping.shippingMethods.filter((_, i) => i !== index);
        setStoreSettings({
            ...storeSettings,
            shipping: {
                ...storeSettings.shipping,
                shippingMethods: updatedMethods
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Store Settings</h1>
                <p className="text-gray-600">Configure your store preferences and policies</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
                {[
                    { id: 'general', label: 'General', icon: Store },
                    { id: 'shipping', label: 'Shipping', icon: Truck },
                    { id: 'payment', label: 'Payment', icon: CreditCard },
                    { id: 'tax', label: 'Tax', icon: Banknote },
                    { id: 'notifications', label: 'Notifications', icon: Mail }
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Settings Content */}
            <div className="bg-white rounded-xl shadow p-6">
                {/* General Settings */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Store className="w-5 h-5" />
                            General Store Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Store Name *
                                </label>
                                <input
                                    type="text"
                                    value={storeSettings.general.storeName}
                                    onChange={(e) => handleInputChange('general', 'storeName', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Store Email *
                                </label>
                                <input
                                    type="email"
                                    value={storeSettings.general.storeEmail}
                                    onChange={(e) => handleInputChange('general', 'storeEmail', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Store Phone
                                </label>
                                <input
                                    type="tel"
                                    value={storeSettings.general.storePhone}
                                    onChange={(e) => handleInputChange('general', 'storePhone', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Currency
                                </label>
                                <select
                                    value={storeSettings.general.currency}
                                    onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="INR">Indian Rupee (₹)</option>
                                    <option value="USD">US Dollar ($)</option>
                                    <option value="EUR">Euro (€)</option>
                                    <option value="GBP">British Pound (£)</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Store Address
                                </label>
                                <textarea
                                    value={storeSettings.general.storeAddress}
                                    onChange={(e) => handleInputChange('general', 'storeAddress', e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Store Description
                                </label>
                                <textarea
                                    value={storeSettings.general.storeDescription}
                                    onChange={(e) => handleInputChange('general', 'storeDescription', e.target.value)}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Shipping Settings */}
                {activeTab === 'shipping' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Truck className="w-5 h-5" />
                                Shipping Configuration
                            </h2>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={storeSettings.shipping.enableShipping}
                                    onChange={(e) => handleInputChange('shipping', 'enableShipping', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 mr-2"
                                />
                                <span className="text-sm">Enable Shipping</span>
                            </label>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-medium text-gray-700">Shipping Methods</h3>
                                <button
                                    onClick={addShippingMethod}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    + Add Method
                                </button>
                            </div>

                            <div className="space-y-4">
                                {storeSettings.shipping.shippingMethods.map((method, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={method.enabled}
                                                    onChange={(e) => handleShippingMethodChange(index, 'enabled', e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 mr-3"
                                                />
                                                <input
                                                    type="text"
                                                    value={method.name}
                                                    onChange={(e) => handleShippingMethodChange(index, 'name', e.target.value)}
                                                    className="px-3 py-1 border border-gray-300 rounded-lg font-medium"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeShippingMethod(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Price (₹)</label>
                                                <input
                                                    type="number"
                                                    value={method.price}
                                                    onChange={(e) => handleShippingMethodChange(index, 'price', e.target.value)}
                                                    className="w-full px-3 py-1 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">Delivery Days</label>
                                                <input
                                                    type="text"
                                                    value={method.deliveryDays}
                                                    onChange={(e) => handleShippingMethodChange(index, 'deliveryDays', e.target.value)}
                                                    className="w-full px-3 py-1 border border-gray-300 rounded-lg"
                                                    placeholder="e.g., 3-5"
                                                />
                                            </div>
                                            {method.minOrder !== undefined && (
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">Min Order for Free (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={method.minOrder}
                                                        onChange={(e) => handleShippingMethodChange(index, 'minOrder', e.target.value)}
                                                        className="w-full px-3 py-1 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-700 mb-4">Processing Time</h3>
                            <input
                                type="text"
                                value={storeSettings.shipping.processingTime}
                                onChange={(e) => handleInputChange('shipping', 'processingTime', e.target.value)}
                                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="e.g., 1-2 business days"
                            />
                        </div>
                    </div>
                )}

                {/* Payment Settings */}
                {activeTab === 'payment' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Payment Methods
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={storeSettings.payment.codEnabled}
                                        onChange={(e) => handleInputChange('payment', 'codEnabled', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 mr-3"
                                    />
                                    <div>
                                        <h4 className="font-medium">Cash on Delivery</h4>
                                        <p className="text-sm text-gray-500">Allow customers to pay when they receive the order</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">Order Limits</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">₹{storeSettings.payment.codMinOrder}</span>
                                        <span className="text-gray-400">-</span>
                                        <span className="text-sm">₹{storeSettings.payment.codMaxOrder}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border border-gray-200 rounded-lg">
                                <h4 className="font-medium mb-3">Online Payment Methods</h4>
                                <div className="space-y-3">
                                    {[
                                        { id: 'razorpay', label: 'Razorpay', field: 'razorpayKey', value: storeSettings.payment.razorpayKey },
                                        { id: 'stripe', label: 'Stripe', field: 'stripeKey', value: storeSettings.payment.stripeKey },
                                        { id: 'paypal', label: 'PayPal', field: 'paypalEmail', value: storeSettings.payment.paypalEmail }
                                    ].map(payment => (
                                        <div key={payment.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={storeSettings.payment.acceptedMethods.includes(payment.id)}
                                                onChange={(e) => {
                                                    const methods = e.target.checked
                                                        ? [...storeSettings.payment.acceptedMethods, payment.id]
                                                        : storeSettings.payment.acceptedMethods.filter(m => m !== payment.id);
                                                    handleInputChange('payment', 'acceptedMethods', methods);
                                                }}
                                                className="rounded border-gray-300 text-blue-600 mr-3"
                                            />
                                            <div className="flex-1">
                                                <label className="font-medium">{payment.label}</label>
                                                <input
                                                    type="text"
                                                    value={payment.value}
                                                    onChange={(e) => handleInputChange('payment', payment.field, e.target.value)}
                                                    placeholder={`Enter ${payment.label} ${payment.id === 'paypal' ? 'Email' : 'Key'}`}
                                                    className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h4 className="font-medium">Auto-Confirm Orders</h4>
                                    <p className="text-sm text-gray-500">Automatically confirm orders when payment is successful</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={storeSettings.payment.autoConfirmOrders}
                                    onChange={(e) => handleInputChange('payment', 'autoConfirmOrders', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tax Settings */}
                {activeTab === 'tax' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Banknote className="w-5 h-5" />
                                Tax Configuration
                            </h2>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={storeSettings.tax.enableTax}
                                    onChange={(e) => handleInputChange('tax', 'enableTax', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 mr-2"
                                />
                                <span className="text-sm">Enable Tax Calculation</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tax Rate (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={storeSettings.tax.taxRate}
                                    onChange={(e) => handleInputChange('tax', 'taxRate', parseFloat(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={storeSettings.tax.taxInclusive}
                                        onChange={(e) => handleInputChange('tax', 'taxInclusive', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 mr-2"
                                    />
                                    <span className="text-sm">Prices include tax</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    GST Number
                                </label>
                                <input
                                    type="text"
                                    value={storeSettings.tax.gstNumber}
                                    onChange={(e) => handleInputChange('tax', 'gstNumber', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="GSTIN number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    PAN Number
                                </label>
                                <input
                                    type="text"
                                    value={storeSettings.tax.panNumber}
                                    onChange={(e) => handleInputChange('tax', 'panNumber', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="PAN number"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Notification Preferences
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div>
                                    <h4 className="font-medium">Email Notifications</h4>
                                    <p className="text-sm text-gray-500">Receive email notifications for important events</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={storeSettings.notifications.emailNotifications}
                                    onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                            </div>

                            <div className="p-4 border border-gray-200 rounded-lg">
                                <h4 className="font-medium mb-4">Order Notifications</h4>
                                <div className="space-y-3">
                                    {[
                                        { id: 'orderConfirmation', label: 'Order Confirmation', description: 'When a new order is placed' },
                                        { id: 'orderShipped', label: 'Order Shipped', description: 'When an order is shipped' },
                                        { id: 'orderDelivered', label: 'Order Delivered', description: 'When an order is delivered' }
                                    ].map(notification => (
                                        <div key={notification.id} className="flex items-center justify-between">
                                            <div>
                                                <label className="font-medium">{notification.label}</label>
                                                <p className="text-sm text-gray-500">{notification.description}</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={storeSettings.notifications[notification.id]}
                                                onChange={(e) => handleInputChange('notifications', notification.id, e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 border border-gray-200 rounded-lg">
                                <h4 className="font-medium mb-4">Alert Notifications</h4>
                                <div className="space-y-3">
                                    {[
                                        { id: 'lowStockAlerts', label: 'Low Stock Alerts', description: 'When product stock is low' },
                                        { id: 'newReviewAlerts', label: 'New Review Alerts', description: 'When a new review is posted' },
                                        { id: 'marketingEmails', label: 'Marketing Emails', description: 'Receive marketing updates and tips' }
                                    ].map(alert => (
                                        <div key={alert.id} className="flex items-center justify-between">
                                            <div>
                                                <label className="font-medium">{alert.label}</label>
                                                <p className="text-sm text-gray-500">{alert.description}</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={storeSettings.notifications[alert.id]}
                                                onChange={(e) => handleInputChange('notifications', alert.id, e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Settings
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default StoreSettings;