FROM node:20-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ffmpeg \
    fonts-dejavu-core \
    fonts-inter \
    fonts-open-sans \
    fonts-roboto-unhinted \
    fonts-bebas-neue \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY src/lib src/lib

RUN mkdir -p /app/src/lib/social/fonts/worker-bold \
  && cp /usr/share/fonts/opentype/inter/Inter-Bold.otf /app/src/lib/social/fonts/worker-bold/Inter-Bold.otf \
  && cp /usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Bold.ttf /app/src/lib/social/fonts/worker-bold/Roboto-Bold.ttf \
  && cp /usr/share/fonts/truetype/open-sans/OpenSans-Bold.ttf /app/src/lib/social/fonts/worker-bold/OpenSans-Bold.ttf \
  && cp /usr/share/fonts/opentype/bebas-neue/BebasNeue-Bold.otf /app/src/lib/social/fonts/worker-bold/BebasNeue-Bold.otf \
  && test -f /app/src/lib/social/fonts/worker-bold/Inter-Bold.otf \
  && test -f /app/src/lib/social/fonts/Inter-Regular.ttf \
  && test -f /usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf

COPY workers/video-processor/package.json workers/video-processor/
COPY workers/video-processor/tsconfig.json workers/video-processor/
COPY workers/video-processor/src workers/video-processor/src

WORKDIR /app/workers/video-processor
RUN npm install

ENV VIDEO_FONTS_ROOT=/app/src/lib/social/fonts

CMD ["npm", "start"]
