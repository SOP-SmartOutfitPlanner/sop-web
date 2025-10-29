/**
 * JWT Token Utilities
 * Decode and parse JWT tokens without external dependencies
 */

export interface DecodedToken {
  emailaddress?: string;
  UserId?: string;
  role?: string;
  FirstTime?: string;
  exp?: number;
  iss?: string;
  aud?: string;
  jti?: string;
  [key: string]: unknown; // Allow dynamic claim names
}

/**
 * Decode JWT token
 * @param token JWT token string
 * @returns Decoded token payload
 */
export function decodeJWT(token: string): DecodedToken | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (second part)
    const payload = parts[1];
    
    // Base64 decode
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    
    // Parse JSON
    const parsedPayload = JSON.parse(decoded);
    return parsedPayload;
  } catch {
    return null;
  }
}

/**
 * Extract user info from JWT token
 * @param token JWT access token
 * @returns User information
 */
export function extractUserFromToken(token: string) {
  const decoded = decodeJWT(token);
  
  if (!decoded) {
    return null;
  }

  // Extract user info from JWT claims
  const email = (decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] as string | undefined) || decoded.emailaddress;
  const userId = decoded.UserId;
  const role = (decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string | undefined) || decoded.role;
  const firstTime = decoded.FirstTime === "True";

  return {
    id: userId || "",
    email: email || "",
    displayName: email?.split("@")[0] || "", // Use email username as display name
    role: role || "USER",
    firstTime,
  };
}

/**
 * Check if token is expired
 * @param token JWT token
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  
  if (!decoded || !decoded.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
}

/**
 * Check if token user is ADMIN role
 * @param token JWT token
 * @returns true if user is ADMIN, false otherwise
 */
export function isAdminUser(token: string): boolean {
  const decoded = decodeJWT(token);
  
  if (!decoded) {
    return false;
  }

  // Check for role claim
  const role = (decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string | undefined) || decoded.role;
  
  return role === "ADMIN" || role === "SuperAdmin";
}

/**
 * Get user role from token
 * @param token JWT token
 * @returns User role (ADMIN, STYLIST, USER) or undefined
 */
export function getUserRoleFromToken(token: string): string | undefined {
  const decoded = decodeJWT(token);
  
  if (!decoded) {
    return undefined;
  }

  // Check for role claim
  const role = (decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string | undefined) || decoded.role;
  
  return role;
}

