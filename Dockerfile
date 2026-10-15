# Production Dockerfile for Deno 2
FROM denoland/deno:alpine AS runner

WORKDIR /app
COPY deno.json ./
COPY src/ ./src/

EXPOSE 8000

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "src/main.ts"]
