
'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Typography, notification, Select, Form, Space } from 'antd';
import { addPet} from '../../services/family';
import { useGlobalLoading } from '../../app/loadingContext';
import { showNotification } from '../../utils/notification';
const { Text } = Typography;

// Define types
type FormDataState = {
    petName: string;
    petType: string;
    petBreed: string;
    guardianEmail?: string;
    guardianContact?: string;
};

interface PetInviteFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (formData: FormDataState) => void;
}

const PetInviteForm: React.FC<PetInviteFormProps> = ({ visible, onCancel, onSubmit }) => {
    const [step, setStep] = useState<'add' | 'review' | 'sent'>('add');
    const [formData, setFormData] = useState<FormDataState>({
        petName: '',
        petType: 'Dog',
        petBreed: '',
        guardianEmail: '',
        guardianContact: '',
    });
    const [pendingPet, setPendingPet] = useState<FormDataState | null>(null);
    const { loading, setLoading } = useGlobalLoading();
    const[form] = Form.useForm();
    // Popular pet types in the U.S.
    const petTypes = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Other'];

    useEffect(() => {
        if (!visible) {
            setStep('add');
            setFormData({
                petName: '',
                petType: 'Dog',
                petBreed: '',
                guardianEmail: '',
                guardianContact: '',
            });
            setPendingPet(null);
        }
    }, [visible]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePetTypeChange = (value: string) => {
        setFormData((prev) => ({ ...prev, petType: value }));
    };

    const isFormValid = () => {
        return (
            formData.petName &&
            formData.petType &&
            formData.petBreed &&
            formData.guardianEmail &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guardianEmail) &&
            formData.guardianContact &&
            /^\d{10,15}$/.test(formData.guardianContact.replace(/\D/g, ''))
        );
    };

    const handleSendInvitation = async () => {
        setLoading(true);
        try {
            // Get the current family group ID from localStorage or context
            const currentFamilyGroupId = localStorage.getItem('currentFamilyGroupId') || localStorage.getItem('fuser');
            
            const response = await addPet({
                name: formData.petName,
                species: formData.petType,
                breed: formData.petBreed,
                guardianEmail: formData.guardianEmail || '',
                guardianContact: formData.guardianContact || '',
                userId: localStorage.getItem('userId') || '',
                family_group_id: currentFamilyGroupId || '',
            });

            const responseData = response?.data || response;
            const status = responseData?.status ?? false;
            const responseMessage = responseData?.message ?? 'Unknown error';

            if (status) {
                onSubmit(formData);
                setPendingPet(formData);
                setStep('sent');

                // ✅ Custom success message for pets
                showNotification("Success", responseMessage, "success");
            } else {
                // ✅ Error notification via showNotification
                showNotification("Error", responseMessage, "error");
            }
        } catch (error) {
            console.error('Error in handleSendInvitation:', error);
            showNotification("Error", "Only paid members can add Pets" , "error");
        } finally {
            setLoading(false);
        }
    };


    const renderAddForm = () => (
        <Form
            layout="vertical"
            style={{ padding: "24px", backgroundColor: "#f7fafc", borderRadius: "8px" }}
            onFinish={() => setStep("review")}
        >
            <h2
            style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#2d3748",
                marginBottom: "24px",
            }}
            >
            Add a New Pet
            </h2>

            <Form.Item
            name="petName"
            label="Pet Name"
            rules={[{ required: true, message: "Please enter pet name" }]}
            initialValue={formData.petName}
            >
            <Input
                name="petName"
                placeholder="Enter pet name"
                size="large"
                onChange={handleInputChange}
                style={{ borderRadius: 8 }}
            />
            </Form.Item>

            <Form.Item
            name="petType"
            label="Pet Type"
            rules={[{ required: true, message: "Please select pet type" }]}
            initialValue={formData.petType}
            >
            <Select
                placeholder="Select pet type"
                size="large"
                onChange={handlePetTypeChange}
                style={{ borderRadius: 8 }}
                options={petTypes.map((type) => ({ value: type, label: type }))}
            />
            </Form.Item>

            <Form.Item
            name="petBreed"
            label="Pet Breed"
            rules={[{ required: true, message: "Please enter pet breed" }]}
            initialValue={formData.petBreed}
            >
            <Input
                name="petBreed"
                placeholder="Enter pet breed"
                size="large"
                onChange={handleInputChange}
                style={{ borderRadius: 8 }}
            />
            </Form.Item>

            <Form.Item
            name="guardianEmail"
            label="Guardian Email"
            rules={[
                { type: "email", message: "Please enter a valid email address" },
            ]}
            initialValue={formData.guardianEmail}
            >
            <Input
                name="guardianEmail"
                placeholder="Enter guardian email"
                size="large"
                onChange={handleInputChange}
                style={{ borderRadius: 8 }}
            />
            </Form.Item>

            <Form.Item
            name="guardianContact"
            label="Guardian Contact"
            rules={[
                { pattern: /^\d{10,15}$/, message: "Please enter a valid phone number" },
            ]}
            initialValue={formData.guardianContact}
            >
            <Input
                name="guardianContact"
                placeholder="Enter guardian phone"
                size="large"
                onChange={handleInputChange}
                style={{ borderRadius: 8 }}
            />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: "right", marginTop: 24 }}>
            <Space size="middle">
                <Button
                size="large"
                onClick={onCancel}
                style={{ borderRadius: 8 }}
                >
                Cancel
                </Button>
                <Button
                type="primary"
                size="large"
                htmlType="submit"
                // disabled={!isFormValid()}
                style={{
                    borderRadius: 8,
                    backgroundColor: "#3182ce",
                    borderColor: "#3182ce",
                }}
                >
                Continue
                </Button>
            </Space>
            </Form.Item>
        </Form>
    );

    const renderReview = () => (
        <div style={{ padding: '24px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748', marginBottom: '24px' }}>
                Review Pet Details
            </h3>
            <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: '#4a5568', margin: '8px 0' }}>
                    <span style={{ fontWeight: '500' }}>Pet Name:</span> {formData.petName}
                </p>
                <p style={{ fontSize: '14px', color: '#4a5568', margin: '8px 0' }}>
                    <span style={{ fontWeight: '500' }}>Pet Type:</span> {formData.petType}
                </p>
                <p style={{ fontSize: '14px', color: '#4a5568', margin: '8px 0' }}>
                    <span style={{ fontWeight: '500' }}>Pet Breed:</span> {formData.petBreed}
                </p>
                <p style={{ fontSize: '14px', color: '#4a5568', margin: '8px 0' }}>
                    <span style={{ fontWeight: '500' }}>Guardian Email:</span> {formData.guardianEmail}
                </p>
                <p style={{ fontSize: '14px', color: '#4a5568', margin: '8px 0' }}>
                    <span style={{ fontWeight: '500' }}>Guardian Contact:</span> {formData.guardianContact}
                </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                <Button
                    onClick={() => setStep('add')}
                    style={{
                        height: '40px',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0',
                        color: '#4a5568',
                        fontSize: '14px',
                        padding: '0 24px',
                        transition: 'background-color 0.3s',
                    }}
                >
                    Back
                </Button>
                <Button
                    type="primary"
                    onClick={handleSendInvitation}
                    loading={loading}
                    style={{
                        height: '40px',
                        borderRadius: '20px',
                        backgroundColor: '#3182ce',
                        borderColor: '#3182ce',
                        color: '#ffffff',
                        fontSize: '14px',
                        padding: '0 24px',
                        transition: 'background-color 0.3s',
                    }}
                >
                    Add Pet
                </Button>
            </div>
        </div>
    );

    const renderSent = () => (
        <div style={{ padding: '24px', backgroundColor: '#f7fafc', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748', marginBottom: '24px' }}>
                Pet Added!
            </h3>
            <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '24px' }}>
                {pendingPet?.petName} ({pendingPet?.petType}, {pendingPet?.petBreed}) has been added to the Family Hub.
            </p>
            <Button
                type="primary"
                onClick={onCancel}
                style={{
                    height: '40px',
                    borderRadius: '20px',
                    backgroundColor: '#3182ce',
                    borderColor: '#3182ce',
                    color: '#ffffff',
                    fontSize: '14px',
                    padding: '0 24px',
                    transition: 'background-color 0.3s',
                }}
            >
                Done
            </Button>
        </div>
    );

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
            style={{ borderRadius: '10px' }}
            styles={{ body: { padding: '0', borderRadius: '10px', backgroundColor: '#f7fafc' } }}
        >
            {step === 'add' && renderAddForm()}
            {step === 'review' && renderReview()}
            {step === 'sent' && renderSent()}
        </Modal>
    );
};

export default PetInviteForm;