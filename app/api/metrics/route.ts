// ─────────────────────────────────────────────────────────────────────────────
// FILE: app/api/metrics/route.ts
//
// PURPOSE:
//   This file creates an HTTP endpoint at /api/metrics.
//   Prometheus visits this URL every 15 seconds to READ the metrics our app
//   is collecting. This file simply answers that request with the numbers.
//
//   The flow:
//     Prometheus  →  GET /api/metrics  →  this file reads the registry
//                                          and returns all metric numbers
//                                          as plain text
//                                       →  Prometheus stores the numbers
//                                       →  Grafana reads from Prometheus
//                                       →  you see graphs
// ─────────────────────────────────────────────────────────────────────────────

// Import the shared registry from metrics.ts.
// The registry is the "notebook" holding all metric readings.
// We read from it here and send its contents back to Prometheus.
import { metricsRegistry } from "@/app/lib/metrics";

// NextResponse is Next.js' helper for building HTTP responses.
import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// GET handler
//
// In Next.js App Router, you name your exported function after the HTTP
// method you want to handle. Prometheus does a GET request, so we export GET.
//
// This runs EVERY TIME Prometheus (or anyone) visits /api/metrics.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  // Read all current metric values from the registry and format them as
  // the Prometheus text format (plain text that Prometheus understands).
  //
  // Example of what metricsText looks like:
  //   # HELP word_puzzle_nodejs_heap_size_used_bytes Process heap size used
  //   # TYPE word_puzzle_nodejs_heap_size_used_bytes gauge
  //   word_puzzle_nodejs_heap_size_used_bytes 58310656
  const metricsText = await metricsRegistry.metrics();

  // Return the metrics text as an HTTP 200 response.
  // The Content-Type header MUST be set correctly — this is how Prometheus
  // knows the response is in the format it expects. Without it, Prometheus
  // will reject the response.
  //
  // metricsRegistry.contentType already has the correct value:
  //   "text/plain; version=0.0.4; charset=utf-8"
  return new NextResponse(metricsText, {
    status: 200,
    headers: {
      "Content-Type": metricsRegistry.contentType,
    },
  });
}
