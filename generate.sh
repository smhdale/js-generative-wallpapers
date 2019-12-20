#!/bin/sh

# Choice of scripts to run
generators[0]="maze"
generators[1]="triangles"
generators[2]="circles"
generators[3]="fractal"

# Paths
base_dir="$(cd "$(dirname "$0")" && pwd)"
out_dir="$base_dir/out"

# Regenerate background, picking a generator at random
index=$[$RANDOM % ${#generators[@]}]
generator=${generators[$index]}
bg_new=$(node "$base_dir/generators/$generator")

# Delete old backgrounds
find "$out_dir" -type f -not -name "$bg_new" -delete
