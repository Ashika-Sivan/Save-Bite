import {
    CircleMarker,
    MapContainer,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import {
    useEffect,
    useState,
} from "react";
import toast from "react-hot-toast";

import {
    reverseGeoCode,
    searchLocations,
    type LocationSearchResult,
} from "../../services/location.service";

interface LocationPickerProps {
    latitude: number | null;
    longitude: number | null;

    onLocationSelect: (
        latitude: number,
        longitude: number
    ) => void;
}

interface MapClickHandlerProps {
    onLocationSelect: (
        latitude: number,
        longitude: number
    ) => void;
}

interface RecenterMapProps {
    latitude: number | null;
    longitude: number | null;
}

const DEFAULT_POSITION: [number, number] = [
    11.8745,
    75.3704,
];

const RecenterMap = ({
    latitude,
    longitude,
}: RecenterMapProps) => {
    const map = useMap();

    useEffect(() => {
        if (
            latitude === null ||
            longitude === null
        ) {
            return;
        }

        map.flyTo([latitude, longitude], 16,{animate:true,duration:1.5});
    }, [map, latitude, longitude]);

    return null;
};

const MapClickHandler = ({
    onLocationSelect,
}: MapClickHandlerProps) => {
    useMapEvents({
        click(event) {
            onLocationSelect(
                event.latlng.lat,
                event.latlng.lng
            );
        },
    });

    return null;
};

const LocationPicker = ({
    latitude,
    longitude,
    onLocationSelect,
}: LocationPickerProps) => {
    const [isLocating, setIsLocating] =
        useState(false);

    const [isSearching, setIsSearching] =
        useState(false);

    const [
        isFindingAddress,
        setIsFindingAddress,
    ] = useState(false);

    const [searchQuery, setSearchQuery] =
        useState("");

    const [searchResults, setSearchResults] =
        useState<LocationSearchResult[]>([]);

    const [selectedAddress, setSelectedAddress] =
        useState("");

    const selectedPosition:
        | [number, number]
        | null =
        latitude !== null && longitude !== null
            ? [latitude, longitude]
            : null;

    /*
     * This function is used by:
     * 1. Current-location selection
     * 2. Map clicking
     *
     * It saves the coordinates in the parent component
     * and converts the coordinates into an address.
     */
    const selectLocation = async (
        selectedLatitude: number,
        selectedLongitude: number,
        knownAddress?: string
    ) => {
        onLocationSelect(
            selectedLatitude,
            selectedLongitude
        );

        /*
         * Search results already contain an address,
         * so another API request is unnecessary.
         */
        if (knownAddress) {
            setSelectedAddress(knownAddress);
            return;
        }

        try {
            setIsFindingAddress(true);

            const result = await reverseGeoCode(
                selectedLatitude,
                selectedLongitude
            );

            setSelectedAddress(
                result.display_name ||
                    "Location selected"
            );
        } catch {
            setSelectedAddress(
                "Location selected, but the address could not be found"
            );
        } finally {
            setIsFindingAddress(false);
        }
    };

const handleSearch = async (): Promise<void> => {
    const query = searchQuery.trim();

    if (!query) {
        toast.error("Please enter a place to search");
        return;
    }

    try {
        setIsSearching(true);
        setSearchResults([]);

        const results = await searchLocations(query);

        if (results.length === 0) {
            toast.error("No matching location was found");
            return;
        }

        // Display all matching results
        setSearchResults(results);

        // Automatically select the first matching result
        const firstResult = results[0];

        const selectedLatitude = Number(firstResult.lat);
        const selectedLongitude = Number(firstResult.lon);

        if (
            !Number.isFinite(selectedLatitude) ||
            !Number.isFinite(selectedLongitude)
        ) {
            toast.error("Invalid location coordinates");
            return;
        }

        await selectLocation(
            selectedLatitude,
            selectedLongitude,
            firstResult.display_name
        );

        setSearchQuery(firstResult.display_name);
    } catch {
        toast.error("Unable to search locations");
    } finally {
        setIsSearching(false);
    }
};

    const handleSearchResultSelect = (
        result: LocationSearchResult
    ) => {
        const selectedLatitude = Number(result.lat);
        const selectedLongitude = Number(result.lon);

        if (
            !Number.isFinite(selectedLatitude) ||
            !Number.isFinite(selectedLongitude)
        ) {
            toast.error(
                "The selected location is invalid"
            );
            return;
        }

        void selectLocation(
            selectedLatitude,
            selectedLongitude,
            result.display_name
        );

        setSearchQuery(result.display_name);
        setSearchResults([]);
    };

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error(
                "Geolocation is not supported by this browser"
            );
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentLatitude =
                    position.coords.latitude;

                const currentLongitude =
                    position.coords.longitude;

                void selectLocation(
                    currentLatitude,
                    currentLongitude
                );

                setIsLocating(false);
            },
            (error) => {
                setIsLocating(false);

                if (
                    error.code ===
                    error.PERMISSION_DENIED
                ) {
                    toast.error(
                        "Please allow location permission"
                    );
                    return;
                }

                toast.error(
                    "Unable to detect your current location"
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return (
        <div className="space-y-3">
            {/* Place search */}
          <div className="flex gap-2">
    <input
        type="text"
        value={searchQuery}
        onChange={(event) =>
            setSearchQuery(event.target.value)
        }
        onKeyDown={(event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                void handleSearch();
            }
        }}
        placeholder="Search place, hospital, area or pincode"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
    />

    <button
        type="button"
        onClick={() => void handleSearch()}
        disabled={isSearching}
        className="rounded-lg bg-green-700 px-5 py-2 font-semibold text-white disabled:opacity-60"
    >
        {isSearching
            ? "Searching..."
            : "Search"}
    </button>
</div>

            {/* Search result list */}
            {searchResults.length > 0 && (
                <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow">
                    {searchResults.map((result) => (
                        <button
                            key={result.place_id}
                            type="button"
                            onClick={() =>
                                handleSearchResultSelect(
                                    result
                                )
                            }
                            className="block w-full border-b border-gray-100 px-4 py-3 text-left text-sm hover:bg-green-50"
                        >
                            {result.display_name}
                        </button>
                    ))}
                </div>
            )}

            {/* Current-location button */}
            <button
                type="button"
                onClick={handleCurrentLocation}
                disabled={isLocating}
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
                {isLocating
                    ? "Finding location..."
                    : "Use my current location"}
            </button>

           <MapContainer
            center={DEFAULT_POSITION}
            zoom={12}
            scrollWheelZoom
            className="h-72 w-full rounded-xl border border-gray-200"
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler
                onLocationSelect={(
                    selectedLatitude,
                    selectedLongitude
                ) => {
                    void selectLocation(
                        selectedLatitude,
                        selectedLongitude
                    );
                }}
            />

        <RecenterMap
            latitude={latitude}
            longitude={longitude}
        />

        {selectedPosition && (
            <CircleMarker
                center={selectedPosition}
                radius={10}
                pathOptions={{
                    color: "#166534",
                    fillColor: "#22c55e",
                    fillOpacity: 0.9,
                }}
            />
        )}
</MapContainer>

            <p className="text-sm text-gray-500">
                Search for a place, use your current
                location, or click the map.
            </p>

            {/* Selected address */}
            {selectedPosition && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <p className="text-sm font-semibold text-green-800">
                        Selected location
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                        {isFindingAddress
                            ? "Finding address..."
                            : selectedAddress ||
                              "Location selected"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        Latitude:{" "}
                        {latitude?.toFixed(6)}
                        {" | "}
                        Longitude:{" "}
                        {longitude?.toFixed(6)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;