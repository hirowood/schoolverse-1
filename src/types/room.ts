export type RoomType = 'CLASSROOM' | 'GALLERY' | 'PARK' | 'CUSTOM';

export type Room = {
  id: string;
  name: string;
  type: RoomType;
  maxUsers: number;
  mapData?: unknown;
};
