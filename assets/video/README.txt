Drop your hero video here as:

    hero.mp4

Until that file exists the page shows assets/img/hero-poster.svg instead,
so nothing looks broken while you are still shooting.

What works well:
  - 10 to 20 seconds, looping, no audio (it plays muted)
  - 1920x1080, H.264, under about 4 MB so the page stays quick
  - Slow movement. A pan across the shop floor, a booth door opening,
    a sander working a panel, sparks from a welder.

Shrink an oversized clip with ffmpeg:

    ffmpeg -i raw.mov -t 15 -an -vf "scale=1920:-2" \
      -c:v libx264 -crf 28 -preset slow -movflags +faststart hero.mp4

GitHub has a 100 MB per file limit, and anything over 50 MB gets a warning,
so keep it small. It is also what your customers on mobile data will thank
you for.
