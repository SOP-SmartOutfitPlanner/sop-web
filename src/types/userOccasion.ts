
export interface GetUserOccasionRequest{
    PageIndex : number;
    PageSize : number;
    Search? : string;
    takeAll? : boolean;
    StartDate? : string;
    EndDate? : string;
    Year? : number;
    Month? : number;
    UpcomingDays? : boolean;
    Today? : boolean;
}
export interface CreateUserOccasionRequest{
   occasionId?: number| null;
   name: string| null;
    description: string;
    dateOccasion: string;
    startTime: string;
    endTime: string;
    weatherSnapshot: string;
}
export interface GetUserOccasionsResponse{
    statusCode: number;
    message: string;
    data: {
        data: UserOccasion[];
    }
}
export interface CreateUserOccasionResponse{
    statusCode: number;
    message: string;
    data: UserOccasion;
}
export interface EditUserOccasionRequest{
   occasionId: number;
   name: string;
   description: string;
   dateOccasion: string;
   startTime: string;
   endTime: string;
   weatherSnapshot: string;
}
export interface EditUserOccasionResponse{
    statusCode: number;
    message: string;
    data: UserOccasion;
}
export interface UserOccasion {
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
