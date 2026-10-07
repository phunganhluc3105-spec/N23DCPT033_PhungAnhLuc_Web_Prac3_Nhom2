export interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  category?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  comments?: Comment[];
  commentsCount?: number;
}

export interface CreatePostInput {
  title: string;
  content: string;
  author: string;
  category?: string;
  imageUrl?: string;
}

export interface UpdatePostInput {
  title: string;
  content: string;
  author: string;
  category?: string;
  imageUrl?: string;
}
