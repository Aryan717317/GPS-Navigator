export interface LatLng {
    lat: number;
    lng: number;
}

export interface RouteInstruction {
    text: string;
    distance: number;
    time: number;
}

export interface RouteData {
    distance: number; // in meters
    duration: number; // in seconds
    coordinates: LatLng[];
    instructions: RouteInstruction[];
}
