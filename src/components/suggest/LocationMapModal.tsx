"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, X, AlertCircle } from "lucide-react";
import { Input } from "antd";
import GlassButton from "@/components/ui/glass-button";
import { useScrollLock } from "@/hooks/useScrollLock";
import goongjs from "@goongmaps/goong-js";

const { Search } = Input;

interface LocationMapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

interface SearchResult {
  place_id: string;
  display: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}

export default function LocationMapModal({
  open,
  onOpenChange,
  onLocationSelect,
  initialLocation,
}: LocationMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Lock scroll when modal is open
  useScrollLock(open);

  // Initialize map
  useEffect(() => {
    if (!open) {
      // Clean up map when modal closes
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      return;
    }

    // Prevent multiple initializations
    if (mapRef.current) {
      console.log("Map already initialized");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOONG_MAP_KEY;
    console.log("Goong API Key:", apiKey ? "Present" : "Missing");

    if (!apiKey || apiKey === "YOUR_GOONG_API_KEY_HERE") {
      const errorMsg = "Goong API key not configured. Please add NEXT_PUBLIC_GOONG_API_KEY to .env.local";
      console.error(errorMsg);
      setMapError(errorMsg);
      return;
    }

    // Wait for container to be ready with longer delay
    const timeout = setTimeout(() => {
      if (!mapContainerRef.current) {
        console.log("Map container not ready, retrying...");
        // Retry after another delay
        const retryTimeout = setTimeout(() => {
          if (!mapContainerRef.current) {
            console.error("Map container still not ready");
            setMapError("Failed to initialize map container");
            return;
          }
          initializeMap();
        }, 300);
        return () => clearTimeout(retryTimeout);
      }

      initializeMap();
    }, 200);

    function initializeMap() {
      if (!mapContainerRef.current) return;

      console.log("Initializing Goong map...");
      setMapError(null);

      try {
        // Set access token
        const token = apiKey;
        if (token) {
          goongjs.accessToken = token;
        }

        // Use initial location if provided, otherwise get user's current location
        if (initialLocation) {
          // Initialize map with provided location
          const map = new goongjs.Map({
            container: mapContainerRef.current!,
            style: "https://tiles.goong.io/assets/goong_map_web.json",
            center: [initialLocation.lng, initialLocation.lat],
            zoom: 15,
            attributionControl: false,
          });

          // Wait for map to load
          map.on("load", () => {
            console.log("✅ Goong map loaded successfully with initial location");
          });

          map.on("error", (e: { error: Error }) => {
            console.error("❌ Map error:", e);
            setMapError("Failed to load map. Please check your internet connection.");
          });

          // Add navigation controls
          map.addControl(new goongjs.NavigationControl(), "top-right");

          // Add click handler to map
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          map.on("click", async (e: any) => {
            const { lng, lat } = e.lngLat;
            await handleMapClick(lat, lng);
          });

          mapRef.current = map;

          // Add marker at initial location
          handleMapClick(initialLocation.lat, initialLocation.lng);

          console.log("Map instance created with initial location");
          return;
        }

        // Try to get user's current location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("User location:", latitude, longitude);

            // Initialize map centered on user's current location
            const map = new goongjs.Map({
              container: mapContainerRef.current!,
              style: "https://tiles.goong.io/assets/goong_map_web.json",
              center: [longitude, latitude],
              zoom: 15,
              attributionControl: false,
            });

            // Wait for map to load
            map.on("load", () => {
              console.log("✅ Goong map loaded successfully");
            });

            map.on("error", (e: { error: Error }) => {
              console.error("❌ Map error:", e);
              setMapError("Failed to load map. Please check your internet connection.");
            });

            // Add navigation controls
            map.addControl(new goongjs.NavigationControl(), "top-right");

            // Add click handler to map
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            map.on("click", async (e: any) => {
              const { lng, lat } = e.lngLat;
              await handleMapClick(lat, lng);
            });

            mapRef.current = map;

            // Add marker at user's current location
            handleMapClick(latitude, longitude);

            console.log("Map instance created with user location");
          },
          (error) => {
            console.error("Geolocation error:", error);
            // Fallback to Hanoi if location not available
            initializeMapWithFallback();
          }
        );
      } catch (error) {
        console.error("Map initialization error:", error);
        setMapError(`Map initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    function initializeMapWithFallback() {
      if (!mapContainerRef.current) return;

      try {
        // Initialize map centered on Hanoi, Vietnam (fallback)
        const map = new goongjs.Map({
          container: mapContainerRef.current,
          style: "https://tiles.goong.io/assets/goong_map_web.json",
          center: [105.8342, 21.0278], // Hanoi coordinates
          zoom: 12,
          attributionControl: false,
        });

        // Wait for map to load
        map.on("load", () => {
          console.log("✅ Goong map loaded successfully (fallback location)");
        });

        map.on("error", (e: { error: Error }) => {
          console.error("❌ Map error:", e);
          setMapError("Failed to load map. Please check your internet connection.");
        });

        // Add navigation controls
        map.addControl(new goongjs.NavigationControl(), "top-right");

        // Add click handler to map
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.on("click", async (e: any) => {
          const { lng, lat } = e.lngLat;
          await handleMapClick(lat, lng);
        });

        mapRef.current = map;
        console.log("Map instance created (fallback)");
      } catch (error) {
        console.error("Map fallback initialization error:", error);
        setMapError(`Map initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Handle map click
  const handleMapClick = async (lat: number, lng: number) => {
    if (!mapRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add new marker
    const marker = new goongjs.Marker({ color: "#3b82f6" })
      .setLngLat([lng, lat])
      .addTo(mapRef.current);

    markerRef.current = marker;

    // Reverse geocode to get address
    const address = await reverseGeocode(lat, lng);
    setSelectedLocation({ lat, lng, address });
  };

  // Reverse geocoding
  const reverseGeocode = async (
    lat: number,
    lng: number
  ): Promise<string> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOONG_API_KEY;
      const response = await fetch(
        `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${apiKey}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Search locations with debounce
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOONG_API_KEY;
        
        // Get current map center for location-based search
        let location = "";
        if (mapRef.current) {
          const center = mapRef.current.getCenter();
          location = `${center.lat},${center.lng}`;
        }

        // Use autocomplete API with location, limit, and radius parameters
        const params = new URLSearchParams({
          api_key: apiKey || "",
          input: searchQuery,
          limit: "10",
          radius: "10000", // 10km radius
        });

        if (location) {
          params.append("location", location);
        }

        const response = await fetch(
          `https://rsapi.goong.io/place/autocomplete?${params.toString()}`
        );
        const data = await response.json();

        if (data.predictions) {
          // Get place details for each prediction
          const results = await Promise.all(
            data.predictions.slice(0, 5).map(async (prediction: { place_id: string; description: string }) => {
              const detailResponse = await fetch(
                `https://rsapi.goong.io/Place/Detail?place_id=${prediction.place_id}&api_key=${apiKey}`
              );
              const detailData = await detailResponse.json();

              if (detailData.result?.geometry?.location) {
                return {
                  place_id: prediction.place_id,
                  display: prediction.description,
                  address: prediction.description,
                  location: {
                    lat: detailData.result.geometry.location.lat,
                    lng: detailData.result.geometry.location.lng,
                  },
                };
              }
              return null;
            })
          );

          setSearchResults(results.filter((r): r is SearchResult => r !== null));
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle search result click
  const handleResultClick = (result: SearchResult) => {
    if (!mapRef.current) return;

    const { lat, lng } = result.location;

    // Pan to location
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 15,
    });

    // Add marker
    handleMapClick(lat, lng);
    setSearchResults([]);
    setSearchQuery("");
  };

  // Get current location
  const handleCurrentLocation = () => {
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
          });

          handleMapClick(latitude, longitude);
        }

        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please enable location services.");
        setIsGettingLocation(false);
      }
    );
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(
        selectedLocation.lat,
        selectedLocation.lng,
        selectedLocation.address
      );
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed h-full inset-0 bg-black/60 backdrop-blur-sm z-50" />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="max-w-[95vw] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative flex flex-col"
          style={{
            width: "900px",
            maxHeight: "95vh"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-blue-900/80 to-slate-900/85">
            <div className="absolute top-0 -right-32 w-[400px] h-[400px] bg-blue-200/15 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-cyan-200/15 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="px-6 pt-5 pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-dela-gothic text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                    Select Location
                  </h2>
                  <p className="font-bricolage text-sm text-gray-200 mt-0.5">
                    Search for a location or click on the map to get weather information
                  </p>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 flex-1 min-h-0 overflow-y-auto">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search
                        placeholder="Search for a location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        loading={isSearching}
                        allowClear
                        size="large"
                        className="custom-search-input"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        }}
                      />
                    </div>
                    <GlassButton
                      onClick={handleCurrentLocation}
                      disabled={isGettingLocation}
                      title="Use current location"
                    >
                      <Navigation className="w-4 h-4" />
                    </GlassButton>
                  </div>

                  {/* Search Results Dropdown */}
                  {isSearching && searchQuery.trim() && (
                    <div className="absolute z-10 w-full mt-2 bg-slate-800/95 border border-white/20 rounded-lg shadow-lg p-4">
                      <div className="flex items-center gap-2 text-white/70">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-sm">Searching...</span>
                      </div>
                    </div>
                  )}
                  {!isSearching && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-slate-800/95 border border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.place_id}
                          onClick={() => handleResultClick(result)}
                          className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-start gap-3 border-b border-white/10 last:border-b-0"
                        >
                          <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-cyan-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-white">
                              {result.display}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Map Container */}
                <div className="relative h-[400px] rounded-xl overflow-hidden bg-gray-100">
                  {mapError ? (
                    <div className="w-full h-full flex items-center justify-center p-6">
                      <div className="text-center max-w-md">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 font-medium mb-2">Map Error</p>
                        <p className="text-sm text-gray-300">{mapError}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      ref={mapContainerRef}
                      className="w-full h-full"
                      style={{ minHeight: '400px' }}
                    />
                  )}
                </div>

                {/* Selected Location Info */}
                {selectedLocation && (
                  <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-cyan-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-white">Selected Location</p>
                        <p className="text-sm text-gray-300">
                          {selectedLocation.address}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {selectedLocation.lat.toFixed(6)},{" "}
                          {selectedLocation.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 pt-3 flex-shrink-0 border-t border-white/10">
              <div className="flex items-center justify-end gap-3">
                <GlassButton
                  variant="outline"
                  size="md"
                  onClick={() => onOpenChange(false)}
                  className="text-base"
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  variant="custom"
                  size="md"
                  onClick={handleConfirm}
                  disabled={!selectedLocation}
                  backgroundColor="rgba(34, 211, 238, 0.8)"
                  borderColor="rgba(34, 211, 238, 1)"
                  className="min-w-[120px] text-base"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Confirm Location
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
