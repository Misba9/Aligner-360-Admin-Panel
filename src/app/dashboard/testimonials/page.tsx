'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import axiosInstance from "@/lib/axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
type Testimonial = {
    id: string
    name: string
    imageUrl: string
    message: string
}
const Testimonials = () => {
    const [credentials, setCredentials] = useState<{
        name: string;
        message: string;
        image: File | null;
    }>({
        name: '',
        message: '',
        image: null,
    })
    const [isCreating, setIsCreating] = useState(false)
    const queryClient = useQueryClient()

    const { data, isLoading, error } = useQuery({
        queryKey: ['testimonials'],
        queryFn: async () => {
            const response = await axiosInstance.get<{ data: Testimonial[] }>('/testimonial')
            return response.data
        },
    })

    const testimonials = data?.data || []

    const createTestimonialMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axiosInstance.post('/testimonial', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] })
            toast.success('Testimonial created successfully')
            setIsCreating(false);
        }, onError: (error: any) => {
            toast.error(error.response?.data?.message || error.message || 'Failed to create testimonial')
            setIsCreating(false);
        }
    })
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', credentials.name);
        formData.append('message', credentials.message);
        if (credentials.image) {
            formData.append('file', credentials.image);
        }
        await createTestimonialMutation.mutateAsync(formData);
        setIsCreating(false);
        setCredentials({ name: '', message: '', image: null });
    };

    const deleteTestimonialMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await axiosInstance.delete(`/testimonial/${id}`)
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] })
            toast.success('Testimonial deleted successfully')
        }, onError: (error: any) => {
            toast.error(error.response?.data?.message || error.message || 'Failed to delete testimonial')
        }
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, files } = e.target as HTMLInputElement;
        if (type === 'file' && files && files.length > 0) {
            setCredentials((prevState) => ({
                ...prevState,
                [name]: files[0],
            }));
        } else {
            setCredentials((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading testimonials</h3>
                    <p className="text-gray-500 mb-4">Please try refreshing the page</p>
                    <Button onClick={() => window.location.reload()}>Refresh</Button>
                </div>
            </div>
        )
    }
    return (
        <div>
            <header className="flex items-center justify-between gap-4 mt-4">
                <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
                <Button variant={'outline'} onClick={() => setIsCreating(true)}>Create Testimonial</Button>
            </header>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 mt-20">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Image
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Message
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Delete
                            </th>

                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(!testimonials || testimonials.length === 0) ? (
                            <tr className="bg-white">
                                <td colSpan={4} className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-gray-900 text-center text-xl">No testimonials found</div>
                                </td>
                            </tr>
                        ) : (
                            testimonials?.map((testimonial) => (
                                <tr key={testimonial.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            <img src={testimonial.imageUrl} alt="Testimonial" className="w-10 h-10 rounded-full" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500 max-w-md truncate">
                                            {testimonial.message}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            className="!bg-red-500 text-white cursor-pointer"
                                            disabled={deleteTestimonialMutation.isPending && deleteTestimonialMutation.variables === testimonial.id}
                                            variant={'destructive'} onClick={() => deleteTestimonialMutation.mutate(testimonial.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


            {
                isCreating && (
                    <div className="fixed inset-0 z-50 overflow-y-auto min-h-screen backdrop-blur flex items-center justify-center">
                        <Card className="p-6 relative bg-white w-full max-w-md">
                            <button onClick={() => setIsCreating(false)} className="absolute cursor-pointer top-3 right-3">
                                <X className="h-6 w-6" />
                            </button>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                                        Name
                                    </label>
                                    <Input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={credentials.name}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900">
                                        Message
                                    </label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        rows={3}
                                        value={credentials.message}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget risus sollicitudin..."
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="image" className="block mb-2 text-sm font-medium text-gray-900">
                                        Image
                                    </label>
                                    <Input
                                        type="file"
                                        name="image"
                                        id="image"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className="block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <Button type="submit" className="w-full !bg-blue-600 !text-white" disabled={createTestimonialMutation.isPending}>
                                    {createTestimonialMutation.isPending ? 'Creating...' : 'Create'}
                                </Button>
                            </form>
                        </Card>
                    </div>
                )
            }
        </div>
    )
}

export default Testimonials