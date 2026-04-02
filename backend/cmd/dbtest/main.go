package main

import (
	"context"
	"log"
	"os"

	"github.com/AmanKawadia26/TrustLeader/backend/internal/dbconn"
	"github.com/jackc/pgx/v5"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set (source backend/.env or export it)")
	}

	cfg, err := pgx.ParseConfig(dsn)
	if err != nil {
		log.Fatalf("parse config: %v", err)
	}
	dbconn.ApplyPreferIPv4(cfg)
	conn, err := pgx.ConnectConfig(context.Background(), cfg)
	if err != nil {
		log.Fatalf("failed to connect to the database: %v", dbconn.WrapPingError(err))
	}
	defer conn.Close(context.Background())

	var version string
	if err := conn.QueryRow(context.Background(), "SELECT version()").Scan(&version); err != nil {
		log.Fatalf("query failed: %v", err)
	}

	log.Println("connected:", version)
}
