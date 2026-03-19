export default async function handler(req, res) {
  const { path, ...params } = req.query;

  console.log("API Function Called:", { path, params });

  if (!path) {
    console.error("Error: Missing path parameter");
    return res.status(400).json({ error: "Missing 'path' query parameter" });
  }

  // eslint-disable-next-line no-undef
  const API_KEY = process.env.TMDB_API_KEY;
  const BASE_URL = "https://api.themoviedb.org/3";

  if (!API_KEY) {
    console.error("Error: TMDB_API_KEY not found in process.env");
    return res.status(500).json({ 
      error: "TMDB_API_KEY is not configured on the server",
      tip: "Please check Vercel Project Settings > Environment Variables"
    });
  }

  try {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set("api_key", API_KEY);
    
    Object.keys(params).forEach((key) => {
      url.searchParams.set(key, params[key]);
    });

    console.log("Fetching from TMDB:", url.toString().replace(API_KEY, "HIDDEN"));

    const response = await fetch(url.toString(), {
        headers: {
            "Accept": "application/json",
            "User-Agent": "Vercel-Serverless-Function"
        }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("TMDB API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText
      });
      return res.status(response.status).json({ 
        error: `TMDB API error: ${response.statusText}`,
        details: errorText 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Serverless Function Runtime Error:", error);
    // eslint-disable-next-line no-undef
    const isDev = process.env.NODE_ENV === "development";
    return res.status(500).json({ 
        error: "Internal Server Error", 
        message: error.message,
        stack: isDev ? error.stack : undefined
    });
  }
}
