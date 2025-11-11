/**
 * 공용 타입 정의. 서버/클라이언트가 동일한 DTO를 공유한다.
 */
export interface TagDTO {
  id: number;
  name: string;
}

export interface NoticeCardDTO {
  id: string;
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
}

export interface NoticeDetailDTO extends NoticeCardDTO {
  link?: string | null;
  pblancUrl?: string | null;
  content?: string | null;
  attachments?: string | null;
  related: NoticeCardDTO[];
}

export interface PaginatedNoticeResponse {
  items: NoticeCardDTO[];
  total: number;
  page: number;
  pageSize: number;
}
