export interface GetCalenderRequest{
    PageIndex : number;
    PageSize : number;
    Search? : string;
    takeAll? : boolean;
    StartDate? : string;
    EndDate? : string;
    Year? : number;
    Month? : number;
}

export interface GetCalendersResponse{
    statusCode: number;
    message: string;
    data: {
        data: CalendarEntry[];
        metaData?: {
            totalCount: number;
            pageSize: number;
            currentPage: number;
            totalPages: number;
            hasNext: boolean;
            hasPrevious: boolean;
        };
    };
}

export interface CreateCalenderRequest{
    outfitIds: number[];  // Array of outfit IDs to add
    isDaily: boolean;
    userOccasionId?: number;  // Required when isDaily = false
    time?: string;  // Required when isDaily = true (format: "yyyy-MM-dd'T'HH:mm:ss")
    endTime?: string;  // Format: "yyyy-MM-dd'T'HH:mm:ss"
}
export interface EditCalenderRequest{
    outfitId?: number| null;
    userOccasionId?: number| null;
    endTime?: string;
}

export interface CreateCalenderResponse{
    statusCode: number;
    message: string;
    data: CalendarCreateEntry[];
}
export interface EditCalenderResponse{
    statusCode: number;
    message: string;
    data: Calender;
}

export interface Calender {
    calendarId: number;
    outfitId: number;
    outfitName: string;
    outfitDetails: {
        id: number;
        userId: number;
        userDisplayName: string;
        name: string;
        description: string;
        isFavorite: boolean;
        isSaved: boolean;
        createdDate: string;
        updatedDate: string | null;
        items: CalendarItem[];
    };
    createdDate: string;
}

export interface CalendarItem {
    itemId: number;
    name: string;
    categoryId: number;
    categoryName: string;
    color: string;
    aiDescription: string;
    brand: string | null;
    frequencyWorn: number | null;
    lastWornAt: string;
    imgUrl: string;
    weatherSuitable: string;
    condition: string;
    pattern: string;
    fabric: string;
}

export interface CalendarUserOccasion {
    id: number;
    userId: number;
    userDisplayName: string;
    occasionId: number;
    occasionName: string;
    name: string;
    description: string;
    dateOccasion: string;
    startTime: string;
    endTime: string;
    weatherSnapshot: string;
    createdDate: string;
    updatedDate: string | null;
}

export interface CalendarEntry {
    userOccasion: CalendarUserOccasion;  // Always present (even for daily entries)
    isDaily: boolean;
    outfits: Calender[];
}

export interface CalendarCreateEntry {
    id: number;
    userId: number;
    userDisplayName: string;
    outfitId: number;
    outfitName: string;
    userOccasionId?: number;
    userOccasionName?: string;
    isDaily: boolean;
    createdBy: string;
    createdDate: string;
    updatedDate: string | null;
}
