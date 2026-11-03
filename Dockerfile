# syntax=docker/dockerfile:1
# Deno starter: compile to a single binary, run it on distroless as non-root.

ARG DENO_VERSION=2.9.8

# ---- build: full Deno toolchain ---------------------------------------------
FROM denoland/deno:${DENO_VERSION} AS build
WORKDIR /app

# Manifests first, so the dependency layer is cached until they change.
COPY deno.json deno.lock ./
COPY src/ ./src/
RUN deno install --frozen --entrypoint src/main.ts

# -P bakes the "default" permission set from deno.json into the binary:
# net to 0.0.0.0 and 127.0.0.1, env PORT, nothing else.
RUN deno compile --frozen -P --output /out/server src/main.ts

# ---- runtime: glibc + CA certs, no shell, no package manager ---------------
FROM gcr.io/distroless/cc-debian12:nonroot AS runtime
WORKDIR /app
COPY --from=build /out/server /app/server
ENV PORT=8000
USER nonroot
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD ["/app/server", "healthcheck"]
ENTRYPOINT ["/app/server"]
