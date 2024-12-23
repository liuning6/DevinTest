import { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getLeaderboard } from "@/utils/storage";
import type { LeaderboardEntry } from "@/utils/storage";

function Leaderboard() {
  const [items, setItems] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setItems(getLeaderboard());
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((entry, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{entry.name}</TableCell>
              <TableCell className="text-right">{entry.score}</TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500">
                No scores yet. Be the first to play!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default Leaderboard;
