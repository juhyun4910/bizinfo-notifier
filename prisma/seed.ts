import { importNotices } from "@/lib/importer";

/**
 * Prisma seed 스크립트: 기업마당 API를 통해 2페이지 분량의 데이터를 불러온다.
 * - 운영 주석: 레이트리밋을 고려하여 fetchAllPages 내부에서 재시도/백오프가 적용된다.
 */
async function main() {
  const result = await importNotices({ pages: 2, pageUnit: 50 });
  console.log(`Seed completed`, result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
