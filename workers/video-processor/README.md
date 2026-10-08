# StitchedUp Video Processor Worker

Async FFmpeg worker for Social Video Phase 3 branding. **Do not run FFmpeg on Vercel** — deploy this service separately on Render.

## Recommended Render configuration (initial production)

| Setting | Value |
|---------|--------|
| Service type | **Background Worker** (no public HTTP) |
| Dockerfile | `workers/video-processor/Dockerfile` (build context = repo root) |
| Start command | Default `CMD ["npm", "start"]` |
| Replicas | **1** |
| CPU | **1 vCPU** |
| Memory | **1 GB minimum**, **2 GB preferred** |
| Ephemeral disk headroom | **≥ 2 GB** (250 MB upload + encode temp) |
| Persistent volume | **No** |
| Public domain | **No** |
| Health endpoint | **Not required** (restart on process exit) |
| Restart policy | **Always** / restart on failure |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (**worker only — never expose to browser**) |
| `VIDEO_PROCESSOR_POLL_MS` | No | Poll interval ms (default `3000`) |
| `VIDEO_PROCESSOR_WORKER_ID` | No | Identifier logged on job claims |

## Requirements

- Node.js 20+
- FFmpeg + FFprobe (installed in Docker image)
- DejaVu Sans Bold at `/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf` (installed via `fonts-dejavu-core`)

## Local run

```bash
cd workers/video-processor
npm install
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
npm start
```

## Flow

1. Vercel API creates `social_video_processing_jobs` row (`pending`) and sets asset `processing_status = processing`.
2. Worker recovers stale `processing` jobs older than **10 minutes** on startup and every ~60s.
3. Worker atomically claims one `pending` job (`UPDATE … WHERE status = 'pending'`).
4. Worker downloads original + logo from Supabase Storage, runs FFmpeg (10 min max), uploads processed MP4.
5. Worker updates asset `processed_url`, `processing_status = processed`.
6. Frontend polls `GET …/processing-status` every ~4s while card is open.

## Concurrency

- **One replica**, **one FFmpeg process at a time** per instance.
- Atomic conditional claim prevents two workers from processing the same job row.
- DB partial unique index prevents two active jobs per asset.

## Cost drivers

- Always-on worker compute (Render)
- CPU time during H.264 encodes
- Supabase storage for processed MP4s
- Supabase egress on download

Rough idle cost: low single-digit USD/month on a small always-on instance; scales with encode volume and file sizes.

## Docker build (from repo root)

```bash
docker build -f workers/video-processor/Dockerfile -t stitchedup-video-processor .
docker run --env-file .env.local stitchedup-video-processor
```
