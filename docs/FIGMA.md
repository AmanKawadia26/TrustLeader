# Figma design frames (TrustLeader)

**Latest capture file (html-to-design):** [TrustLeader-traffic-light-and-flows](https://www.figma.com/design/E4ZO24w5hDBojNIQwErPdB) — `fileKey`: `E4ZO24w5hDBojNIQwErPdB`

Use the **Figma MCP** integration in Cursor (`generate_figma_design`, `get_design_context`, `use_figma`) when you need canvas output.

## Recommended frames

1. **Home** — Forest hero, gold search CTA, stats row, featured business grid.
2. **Categories** — 3-column category cards with icons.
3. **About** — Story + stats grid + values grid.
4. **Search** — Search bar + results grid + empty state.
5. **Write review** — Rating, title, body, trust note.
6. **Login / Register (consumer)** / **Register (business)** — Dual signup flows; link between consumer and business.
7. **Business profile** — Traffic-light badge, listing source chip, aggregate rating, **InsuranceBanner** when `insurance_proof` + green.

## Capturing the live UI into Figma

With the dev server running (`pnpm --filter @workspace/trustleader dev`), use the **Figma MCP** tool `generate_figma_design`:

1. Call it with `outputMode: "newFile"`, a `fileName`, and your team `planKey` to obtain a **capture ID** and hash URL instructions.
2. Open the localhost URL with the `#figmacapture=...` hash so the capture script runs (see MCP response for the exact link).
3. Poll `generate_figma_design` with the same `captureId` until status is `completed`.
4. For additional screens, use `outputMode: "existingFile"` with the `fileKey` returned after the first capture.

### Automated capture (repo helper)

Static page + Playwright live in `tools/figma-capture-static/` (see `README.md` there): run `python3 -m http.server 5173 --bind 127.0.0.1`, set `CAPTURE_ID` from a new `generate_figma_design` call, then `node run-capture.mjs`. For **additional screens** in the same file, call MCP with `outputMode: 'existingFile'` and `fileKey: 'E4ZO24w5hDBojNIQwErPdB'`.

## Tokens

Brand CSS variables live in `artifacts/trustleader/src/index.css` (`--brand-forest`, `--brand-gold`, `--brand-cream`, `--brand-sand`).

## Logo (code ↔ Figma)

Header/footer use the combined wordmark SVG `artifacts/trustleader/public/logo-on-dark.svg` (green star + **TrustLeader**). The Figma file `E4ZO24w5hDBojNIQwErPdB` uses matching **TrustLeader** copy (no `.org` in the wordmark).
