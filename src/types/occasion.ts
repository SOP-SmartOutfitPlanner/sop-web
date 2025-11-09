import { PaginationMetaData } from "@/lib/api";

export interface Occasion{
    id: number;
    name: string;
    createdDate: string;
    updatedDate: string;
}
export interface OccasionsListResponse {
    statusCode: number;
    message: string;
    data:{
        data: Occasion[];
        metaData: PaginationMetaData;
    };
}
export interface OccasionsListRequest {
    PageIndex: number;
    PageSize: number;
    takeAll?: boolean;
    Search?: string;
}
export interface CreateOccasionRequest {
    name: string;
}
export interface CreateOccasionResponse {
    statusCode: number;
    message: string;
    data: Occasion;
}
export interface UpdateOccasionRequest {
    id: number;
    name: string;
}
export interface UpdateOccasionResponse {
    statusCode: number;
    message: string;
    data: Occasion;
}