package dbconn

import (
	"fmt"
	"strings"
)

const supabaseIPv4PoolerHint = " Supabase direct host db.<ref>.supabase.co often has only IPv6 (AAAA) in DNS, so IPv4-first resolution cannot help. Use Project Settings → Database → Connection pooling → Transaction mode (port 6543, pooler hostname). See backend/.env.example."

// WrapPingError adds a short hint when the failure looks like IPv6-only DNS plus an unreachable IPv6 route.
func WrapPingError(err error) error {
	if err == nil || !looksLikeSupabaseIPv6Unreachable(err) {
		return err
	}
	return fmt.Errorf("%w:%s", err, supabaseIPv4PoolerHint)
}

func looksLikeSupabaseIPv6Unreachable(err error) bool {
	s := err.Error()
	if !strings.Contains(s, "supabase.co") {
		return false
	}
	if !strings.Contains(s, "network is unreachable") {
		return false
	}
	return strings.Contains(s, "[") && strings.Contains(s, "]:5432")
}
