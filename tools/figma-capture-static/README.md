# Figma html-to-design capture (static)

Used when the Vite app cannot start (Node / native binding issues). Serves a representative TrustLeader layout for MCP capture.

## One-time setup

```bash
cd tools/figma-capture-static
npm install
npx playwright install chromium
```

## Run capture

1. Start the static server (keep running):

   ```bash
   python3 -m http.server 5173 --bind 127.0.0.1
   ```

2. In Cursor, call Figma MCP `generate_figma_design` with `outputMode: newFile` and note the **capture ID**.

3. In another terminal:

   ```bash
   cd tools/figma-capture-static
   CAPTURE_ID='<paste-id>' node run-capture.mjs
   ```

4. Poll MCP `generate_figma_design` with `captureId` until **completed**.

## Existing file

Add more frames with `outputMode: existingFile` and `fileKey` from [docs/FIGMA.md](../../docs/FIGMA.md).
