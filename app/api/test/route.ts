// app/api/test/route.ts
export async function GET() {
  const mlUrl = process.env.ML_API_URL
  
  try {
    const res = await fetch(`${mlUrl}/docs`)
    return Response.json({
      ml_api_url: mlUrl,
      status: res.status,
      reachable: res.ok
    })
  } catch (err) {
    return Response.json({
      ml_api_url: mlUrl,
      reachable: false,
      error: String(err)
    })
  }
}