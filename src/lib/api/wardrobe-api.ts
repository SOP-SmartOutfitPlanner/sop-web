const API_BASE_URL = "https://68cd6eccda4697a7f305f673.mockapi.io";

export interface ApiWardrobeItem {
  id: string;
  name: string;
  type: "top" | "bottom" | "shoes" | "outer" | "accessory";
  imageUrl: string; // Base64 string
  brand?: string;
  colors: string[];
  seasons: ("spring" | "summer" | "fall" | "winter")[];
  occasions: ("casual" | "formal" | "sport" | "travel")[];
  status: "active" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWardrobeItemRequest {
  name: string;
  type: "top" | "bottom" | "shoes" | "outer" | "accessory";
  imageUrl: string; // Base64 string
  brand?: string;
  colors: string[];
  seasons: ("spring" | "summer" | "fall" | "winter")[];
  occasions: ("casual" | "formal" | "sport" | "travel")[];
  status?: "active" | "archived";
}

class WardrobeAPI {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}/${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  async getItems(): Promise<ApiWardrobeItem[]> {
    return this.request<ApiWardrobeItem[]>("item");
  }

  async getItem(id: string): Promise<ApiWardrobeItem> {
    return this.request<ApiWardrobeItem>(`item/${id}`);
  }

  async createItem(item: CreateWardrobeItemRequest): Promise<ApiWardrobeItem> {
    return this.request<ApiWardrobeItem>("item", {
      method: "POST",
      body: JSON.stringify({
        ...item,
        status: item.status || "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });
  }

  async updateItem(id: string, item: Partial<CreateWardrobeItemRequest>): Promise<ApiWardrobeItem> {
    return this.request<ApiWardrobeItem>(`item/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...item,
        updatedAt: new Date().toISOString(),
      }),
    });
  }

  async deleteItem(id: string): Promise<{ id: string }> {
    return this.request<{ id: string }>(`item/${id}`, {
      method: "DELETE",
    });
  }
}

export const wardrobeAPI = new WardrobeAPI();
