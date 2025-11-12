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
        data: Calender[];
        metaData?: {
            currentPage: number;
            totalPages: number;
            pageSize: number;
            totalCount: number;
            hasPrevious: boolean;
            hasNext: boolean;
        };
    };
}

export interface CreateCalenderRequest{
    outfitId: number;
    userOccasionId: number;
    dateUsed: string;
}
export interface EditCalenderRequest{
    outfitId?: number| null;
    userOccasionId?: number| null;
    dateUsed?: string;
}

export interface CreateCalenderResponse{
    statusCode: number;
    message: string;
    data: Calender;
}
export interface EditCalenderResponse{
    statusCode: number;
    message: string;
    data: Calender;
}

export interface Calender {
    id: number;
    userId: number;
    userDisplayName: string;
    outfitId: number;
    outfitName: string;
    userOccasionId: number;
    userOccasionName: string;
    dateUsed: string;
    createdBy: string;
    createdDate: string;
    updatedDate: string | null;
}