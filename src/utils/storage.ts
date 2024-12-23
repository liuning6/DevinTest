// Types for leaderboard entries
export interface LeaderboardEntry {
  name: string;
  score: number;
}

/**
 * Retrieves the leaderboard data from localStorage
 * @returns Array of leaderboard entries sorted by score in descending order
 */
export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem("snake_leaderboard");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading leaderboard data:", error);
    return [];
  }
}

/**
 * Saves the leaderboard data to localStorage
 * @param leaderboard Array of leaderboard entries to save
 */
export function setLeaderboard(leaderboard: LeaderboardEntry[]): void {
  try {
    localStorage.setItem("snake_leaderboard", JSON.stringify(leaderboard));
  } catch (error) {
    console.error("Error saving leaderboard data:", error);
  }
}

/**
 * Adds a new score to the leaderboard
 * @param name Player name
 * @param score Player score
 * @returns Updated leaderboard entries
 */
export function addScore(name: string, score: number): LeaderboardEntry[] {
  const leaderboard = getLeaderboard();
  leaderboard.push({ name: name || "Anonymous", score });
  
  // Sort by score in descending order
  leaderboard.sort((a, b) => b.score - a.score);
  
  // Keep only top 10 scores
  const topScores = leaderboard.slice(0, 10);
  
  setLeaderboard(topScores);
  return topScores;
}
