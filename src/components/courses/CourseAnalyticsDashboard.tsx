'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminCourseService } from '@/services/course.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    TrendingUp,
    Users,
    BookOpen,
    DollarSign,
    Star,
    Clock,
    Award,
    BarChart3
} from 'lucide-react';

interface CourseAnalytics {
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    averageRating: number;
    completionRate: number;
    totalHoursDelivered: number;
    topPerformingCourse: {
        title: string;
        enrollments: number;
    };
    recentEnrollments: number;
}

export const CourseAnalyticsDashboard: React.FC = () => {
    // Fetch course analytics
    const { data: analyticsData, isLoading } = useQuery({
        queryKey: ['course-analytics'],
        queryFn: async () => {
            // Mock data - in real implementation, this would call your analytics API
            const mockAnalytics: CourseAnalytics = {
                totalCourses: 24,
                totalEnrollments: 1847,
                totalRevenue: 45780,
                averageRating: 4.6,
                completionRate: 78.5,
                totalHoursDelivered: 12450,
                topPerformingCourse: {
                    title: 'Advanced Dental Implant Procedures',
                    enrollments: 234
                },
                recentEnrollments: 47
            };

            return mockAnalytics;
        },
    });

    const analytics = analyticsData;

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Analytics Unavailable
                </h3>
                <p className="text-gray-600">
                    Unable to load course analytics at this time.
                </p>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Analytics</h2>
                <p className="text-gray-600">Overview of your course performance and metrics</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Courses */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalCourses}</div>
                        <p className="text-xs text-muted-foreground">
                            +2 from last month
                        </p>
                    </CardContent>
                </Card>

                {/* Total Enrollments */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(analytics.totalEnrollments)}</div>
                        <p className="text-xs text-muted-foreground">
                            +{analytics.recentEnrollments} this week
                        </p>
                    </CardContent>
                </Card>

                {/* Total Revenue */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            +12.5% from last month
                        </p>
                    </CardContent>
                </Card>

                {/* Average Rating */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">
                            ⭐ Excellent feedback
                        </p>
                    </CardContent>
                </Card>

                {/* Completion Rate */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.completionRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Above industry average
                        </p>
                    </CardContent>
                </Card>

                {/* Total Hours Delivered */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hours Delivered</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(analytics.totalHoursDelivered)}</div>
                        <p className="text-xs text-muted-foreground">
                            Educational content hours
                        </p>
                    </CardContent>
                </Card>

                {/* Top Performing Course */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Performing Course</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold mb-1">{analytics.topPerformingCourse.title}</div>
                        <p className="text-sm text-muted-foreground">
                            {formatNumber(analytics.topPerformingCourse.enrollments)} enrollments
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Enrollment Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Enrollment Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                                <p>Chart component would go here</p>
                                <p className="text-sm">Integration with charting library needed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">General Dentistry</span>
                                <span className="font-semibold">{formatCurrency(18450)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Orthodontics</span>
                                <span className="font-semibold">{formatCurrency(12300)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Oral Surgery</span>
                                <span className="font-semibold">{formatCurrency(9870)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Endodontics</span>
                                <span className="font-semibold">{formatCurrency(5160)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between items-center font-semibold">
                                    <span>Total Revenue</span>
                                    <span>{formatCurrency(analytics.totalRevenue)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CourseAnalyticsDashboard;
