# Readable source and playable runtime

The editable knowledge is organized into formatted JSON under data/, including
separate entity topics, variants, spawning, interactions, rewards and combat.
Answer-routing code is split into source modules under src/. Developers should
edit these readable files, not the generated script.

As of 0.2.11 the build uses esbuild bundle:true and minify:false. It combines reachable code
and imported runtime data into the versioned main.js script. Earlier minified builds used oversized lines. Current builds retain descriptive
identifiers and vertical formatting; validation rejects lines over 10,000
characters. Whitespace does not change knowledge, intent recognition or lookup
correctness. Minecraft runs JavaScript, not a language model reading the
layout of the JSON. Formatted source is for maintainability.

Measured published 0.2.10 artifact:
- main.js: 3,868,294 bytes before ZIP compression (about 3.7 MiB).
- Complete downloadable addon: 395,477 bytes (about 386 KiB).

Those figures are file sizes, not RAM measurements or device performance results.
Parsing creates objects and the program builds lookup indexes, so runtime memory
can exceed the script’s text size. Download compression does not eliminate
startup parsing or memory costs. More data can increase both.

The preserved full wiki SQLite/ZIM archives and raw sample evidence are
research-only. They are not imported into the playable runtime. Only connected
runtime knowledge is included. A single script currently simplifies deployment;
splitting it into several statically imported files alone would not save memory,
because all those files would still load. Genuine load savings would require a
supported loading strategy that avoids eagerly constructing unused data, plus
measurement on target devices.

Recommended direction: preserve modular, vertically formatted source and
readable playable JavaScript; retain ZIP compression for the download; measure startup responsiveness and conversation
latency on representative Bedrock devices before making architectural claims.
Cloud unit tests cannot establish mobile/console memory or loading performance.

Measured 0.2.11: main.js is 5,283,359 bytes, 161,199 lines, longest line
801 characters. Complete addon: 448,784 bytes. Formatting increases text size
relative to compact output. Fifteen representative question/follow-up results
matched exactly between readable and compact builds. These are not device RAM
or Minecraft startup measurements.
