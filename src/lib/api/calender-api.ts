import { OccasionsListRequest, OccasionsListResponse } from "@/types/occasion";
import { apiClient } from "./client";
import { 
  CreateUserOccasionRequest, 
  CreateUserOccasionResponse,
  EditUserOccasionRequest,
  EditUserOccasionResponse,
  GetUserOccasionRequest,
  GetUserOccasionsResponse,
} from "@/types/userOccasion";
import {
  GetCalenderRequest,
  GetCalendersResponse,
  CreateCalenderRequest,
  CreateCalenderResponse,
  EditCalenderRequest,
  EditCalenderResponse
} from "@/types/calender";

export const CalenderAPI = {
  // Occasions
  getOccasions: async (data: OccasionsListRequest): Promise<OccasionsListResponse> => {
    const params: Record<string, string | number | boolean> = {
      'page-index': data.PageIndex,
      'page-size': data.PageSize,
    };
    
    if (data.Search) {
      params['search'] = data.Search;
    }
    
    if (data.takeAll !== undefined) {
      params['take-all'] = data.takeAll;
    }
    
    return apiClient.get<OccasionsListResponse>(`/occasions`, { params });
  },

  // User Occasions
  getUserOccasions: async (data: GetUserOccasionRequest): Promise<GetUserOccasionsResponse> => {
    const params: Record<string, string | number | boolean> = {
      'page-index': data.PageIndex,
      'page-size': data.PageSize,
    };
    
    if (data.Search) params['search'] = data.Search;
    if (data.takeAll !== undefined) params['take-all'] = data.takeAll;
    if (data.StartDate) params['start-date'] = data.StartDate;
    if (data.EndDate) params['end-date'] = data.EndDate;
    if (data.Year !== undefined) params['year'] = data.Year;
    if (data.Month !== undefined) params['month'] = data.Month;
    if (data.UpcomingDays !== undefined) params['upcoming-days'] = data.UpcomingDays;
    if (data.Today !== undefined) params['today'] = data.Today;
    
    return apiClient.get<GetUserOccasionsResponse>(`/user-occasions`, { params });
  },

  getUserOccasion: async (id: number): Promise<CreateUserOccasionResponse> => {
    return apiClient.get<CreateUserOccasionResponse>(`/user-occasions/${id}`);
  },

  createUserOccasion: async (data: CreateUserOccasionRequest): Promise<CreateUserOccasionResponse> => {
    return apiClient.post<CreateUserOccasionResponse>(`/user-occasions`, data);
  },

  updateUserOccasion: async (id: number, data: Partial<EditUserOccasionRequest>): Promise<EditUserOccasionResponse> => {
    return apiClient.put<EditUserOccasionResponse>(`/user-occasions/${id}`, data);
  },

  deleteUserOccasion: async (id: number): Promise<{ statusCode: number; message: string }> => {
    return apiClient.delete(`/user-occasions/${id}`);
  },

  // Outfit Calendar
  getCalendarEntries: async (data: GetCalenderRequest): Promise<GetCalendersResponse> => {
    const params: Record<string, string | number | boolean> = {
      'page-index': data.PageIndex,
      'page-size': data.PageSize,
    };
    
    if (data.Search) params['search'] = data.Search;
    if (data.takeAll !== undefined) params['take-all'] = data.takeAll;
    if (data.StartDate) params['start-date'] = data.StartDate;
    if (data.EndDate) params['end-date'] = data.EndDate;
    if (data.Year !== undefined) params['year'] = data.Year;
    if (data.Month !== undefined) params['month'] = data.Month;
    
    return apiClient.get<GetCalendersResponse>(`/outfits/calendar`, { params });
  },

  createCalendarEntry: async (data: CreateCalenderRequest): Promise<CreateCalenderResponse> => {
    // Validate outfitIds array
    if (!data.outfitIds || data.outfitIds.length === 0) {
      throw new Error("outfitIds array must contain at least one outfit ID");
    }

    // Validate request based on isDaily flag
    if (data.isDaily) {
      // isDaily = true: Must have time, must NOT have userOccasionId
      if (!data.time) {
        throw new Error("time is required when isDaily is true");
      }
      if (data.userOccasionId) {
        throw new Error("userOccasionId must not be provided when isDaily is true");
      }
    } else {
      // isDaily = false: Must have userOccasionId, must NOT have time
      if (!data.userOccasionId) {
        throw new Error("userOccasionId is required when isDaily is false");
      }
      if (data.time) {
        throw new Error("time must not be provided when isDaily is false");
      }
    }

    return apiClient.post<CreateCalenderResponse>(`/outfits/calendar`, data);
  },

  updateCalendarEntry: async (id: number, data: EditCalenderRequest): Promise<EditCalenderResponse> => {
    return apiClient.put<EditCalenderResponse>(`/outfits/calendar/${id}`, data);
  },

  deleteCalendarEntry: async (id: number): Promise<{ statusCode: number; message: string }> => {
    return apiClient.delete(`/outfits/calendar/${id}`);
  }
}