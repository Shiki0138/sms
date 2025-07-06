// キャッシュ設定
module.exports = {
  // 静的データの長期キャッシュ
  staticCache: {
    '/api/v1/customers': 'public, max-age=300, s-maxage=600',
    '/api/v1/reservations': 'public, max-age=60, s-maxage=120',
    '/api/v1/analytics/dashboard': 'public, max-age=300, s-maxage=600'
  },
  
  // キャッシュミドルウェア
  cacheMiddleware: (req, res, next) => {
    const cacheControl = module.exports.staticCache[req.path];
    if (cacheControl) {
      res.setHeader('Cache-Control', cacheControl);
    }
    next();
  }
};