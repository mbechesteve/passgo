export interface ParkingZone {
  id: string;
  zone: string;
  detail: string;
  walkMinutes: number;
}

export const PARKING_ZONES: ParkingZone[] = [
  { id: "pz-a", zone: "Zone A", detail: "Kasarani, north gate", walkMinutes: 4 },
  { id: "pz-b", zone: "Zone B", detail: "Kasarani, east approach", walkMinutes: 7 },
  { id: "pz-c", zone: "Zone C", detail: "Mwiki Road overflow", walkMinutes: 12 },
  { id: "pz-d", zone: "Zone D", detail: "Thika Road park and walk", walkMinutes: 18 },
];
