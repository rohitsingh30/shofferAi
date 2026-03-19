#!/bin/bash
# shofferai-parallel.sh — Run N ShofferAI tasks in parallel using Claude agents
#
# Each task gets its own Claude agent + its own Chrome window (isolated).
# N tasks = N Chrome windows = N Claude agents running simultaneously.
#
# Usage:
#   ./shofferai-parallel.sh "task1" "task2" "task3" ...
#
# Environment:
#   MODEL       Claude model (default: sonnet)
#
# Examples:
#   ./shofferai-parallel.sh \
#     "Book cheapest hotel in Goa for March 22-23 on Booking.com" \
#     "Order milk, bread, eggs from Blinkit to Sector 62 Noida" \
#     "Order butter chicken from Zomato to Sector 62 Noida"
#
#   MODEL=haiku ./shofferai-parallel.sh "task1" "task2"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_SCRIPT="${SCRIPT_DIR}/shofferai-agent.sh"
MODEL="${MODEL:-sonnet}"

if [ $# -eq 0 ]; then
  echo "Usage: $0 \"task1\" \"task2\" \"task3\" ..."
  echo ""
  echo "Each task gets its own Chrome window + Claude agent."
  echo ""
  echo "Environment variables:"
  echo "  MODEL  Claude model (default: sonnet)"
  exit 1
fi

N=$#
echo "=== ShofferAI Parallel Runner ==="
echo "Tasks:   ${N}"
echo "Windows: ${N} (one Chrome per task)"
echo "Model:   ${MODEL}"
echo "================================="
echo ""

# Create temp dir for output logs
LOG_DIR=$(mktemp -d)
PIDS=()

# Launch all tasks in parallel — each gets its own Chrome window
for i in $(seq 1 $N); do
  TASK="${!i}"
  LOG_FILE="${LOG_DIR}/task-${i}.log"
  echo "[Task ${i}/${N}] Starting: ${TASK}"
  MODEL="${MODEL}" bash "${AGENT_SCRIPT}" "${TASK}" > "${LOG_FILE}" 2>&1 &
  PIDS+=($!)
  # Small stagger to avoid port race conditions
  sleep 1
done

echo ""
echo "All ${N} agents launched (${N} Chrome windows). Waiting for completion..."
echo ""

# Wait for all tasks and collect results
FAILED=0
for i in $(seq 1 $N); do
  idx=$((i - 1))
  PID=${PIDS[$idx]}
  TASK="${!i}"
  LOG_FILE="${LOG_DIR}/task-${i}.log"

  if wait "${PID}"; then
    echo "✅ [Task ${i}/${N}] DONE: ${TASK}"
  else
    echo "❌ [Task ${i}/${N}] FAILED: ${TASK}"
    FAILED=$((FAILED + 1))
  fi

  echo "--- Output (task ${i}) ---"
  cat "${LOG_FILE}"
  echo "--- End task ${i} ---"
  echo ""
done

# Cleanup
rm -rf "${LOG_DIR}"

echo "================================="
echo "Results: $((N - FAILED))/${N} succeeded, ${FAILED} failed"
echo "================================="

exit ${FAILED}
