FROM node:22.14.0-alpine AS builder

WORKDIR /app

COPY package*.json .
COPY pnpm-lock.yaml .

RUN npm i -g pnpm
RUN pnpm install

COPY . .

RUN pnpm run build
RUN pnpm prune --prod

FROM node:22.14.0-alpine AS deployer

WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/ 
COPY --from=builder /app/src/posts ./posts
EXPOSE 80

ENV NODE_ENV=production
ENV PORT=80

CMD [ "node", "build" ]