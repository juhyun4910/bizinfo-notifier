# bizinfo-alert (DB 없이 최소 웹 데모)

브라우저에서 기업마당 지원사업정보 API를 조회하고, 카드형 리스트와 태그(해시태그/분류) 필터·텍스트 검색으로 빠르게 탐색하는 최소 예제입니다. 데이터베이스/서버 연동 없이 동작하며, API 호출은 서버 프록시를 통해 수행해 CORS/키 노출을 방지합니다.

## 빠른 실행
- 의존성 설치: `npm install`
- 개발 서버: `npm run dev` → http://localhost:3000
- 옵션(서버 환경변수): 프로젝트 루트에 `.env` 생성 후 API 키 설정
  - `BIZINFO_API_KEY=발급키` (없으면 데모키 21Ya48 사용)

## 사용 방법
- 상단 “검색 파라미터”에서 `pageIndex`, `pageUnit`, `searchLclasId`, `hashtags`를 입력하고 “불러오기”
- “해시태그 전체”에서 칩을 클릭해 다중 선택(해시태그 + 분류(경영/수출/기술/창업) 포함)
- “빠른 검색” 입력창으로 제목/기관/요약 문자 포함 검색
- 카드 제목을 클릭하면 기업마당 상세 페이지를 새 창으로 엽니다.

## 폴더 구조
- `app/`
  - `page.tsx`: 단일 화면. API 호출, 카드 리스트 렌더링, 텍스트 검색, 선택한 태그 필터링, D-Day 계산을 담당합니다.
  - `layout.tsx`: 최소 레이아웃(헤더/푸터)과 전역 스타일 로드.
  - `globals.css`: Tailwind 기반 전역 스타일(필수 최소만 유지).
  - `api/proxy/route.ts`: 서버 프록시. 쿼리 파라미터를 화이트리스트로 전달하고 `BIZINFO_API_KEY`(없으면 21Ya48)를 사용해 기업마당 API(JSON) 호출 후 그대로 반환합니다.
- `components/`
  - `tag-chip.tsx`: 태그 선택/해제 칩 컴포넌트.
- `public/`: 정적 에셋 폴더(선택).
- `next.config.mjs`: Next.js 기본 설정.
- `tailwind.config.ts`, `postcss.config.mjs`: Tailwind 설정(필수).
- `tsconfig.json`, `next-env.d.ts`: TypeScript/Next 구성 파일.
- `.eslintrc.json`, `.gitignore`: 품질/버전관리 보조.

## 삭제/정리된 항목
- 데이터베이스/Prisma 및 관련 스크립트
- 서버 API(수집/북마크 등)와 테스트 코드
- Docker/Jest 구성 등 현재 데모에 불필요한 파일

## 보안/운영 메모
- 브라우저에서 직접 외부 API를 호출하지 않고, `/api/proxy`를 통해 서버에서 호출해 CORS와 키 노출을 방지합니다.
- 키는 가능하면 `.env`의 `BIZINFO_API_KEY`로 제공하세요.
- API 응답 구조가 변동될 수 있어, `jsonArray.item` 배열/단건/상대경로 링크 등 다양한 케이스를 방어적으로 처리합니다.
