export interface Item{
    id: number;
    userId: number;
    userDisplayName: string;
    name: string;
    categoryId: number;
    categoryName: string;
    color: string;
    aiDescription: string;
    brand: string | null;
    frequencyWorn: string | null;
    lastWornAt: string | null;
    imgUrl: string;
    weatherSuitable: string;
    condition: string;
    pattern: string;
    fabric: string;
    isAnalyzed: boolean;
    aiConfidence: number;
    occasions: Array<{
        id: number;
        name: string;
    }>;
    seasons: Array<{
        id: number;
        name: string;
    }>;
    styles: Array<{
        id: number;
        name: string;
    }>;
}
export interface ItemsListRequest {
    PageIndex: number;
    PageSize: number;
    takeAll?: boolean;
    Search?: string;
    
}

export interface ItemsListResponse {
    statusCode: number;
    message: string;
    data:{
        data: Item[];
        metaData: {
        totalCount: number;
        pageSize: number;
        currentPage: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    }
}
   