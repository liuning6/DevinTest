import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Pause, RotateCcw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { addScore } from "@/utils/storage";
import { Trophy } from "lucide-react";
import Leaderboard from "./components/Leaderboard";

// Types
type Position = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = 'RIGHT';
const GAME_SPEED = 300;

function App() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Generate random food position
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    setFood(newFood);
  }, []);

  // Check collisions
  const checkCollision = useCallback((head: Position) => {
    // Wall collision
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }

    return false;
  }, [snake]);

  // Move snake
  const moveSnake = useCallback(() => {
    if (isPaused || isGameOver) return;

    const head = { ...snake[0] };
    
    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }

    if (checkCollision(head)) {
      setIsGameOver(true);
      setShowNameDialog(true);
      return;
    }

    const newSnake = [head];
    const ateFood = head.x === food.x && head.y === food.y;

    if (ateFood) {
      setScore(prev => prev + 1);
      generateFood();
    }

    for (let i = 0; i < snake.length - (ateFood ? 0 : 1); i++) {
      newSnake.push({ ...snake[i] });
    }

    setSnake(newSnake);
  }, [snake, direction, food, isPaused, isGameOver, checkCollision, generateFood]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
          setIsPaused(prev => !prev);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  // Game loop
  useEffect(() => {
    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  // Reset game
  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setIsGameOver(false);
    setIsPaused(true);
    setScore(0);
    generateFood();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-4 flex items-center gap-4">
        <Button 
          onClick={() => setIsPaused(!isPaused)} 
          disabled={isGameOver}
          variant="outline"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </Button>
        <Button onClick={resetGame} variant="outline">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button onClick={() => setShowLeaderboard(true)} variant="outline">
          <Trophy className="w-4 h-4" />
        </Button>
        <div className="text-lg font-semibold">Score: {score}</div>
      </div>

      {isGameOver && (
        <Alert className="mb-4 bg-red-100">
          <AlertDescription>
            Game Over! Score: {score}
          </AlertDescription>
        </Alert>
      )}

      <div 
        className="bg-white rounded-lg shadow-lg p-4"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          position: 'relative'
        }}
      >
        {/* Food */}
        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
          }}
        />
        
        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute bg-green-500 rounded"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
            }}
          />
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Use arrow keys to move, space to pause
      </div>

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Over!</DialogTitle>
            <DialogDescription>
              Your score: {score}. Enter your name for the leaderboard:
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
            placeholder="Enter your name"
          />
          <DialogFooter>
            <Button onClick={() => {
              addScore(playerName || "Anonymous", score);
              setShowNameDialog(false);
              setPlayerName("");
            }}>
              Save Score
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Leaderboard</DialogTitle>
            <DialogDescription>
              Top scores from all players
            </DialogDescription>
          </DialogHeader>
          <Leaderboard />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App
