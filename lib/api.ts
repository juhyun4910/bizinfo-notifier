import axios from "axios";
import { PaginatedNoticeResponse, NoticeDetailDTO, TagDTO } from "./types";

/**
 * 클라이언트 전용 API 래퍼. 서버 API를 호출하여 React Query와 결합한다.
 * - 보안 주석: 기업마당 API 키는 서버 라우트 내부에서만 사용되며, 이 파일은 내부 API만 호출한다.
 */
export async function fetchNotices(params: Record<string, string | number | undefined>) {
  const response = await axios.get<PaginatedNoticeResponse>("/api/notices", {
    params,
  });
  return response.data;
}

export async function fetchNoticeDetail(id: string) {
  const response = await axios.get<NoticeDetailDTO>(`/api/notices/${id}`);
  return response.data;
}

export async function fetchTags() {
  const response = await axios.get<TagDTO[]>("/api/tags");
  return response.data;
}

export async function createTag(name: string) {
  const response = await axios.post<TagDTO>("/api/tags", { name });
  return response.data;
}

export async function deleteTag(id: number) {
  await axios.delete(`/api/tags/${id}`);
}

export async function createBookmark(noticeId: string) {
  const response = await axios.post<{ ok: boolean; id: number }>("/api/bookmarks", { noticeId });
  return response.data;
}

export async function deleteBookmark(id: number) {
  await axios.delete(`/api/bookmarks/${id}`);
}

export async function fetchBookmarks(params: Record<string, string | number | undefined>) {
  const response = await axios.get<PaginatedNoticeResponse>("/api/bookmarks", { params });
  return response.data;
}
