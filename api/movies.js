export default async function handler(req, res) {
  const { path, ...params } = req.query;

  if (!path) {
    return res.status(400).json({ error: "Missing 'path' query parameter" });
  }

  const API_KEY = process.env.TMDB_API_KEY;
  const BASE_URL = "https://api.themoviedb.org/3";

  if (!API_KEY) {
    return res.status(500).json({ error: "TMDB_API_KEY is not configured on the server" });
  }

  try {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set("api_key", API_KEY);
    
    Object.keys(params).forEach((key) => {
      url.searchParams.set(key, params[key]);
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `TMDB API error: ${response.statusText}`,
        details: errorText 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Serverless Function Error:", error);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
}
