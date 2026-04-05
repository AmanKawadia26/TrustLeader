# Build: docker build -f backend/Dockerfile -t trustleader-api .
# Run:   docker run --rm -e PORT=8080 -e DATABASE_URL=... -e SUPABASE_JWT_SECRET=... -p 8080:8080 trustleader-api

FROM golang:1.22-alpine AS build
WORKDIR /src
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api

FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata
COPY --from=build /out/api /usr/local/bin/trustleader-api
EXPOSE 8080
ENV PORT=8080
USER 65534:65534
ENTRYPOINT ["/usr/local/bin/trustleader-api"]
