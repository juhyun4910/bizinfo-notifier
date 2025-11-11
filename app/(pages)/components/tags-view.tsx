"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTag, deleteTag, fetchTags } from "@/lib/api";
import { AUTO_TAG_KEYWORDS } from "@/lib/constants";
import { normalizeTagName } from "@/lib/bizinfo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TagDTO } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

/**
 * 태그 관리 페이지 컴포넌트. 관심 태그를 CRUD 한다.
 * - 운영 주석: React Query 낙관적 업데이트로 태그 추가/삭제 시 즉시 반영한다.
 */
export function TagsView() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["tags"], queryFn: fetchTags });
  const [value, setValue] = useState("");

  const createMutation = useMutation({
    mutationFn: createTag,
    onMutate: async (name: string) => {
      await queryClient.cancelQueries({ queryKey: ["tags"] });
      const previous = queryClient.getQueryData<TagDTO[]>(["tags"]) ?? [];
      const optimistic: TagDTO = { id: Date.now(), name };
      queryClient.setQueryData<TagDTO[]>(["tags"], [...previous, optimistic]);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tags"], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onSettled: () => {
      setValue("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["tags"] });
      const previous = queryClient.getQueryData<TagDTO[]>(["tags"]) ?? [];
      queryClient.setQueryData<TagDTO[]>(["tags"], previous.filter((tag) => tag.id !== id));
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tags"], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  const recommended = AUTO_TAG_KEYWORDS.filter((keyword) => !data?.some((tag) => tag.name === normalizeTagName(keyword)));

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">관심 태그 관리</h1>
        <p className="text-sm text-muted-foreground">
          관심 태그를 등록하면 헤더 빠른필터와 향후 알림톡 매칭에 활용할 수 있다.
        </p>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!value.trim()) return;
            createMutation.mutate(value.trim());
          }}
        >
          <Input
            placeholder="태그명 입력"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="w-64"
          />
          <Button type="submit">추가</Button>
        </form>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">등록된 태그</h2>
        <div className="flex flex-wrap gap-2">
          {data?.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-2">
              #{tag.name}
              <button
                type="button"
                onClick={() => deleteMutation.mutate(tag.id)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                삭제
              </button>
            </Badge>
          )) || <p className="text-sm text-muted-foreground">등록된 태그가 없습니다.</p>}
        </div>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">추천 태그</h2>
        <div className="flex flex-wrap gap-2">
          {recommended.map((tag) => (
            <Button key={tag} variant="outline" size="sm" onClick={() => createMutation.mutate(tag)}>
              #{tag}
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
