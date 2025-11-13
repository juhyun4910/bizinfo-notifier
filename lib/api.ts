import { NoticeCardDTO, PagedResponse, TagDTO } from "./types";

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchNotices(params: Record<string, string | number | boolean | undefined> = {}): Promise<PagedResponse<NoticeCardDTO>> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const url = `/api/notices${qs.size ? `?${qs.toString()}` : ""}`;
  return http(url);
}

export async function fetchBookmarks(params: Record<string, string | number | boolean | undefined> = {}): Promise<PagedResponse<NoticeCardDTO>> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const url = `/api/bookmarks${qs.size ? `?${qs.toString()}` : ""}`;
  return http(url);
}

export async function createBookmark(noticeId: number): Promise<{ ok: boolean; id: number }>{
  return http("/api/bookmarks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ noticeId }),
  });
}

export async function deleteBookmark(id: number): Promise<{ ok: boolean }>{
  return http(`/api/bookmarks/${id}`, { method: "DELETE" });
}

export async function fetchTags(): Promise<TagDTO[]>{
  return http("/api/tags");
}

export async function createTag(name: string): Promise<TagDTO>{
  return http("/api/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function deleteTag(id: number): Promise<{ ok: boolean }>{
  return http(`/api/tags/${id}`, { method: "DELETE" });
}

