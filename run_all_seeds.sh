#!/bin/bash
for script in scripts/seed_pyq_*.mjs; do
  echo "Running $script..."
  node "$script"
done
