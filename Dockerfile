# node 18 기반 Next.js 프로덕션 이미지
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --legacy-peer-deps || yarn install || pnpm install

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
RUN npm install --omit=dev --legacy-peer-deps || true
EXPOSE 3000
CMD ["npm", "run", "start"]
