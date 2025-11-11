import { PrismaClient } from "@prisma/client";

/**
 * Prisma 클라이언트 싱글톤 관리.
 * - 운영 주석: 개발 환경에서는 핫리로드 시 다중 인스턴스 생성을 피하기 위해 전역 캐시를 사용한다.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
