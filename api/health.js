export default function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: 'v1',
    message: '美容室管理システム API'
  })
}