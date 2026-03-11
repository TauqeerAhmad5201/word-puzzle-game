// ─────────────────────────────────────────────────────────────────────────────
// FILE: app/lib/metrics.ts
//
// PURPOSE:
//   This file sets up Prometheus metrics collection for our Next.js app.
//
//   Think of it like this:
//     - Prometheus is a tool that COLLECTS numbers (metrics) from your app
//       and stores them over time so you can see trends (e.g. "memory grew
//       from 50 MB to 200 MB over the last hour").
//     - This file is the "sensor" you install in your app.
//     - The sensor reads things like: How much memory is used? How busy is
//       the CPU? How often is garbage collection happening?
//
//   You import this file ONCE in your metrics API route, and from that point
//   Prometheus can read the numbers at any time.
// ─────────────────────────────────────────────────────────────────────────────

// Import specific named exports from prom-client.
// prom-client is the official Prometheus library for Node.js.
// It does the heavy lifting of measuring and formatting metrics.
//
// We import only the two things we need:
//   Registry              → the "notebook" that holds all metric values
//   collectDefaultMetrics → a function that starts auto-measuring Node.js internals
import { Registry, collectDefaultMetrics } from "prom-client";

// ─────────────────────────────────────────────────────────────────────────────
// WHAT IS A "REGISTRY"?
//
// A Registry is like a notebook where all your metrics are written down.
// When Prometheus comes to scrape (read) metrics, it reads this notebook.
//
// We create ONE registry and reuse it throughout the whole app.
// This is called a "singleton" pattern — one shared instance, not many.
//
// Why a singleton?
//   Next.js in development mode can hot-reload code, which would create a new
//   registry on every reload. By caching it on the global object, we avoid
//   creating duplicate metrics (which would cause an error).
// ─────────────────────────────────────────────────────────────────────────────

// We store our registry on the Node.js "global" object so it survives
// hot-reloads in development. Think of `global` as a shared shelf that
// persists as long as the Node.js process is running.
const globalWithMetrics = global as typeof globalThis & {
  metricsRegistry?: Registry;
};

// If a registry doesn't exist yet on the global shelf, create one.
// If it already exists (e.g. after a hot-reload), reuse the existing one.
if (!globalWithMetrics.metricsRegistry) {
  // Create a brand new Registry — the notebook for our metrics.
  const registry = new Registry();

  // ───────────────────────────────────────────────────────────────────────────
  // WHAT ARE "DEFAULT METRICS"?
  //
  // prom-client comes with a built-in set of metrics that are useful for
  // almost every Node.js app. You get them FOR FREE just by calling this one
  // function. They include:
  //
  //   nodejs_heap_size_used_bytes    → How much memory your app is actively using
  //   nodejs_heap_size_total_bytes   → Total memory allocated (used + free)
  //   nodejs_external_memory_bytes   → Memory used by C++ objects (e.g. Buffers)
  //   nodejs_gc_duration_seconds     → How long garbage collection pauses lasted
  //   nodejs_eventloop_lag_seconds   → How backed-up the event loop is
  //   process_cpu_seconds_total      → Total CPU time used by your process
  //   process_open_fds               → Number of open file descriptors
  //
  // These are visible in Grafana once Prometheus starts collecting them.
  // ───────────────────────────────────────────────────────────────────────────
  collectDefaultMetrics({
    // Tell prom-client WHICH registry to write these metrics into.
    register: registry,

    // "prefix" adds a label in front of every metric name.
    // e.g. instead of "nodejs_heap_size_used_bytes" it becomes
    //      "word_puzzle_nodejs_heap_size_used_bytes"
    // This helps when you have multiple apps sending to the same Prometheus —
    // you can tell them apart by their prefix.
    prefix: "word_puzzle_",
  });

  // Save the registry to the global shelf so it can be reused.
  globalWithMetrics.metricsRegistry = registry;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
//
// Export the registry so other files (like our API route) can import it
// and read the metric values to send to Prometheus.
// ─────────────────────────────────────────────────────────────────────────────
export const metricsRegistry = globalWithMetrics.metricsRegistry;
