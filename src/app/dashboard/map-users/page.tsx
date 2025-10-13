'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMapUsers, useDeleteMapUser, useToggleMapUserVisibility } from '@/hooks/useMapUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { MapUser, MapUserQuery } from '@/services/mapuser.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Filter,
    MapPin,
    Phone,
    Calendar,
    Building,
    Map
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

const MapUsersPage: React.FC = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [visibilityFilter, setVisibilityFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [selectedMapUser, setSelectedMapUser] = useState<MapUser | null>(null);    // Debounce search term with 1000ms delay
    const debouncedSearchTerm = useDebounce(searchTerm, 1000);

    // Use ref to track previous debounced search term to prevent jitter
    const prevDebouncedSearchRef = useRef(debouncedSearchTerm);

    const queryParams: MapUserQuery = {
        search: debouncedSearchTerm || undefined,
        showOnMap: visibilityFilter === 'visible' ? true : visibilityFilter === 'hidden' ? false : undefined,
        page: currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    };

    const { data, isLoading, error } = useMapUsers(queryParams);
    const deleteMapUserMutation = useDeleteMapUser();
    const toggleVisibilityMutation = useToggleMapUserVisibility();

    // Reset to first page only when debounced search term actually changes
    useEffect(() => {
        if (debouncedSearchTerm !== prevDebouncedSearchRef.current) {
            setCurrentPage(1);
            prevDebouncedSearchRef.current = debouncedSearchTerm;
        }
    }, [debouncedSearchTerm]);

    const mapUsers = data?.data || [];
    const pagination = data?.pagination; const handleSearch = () => {
        setCurrentPage(1);
    };

    const handleDelete = (mapUser: MapUser) => {
        setSelectedMapUser(mapUser);
        setShowDeleteConfirm(mapUser.id);
    };

    const confirmDelete = () => {
        if (showDeleteConfirm) {
            deleteMapUserMutation.mutate(showDeleteConfirm);
            setShowDeleteConfirm(null);
            setSelectedMapUser(null);
        }
    };

    const handleToggleVisibility = (mapUser: MapUser) => {
        toggleVisibilityMutation.mutate({
            id: mapUser.id,
            showOnMap: !mapUser.showOnMap
        });
    };

    const getVisibilityBadge = (showOnMap: boolean) => {
        if (showOnMap) {
            return (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Eye className="h-3 w-3 mr-1" />
                    Visible
                </Badge>
            );
        }
        return (
            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                <EyeOff className="h-3 w-3 mr-1" />
                Hidden
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setVisibilityFilter('');
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Error loading map users. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>

                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Map className="h-8 w-8 text-blue-600" />
                        Map Users Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage users displayed on the map
                    </p>


                </div>
                <Link href="/dashboard/map-users/create">
                    <Button className="!bg-blue-600 hover:!bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Map User
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />                                <Input
                                    placeholder="Search by name, phone, location, or clinic..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Button onClick={handleSearch} className="sm:w-auto">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                        {(searchTerm || visibilityFilter) && (
                            <Button variant="outline" onClick={resetFilters}>
                                <Filter className="h-4 w-4 mr-2" />
                                Clear
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>            {/* Map Users Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Visibility
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date Added
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mapUsers.map((mapUser: MapUser) => (
                                    <tr key={mapUser.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {mapUser.firstName} {mapUser.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                                    <Building className="h-4 w-4 mr-1" />
                                                    {mapUser.clinicName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                                {mapUser.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap truncate max-w-[200px]">
                                            <div className="text-sm text-gray-900 flex items-center ">
                                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                                {mapUser.location} - {mapUser.zipCode}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getVisibilityBadge(mapUser.showOnMap)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                {formatDate(mapUser.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link href={`/dashboard/map-users/${mapUser.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleVisibility(mapUser)}
                                                    className={mapUser.showOnMap ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                                                >
                                                    {mapUser.showOnMap ? (
                                                        <>
                                                            <EyeOff className="h-4 w-4 mr-1" />
                                                            Hide
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Show
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(mapUser)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Empty State */}
            {mapUsers.length === 0 && (
                <div className="text-center py-12">
                    <Map className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No map users</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || visibilityFilter
                            ? 'No map users found matching your criteria.'
                            : 'Get started by creating a new map user.'}
                    </p>
                    {!searchTerm && !visibilityFilter && (
                        <div className="mt-6">
                            <Link href="/dashboard/map-users/create">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Map User
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} results
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={!!showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(null);
                    setSelectedMapUser(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Map User"
                message={`Are you sure you want to delete ${selectedMapUser?.firstName} ${selectedMapUser?.lastName}? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
                loading={deleteMapUserMutation.isPending}
            />
        </div>
    );
};

export default MapUsersPage;
