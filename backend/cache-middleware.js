// コスト効率的なキャッシング戦略

const NodeCache = require('node-cache');

// インメモリキャッシュ（Cloud Runインスタンス内）
const cache = new NodeCache({ 
  stdTTL: 300, // 5分
  checkperiod: 60,
  useClones: false // メモリ使用量削減
});

// キャッシュミドルウェア
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = `${req.method}:${req.originalUrl}`;
    const cached = cache.get(key);
    
    if (cached) {
      console.log('Cache HIT:', key);
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }
    
    console.log('Cache MISS:', key);
    res.setHeader('X-Cache', 'MISS');
    
    // レスポンスをキャッシュ
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, data, duration);
      originalJson.call(this, data);
    };
    
    next();
  };
};

// 選択的キャッシング設定
const cacheConfig = {
  '/api/v1/customers': {
    duration: 300, // 5分
    headers: 'public, max-age=300, s-maxage=600'
  },
  '/api/v1/reservations': {
    duration: 60, // 1分
    headers: 'public, max-age=60, s-maxage=120'
  },
  '/api/v1/analytics/dashboard': {
    duration: 600, // 10分
    headers: 'public, max-age=600, s-maxage=1200'
  }
};

// コスト効率的なヘッダー設定
const setCacheHeaders = (req, res, next) => {
  const config = cacheConfig[req.path];
  if (config) {
    res.setHeader('Cache-Control', config.headers);
    res.setHeader('Vary', 'Accept-Encoding');
  }
  next();
};

// キャッシュ統計（コスト監視用）
const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
};

module.exports = {
  cacheMiddleware,
  setCacheHeaders,
  getCacheStats,
  cache
};