import { PropertyModel } from '../Models/PropertyModel.js';
import { LeadsModel } from '../Models/LeadsModel.js';
import { UsersModel } from '../Models/UsersModel.js';
import { FollowUpStatusModel } from '../Models/FollowUpStatusModel.js';
import { LeadStatusModel } from '../Models/LeadStatusModel.js';
import { MeetingScheduleModel } from '../Models/MeetingScheduleModel.js';
import { RentalBookingModel } from '../Models/booking/RentalBookingModel.js';
import { PurchaseBookingModel } from '../Models/booking/PurchaseBookingModel.js';
import { MeetingScheduleStatusModel } from '../Models/MeetingScheduleStatusModel.js';

export class DashboardController {
    // Get overall dashboard statistics
    static async getDashboardOverview(req, res) {
        try {
            const userId = req.user.id || req.user._id;
            const userRole = req.user.role;
            // Apply Filtering based on Role
            const isSales = userRole?.toLowerCase() === 'sales' || userRole?.toLowerCase() === 'sales person';
            const isExecutive = userRole?.toLowerCase() === 'executive';

            // Get all properties
            let propertyQuery = { published: true };
            // For now, everyone sees all published properties, but we could filter by creator if needed
            // if (isExecutive) propertyQuery.createdByUserId = userId;

            const allProperties = await PropertyModel.find(propertyQuery);
            const soldProperties = allProperties.filter(
                p => (p.propertyStatus || '').trim().toLowerCase() === 'sold'
            );
            const unsoldProperties = allProperties.filter(
                p => (p.propertyStatus || '').trim().toLowerCase() !== 'sold'
            );
            const totalSales = soldProperties.reduce((sum, prop) => sum + (prop.price || 0), 0);

            // Debugging logs


            // Get counts
            let leadQuery = { published: true };
            if (isSales) {
                leadQuery.assignedToUserId = userId;
            } else if (isExecutive) {
                leadQuery.createdByUserId = userId;
            }

            const allLeads = await LeadsModel.find(leadQuery).populate('leadStatus followUpStatus');
            const totalLeads = allLeads.length;

            const activeLeads = allLeads.filter(lead => {
                let statusVal = null;
                if (typeof lead.leadStatus === 'string') {
                    statusVal = lead.leadStatus;
                } else if (lead.leadStatus && lead.leadStatus.name) {
                    statusVal = lead.leadStatus.name;
                }

                if (!statusVal) return false;
                const lowerStatus = statusVal.toLowerCase();
                return lowerStatus === 'active' ||
                    lowerStatus === 'warm' ||
                    lowerStatus === 'urgent' ||
                    lowerStatus === 'high budget' ||
                    lowerStatus === 'low budget' ||
                    lowerStatus === 'ready to move' ||
                    lowerStatus === 'in progress';
            }).length;

            const pendingFollowups = allLeads.filter(lead => {
                if (typeof lead.followUpStatus === 'string') {
                    return lead.followUpStatus.toLowerCase() === 'pending';
                } else if (lead.followUpStatus && lead.followUpStatus.name) {
                    return lead.followUpStatus.name.toLowerCase() === 'pending';
                }
                return false;
            }).length;

            const totalUsers = await UsersModel.countDocuments({ published: true });

            // Get booking counts
            const totalRentalBookings = await RentalBookingModel.countDocuments({ published: true });
            const totalPurchaseBookings = await PurchaseBookingModel.countDocuments({ published: true });

            // Get role-wise customer counts
            const users = await UsersModel.find({ published: true }).populate('role');
            const roleWiseCustomers = {};
            users.forEach(user => {
                let role = 'unknown';
                if (user.role && typeof user.role === 'object') {
                    role = user.role.name || 'unknown';
                } else if (typeof user.role === 'string') {
                    role = user.role;
                }
                roleWiseCustomers[role] = (roleWiseCustomers[role] || 0) + 1;
            });

            // Calculate average rating (placeholder for now)
            const averageRating = 4.5;

            // Get today's and tomorrow's schedules
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dayAfterTomorrow = new Date(today);
            dayAfterTomorrow.setDate(today.getDate() + 2);

            // Get status IDs for Cancelled and Completed to exclude them
            const inactiveStatuses = await MeetingScheduleStatusModel.find({
                statusCode: { $in: [2, 3] }
            }, '_id');
            const inactiveStatusIds = inactiveStatuses.map(s => s._id);

            let scheduleFilter = {
                status: { $nin: inactiveStatusIds },
                published: true
            };

            if (isSales) {
                scheduleFilter.salesPersonId = userId;
            } else if (isExecutive) {
                scheduleFilter.executiveId = userId;
            }

            const todaySchedules = await MeetingScheduleModel.countDocuments({
                ...scheduleFilter,
                meetingDate: {
                    $gte: today,
                    $lt: tomorrow
                }
            });

            const tomorrowSchedules = await MeetingScheduleModel.countDocuments({
                ...scheduleFilter,
                meetingDate: {
                    $gte: tomorrow,
                    $lt: dayAfterTomorrow
                }
            });

            const newLeads = allLeads.filter(lead => {
                let statusVal = null;
                if (typeof lead.leadStatus === 'string') {
                    statusVal = lead.leadStatus;
                } else if (lead.leadStatus && lead.leadStatus.name) {
                    statusVal = lead.leadStatus.name;
                }

                if (!statusVal) return false;
                const lowerStatus = statusVal.toLowerCase();
                return lowerStatus === 'new' ||
                    lowerStatus === 'new lead' ||
                    lowerStatus === 'inquiry only' ||
                    lowerStatus === 'interested';
            }).length;

            const completedLeads = allLeads.filter(lead => {
                let statusVal = null;
                if (typeof lead.leadStatus === 'string') {
                    statusVal = lead.leadStatus;
                } else if (lead.leadStatus && lead.leadStatus.name) {
                    statusVal = lead.leadStatus.name;
                }

                if (!statusVal) return false;
                const lowerStatus = statusVal.toLowerCase();
                return lowerStatus === 'completed' ||
                    lowerStatus === 'closed' ||
                    lowerStatus === 'sold';
            }).length;

            res.status(200).json({
                statusCode: 200,
                message: 'Dashboard overview retrieved successfully',
                data: {
                    totalProperties: allProperties.length,
                    soldProperties: soldProperties.length,
                    unsoldProperties: unsoldProperties.length,
                    totalSales,
                    totalLeads,
                    totalUsers,
                    totalRentalBookings,
                    totalPurchaseBookings,
                    roleWiseCustomers,
                    activeLeads,
                    newLeads,
                    completedLeads,
                    pendingFollowups,
                    averageRating,
                    todaySchedules,
                    tomorrowSchedules
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving dashboard overview',
                error: error.message
            });
        }
    }

    // Get detailed property analytics
    static async getPropertyAnalytics(req, res) {
        try {
            const timeFrame = req.query.timeFrame || '12M';
            const months = DashboardController._getMonthsFromTimeFrame(timeFrame);

            const currentDate = new Date();
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - months, 1);

            let properties = await PropertyModel.find({ published: true }).populate('propertyTypeId');

            // Filter properties based on timeFrame
            properties = properties.filter(prop => {
                const propDate = new Date(prop.createdAt);
                return propDate >= startDate && propDate <= currentDate;
            });

            // Property status distribution
            const statusDistribution = {};
            properties.forEach(prop => {
                const status = prop.propertyStatus || 'unknown';
                statusDistribution[status] = (statusDistribution[status] || 0) + 1;
            });

            // Property type distribution
            const typeDistribution = {};
            properties.forEach(prop => {
                const type = prop.propertyTypeId?.typeName || 'unknown';
                typeDistribution[type] = (typeDistribution[type] || 0) + 1;
            });

            // Price range distribution
            const priceRanges = {
                '0-50L': 0,
                '50L-1Cr': 0,
                '1Cr-2Cr': 0,
                '2Cr-5Cr': 0,
                '5Cr+': 0
            };

            properties.forEach(prop => {
                const price = prop.price || 0;
                if (price <= 5000000) priceRanges['0-50L']++;
                else if (price <= 10000000) priceRanges['50L-1Cr']++;
                else if (price <= 20000000) priceRanges['1Cr-2Cr']++;
                else if (price <= 50000000) priceRanges['2Cr-5Cr']++;
                else priceRanges['5Cr+']++;
            });

            // Recent properties are now equal to all filtered properties for this timeframe
            const recentProperties = properties;

            // Sold, active, and total value
            const soldProperties = properties.filter(
                p => (p.propertyStatus || '').trim().toLowerCase() === 'sold'
            ).length;
            const activeProperties = properties.filter(
                p => (p.propertyStatus || '').trim().toLowerCase() === 'active'
            ).length;
            const totalValue = properties.reduce((sum, prop) => sum + (prop.price || 0), 0);

            // Property type sales analysis
            const propertyTypeSales = {};
            properties.forEach(prop => {
                const type = prop.propertyTypeId?.typeName || 'unknown';
                if (!propertyTypeSales[type]) {
                    propertyTypeSales[type] = {
                        totalSales: 0,
                        count: 0,
                        averagePrice: 0
                    };
                }
                propertyTypeSales[type].totalSales += prop.price || 0;
                propertyTypeSales[type].count += 1;
            });

            // Calculate average price for each type
            Object.keys(propertyTypeSales).forEach(type => {
                if (propertyTypeSales[type].count > 0) {
                    propertyTypeSales[type].averagePrice = propertyTypeSales[type].totalSales / propertyTypeSales[type].count;
                }
            });

            // Sort by total sales (descending)
            const sortedPropertyTypeSales = Object.entries(propertyTypeSales)
                .sort(([, a], [, b]) => b.totalSales - a.totalSales)
                .reduce((obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                }, {});

            res.status(200).json({
                statusCode: 200,
                message: 'Property analytics retrieved successfully',
                data: {
                    totalProperties: properties.length,
                    soldProperties,
                    activeProperties,
                    totalValue,
                    statusDistribution,
                    typeDistribution,
                    priceRanges,
                    propertyTypeSales: sortedPropertyTypeSales,
                    averagePrice: properties.length > 0 ?
                        properties.reduce((sum, prop) => sum + (prop.price || 0), 0) / properties.length : 0,
                    recentProperties: recentProperties.length,
                    timeFrame
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving property analytics',
                error: error.message
            });
        }
    }

    // Get detailed lead analytics
    static async getLeadAnalytics(req, res) {
        try {
            const timeFrame = req.query.timeFrame || '12M';
            const months = DashboardController._getMonthsFromTimeFrame(timeFrame);
            //console.log('LEAD ANALYTICS DEBUG: timeFrame =', timeFrame, 'months =', months);

            const currentDate = new Date();
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - months, 1);

            let leads = await LeadsModel.find({ published: true }).populate('leadStatus followUpStatus userId');

            // Filter leads based on timeFrame
            leads = leads.filter(lead => {
                const leadDate = new Date(lead.createdAt);
                return leadDate >= startDate && leadDate <= currentDate;
            });
            //console.log('LEAD ANALYTICS DEBUG: leads count =', leads.length);

            // Lead status distribution
            const allLeadStatuses = await LeadStatusModel.find({ published: true });
            const statusDistribution = {};
            allLeadStatuses.forEach(s => {
                statusDistribution[s.name] = 0;
            });

            leads.forEach(lead => {
                let status = 'unknown';
                if (typeof lead.leadStatus === 'string') {
                    status = lead.leadStatus;
                } else if (lead.leadStatus && lead.leadStatus.name) {
                    status = lead.leadStatus.name;
                }
                statusDistribution[status] = (statusDistribution[status] || 0) + 1;
            });

            // Lead designation distribution
            const designationDistribution = {};
            leads.forEach(lead => {
                const designation = lead.leadDesignation || 'unknown';
                designationDistribution[designation] = (designationDistribution[designation] || 0) + 1;
            });

            // Follow-up status distribution
            const allFollowUpStatuses = await FollowUpStatusModel.find({ published: true });
            const followUpDistribution = {};
            allFollowUpStatuses.forEach(s => {
                followUpDistribution[s.name] = 0;
            });

            leads.forEach(lead => {
                let followUp = 'unknown';
                if (typeof lead.followUpStatus === 'string') {
                    followUp = lead.followUpStatus;
                } else if (lead.followUpStatus && lead.followUpStatus.name) {
                    followUp = lead.followUpStatus.name;
                }
                followUpDistribution[followUp] = (followUpDistribution[followUp] || 0) + 1;
            });

            // Recent leads are now the top 5 of the filtered leads
            const recentLeads = leads.slice(0, 5); // Get only first 5 recent leads

            // Lead conversion rate (leads that became properties)
            const convertedLeads = leads.filter(lead => {
                let leadStatus = '';
                if (typeof lead.leadStatus === 'string') {
                    leadStatus = lead.leadStatus;
                } else if (lead.leadStatus && lead.leadStatus.name) {
                    leadStatus = lead.leadStatus.name;
                }
                return leadStatus === 'converted' || leadStatus === 'closed';
            }).length;

            // console.log('LEAD ANALYTICS DEBUG: Response data =', {
            //     totalLeads: leads.length,
            //     statusDistribution,
            //     designationDistribution,
            //     followUpDistribution,
            //     recentLeads: recentLeads.length,
            //     convertedLeads,
            //     conversionRate: leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0,
            //     timeFrame
            // });

            res.status(200).json({
                statusCode: 200,
                message: 'Lead analytics retrieved successfully',
                data: {
                    totalLeads: leads.length,
                    statusDistribution,
                    designationDistribution,
                    followUpDistribution,
                    recentLeads: recentLeads.length,
                    recentLeadsList: recentLeads,
                    convertedLeads,
                    conversionRate: leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0,
                    timeFrame
                }
            });
        } catch (error) {
            //console.error('LEAD ANALYTICS ERROR:', error);
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving lead analytics',
                error: error.message
            });
        }
    }

    // Get sales analytics
    static async getSalesAnalytics(req, res) {
        try {
            const timeFrame = req.query.timeFrame || '12M';
            // Use the correct reference for the helper
            const months = DashboardController._getMonthsFromTimeFrame(timeFrame);
            //console.log('SALES ANALYTICS DEBUG: timeFrame =', timeFrame, 'months =', months);

            const currentDate = new Date();
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - months, 1);

            let soldProperties = await PropertyModel.find({
                propertyStatus: 'SOLD',
                published: true
            });

            // Filter properties based on timeFrame
            soldProperties = soldProperties.filter(prop => {
                const soldDate = new Date(prop.updatedAt || prop.createdAt);
                return soldDate >= startDate && soldDate <= currentDate;
            });
            //console.log('SALES ANALYTICS DEBUG: soldProperties count =', soldProperties.length);

            // Monthly performance for the specified time frame
            const monthlyPerformance = {};

            for (let i = 0; i < months; i++) {
                const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const monthKey = month.toISOString().slice(0, 7); // YYYY-MM format
                monthlyPerformance[monthKey] = {
                    propertiesSold: 0,
                    revenue: 0
                };
            }

            soldProperties.forEach(prop => {
                const soldDate = new Date(prop.updatedAt || prop.createdAt);
                const monthKey = soldDate.toISOString().slice(0, 7);

                if (monthlyPerformance[monthKey]) {
                    monthlyPerformance[monthKey].propertiesSold++;
                    monthlyPerformance[monthKey].revenue += prop.price || 0;
                }
            });

            // Total revenue
            const totalRevenue = soldProperties.reduce((sum, prop) => sum + (prop.price || 0), 0);

            // Average sale price
            const averageSalePrice = soldProperties.length > 0 ?
                totalRevenue / soldProperties.length : 0;

            res.status(200).json({
                statusCode: 200,
                message: 'Sales analytics retrieved successfully',
                data: {
                    totalSales: soldProperties.length,
                    totalRevenue,
                    averageSalePrice,
                    monthlyPerformance,
                    timeFrame
                }
            });
        } catch (error) {
            // console.error('SALES ANALYTICS ERROR:', error);
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving sales analytics',
                error: error.message
            });
        }
    }

    // Get user performance analytics
    static async getUserAnalytics(req, res) {
        try {
            const users = await UsersModel.find({ published: true });
            const leads = await LeadsModel.find({ published: true }).populate('leadStatus followUpStatus');
            const properties = await PropertyModel.find({ published: true });

            // User role distribution
            const roleDistribution = {};
            users.forEach(user => {
                const role = typeof user.role === 'string' ? user.role : (user.role?.name || 'unknown');
                roleDistribution[role] = (roleDistribution[role] || 0) + 1;
            });

            // User performance (leads assigned to each user)
            const userPerformance = [];
            for (const user of users) {
                const userLeads = leads.filter(lead =>
                    lead.assignedTo === user._id.toString()
                );

                const userProperties = properties.filter(prop =>
                    prop.createdByUserId === user._id.toString()
                );

                userPerformance.push({
                    userId: user._id,
                    userName: `${user.firstName} ${user.lastName}`,
                    totalLeads: userLeads.length,
                    activeLeads: userLeads.filter(lead => {
                        // Handle both ObjectId and string cases for leadStatus
                        if (typeof lead.leadStatus === 'string') {
                            return lead.leadStatus === 'active';
                        } else if (lead.leadStatus && lead.leadStatus.name) {
                            return lead.leadStatus.name === 'active';
                        }
                        return false;
                    }).length,
                    totalProperties: userProperties.length,
                    soldProperties: userProperties.filter(prop => prop.propertyStatus === 'SOLD').length
                });
            }

            res.status(200).json({
                statusCode: 200,
                message: 'User analytics retrieved successfully',
                data: {
                    totalUsers: users.length,
                    roleDistribution,
                    userPerformance
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving user analytics',
                error: error.message
            });
        }
    }

    // Get recent activities
    static async getRecentActivities(req, res) {
        try {
            const recentProperties = await PropertyModel.find({ published: true })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('propertyTypeId');

            const recentLeads = await LeadsModel.find({ published: true })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('leadStatus followUpStatus');

            const activities = [];

            // Add property activities
            recentProperties.forEach(prop => {
                activities.push({
                    type: 'property',
                    title: `Property ${prop.propertyStatus === 'SOLD' ? 'Sold' : 'Listed'}`,
                    subtitle: prop.name,
                    description: `${prop.propertyTypeId?.name || 'Property'} - ${prop.propertyStatus}`,
                    time: prop.createdAt,
                    data: prop
                });
            });

            // Add lead activities
            recentLeads.forEach(lead => {
                activities.push({
                    type: 'lead',
                    title: 'New Lead Added',
                    subtitle: `${lead.fullName} - ${lead.leadDesignation}`,
                    description: `Lead status: ${typeof lead.leadStatus === 'string' ? lead.leadStatus : (lead.leadStatus?.name || 'unknown')}`,
                    time: lead.createdAt,
                    data: lead
                });
            });

            // Sort by time (most recent first)
            activities.sort((a, b) => new Date(b.time) - new Date(a.time));

            res.status(200).json({
                statusCode: 200,
                message: 'Recent activities retrieved successfully',
                data: activities.slice(0, 15) // Return top 15 activities
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving recent activities',
                error: error.message
            });
        }
    }

    // Get weekly performance data
    static async getWeeklyPerformance(req, res) {
        try {
            const currentDate = new Date();
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
            weekStart.setHours(0, 0, 0, 0);

            const weekData = [];
            for (let i = 0; i < 7; i++) {
                const dayStart = new Date(weekStart);
                dayStart.setDate(weekStart.getDate() + i);
                const dayEnd = new Date(dayStart);
                dayEnd.setDate(dayStart.getDate() + 1);

                // Count properties created on this day
                const propertiesCount = await PropertyModel.countDocuments({
                    createdAt: { $gte: dayStart, $lt: dayEnd },
                    published: true
                });

                // Count leads created on this day
                const leadsCount = await LeadsModel.countDocuments({
                    createdAt: { $gte: dayStart, $lt: dayEnd },
                    published: true
                });

                weekData.push({
                    day: dayStart.toISOString().slice(0, 10),
                    dayName: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
                    properties: propertiesCount,
                    leads: leadsCount,
                    total: propertiesCount + leadsCount
                });
            }

            res.status(200).json({
                statusCode: 200,
                message: 'Weekly performance data retrieved successfully',
                data: weekData
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving weekly performance data',
                error: error.message
            });
        }
    }

    // Get monthly trends
    static async getMonthlyTrends(req, res) {
        try {
            const currentDate = new Date();
            const trends = [];

            for (let i = 0; i < 6; i++) {
                const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);

                const propertiesCount = await PropertyModel.countDocuments({
                    createdAt: { $gte: monthStart, $lt: monthEnd },
                    published: true
                });

                const leadsCount = await LeadsModel.countDocuments({
                    createdAt: { $gte: monthStart, $lt: monthEnd },
                    published: true
                });

                const soldProperties = await PropertyModel.find({
                    propertyStatus: 'SOLD',
                    updatedAt: { $gte: monthStart, $lt: monthEnd },
                    published: true
                });

                const monthlyRevenue = soldProperties.reduce((sum, prop) => sum + (prop.price || 0), 0);

                trends.push({
                    month: monthStart.toISOString().slice(0, 7),
                    monthName: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                    properties: propertiesCount,
                    leads: leadsCount,
                    soldProperties: soldProperties.length,
                    revenue: monthlyRevenue
                });
            }

            res.status(200).json({
                statusCode: 200,
                message: 'Monthly trends retrieved successfully',
                data: trends.reverse() // Return in chronological order
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving monthly trends',
                error: error.message
            });
        }
    }

    // Get top performing properties
    static async getTopProperties(req, res) {
        try {
            const topProperties = await PropertyModel.find({ published: true })
                .sort({ price: -1 })
                .limit(10)
                .populate('propertyType');

            const topViewedProperties = await PropertyModel.find({ published: true })
                .sort({ views: -1 })
                .limit(10)
                .populate('propertyType');

            res.status(200).json({
                statusCode: 200,
                message: 'Top properties retrieved successfully',
                data: {
                    topByPrice: topProperties,
                    topByViews: topViewedProperties
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving top properties',
                error: error.message
            });
        }
    }

    // Get lead conversion rates
    static async getLeadConversionRates(req, res) {
        try {
            const leads = await LeadsModel.find({ published: true }).populate('leadStatus followUpStatus');

            const totalLeads = leads.length;
            const convertedLeads = leads.filter(lead => {
                let statusVal = null;
                if (typeof lead.leadStatus === 'string') {
                    statusVal = lead.leadStatus;
                } else if (lead.leadStatus && lead.leadStatus.name) {
                    statusVal = lead.leadStatus.name;
                }
                return statusVal && (statusVal.toLowerCase() === 'converted' || statusVal.toLowerCase() === 'closed');
            }).length;

            const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

            // Conversion by lead designation
            const designationConversion = {};
            const designations = [...new Set(leads.map(lead => lead.leadDesignation))];

            designations.forEach(designation => {
                const designationLeads = leads.filter(lead => lead.leadDesignation === designation);
                const converted = designationLeads.filter(lead => {
                    let statusVal = null;
                    if (typeof lead.leadStatus === 'string') {
                        statusVal = lead.leadStatus;
                    } else if (lead.leadStatus && lead.leadStatus.name) {
                        statusVal = lead.leadStatus.name;
                    }
                    return statusVal && (statusVal.toLowerCase() === 'converted' || statusVal.toLowerCase() === 'closed');
                }).length;

                designationConversion[designation] = {
                    total: designationLeads.length,
                    converted: converted,
                    rate: designationLeads.length > 0 ? (converted / designationLeads.length) * 100 : 0
                };
            });

            res.status(200).json({
                statusCode: 200,
                message: 'Lead conversion rates retrieved successfully',
                data: {
                    totalLeads,
                    convertedLeads,
                    conversionRate,
                    designationConversion
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving lead conversion rates',
                error: error.message
            });
        }
    }

    // Get financial summary
    static async getFinancialSummary(req, res) {
        try {
            const soldProperties = await PropertyModel.find({
                propertyStatus: 'SOLD',
                published: true
            });

            const totalRevenue = soldProperties.reduce((sum, prop) => sum + (prop.price || 0), 0);
            const averageSalePrice = soldProperties.length > 0 ?
                totalRevenue / soldProperties.length : 0;

            // Monthly revenue for current year
            const currentYear = new Date().getFullYear();
            const monthlyRevenue = {};

            for (let month = 1; month <= 12; month++) {
                const monthStart = new Date(currentYear, month - 1, 1);
                const monthEnd = new Date(currentYear, month, 1);

                const monthSales = soldProperties.filter(prop => {
                    const soldDate = new Date(prop.updatedAt || prop.createdAt);
                    return soldDate >= monthStart && soldDate < monthEnd;
                });

                monthlyRevenue[month] = monthSales.reduce((sum, prop) => sum + (prop.price || 0), 0);
            }

            res.status(200).json({
                statusCode: 200,
                message: 'Financial summary retrieved successfully',
                data: {
                    totalRevenue,
                    averageSalePrice,
                    totalSales: soldProperties.length,
                    monthlyRevenue
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving financial summary',
                error: error.message
            });
        }
    }

    // Get admin performance analytics (overall company performance)
    static async getAdminPerformanceAnalytics(req, res) {
        try {
            const timeFrame = req.query.timeFrame || '12M';
            const months = DashboardController._getMonthsFromTimeFrame(timeFrame);
            //console.log('ADMIN PERFORMANCE DEBUG: timeFrame =', timeFrame, 'months =', months);

            const currentDate = new Date();
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - months, 1);

            let soldProperties = await PropertyModel.find({
                propertyStatus: 'SOLD',
                published: true
            });

            // Filter properties based on timeFrame
            soldProperties = soldProperties.filter(prop => {
                const soldDate = new Date(prop.updatedAt || prop.createdAt);
                return soldDate >= startDate && soldDate <= currentDate;
            });
            //console.log('ADMIN PERFORMANCE DEBUG: soldProperties count =', soldProperties.length);

            // Monthly performance for the specified time frame
            const monthlyPerformance = {};

            for (let i = 0; i < months; i++) {
                const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const monthKey = month.toISOString().slice(0, 7); // YYYY-MM format
                monthlyPerformance[monthKey] = {
                    propertiesSold: 0,
                    revenue: 0
                };
            }

            soldProperties.forEach(prop => {
                const soldDate = new Date(prop.updatedAt || prop.createdAt);
                const monthKey = soldDate.toISOString().slice(0, 7);

                if (monthlyPerformance[monthKey]) {
                    monthlyPerformance[monthKey].propertiesSold++;
                    monthlyPerformance[monthKey].revenue += prop.price || 0;
                }
            });

            // Total performance metrics
            const totalPropertiesSold = soldProperties.length;
            const totalRevenue = soldProperties.reduce((sum, prop) => sum + (prop.price || 0), 0);
            const averageSalePrice = soldProperties.length > 0 ?
                totalRevenue / soldProperties.length : 0;

            // console.log('ADMIN PERFORMANCE DEBUG: Response data =', {
            //     totalPropertiesSold,
            //     totalRevenue,
            //     averageSalePrice,
            //     monthlyPerformance,
            //     timeFrame
            // });

            res.status(200).json({
                statusCode: 200,
                message: 'Admin performance analytics retrieved successfully',
                data: {
                    totalPropertiesSold,
                    totalRevenue,
                    averageSalePrice,
                    monthlyPerformance,
                    timeFrame
                }
            });
        } catch (error) {
            //console.error('ADMIN PERFORMANCE ERROR:', error);
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving admin performance analytics',
                error: error.message
            });
        }
    }

    // Get sales performance analytics (individual sales person performance)
    static async getSalesPerformanceAnalytics(req, res) {
        try {
            const userId = req.user.id;
            const timeFrame = req.query.timeFrame || '12M';
            const months = DashboardController._getMonthsFromTimeFrame(timeFrame);

            const currentDate = new Date();
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - months, 1);

            // Get leads assigned to this sales person
            let assignedLeads = await LeadsModel.find({
                assignedToUserId: userId,
                published: true
            });

            // Filter leads based on timeframe
            assignedLeads = assignedLeads.filter(lead => {
                const leadDate = new Date(lead.createdAt);
                return leadDate >= startDate && leadDate <= currentDate;
            });

            // Get properties sold by leads assigned to this sales person
            const soldProperties = await PropertyModel.find({
                propertyStatus: 'SOLD',
                published: true
            });

            // Filter properties that were sold by leads assigned to this sales person
            // and within the timeframe
            const userSoldProperties = soldProperties.filter(prop => {
                const soldDate = new Date(prop.updatedAt || prop.createdAt);
                const isWithinTimeframe = soldDate >= startDate && soldDate <= currentDate;

                // Check if any lead assigned to this user resulted in this property sale
                const isUsersSale = assignedLeads.some(lead => {
                    // This is a simplified logic - you might need to adjust based on your data model
                    // For now, we'll assume properties sold by this user's leads
                    return prop.createdByUserId === userId;
                });

                return isWithinTimeframe && isUsersSale;
            });

            // Monthly performance for the specified time frame
            const monthlyPerformance = {};

            for (let i = 0; i < months; i++) {
                const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const monthKey = month.toISOString().slice(0, 7); // YYYY-MM format
                monthlyPerformance[monthKey] = {
                    leadsConverted: 0,
                    propertiesSold: 0,
                    revenue: 0
                };
            }

            // Calculate monthly performance based on assigned leads and their conversions
            assignedLeads.forEach(lead => {
                const leadDate = new Date(lead.createdAt);
                const monthKey = leadDate.toISOString().slice(0, 7);

                if (monthlyPerformance[monthKey]) {
                    monthlyPerformance[monthKey].leadsConverted++;
                }
            });

            userSoldProperties.forEach(prop => {
                const soldDate = new Date(prop.updatedAt || prop.createdAt);
                const monthKey = soldDate.toISOString().slice(0, 7);

                if (monthlyPerformance[monthKey]) {
                    monthlyPerformance[monthKey].propertiesSold++;
                    monthlyPerformance[monthKey].revenue += prop.price || 0;
                }
            });

            // Total performance metrics
            const totalLeadsAssigned = assignedLeads.length;
            const totalPropertiesSold = userSoldProperties.length;
            const totalRevenue = userSoldProperties.reduce((sum, prop) => sum + (prop.price || 0), 0);
            const conversionRate = totalLeadsAssigned > 0 ?
                (totalPropertiesSold / totalLeadsAssigned) * 100 : 0;

            res.status(200).json({
                statusCode: 200,
                message: 'Sales performance analytics retrieved successfully',
                data: {
                    totalLeadsAssigned,
                    totalPropertiesSold,
                    totalRevenue,
                    conversionRate,
                    monthlyPerformance,
                    timeFrame
                }
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving sales performance analytics',
                error: error.message
            });
        }
    }

    // Helper function to get number of months from time frame
    static _getMonthsFromTimeFrame(timeFrame) {
        switch (timeFrame) {
            case '1M':
                return 1;
            case '3M':
                return 3;
            case '6M':
                return 6;
            case '12M':
                return 12;
            case '1Y':
                return 12;
            case '2Y':
                return 24;
            default:
                return 12; // Default to 12 months
        }
    }

    // Get today's schedules
    static async getTodaySchedules(req, res) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Get status IDs for Cancelled and Completed to exclude them
            const inactiveStatuses = await MeetingScheduleStatusModel.find({
                statusCode: { $in: [2, 3] }
            }, '_id');
            const inactiveStatusIds = inactiveStatuses.map(s => s._id);

            const userId = req.user.id || req.user._id;
            const userRole = req.user.role;
            const isSales = userRole?.toLowerCase() === 'sales' || userRole?.toLowerCase() === 'sales person';
            const isExecutive = userRole?.toLowerCase() === 'executive';

            let scheduleFilter = {
                status: { $nin: inactiveStatusIds },
                published: true
            };

            if (isSales) {
                scheduleFilter.salesPersonId = userId;
            } else if (isExecutive) {
                scheduleFilter.executiveId = userId;
            }

            const todaysSchedules = await MeetingScheduleModel.find({
                ...scheduleFilter,
                meetingDate: {
                    $gte: today,
                    $lt: tomorrow
                }
            }).populate('scheduledByUserId', 'firstName lastName')
                .populate('customerId', 'firstName lastName')
                .populate('propertyId', 'name')
                .populate('status', 'name statusCode')
                .sort({ startTime: 1 });

            res.status(200).json({
                statusCode: 200,
                message: 'Today\'s schedules retrieved successfully',
                data: todaysSchedules
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                message: 'Error retrieving today\'s schedules',
                error: error.message
            });
        }
    }
} 