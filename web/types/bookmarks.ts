export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  tags?: string[];
  isFavorite?: boolean;
  is_favorite?: boolean;
  favicon?: string;
  createdAt?: string;
  created_at?: string;
  dateAdded?: string;
  user_id?: string;
  tagged_ids?: string[];
  hub?: string; // Keep for backward compatibility
  hubs: string[]; // Array of hubs
}

export interface BookmarkFormData {
  title: string;
  url: string;
  description?: string;
  category: string;
  tags?: string[];
  favicon?: string;
  hub?: string; // Keep for backward compatibility
  hubs?: string[]; // Array of hubs
}

export interface BookmarksResponse {
  bookmarks: Bookmark[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
}

export interface StatsResponse {
  total_bookmarks: number;
  favorite_bookmarks: number;
  categories_count: number;
}

export interface CategoriesResponse {
  categories: string[];
}


