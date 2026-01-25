import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Modal,
    FlatList,
    RefreshControl,
    SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getUserMaterialRequirements,
    getMaterialRequirementById,
    updateMaterialRequirement,
    cancelMaterialRequirement,
    createMaterialRequirement,
    deleteMaterialRequirement,
    validatePhoneNumber
} from '../services/postRequirmentApi';


const MaterialRequirementsDashboard = () => {
    const navigation = useNavigation();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState('');
    
    // States for modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        projectType: '',
        projectLocation: '',
        deliveryDate: '',
        budgetRange: '',
        company: '',
        phone: '',
        materials: [{ id: 1, type: '', quantity: '', unit: 'units', specification: '' }],
        additionalNotes: '',
        urgencyLevel: 'medium',
        siteVisitRequired: false
    });

    // Filters
    const [filters, setFilters] = useState({
        status: '',
        projectType: '',
        search: '',
        sortBy: '-createdAt'
    });

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
        'MT', 'KG', 'Ton', 'Cubic Meter', 'Square Feet', 'Number', 'Set', 'Bag', 'units'
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

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending', color: '#FEF3C7', textColor: '#92400E' },
        { value: 'in-progress', label: 'In Progress', color: '#DBEAFE', textColor: '#1E40AF' },
        { value: 'accepted', label: 'Accepted', color: '#E9D5FF', textColor: '#6B21A8' },
        { value: 'completed', label: 'Completed', color: '#D1FAE5', textColor: '#065F46' },
        { value: 'cancelled', label: 'Cancelled', color: '#FEE2E2', textColor: '#991B1B' }
    ];

    const urgencyLevels = [
        { value: 'low', label: 'Low', color: '#FFFBEB', textColor: '#92400E', borderColor: '#FBBF24' },
        { value: 'medium', label: 'Medium', color: '#FDE68A', textColor: '#78350F', borderColor: '#F59E0B' },
        { value: 'high', label: 'High', color: '#D97706', textColor: '#FFFFFF', borderColor: '#B45309' },
        { value: 'urgent', label: 'Urgent', color: '#DC2626', textColor: '#FFFFFF', borderColor: '#B91C1C' }
    ];

    // Fetch user info on component mount
    useEffect(() => {
        fetchUserData();
    }, []);

    // Fetch requirements when filters change
    useEffect(() => {
        fetchRequirements();
    }, [filters]);

    const fetchUserData = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.navigate('Login');
                return;
            }
            
            const userName = await AsyncStorage.getItem('userName');
            const userEmail = await AsyncStorage.getItem('userEmail');
            const userPhone = await AsyncStorage.getItem('userPhone');
            
            setUserInfo({
                name: userName || 'User',
                email: userEmail || '',
                phone: userPhone || ''
            });
        } catch (err) {
            console.error('Error fetching user data:', err);
            Alert.alert('Error', 'Failed to load user data');
        }
    };

    const fetchRequirements = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await getUserMaterialRequirements(filters);
            
            if (response.success) {
                setRequirements(response.data);
            } else {
                setError(response.message || 'Failed to fetch requirements');
                Alert.alert('Error', response.message || 'Failed to fetch requirements');
            }
        } catch (err) {
            console.error('Error fetching requirements:', err);
            setError('An error occurred while fetching requirements');
            Alert.alert('Error', 'Failed to load requirements');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequirements();
    };

    const handleCreateSubmit = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            setError('');
            
            const requirementData = {
                ...formData,
                materials: formData.materials.map(({ id, ...rest }) => rest)
            };

            const response = await createMaterialRequirement(requirementData);
            
            if (response.success) {
                Alert.alert('Success', 'Requirement created successfully!');
                setShowCreateModal(false);
                resetForm();
                fetchRequirements();
            } else {
                setError(response.message || 'Failed to create requirement');
                Alert.alert('Error', response.message || 'Failed to create requirement');
            }
        } catch (err) {
            console.error('Create error:', err);
            setError('Failed to create requirement');
            Alert.alert('Error', 'Failed to create requirement');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubmit = async () => {
        if (!selectedRequirement || !validateForm()) return;

        try {
            setLoading(true);
            setError('');
            
            const updateData = {
                ...formData,
                materials: formData.materials.map(({ id, ...rest }) => rest)
            };

            const response = await updateMaterialRequirement(selectedRequirement._id, updateData);
            
            if (response.success) {
                Alert.alert('Success', 'Requirement updated successfully!');
                setShowEditModal(false);
                resetForm();
                fetchRequirements();
            } else {
                setError(response.message || 'Failed to update requirement');
                Alert.alert('Error', response.message || 'Failed to update requirement');
            }
        } catch (err) {
            console.error('Update error:', err);
            setError('Failed to update requirement');
            Alert.alert('Error', 'Failed to update requirement');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequirement = async (requirementId) => {
        Alert.alert(
            'Cancel Requirement',
            'Are you sure you want to cancel this requirement? This action cannot be undone.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            
                            const response = await cancelMaterialRequirement(requirementId);
                            
                            if (response.success) {
                                Alert.alert('Success', 'Requirement cancelled successfully!');
                                fetchRequirements();
                            } else {
                                Alert.alert('Error', response.message || 'Failed to cancel requirement');
                            }
                        } catch (err) {
                            console.error('Cancel error:', err);
                            Alert.alert('Error', 'Failed to cancel requirement');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteRequirement = async () => {
        if (!selectedRequirement) return;

        Alert.alert(
            'Delete Requirement',
            'Are you sure you want to delete this requirement? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            
                            const response = await deleteMaterialRequirement(selectedRequirement._id);
                            
                            if (response.success) {
                                Alert.alert('Success', 'Requirement deleted successfully!');
                                setShowDeleteModal(false);
                                setSelectedRequirement(null);
                                fetchRequirements();
                            } else {
                                Alert.alert('Error', response.message || 'Failed to delete requirement');
                            }
                        } catch (err) {
                            console.error('Delete error:', err);
                            Alert.alert('Error', 'Failed to delete requirement');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const validateForm = () => {
        if (!formData.projectType) {
            setError('Project type is required');
            Alert.alert('Error', 'Project type is required');
            return false;
        }
        if (!formData.projectLocation) {
            setError('Project location is required');
            Alert.alert('Error', 'Project location is required');
            return false;
        }
        if (!formData.deliveryDate) {
            setError('Delivery date is required');
            Alert.alert('Error', 'Delivery date is required');
            return false;
        }
        if (!formData.budgetRange) {
            setError('Budget range is required');
            Alert.alert('Error', 'Budget range is required');
            return false;
        }

        const phoneStr = String(formData.phone || '').trim();
        if (phoneStr && !validatePhoneNumber(phoneStr)) {
            setError('Valid 10-digit phone number is required');
            Alert.alert('Error', 'Valid 10-digit phone number is required');
            return false;
        }

        for (const material of formData.materials) {
            if (!material.type) {
                setError('All materials must have a type selected');
                Alert.alert('Error', 'All materials must have a type selected');
                return false;
            }
            const quantity = parseFloat(material.quantity);
            if (isNaN(quantity) || quantity <= 0) {
                setError('All materials must have a valid quantity greater than 0');
                Alert.alert('Error', 'All materials must have a valid quantity greater than 0');
                return false;
            }
        }

        return true;
    };

    const resetForm = () => {
        setFormData({
            projectType: '',
            projectLocation: '',
            deliveryDate: '',
            budgetRange: '',
            company: '',
            phone: userInfo?.phone || '',
            materials: [{ id: 1, type: '', quantity: '', unit: 'units', specification: '' }],
            additionalNotes: '',
            urgencyLevel: 'medium',
            siteVisitRequired: false
        });
        setError('');
    };

    const openEditModal = (requirement) => {
        setSelectedRequirement(requirement);
        setFormData({
            projectType: requirement.projectType || '',
            projectLocation: requirement.projectLocation || '',
            deliveryDate: requirement.deliveryDate ? requirement.deliveryDate.split('T')[0] : '',
            budgetRange: requirement.budgetRange || '',
            company: requirement.company || '',
            phone: requirement.phone || userInfo?.phone || '',
            materials: requirement.materials?.map((mat, idx) => ({
                id: idx + 1,
                type: mat.type || '',
                quantity: mat.quantity || '',
                unit: mat.unit || 'units',
                specification: mat.specification || ''
            })) || [{ id: 1, type: '', quantity: '', unit: 'units', specification: '' }],
            additionalNotes: requirement.additionalNotes || '',
            urgencyLevel: requirement.urgencyLevel || 'medium',
            siteVisitRequired: requirement.siteVisitRequired || false
        });
        setShowEditModal(true);
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
            materials: [...prev.materials, { id: newId, type: '', quantity: '', unit: 'units', specification: '' }]
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

    const getStatusColor = (status) => {
        const option = statusOptions.find(opt => opt.value === status);
        return option || { color: '#F3F4F6', textColor: '#374151' };
    };

    const getUrgencyColor = (urgency) => {
        const option = urgencyLevels.find(opt => opt.value === urgency);
        return option || { color: '#F3F4F6', textColor: '#374151', borderColor: '#D1D5DB' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN');
    };

    const formatDeliveryDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN');
    };

    const calculateEstimatedTotal = (materials) => {
        const quantity = materials?.reduce((sum, material) => {
            const qty = parseFloat(material.quantity) || 0;
            return sum + qty;
        }, 0) || 0;

        if (quantity === 0) return 'N/A';
        return `${quantity.toLocaleString('en-IN')} ${materials?.[0]?.unit || 'units'}`;
    };

    const renderRequirementItem = ({ item }) => {
        const status = getStatusColor(item.status);
        const urgency = getUrgencyColor(item.urgencyLevel);
        
        return (
            <View style={styles.requirementCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.requirementId}>{item.requirementNumber}</Text>
                    <Text style={styles.budget}>{item.budgetRange}</Text>
                </View>
                
                <View style={styles.cardBody}>
                    <View style={styles.projectInfo}>
                        <Text style={styles.projectType}>{item.projectType}</Text>
                        <Text style={styles.projectLocation}>{item.projectLocation}</Text>
                        <Text style={styles.deliveryDate}>
                            Delivery: {formatDeliveryDate(item.deliveryDate)}
                        </Text>
                    </View>
                    
                    <View style={styles.materialsInfo}>
                        <Text style={styles.materialsCount}>
                            {item.materials?.length || 0} Items
                        </Text>
                        <Text style={styles.materialsTotal}>
                            {calculateEstimatedTotal(item.materials)}
                        </Text>
                    </View>
                    
                    <View style={styles.statusContainer}>
                        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                            <Text style={[styles.statusText, { color: status.textColor }]}>
                                {status.label}
                            </Text>
                        </View>
                        <View style={[styles.urgencyBadge, { 
                            backgroundColor: urgency.color,
                            borderColor: urgency.borderColor 
                        }]}>
                            <Text style={[styles.urgencyText, { color: urgency.textColor }]}>
                                {urgency.label.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    
                    <Text style={styles.createdDate}>
                        Created: {formatDate(item.createdAt)}
                    </Text>
                </View>
                
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedRequirement(item);
                            setShowDetailsModal(true);
                        }}
                        style={styles.actionButton}
                    >
                        <Text style={styles.viewAction}>View</Text>
                    </TouchableOpacity>
                    
                    {item.status === 'pending' && (
                        <>
                            <TouchableOpacity
                                onPress={() => openEditModal(item)}
                                style={styles.actionButton}
                            >
                                <Text style={styles.editAction}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleCancelRequirement(item._id)}
                                style={styles.actionButton}
                            >
                                <Text style={styles.cancelAction}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedRequirement(item);
                            setShowDeleteModal(true);
                        }}
                        style={styles.actionButton}
                    >
                        <Text style={styles.deleteAction}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderCreateModal = () => (
        <Modal
            visible={showCreateModal}
            animationType="slide"
            transparent={true}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <ScrollView style={styles.modalScrollView}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create New Requirement</Text>
                            <TouchableOpacity
                                onPress={() => setShowCreateModal(false)}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.formSection}>
                            <Text style={styles.formLabel}>Project Type *</Text>
                            <View style={styles.dropdownContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {projectTypes.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.typeOption,
                                                formData.projectType === type && styles.typeOptionSelected
                                            ]}
                                            onPress={() => setFormData({...formData, projectType: type})}
                                        >
                                            <Text style={[
                                                styles.typeOptionText,
                                                formData.projectType === type && styles.typeOptionTextSelected
                                            ]}>
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                        
                        <View style={styles.formSection}>
                            <Text style={styles.formLabel}>Project Location *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.projectLocation}
                                onChangeText={(text) => setFormData({...formData, projectLocation: text})}
                                placeholder="Enter site address"
                            />
                        </View>
                        
                        <View style={styles.formSection}>
                            <Text style={styles.formLabel}>Delivery Date *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.deliveryDate}
                                onChangeText={(text) => setFormData({...formData, deliveryDate: text})}
                                placeholder="YYYY-MM-DD"
                            />
                        </View>
                        
                        <View style={styles.formSection}>
                            <Text style={styles.formLabel}>Budget Range *</Text>
                            <View style={styles.dropdownContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {budgetRanges.map((range) => (
                                        <TouchableOpacity
                                            key={range}
                                            style={[
                                                styles.budgetOption,
                                                formData.budgetRange === range && styles.budgetOptionSelected
                                            ]}
                                            onPress={() => setFormData({...formData, budgetRange: range})}
                                        >
                                            <Text style={[
                                                styles.budgetOptionText,
                                                formData.budgetRange === range && styles.budgetOptionTextSelected
                                            ]}>
                                                {range}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                        
                        <View style={styles.formSection}>
                            <Text style={styles.formLabel}>Urgency Level *</Text>
                            <View style={styles.urgencyContainer}>
                                {urgencyLevels.map((level) => (
                                    <TouchableOpacity
                                        key={level.value}
                                        style={[
                                            styles.urgencyOption,
                                            { backgroundColor: level.color, borderColor: level.borderColor },
                                            formData.urgencyLevel === level.value && styles.urgencyOptionSelected
                                        ]}
                                        onPress={() => setFormData({...formData, urgencyLevel: level.value})}
                                    >
                                        <Text style={[
                                            styles.urgencyOptionText,
                                            { color: level.textColor }
                                        ]}>
                                            {level.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        
                        <View style={styles.formSection}>
                            <Text style={styles.formLabel}>Company Name (Optional)</Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.company}
                                onChangeText={(text) => setFormData({...formData, company: text})}
                                placeholder="Enter company name"
                            />
                        </View>
                        
                        <View style={styles.formSection}>
                            <Text style={styles.formLabel}>Phone Number</Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.phone}
                                onChangeText={(text) => setFormData({...formData, phone: text})}
                                placeholder="Enter 10-digit phone number"
                                keyboardType="phone-pad"
                            />
                        </View>
                        
                        <View style={styles.formSection}>
                            <View style={styles.materialsHeader}>
                                <Text style={styles.formLabel}>Materials Required *</Text>
                                <TouchableOpacity onPress={addMaterialRow}>
                                    <Text style={styles.addMaterialButton}>+ Add Material</Text>
                                </TouchableOpacity>
                            </View>
                            
                            {formData.materials.map((material) => (
                                <View key={material.id} style={styles.materialRow}>
                                    <View style={styles.materialInput}>
                                        <Text style={styles.inputLabel}>Type</Text>
                                        <ScrollView horizontal>
                                            {materialCategories.slice(0, 5).map((cat) => (
                                                <TouchableOpacity
                                                    key={cat}
                                                    style={[
                                                        styles.materialOption,
                                                        material.type === cat && styles.materialOptionSelected
                                                    ]}
                                                    onPress={() => handleMaterialChange(material.id, 'type', cat)}
                                                >
                                                    <Text style={[
                                                        styles.materialOptionText,
                                                        material.type === cat && styles.materialOptionTextSelected
                                                    ]}>
                                                        {cat}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                    
                                    <View style={styles.materialInput}>
                                        <Text style={styles.inputLabel}>Quantity</Text>
                                        <TextInput
                                            style={styles.numberInput}
                                            value={material.quantity}
                                            onChangeText={(text) => handleMaterialChange(material.id, 'quantity', text)}
                                            keyboardType="numeric"
                                            placeholder="0"
                                        />
                                    </View>
                                    
                                    <View style={styles.materialInput}>
                                        <Text style={styles.inputLabel}>Unit</Text>
                                        <ScrollView horizontal>
                                            {unitOptions.map((unit) => (
                                                <TouchableOpacity
                                                    key={unit}
                                                    style={[
                                                        styles.unitOption,
                                                        material.unit === unit && styles.unitOptionSelected
                                                    ]}
                                                    onPress={() => handleMaterialChange(material.id, 'unit', unit)}
                                                >
                                                    <Text style={[
                                                        styles.unitOptionText,
                                                        material.unit === unit && styles.unitOptionTextSelected
                                                    ]}>
                                                        {unit}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                    
                                    {formData.materials.length > 1 && (
                                        <TouchableOpacity
                                            onPress={() => removeMaterialRow(material.id)}
                                            style={styles.removeButton}
                                        >
                                            <Text style={styles.removeButtonText}>Remove</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>
                        
                        <View style={styles.formSection}>
                            <Text style={styles.formLabel}>Additional Notes (Optional)</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={formData.additionalNotes}
                                onChangeText={(text) => setFormData({...formData, additionalNotes: text})}
                                placeholder="Any additional information or specifications..."
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                        
                        {error ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}
                        
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={() => setShowCreateModal(false)}
                                style={[styles.modalButton, styles.cancelButton]}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={handleCreateSubmit}
                                disabled={loading}
                                style={[styles.modalButton, styles.submitButton]}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Create Requirement</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderDeleteModal = () => (
        <Modal
            visible={showDeleteModal}
            animationType="slide"
            transparent={true}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.deleteModalContent}>
                    <Text style={styles.deleteModalTitle}>Delete Requirement</Text>
                    <Text style={styles.deleteModalText}>
                        Are you sure you want to delete requirement {selectedRequirement?.requirementNumber}?
                    </Text>
                    <Text style={styles.deleteModalSubtext}>
                        This action cannot be undone.
                    </Text>
                    
                    <View style={styles.deleteModalActions}>
                        <TouchableOpacity
                            onPress={() => setShowDeleteModal(false)}
                            style={[styles.modalButton, styles.cancelButton]}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={handleDeleteRequirement}
                            disabled={loading}
                            style={[styles.modalButton, styles.deleteConfirmButton]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderDetailsModal = () => (
        <Modal
            visible={showDetailsModal}
            animationType="slide"
            transparent={true}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.detailsModalContent}>
                    <ScrollView>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Requirement Details</Text>
                            <TouchableOpacity
                                onPress={() => setShowDetailsModal(false)}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {selectedRequirement && (
                            <View style={styles.detailsContent}>
                                <View style={styles.detailSection}>
                                    <Text style={styles.detailSectionTitle}>Project Information</Text>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Project Type:</Text>
                                        <Text style={styles.detailValue}>{selectedRequirement.projectType}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Location:</Text>
                                        <Text style={styles.detailValue}>{selectedRequirement.projectLocation}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Delivery Date:</Text>
                                        <Text style={styles.detailValue}>
                                            {formatDeliveryDate(selectedRequirement.deliveryDate)}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Budget Range:</Text>
                                        <Text style={styles.detailValue}>{selectedRequirement.budgetRange}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.detailSection}>
                                    <Text style={styles.detailSectionTitle}>Materials Required</Text>
                                    {selectedRequirement.materials?.map((material, index) => (
                                        <View key={index} style={styles.materialDetail}>
                                            <Text style={styles.materialName}>{material.type}</Text>
                                            <Text style={styles.materialSpecs}>
                                                {material.quantity} {material.unit}
                                                {material.specification && ` • ${material.specification}`}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                                
                                <View style={styles.detailSection}>
                                    <Text style={styles.detailSectionTitle}>Status Information</Text>
                                    <View style={styles.statusDetail}>
                                        <View style={[styles.statusBadge, { 
                                            backgroundColor: getStatusColor(selectedRequirement.status).color 
                                        }]}>
                                            <Text style={[styles.statusText, { 
                                                color: getStatusColor(selectedRequirement.status).textColor 
                                            }]}>
                                                {getStatusColor(selectedRequirement.status).label}
                                            </Text>
                                        </View>
                                        <View style={[styles.urgencyBadge, { 
                                            backgroundColor: getUrgencyColor(selectedRequirement.urgencyLevel).color,
                                            borderColor: getUrgencyColor(selectedRequirement.urgencyLevel).borderColor
                                        }]}>
                                            <Text style={[styles.urgencyText, { 
                                                color: getUrgencyColor(selectedRequirement.urgencyLevel).textColor 
                                            }]}>
                                                {getUrgencyColor(selectedRequirement.urgencyLevel).label}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.createdDate}>
                                        Created: {formatDate(selectedRequirement.createdAt)}
                                    </Text>
                                </View>
                                
                                {selectedRequirement.additionalNotes && (
                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailSectionTitle}>Additional Notes</Text>
                                        <Text style={styles.notesText}>{selectedRequirement.additionalNotes}</Text>
                                    </View>
                                )}
                                
                                <View style={styles.detailsActions}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowDetailsModal(false);
                                            setShowDeleteModal(true);
                                        }}
                                        style={[styles.actionButton, styles.deleteButton]}
                                    >
                                        <Text style={styles.deleteButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                    
                                    {selectedRequirement.status === 'pending' && (
                                        <>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setShowDetailsModal(false);
                                                    openEditModal(selectedRequirement);
                                                }}
                                                style={[styles.actionButton, styles.editButton]}
                                            >
                                                <Text style={styles.editButtonText}>Edit</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Alert.alert(
                                                        'Cancel Requirement',
                                                        'Are you sure you want to cancel this requirement?',
                                                        [
                                                            { text: 'No', style: 'cancel' },
                                                            {
                                                                text: 'Yes',
                                                                onPress: () => {
                                                                    handleCancelRequirement(selectedRequirement._id);
                                                                    setShowDetailsModal(false);
                                                                }
                                                            }
                                                        ]
                                                    );
                                                }}
                                                style={[styles.actionButton, styles.cancelButton]}
                                            >
                                                <Text style={styles.cancelButtonText}>Cancel</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                    
                                    <TouchableOpacity
                                        onPress={() => setShowDetailsModal(false)}
                                        style={[styles.actionButton, styles.closeButton]}
                                    >
                                        <Text style={styles.closeButtonText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Material Requirements</Text>
                <Text style={styles.headerSubtitle}>Manage and track all your material requirements</Text>
            </View>
            
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Total</Text>
                    <Text style={styles.statValue}>{requirements.length}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Pending</Text>
                    <Text style={[styles.statValue, styles.pendingStat]}>
                        {requirements.filter(r => r.status === 'pending').length}
                    </Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>In Progress</Text>
                    <Text style={[styles.statValue, styles.progressStat]}>
                        {requirements.filter(r => r.status === 'in-progress').length}
                    </Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Completed</Text>
                    <Text style={[styles.statValue, styles.completedStat]}>
                        {requirements.filter(r => r.status === 'completed').length}
                    </Text>
                </View>
            </View>
            
            <View style={styles.filtersContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={filters.search}
                    onChangeText={(text) => setFilters({...filters, search: text})}
                    placeholder="Search requirements..."
                />
                
                <View style={styles.filterRow}>
                    <View style={styles.filterSelect}>
                        <Text style={styles.filterLabel}>Status</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {statusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.filterOption,
                                        filters.status === option.value && styles.filterOptionSelected
                                    ]}
                                    onPress={() => setFilters({...filters, status: option.value})}
                                >
                                    <Text style={[
                                        styles.filterOptionText,
                                        filters.status === option.value && styles.filterOptionTextSelected
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </View>
            
            <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                style={styles.createButton}
            >
                <Text style={styles.createButtonText}>+ Submit New Requirement</Text>
            </TouchableOpacity>
            
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#D97706" />
                    <Text style={styles.loadingText}>Loading requirements...</Text>
                </View>
            ) : (
                <FlatList
                    data={requirements}
                    renderItem={renderRequirementItem}
                    keyExtractor={(item) => item._id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#D97706']}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No requirements found</Text>
                            <TouchableOpacity
                                onPress={() => setShowCreateModal(true)}
                                style={styles.emptyButton}
                            >
                                <Text style={styles.emptyButtonText}>Create New Requirement</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}
            
            {renderCreateModal()}
            {renderDeleteModal()}
            {renderDetailsModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginTop: 8,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    pendingStat: {
        color: '#92400E',
    },
    progressStat: {
        color: '#1E40AF',
    },
    completedStat: {
        color: '#065F46',
    },
    filtersContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginTop: 8,
    },
    searchInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 12,
    },
    filterRow: {
        flexDirection: 'row',
    },
    filterSelect: {
        flex: 1,
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    filterOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        marginRight: 8,
    },
    filterOptionSelected: {
        backgroundColor: '#D97706',
    },
    filterOptionText: {
        fontSize: 12,
        color: '#374151',
    },
    filterOptionTextSelected: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
    createButton: {
        backgroundColor: '#D97706',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    requirementCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    requirementId: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    budget: {
        fontSize: 14,
        fontWeight: '600',
        color: '#D97706',
    },
    cardBody: {
        marginBottom: 12,
    },
    projectInfo: {
        marginBottom: 8,
    },
    projectType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    projectLocation: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    deliveryDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    materialsInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    materialsCount: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    materialsTotal: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    urgencyBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    urgencyText: {
        fontSize: 12,
        fontWeight: '600',
    },
    createdDate: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
    },
    actionButton: {
        marginRight: 16,
    },
    viewAction: {
        color: '#2563EB',
        fontWeight: '500',
    },
    editAction: {
        color: '#059669',
        fontWeight: '500',
    },
    cancelAction: {
        color: '#D97706',
        fontWeight: '500',
    },
    deleteAction: {
        color: '#DC2626',
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#6B7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 16,
    },
    emptyButton: {
        backgroundColor: '#D97706',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: '90%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#6B7280',
    },
    modalScrollView: {
        padding: 16,
    },
    formSection: {
        marginBottom: 16,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    dropdownContainer: {
        flexDirection: 'row',
    },
    typeOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginRight: 8,
    },
    typeOptionSelected: {
        backgroundColor: '#D97706',
    },
    typeOptionText: {
        fontSize: 12,
        color: '#374151',
    },
    typeOptionTextSelected: {
        color: '#FFFFFF',
    },
    budgetOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginRight: 8,
    },
    budgetOptionSelected: {
        backgroundColor: '#D97706',
    },
    budgetOptionText: {
        fontSize: 12,
        color: '#374151',
    },
    budgetOptionTextSelected: {
        color: '#FFFFFF',
    },
    urgencyContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    urgencyOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
    },
    urgencyOptionSelected: {
        transform: [{ scale: 1.05 }],
    },
    urgencyOptionText: {
        fontSize: 12,
        fontWeight: '500',
    },
    materialsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    addMaterialButton: {
        color: '#D97706',
        fontWeight: '500',
    },
    materialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    materialInput: {
        flex: 1,
        marginRight: 8,
    },
    inputLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    materialOption: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        marginRight: 4,
    },
    materialOptionSelected: {
        backgroundColor: '#D97706',
    },
    materialOptionText: {
        fontSize: 10,
        color: '#374151',
    },
    materialOptionTextSelected: {
        color: '#FFFFFF',
    },
    numberInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 4,
        padding: 8,
        fontSize: 12,
    },
    unitOption: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        marginRight: 4,
    },
    unitOptionSelected: {
        backgroundColor: '#D97706',
    },
    unitOptionText: {
        fontSize: 10,
        color: '#374151',
    },
    unitOptionTextSelected: {
        color: '#FFFFFF',
    },
    removeButton: {
        padding: 4,
    },
    removeButtonText: {
        color: '#DC2626',
        fontSize: 12,
    },
    errorContainer: {
        backgroundColor: '#FEE2E2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: '#991B1B',
        fontSize: 14,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginLeft: 12,
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cancelButtonText: {
        color: '#374151',
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#D97706',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    deleteModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        width: '80%',
    },
    deleteModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#DC2626',
        marginBottom: 12,
    },
    deleteModalText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
    },
    deleteModalSubtext: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 24,
    },
    deleteModalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    deleteConfirmButton: {
        backgroundColor: '#DC2626',
    },
    deleteConfirmButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    detailsModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: '90%',
        maxHeight: '80%',
    },
    detailsContent: {
        padding: 16,
    },
    detailSection: {
        marginBottom: 24,
    },
    detailSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    materialDetail: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    materialName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    materialSpecs: {
        fontSize: 12,
        color: '#6B7280',
    },
    statusDetail: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    notesText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    detailsActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
        marginTop: 24,
    },
    deleteButton: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
    editButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    editButtonText: {
        color: '#374151',
        fontWeight: '500',
    },
    closeButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
});

export default MaterialRequirementsDashboard;