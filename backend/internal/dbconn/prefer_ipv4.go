package dbconn

import (
	"context"
	"net"
	"os"
	"strings"

	"github.com/jackc/pgx/v5"
)

// ApplyPreferIPv4 sets ConnConfig.LookupFunc so hostname resolution returns IPv4
// addresses before IPv6. pgconn resolves the host before DialFunc runs
// (buildConnectOneConfigs); the default resolver often lists IPv6 first, so
// connect attempts use IPv6 and fail on networks without IPv6 reachability.
//
// If DNS returns only AAAA (no A record), as is common for db.<ref>.supabase.co,
// there is no IPv4 to try; use the Supabase pooler URI (port 6543) instead.
// Set DATABASE_PREFER_IPV4=false to use pgx's default LookupHost ordering.
func ApplyPreferIPv4(cfg *pgx.ConnConfig) {
	if strings.EqualFold(strings.TrimSpace(os.Getenv("DATABASE_PREFER_IPV4")), "false") {
		return
	}
	if cfg == nil {
		return
	}
	cfg.LookupFunc = preferIPv4Lookup
}

// preferIPv4Lookup matches net.Resolver.LookupHost's contract (slice of IP strings).
func preferIPv4Lookup(ctx context.Context, host string) ([]string, error) {
	ips, err := net.DefaultResolver.LookupIPAddr(ctx, host)
	if err != nil {
		return nil, err
	}
	var v4, v6 []string
	for _, ipa := range ips {
		if v := ipa.IP.To4(); v != nil {
			v4 = append(v4, v.String())
		} else {
			v6 = append(v6, ipa.IP.String())
		}
	}
	return append(v4, v6...), nil
}
