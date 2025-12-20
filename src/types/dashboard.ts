// Overview types for dashboard
export interface Overview {
    totalUsers: {
        value: number;
        percentageChange: number;
        changeDirection: string;
    }
    totalItems:{
        value: number;
        percentageChange: number;
        changeDirection: string;
    }
    revenueToday:{
        value: number;
        percentageChange: number;
        changeDirection: string;
    }
    communityPostsToday:{
        value: number;
        percentageChange: number;
        changeDirection: string;
    }
}
// User growth types for dashboard
export interface UserGrowthRequest {
    year: string;
}
export interface UserGrowth{
    month: string;
    year: string;
    monthName: string;
    newUsers: number;
    activeUsers: number;
}
//item by category types for dashboard
export interface ItemByCategory{
    categoryId: number;
    categoryName: string;
    itemCount: number;
    percentage: number;
}

// weekly activity types for dashboard
export interface WeeklyActivity{
    dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    date: string;
    newUsers: number;
    newItems: number;
}