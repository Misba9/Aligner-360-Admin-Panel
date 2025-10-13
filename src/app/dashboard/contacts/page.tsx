'use client'

import axiosInstance from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

interface Contact {
    id: string
    name: string
    email: string
    subject: string
    message: string
}

interface PaginationData {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNext: boolean
    hasPrev: boolean
}

interface ContactsResponse {
    data: Contact[]
    pagination: PaginationData
}

const Contacts = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [limit] = useState(10)

    const { data, isLoading } = useQuery({
        queryKey: ['contacts', currentPage, limit],
        queryFn: async () => {
            const response = await axiosInstance.get<ContactsResponse>(`/user/contacts?page=${currentPage}&limit=${limit}`)
            return response.data
        }
    })

    const contacts = data?.data || []
    const pagination = data?.pagination

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const renderPaginationButtons = () => {
        if (!pagination) return null

        const buttons = []
        const { currentPage, totalPages } = pagination

        // Previous button
        buttons.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className={`px-3 py-2 text-sm font-medium rounded-md ${pagination.hasPrev
                    ? 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    : 'text-gray-300 bg-gray-100 border border-gray-200 cursor-not-allowed'
                    }`}
            >
                Previous
            </button>
        )

        // Page numbers
        const startPage = Math.max(1, currentPage - 2)
        const endPage = Math.min(totalPages, currentPage + 2)

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${i === currentPage
                        ? 'text-white bg-blue-600 border border-blue-600'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    {i}
                </button>
            )
        }

        // Next button
        buttons.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className={`px-3 py-2 text-sm font-medium rounded-md ${pagination.hasNext
                    ? 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    : 'text-gray-300 bg-gray-100 border border-gray-200 cursor-not-allowed'
                    }`}
            >
                Next
            </button>
        )

        return buttons
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading...</p>
                    <p className="mt-2 text-sm text-gray-500">Getting contact messages...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
                    <p className="mt-2 text-gray-600">Manage all contact form submissions</p>
                </div>

                {contacts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m-2 0a2 2 0 002 2v-5a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
                        <p className="text-gray-500">Contact messages will appear here when users submit the contact form.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                All Contacts ({pagination?.totalItems || 0})
                            </h2>
                            {pagination && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                                    {pagination.totalItems} results
                                </p>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Message
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {contacts.map((contact) => (
                                        <tr key={contact.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {contact.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{contact.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {contact.subject}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500 max-w-md truncate">
                                                    {contact.message}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                    onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                                                >
                                                    Reply
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </div>
                                    <div className="flex space-x-2">
                                        {renderPaginationButtons()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Contacts