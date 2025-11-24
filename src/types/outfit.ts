//=====================Request=========================//
export interface GetOutfitsRequest {
    pageIndex: number;
    pageSize: number;
    takeAll: boolean;
    search?: string;
    isFavorite?: boolean;
    isSaved?: boolean;
    startDate?: string;
    endDate?: string;
}

export interface CreateOutfitRequest {
    name: string;
    description: string;
    itemIds: number[];
}
//=====================Response=========================//
export interface MetaData {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface CreateOutfitResponse {
    statusCode: number;
    message: string;
    data: Outfit;
}

export interface GetOutfitsResponse {
    statusCode: number;
    message: string;
    data: {
        data: Outfit[];
        metaData: MetaData;
    }
}
export interface GetOutfitByIdResponse {
    statusCode: number;
    message: string;
    data: Outfit;
}

export interface GetOutfitsFavoriteResponse {
    statusCode: number;
    message: string;
    data: Outfit[];
}
export interface EditOutfitResponse {
    statusCode: number;
    message: string;
    data: Outfit;
}

export interface SuggestedItem {
    id: number;
    userId: number;
    userDisplayName: string;
    name: string;
    categoryId: number;
    categoryName: string;
    color: string;
    aiDescription: string;
    brand: string | null;
    frequencyWorn: number | null;
    lastWornAt: string | null;
    imgUrl: string;
    weatherSuitable: string;
    condition: string;
    pattern: string;
    fabric: string;
    isAnalyzed: boolean;
    aiConfidence: number;
    itemType: string;
    occasions: Array<{ id: number; name: string }>;
    seasons: Array<{ id: number; name: string }>;
    styles: Array<{ id: number; name: string }>;
}

export interface OutfitSuggestionResponse {
    statusCode: number;
    message: string;
    data: {
        suggestedItems: SuggestedItem[];
        reason: string;
    };
}

//=====================Data Models=========================//
export interface Outfit {
    id: number;
    userId: number;
    userDisplayName: string;
    name: string;
    description: string;
    isFavorite: boolean;
    isSaved: boolean;
    createdDate: string;
    updatedDate: string | null;
    items: {
        id: number;
        itemId: number;
        name: string;
        categoryId: number;
        categoryName: string;
        color: string;
        brand: string;
        frequencyWorn: string;
        lastWornAt: string;
        imgUrl: string;
        weatherSuitable: string;
        condition: string;
        pattern: string;
        fabric: string;
    }[];
}

