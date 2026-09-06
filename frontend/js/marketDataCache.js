/**
 * KRISHISHETRA — REUSABLE MARKET DATA CACHE HELPER
 * 
 * Provides persistent, validated caching for market prices across pages.
 * Distinguishes by crop, mandi, and state.
 * Implements strict data validation, corruption resistance, and human-friendly cache age formatting.
 */

(function () {
  'use strict';

  const CACHE_PREFIX = 'krishi_market_cache_v3:';

  /**
   * Normalizes strings for consistent cache key generation
   */
  function normalizeKeyPart(str) {
    if (!str) return 'all';
    return String(str)
      .toLowerCase()
      .trim()
      .replace(/\s*(apmc|mandi|market|yard)\b/gi, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Generates unique cache key distinguished by crop, mandi, and state
   * Example: market:rice:pune:maharashtra
   */
  function generateKey(crop, mandi, state) {
    const c = normalizeKeyPart(crop);
    const m = normalizeKeyPart(mandi);
    const s = normalizeKeyPart(state);
    return `market:${c}:${m}:${s}`;
  }

  /**
   * Validates cached data payload.
   * Ensures data is non-null, has at least one valid observation with a positive numeric price,
   * and contains a valid timestamp.
   */
  function isCacheValid(entry) {
    if (!entry || typeof entry !== 'object') return false;

    // Check timestamp
    const timestamp = entry.fetchedAt || entry.savedAt;
    if (!timestamp || isNaN(new Date(timestamp).getTime())) {
      return false;
    }

    // Check payload data
    const data = entry.data;
    if (!data) return false;

    // If array of records
    if (Array.isArray(data)) {
      if (data.length === 0) return false;
      // Must contain at least one record with a valid positive numeric price
      const hasValidPrice = data.some(r => {
        if (!r || typeof r !== 'object') return false;
        const p = Number(r.modalPrice !== undefined ? r.modalPrice : (r.price !== undefined ? r.price : r.minPrice));
        return !isNaN(p) && p > 0;
      });
      return hasValidPrice;
    }

    // If single object
    if (typeof data === 'object') {
      const p = Number(data.modalPrice !== undefined ? data.modalPrice : (data.price !== undefined ? data.price : data.currentPrice));
      return !isNaN(p) && p > 0;
    }

    return false;
  }

  /**
   * Returns human-readable cache age relative to now
   * Examples:
   * - "Updated just now"
   * - "Updated 15 minutes ago"
   * - "Updated 2 hours ago"
   * - "Updated 2 days ago"
   */
  function getCacheAge(entry) {
    if (!entry) return 'Date unknown';
    const timeStr = entry.fetchedAt || entry.savedAt || entry.timestamp;
    if (!timeStr) return 'Previously saved';

    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return 'Previously saved';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffMins < 2) return 'Updated just now';
    if (diffMins < 60) return `Updated ${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `Updated ${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Updated yesterday';
    if (diffDays < 30) return `Updated ${diffDays} days ago`;

    return `Updated on ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  /**
   * Save verified real market data to localStorage
   */
  function saveMarketData(key, data, source = 'live', metadata = {}) {
    if (typeof localStorage === 'undefined') return false;
    if (!data) return false;

    // Check basic validity before saving
    const tempEntry = {
      data,
      fetchedAt: metadata.fetchedAt || new Date().toISOString(),
      savedAt: new Date().toISOString()
    };
    if (!isCacheValid(tempEntry)) {
      console.warn('[MarketDataCache] Rejected saving invalid or price-less market data');
      return false;
    }

    try {
      const storageKey = CACHE_PREFIX + key;
      const payload = {
        key,
        storageKey,
        data,
        source: source || 'live',
        commodity: metadata.commodity || '',
        mandi: metadata.mandi || '',
        state: metadata.state || '',
        fetchedAt: metadata.fetchedAt || new Date().toISOString(),
        savedAt: new Date().toISOString()
      };

      localStorage.setItem(storageKey, JSON.stringify(payload));
      return true;
    } catch (err) {
      console.warn('[MarketDataCache] Failed to save market cache:', err.message || err);
      return false;
    }
  }

  /**
   * Get cached real market data from localStorage.
   * Returns null if not found or corrupted.
   */
  function getCachedMarketData(key) {
    if (typeof localStorage === 'undefined') return null;

    try {
      const storageKey = CACHE_PREFIX + key;
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (isCacheValid(parsed)) {
        return parsed;
      } else {
        // Cache corrupted: remove invalid entry
        console.warn(`[MarketDataCache] Discarding corrupted cache entry for ${key}`);
        localStorage.removeItem(storageKey);
        return null;
      }
    } catch (err) {
      console.warn('[MarketDataCache] Error reading cache:', err.message || err);
      return null;
    }
  }

  /**
   * Search for any valid cached market data matching crop and state if exact mandi is not found
   */
  function findAlternativeCachedData(crop, state) {
    if (typeof localStorage === 'undefined') return null;

    const normCrop = normalizeKeyPart(crop);
    const normState = normalizeKeyPart(state);

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (isCacheValid(parsed)) {
              const kParts = (parsed.key || '').split(':');
              // Format: market:crop:mandi:state
              if (kParts[1] === normCrop) {
                if (!normState || normState === 'all' || kParts[3] === normState) {
                  return parsed;
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[MarketDataCache] Error searching alternative cache:', err.message || err);
    }
    return null;
  }

  /**
   * Clear cached market data (specific key or all market cache)
   */
  function clearCachedMarketData(key) {
    if (typeof localStorage === 'undefined') return;

    try {
      if (key) {
        localStorage.removeItem(CACHE_PREFIX + key);
      } else {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(CACHE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      }
    } catch (err) {
      console.warn('[MarketDataCache] Error clearing cache:', err.message || err);
    }
  }

  const MarketDataCache = {
    generateKey,
    saveMarketData,
    getCachedMarketData,
    findAlternativeCachedData,
    clearCachedMarketData,
    isCacheValid,
    getCacheAge,
    CACHE_PREFIX
  };

  if (typeof window !== 'undefined') {
    window.MarketDataCache = MarketDataCache;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketDataCache;
  }
})();
