// components/CustomPicker.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomPicker = ({ 
    selectedValue, 
    onValueChange, 
    items, 
    placeholder, 
    style 
}) => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleSelect = (value) => {
        onValueChange(value);
        setModalVisible(false);
    };

    const selectedLabel = items.find(item => item.value === selectedValue)?.label || placeholder;

    return (
        <>
            <TouchableOpacity
                style={[styles.pickerContainer, style]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={selectedValue ? styles.selectedText : styles.placeholderText}>
                    {selectedLabel}
                </Text>
                <Icon name="arrow-drop-down" size={24} color="#6B7280" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{placeholder}</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Icon name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={items}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        selectedValue === item.value && styles.selectedOption
                                    ]}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        selectedValue === item.value && styles.selectedOptionText
                                    ]}>
                                        {item.label}
                                    </Text>
                                    {selectedValue === item.value && (
                                        <Icon name="check" size={20} color="#D97706" />
                                    )}
                                </TouchableOpacity>
                            )}
                            style={styles.optionsList}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    selectedText: {
        fontSize: 15,
        color: '#111827',
        flex: 1,
    },
    placeholderText: {
        fontSize: 15,
        color: '#9CA3AF',
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
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
    optionsList: {
        padding: 20,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    selectedOption: {
        backgroundColor: '#FFFBEB',
        borderRadius: 8,
    },
    optionText: {
        fontSize: 16,
        color: '#374151',
    },
    selectedOptionText: {
        color: '#92400E',
        fontWeight: '600',
    },
});

export default CustomPicker;