export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  avatar?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  ownerId: string;
  owner: { id: string; name: string; email: string };
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  ownerId: string;
  owner: { id: string; name: string; email: string };
  categories: { category: Category }[];
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
