export enum BookStatus {
  ToRead = 'Muốn đọc',
  Reading = 'Đang đọc',
  Finished = 'Đã đọc'
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  status: BookStatus;
  addedDate: number; // timestamp
  notes?: string;
  genre?: string;
  currentPage?: number;
  totalPages?: number;
  isFavorite?: boolean;
}

export interface ReadingStat {
  month: string;
  count: number;
}

export interface GenreStat {
  name: string;
  count: number;
}

export interface ScannedData {
  title?: string;
  author?: string;
  description?: string;
  coverUrl?: string;
  genre?: string;
}