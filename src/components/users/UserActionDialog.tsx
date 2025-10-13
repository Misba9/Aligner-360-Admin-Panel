'use client';

import React from 'react';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

interface UserActionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    action: 'delete' | 'activate' | 'deactivate' | 'showOnMap' | 'hideFromMap';
    userName: string;
    loading?: boolean;
}

export const UserActionDialog: React.FC<UserActionDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    action,
    userName,
    loading = false
}) => {
    const getDialogConfig = () => {
        switch (action) {
            case 'delete':
                return {
                    title: 'Delete User',
                    message: `Are you sure you want to delete ${userName}? This action cannot be undone.`,
                    confirmText: 'Delete',
                    variant: 'danger' as const
                }; case 'activate':
                return {
                    title: 'Activate User',
                    message: `Are you sure you want to activate ${userName}?`,
                    confirmText: 'Activate',
                    variant: 'info' as const
                };
            case 'deactivate':
                return {
                    title: 'Deactivate User',
                    message: `Are you sure you want to deactivate ${userName}?`,
                    confirmText: 'Deactivate',
                    variant: 'warning' as const
                };
            case 'showOnMap':
                return {
                    title: 'Show User on Map',
                    message: `Are you sure you want to make ${userName} visible on the map?`,
                    confirmText: 'Show on Map',
                    variant: 'info' as const
                };
            case 'hideFromMap':
                return {
                    title: 'Hide User from Map',
                    message: `Are you sure you want to hide ${userName} from the map?`,
                    confirmText: 'Hide from Map',
                    variant: 'warning' as const
                };
            default:
                return {
                    title: 'Confirm Action',
                    message: `Are you sure you want to perform this action on ${userName}?`,
                    confirmText: 'Confirm',
                    variant: 'info' as const
                };
        }
    };

    const config = getDialogConfig();

    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={config.title}
            message={config.message}
            confirmText={config.confirmText}
            variant={config.variant}
            loading={loading}
        />
    );
};
