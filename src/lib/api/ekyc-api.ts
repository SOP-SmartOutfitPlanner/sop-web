/**
 * VNPT eKYC API Integration
 * Based on API documentation from VNPT
 */

const EKYC_BASE_URL = process.env.NEXT_PUBLIC_EKYC_BACKEND_URL || "https://api.idg.vnpt.vn";

// Get credentials and strip "bearer " prefix if present
const getAccessToken = () => {
  let token = process.env.NEXT_PUBLIC_EKYC_ACCESS_TOKEN || "";
  if (token.toLowerCase().startsWith("bearer ")) {
    token = token.substring(7);
  }
  return token;
};

const getHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getAccessToken()}`,
  "Token-id": process.env.NEXT_PUBLIC_EKYC_TOKEN_ID || "",
  "Token-key": process.env.NEXT_PUBLIC_EKYC_TOKEN_KEY || "",
  "mac-address": "WEB_CLIENT",
});

// Generate client session string
const generateClientSession = () => {
  const timestamp = Date.now();
  const deviceId = typeof window !== "undefined"
    ? window.navigator.userAgent.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)
    : "unknown";
  return `WEB_browser_web_Device_1.0.0_${deviceId}_${timestamp}`;
};

// Response types
export interface UploadFileResponse {
  message: string;
  object: {
    fileName: string;
    title: string;
    description: string;
    hash: string;
    fileType: string;
    uploadedDate: string;
    storageType: string;
    tokenId: string;
  };
}

export interface ClassifyIdResponse {
  message: string;
  object: {
    type: number;
    name: string;
  };
}

export interface OCRResponse {
  message: string;
  object: {
    id?: string;
    id_prob?: string;
    name?: string;
    name_prob?: string;
    dob?: string;
    dob_prob?: string;
    sex?: string;
    sex_prob?: string;
    nationality?: string;
    nationality_prob?: string;
    home?: string;
    home_prob?: string;
    address?: string;
    address_prob?: string;
    doe?: string;
    doe_prob?: string;
    type_new?: string;
    type?: string;
    // Back side fields
    issue_date?: string;
    issue_date_prob?: string;
    issue_loc?: string;
    issue_loc_prob?: string;
    features?: string;
    features_prob?: string;
    mrz?: string;
    mrz_prob?: string;
  };
}

export interface LivenessResponse {
  message: string;
  object: {
    liveness: string;
    liveness_msg: string;
    score?: number;
  };
}

export interface FaceCompareResponse {
  message: string;
  object: {
    result: string;
    msg: string;
    prob: number;
    multiple_faces: boolean;
  };
}

export interface MaskedFaceResponse {
  message: string;
  object: {
    masked: string;
    msg: string;
    prob: number;
  };
}

export const ekycAPI = {
  /**
   * 1. Upload file to get hash
   */
  uploadFile: async (file: File, title: string = "ekyc_upload"): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", "eKYC verification upload");

    const response = await fetch(`${EKYC_BASE_URL}/file-service/v1/addFile`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${getAccessToken()}`,
        "Token-id": process.env.NEXT_PUBLIC_EKYC_TOKEN_ID || "",
        "Token-key": process.env.NEXT_PUBLIC_EKYC_TOKEN_KEY || "",
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || data.message !== "IDG-00000000") {
      throw new Error(data.message || `Upload failed: ${response.statusText}`);
    }

    return data;
  },

  /**
   * 2. Classify ID type
   */
  classifyId: async (imageHash: string): Promise<ClassifyIdResponse> => {
    const response = await fetch(`${EKYC_BASE_URL}/ai/v1/classify/id`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        img_card: imageHash,
        client_session: generateClientSession(),
        token: "verify_token",
      }),
    });

    const data = await response.json();

    if (!response.ok || (data.message && data.message !== "IDG-00000000")) {
      throw new Error(data.message || `Classify failed: ${response.statusText}`);
    }

    return data;
  },

  /**
   * 3. Check card liveness (anti-spoofing)
   */
  checkCardLiveness: async (imageHash: string): Promise<LivenessResponse> => {
    const response = await fetch(`${EKYC_BASE_URL}/ai/v1/card/liveness`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        img: imageHash,
        client_session: generateClientSession(),
        token: "verify_token",
      }),
    });

    if (!response.ok) {
      throw new Error(`Card liveness check failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * 4. OCR ID Front
   * Note: API expects img_front field, not img
   */
  ocrIdFront: async (imageHash: string, type: number = -1): Promise<OCRResponse> => {
    const response = await fetch(`${EKYC_BASE_URL}/ai/v1/ocr/id/front`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        img_front: imageHash,
        type,
        client_session: generateClientSession(),
        token: "verify_token",
        validate_postcode: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || (data.message && data.message !== "IDG-00000000")) {
      throw new Error(data.message || `OCR front failed: ${response.statusText}`);
    }

    return data;
  },

  /**
   * 5. OCR ID Back
   * Note: API expects img_back field, not img
   */
  ocrIdBack: async (imageHash: string, type: number = -1): Promise<OCRResponse> => {
    const response = await fetch(`${EKYC_BASE_URL}/ai/v1/ocr/id/back`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        img_back: imageHash,
        type,
        client_session: generateClientSession(),
        token: "verify_token",
      }),
    });

    const data = await response.json();

    if (!response.ok || (data.message && data.message !== "IDG-00000000")) {
      throw new Error(data.message || `OCR back failed: ${response.statusText}`);
    }

    return data;
  },

  /**
   * 6. OCR Both sides (combined)
   */
  ocrId: async (frontHash: string, backHash: string, type: number = 0): Promise<OCRResponse> => {
    const response = await fetch(`${EKYC_BASE_URL}/ai/v1/ocr/id`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        img_front: frontHash,
        img_back: backHash,
        type,
        client_session: generateClientSession(),
        token: "verify_token",
      }),
    });

    if (!response.ok) {
      throw new Error(`OCR failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * 7. Compare face on ID with selfie
   */
  compareFace: async (cardHash: string, faceHash: string): Promise<FaceCompareResponse> => {
    const response = await fetch(`${EKYC_BASE_URL}/ai/v1/face/compare`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        img_card: cardHash,
        img_face: faceHash,
        client_session: generateClientSession(),
        token: "verify_token",
      }),
    });

    if (!response.ok) {
      throw new Error(`Face compare failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * 8. Check face liveness
   */
  checkFaceLiveness: async (imageHash: string): Promise<LivenessResponse> => {
    const response = await fetch(`${EKYC_BASE_URL}/ai/v1/face/liveness`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        img: imageHash,
        client_session: generateClientSession(),
        token: "verify_token",
      }),
    });

    if (!response.ok) {
      throw new Error(`Face liveness check failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * 9. Check if face is masked
   */
  checkMaskedFace: async (imageHash: string): Promise<MaskedFaceResponse> => {
    const response = await fetch(`${EKYC_BASE_URL}/ai/v1/face/mask`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        img: imageHash,
        client_session: generateClientSession(),
        token: "verify_token",
      }),
    });

    if (!response.ok) {
      throw new Error(`Masked face check failed: ${response.statusText}`);
    }

    return response.json();
  },
};

// ID Type mapping
export const ID_TYPES: Record<number, string> = {
  0: "CMND mẫu cũ (mặt trước)",
  1: "CMND mẫu cũ (mặt sau)",
  2: "CMND mẫu mới (mặt trước)",
  3: "CMND mẫu mới (mặt sau)",
  4: "CCCD (mặt trước)",
  5: "CCCD (mặt sau)",
  6: "CCCD gắn chip (mặt trước)",
  7: "CCCD gắn chip (mặt sau)",
  8: "Hộ chiếu",
  9: "Bằng lái xe",
};
