'use client';

import { useEffect, useState, useRef } from 'react';

interface PreloadResult {
  /** true once all images finished loading (or failed/timed out) */
  ready: boolean;
  /** set of image URLs that failed to load */
  failed: Set<string>;
}

/**
 * Preloads a batch of image URLs in parallel.
 * Returns `ready: false` (show shimmer) until ALL images have either
 * loaded or failed, then flips to `ready: true` so the UI can reveal
 * everything at once. Includes a safety timeout so the UI never gets
 * stuck in shimmer state forever.
 */
export function useImagePreloader(
  urls: (string | undefined)[],
  timeoutMs = 5000,
): PreloadResult {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  // Track whether we already resolved (prevents double-fire)
  const resolved = useRef(false);

  useEffect(() => {
    resolved.current = false;
    setReady(false);
    setFailed(new Set());

    const validUrls = urls.filter(
      (u): u is string => !!u && u.startsWith('http'),
    );

    // No images to load → reveal immediately
    if (validUrls.length === 0) {
      setReady(true);
      return;
    }

    const failedSet = new Set<string>();
    let loaded = 0;
    const total = validUrls.length;

    function check() {
      if (resolved.current) return;
      loaded++;
      if (loaded >= total) {
        resolved.current = true;
        setFailed(new Set(failedSet));
        setReady(true);
      }
    }

    // Preload each image in parallel
    const images = validUrls.map((url) => {
      const img = new Image();
      // Many grocery CDNs (Zepto, Blinkit) reject requests based on
      // referrer or require anonymous origin. Set both to maximize the
      // chance of a successful preload.
      try {
        (img as HTMLImageElement & { referrerPolicy?: string }).referrerPolicy = 'no-referrer';
      } catch { /* not supported in this env */ }
      img.crossOrigin = 'anonymous';
      img.onload = check;
      img.onerror = () => {
        // Retry once without crossOrigin — some CDNs serve images but
        // don't send CORS headers, which fails an anonymous request.
        const retry = new Image();
        try {
          (retry as HTMLImageElement & { referrerPolicy?: string }).referrerPolicy = 'no-referrer';
        } catch { /* not supported in this env */ }
        retry.onload = check;
        retry.onerror = () => {
          failedSet.add(url);
          check();
        };
        retry.src = url;
      };
      img.src = url;
      return img;
    });

    // Safety timeout — reveal what we have after timeoutMs
    const timer = setTimeout(() => {
      if (!resolved.current) {
        resolved.current = true;
        setFailed(new Set(failedSet));
        setReady(true);
      }
    }, timeoutMs);

    return () => {
      resolved.current = true;
      clearTimeout(timer);
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
    // Re-run when the URL list changes (stringified for stable dep)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.filter(Boolean).join(','), timeoutMs]);

  return { ready, failed };
}
