'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMapUser, useUpdateMapUser } from '@/hooks/useMapUsers';
import { UpdateMapUserData } from '@/services/mapuser.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  MapPin,
  Building,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const EditMapUserPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const mapUserId = params.id as string;

  const { data: mapUserResponse, isLoading, error } = useMapUser(mapUserId);
  const updateMapUserMutation = useUpdateMapUser();

  const [formData, setFormData] = useState<UpdateMapUserData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form data when map user data is loaded
  useEffect(() => {
    if (mapUserResponse?.data) {
      const mapUser = mapUserResponse.data;
      setFormData({
        firstName: mapUser.firstName,
        lastName: mapUser.lastName,
        phone: mapUser.phone,
        location: mapUser.location,
        clinicName: mapUser.clinicName,
        zipCode: mapUser.zipCode,
        showOnMap: mapUser.showOnMap,
      });
    }
  }, [mapUserResponse]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.firstName !== undefined && !formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (formData.lastName !== undefined && !formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.phone !== undefined && formData.phone.trim()) {
      if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s+/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    } else if (formData.phone !== undefined && !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (formData.location !== undefined && !formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.clinicName !== undefined && !formData.clinicName.trim()) {
      newErrors.clinicName = 'Clinic name is required';
    }

    if (formData.zipCode !== undefined && formData.zipCode.trim()) {
      if (!/^\d{5,6}$/.test(formData.zipCode)) {
        newErrors.zipCode = 'Please enter a valid ZIP code (5-6 digits)';
      }
    } else if (formData.zipCode !== undefined && !formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== undefined)
      );

      await updateMapUserMutation.mutateAsync({
        id: mapUserId,
        data: cleanedData
      });
      
      toast.success('Map user updated successfully!');
      router.push('/dashboard/map-users');
    } catch (error) {
      console.error('Update map user error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !mapUserResponse?.data) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading map user data. Please try again.</p>
        <Link
          href="/dashboard/map-users"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Map Users
        </Link>
      </div>
    );
  }

  const mapUser = mapUserResponse.data;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/map-users"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Map User</h1>
            <p className="text-gray-600 mt-1">Update map user information</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'border-red-300' : ''}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'border-red-300' : ''}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className={`pl-10 ${errors.phone ? 'border-red-300' : ''}`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Practice Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Practice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clinicName">Clinic Name *</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="clinicName"
                  name="clinicName"
                  value={formData.clinicName || ''}
                  onChange={handleInputChange}
                  className={`pl-10 ${errors.clinicName ? 'border-red-300' : ''}`}
                  placeholder="Enter clinic name"
                />
              </div>
              {errors.clinicName && (
                <p className="text-red-600 text-sm mt-1">{errors.clinicName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="location"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.location ? 'border-red-300' : ''}`}
                    placeholder="Enter location/address"
                  />
                </div>
                {errors.location && (
                  <p className="text-red-600 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode || ''}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.zipCode ? 'border-red-300' : ''}`}
                    placeholder="Enter ZIP code"
                  />
                </div>
                {errors.zipCode && (
                  <p className="text-red-600 text-sm mt-1">{errors.zipCode}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visibility Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Visibility Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="showOnMap"
                name="showOnMap"
                checked={formData.showOnMap || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="showOnMap" className="flex items-center gap-2 cursor-pointer">
                {formData.showOnMap ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
                Show this user on the map
              </Label>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              When enabled, this user will be visible to visitors on the public map.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <Link href="/dashboard/map-users">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Map User
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditMapUserPage;
