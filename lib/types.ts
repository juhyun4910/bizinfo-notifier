export type TagDTO = {
  id: number;
  name: string;
};

export type NoticeCardDTO = {
  id: number;
  title: string;
  summary: string | null;
  pubDate: string | null;
  deadline: string | null;
  organization: string | null;
  category: string | null;
  tags: TagDTO[];
  bookmarked?: boolean;
  bookmarkId?: number | null;
  inqireCo?: number | null;
};

export type PagedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

