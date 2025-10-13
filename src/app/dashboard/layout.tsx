'use client'

import SidebarLayout from '@/components/layout/SidebarLayout';
import axiosInstance from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const router = useRouter()
    const { data: user, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await axiosInstance.get('/auth/get-logged-in-user')
            return response.data
        }
    })
    if (isLoading) {
        return (<div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Loading...</p>
                <p className="mt-2 text-sm text-gray-500">Please wait while we are authenticating you...</p>
            </div>
        </div>)
    }
    if (!user && !isLoading) {
        router.push('/login')
        return null;
    }
    return (
        <SidebarLayout>
            {children}
        </SidebarLayout>
    );
};

export default DashboardLayout;
