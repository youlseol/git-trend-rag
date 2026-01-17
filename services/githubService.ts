import { Repo } from "../types";

const BASE_URL = "https://api.github.com";

/**
 * Fetches a single page of starred repositories.
 */
export const fetchUserStarsPage = async (username: string, page: number = 1): Promise<Repo[]> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${username}/starred?per_page=100&page=${page}&sort=created&direction=desc`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error("User not found");
      if (response.status === 403) throw new Error("Rate limit exceeded. Please try again later.");
      throw new Error("Failed to fetch stars");
    }

    const data = await response.json();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any) => ({
      id: item.id,
      name: item.full_name,
      description: item.description,
      html_url: item.html_url,
      language: item.language,
      stargazers_count: item.stargazers_count,
      owner: {
        login: item.owner.login,
        avatar_url: item.owner.avatar_url,
      },
      topics: item.topics
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches ALL starred repositories by iterating through pages.
 * Includes a progress callback.
 */
export const fetchAllUserStars = async (
    username: string, 
    onProgress?: (count: number) => void
): Promise<Repo[]> => {
    let page = 1;
    let allRepos: Repo[] = [];
    let keepFetching = true;

    while (keepFetching) {
        const repos = await fetchUserStarsPage(username, page);
        if (repos.length === 0) {
            keepFetching = false;
        } else {
            allRepos = [...allRepos, ...repos];
            if (onProgress) onProgress(allRepos.length);
            
            // If we got less than 100, we've reached the end
            if (repos.length < 100) {
                keepFetching = false;
            } else {
                page++;
            }
        }
        
        // Safety break for unauthenticated API limits (approx 10 pages / 1000 items is safe-ish)
        // Adjust this if you anticipate users with 5000+ stars hitting rate limits immediately.
        if (page > 20) keepFetching = false; 
    }
    return allRepos;
};