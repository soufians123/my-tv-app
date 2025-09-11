// API endpoint لتوليد صور placeholder
export default function handler(req, res) {
  const { params } = req.query
  
  // استخراج الأبعاد من المسار
  let width = 400
  let height = 300
  
  if (params && params.length >= 2) {
    width = parseInt(params[0]) || 400
    height = parseInt(params[1]) || 300
  } else if (params && params.length === 1) {
    const dimensions = params[0].split('x')
    if (dimensions.length === 2) {
      width = parseInt(dimensions[0]) || 400
      height = parseInt(dimensions[1]) || 300
    } else {
      width = height = parseInt(params[0]) || 400
    }
  }
  
  // إنشاء SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="2" y="2" width="${width-4}" height="${height-4}" fill="none" stroke="#d1d5db" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) * 0.1}" fill="#9ca3af" text-anchor="middle" dy="0.3em">
        ${width} × ${height}
      </text>
    </svg>
  `
  
  res.setHeader('Content-Type', 'image/svg+xml')
  res.setHeader('Cache-Control', 'public, max-age=31536000')
  res.status(200).send(svg)
}