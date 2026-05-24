// Package relay handles forwarding ritual prescriptions from the Unity app
// to the user's email via Postmark. We forward and forget — the body is
// streamed to Postmark and never written to storage.
package relay

import "time"

// PrescriptionEnvelope is the payload the Unity app POSTs to /v1/linkage/relay_prescription.
// We do not interpret any field other than account_id (for rate-limiting) and the
// email fields (for forwarding). The playthrough_ref is logged as relay metadata only.
type PrescriptionEnvelope struct {
	AccountID      string  `json:"account_id"`
	PlaythroughRef string  `json:"playthrough_ref"`
	Subject        string  `json:"subject"`
	BodyPlain      string  `json:"body_plain"`
	BodyHTML       *string `json:"body_html,omitempty"` // optional
}

// RelayReceipt is returned to the caller and stored in relay_receipts (metadata only).
// The prescription body is never stored.
type RelayReceipt struct {
	RelayID    string    `json:"relay_id"`
	AcceptedAt time.Time `json:"accepted_at"`
}
