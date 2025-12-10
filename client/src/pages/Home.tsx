import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Lightbulb, Zap } from "lucide-react";
import "../styles/game.css";



/**
 * DESIGN PHILOSOPHY: Futuristic Minimalism
 * - Clean, tech-forward aesthetic with neon accents
 * - Dark background with vibrant cyan/purple highlights
 * - Smooth animations and responsive interactions
 * - Grid-based layout with clear visual hierarchy
 */

interface Cell {
  x: number;
  y: number;
}

interface GameState {
  robot: Cell;
  goal: Cell;
  start: Cell;
  walls: Set<string>;
  path: Cell[];
  nextHint: Cell | null;
  isPlaying: boolean;
  isSolved: boolean;
}

const GRID_SIZE = 20;
const CELL_SIZE = 30;
const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE;
const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE;

// A* Algorithm Implementation
class Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;

  constructor(x: number, y: number, g: number, h: number) {
    this.x = x;
    this.y = y;
    this.g = g;
    this.h = h;
    this.f = g + h;
    this.parent = null;
  }
}

function heuristic(from: Cell, to: Cell, type: "manhattan" | "euclidean" = "manhattan"): number {
  const dx = Math.abs(from.x - to.x);
  const dy = Math.abs(from.y - to.y);
  
  if (type === "manhattan") {
    return dx + dy;
  } else {
    return Math.sqrt(dx * dx + dy * dy);
  }
}

function aStar(
  start: Cell,
  goal: Cell,
  walls: Set<string>,
  gridSize: number
): Cell[] {
  const openSet: Node[] = [];
  const closedSet = new Set<string>();
  const nodeMap = new Map<string, Node>();

  const startNode = new Node(start.x, start.y, 0, heuristic(start, goal));
  openSet.push(startNode);
  nodeMap.set(`${start.x},${start.y}`, startNode);

  while (openSet.length > 0) {
    // Find node with lowest f score
    let current = openSet[0];
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < current.f) {
        current = openSet[i];
        currentIndex = i;
      }
    }

    if (current.x === goal.x && current.y === goal.y) {
      // Reconstruct path
      const path: Cell[] = [];
      let node: Node | null = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    openSet.splice(currentIndex, 1);
    closedSet.add(`${current.x},${current.y}`);

    // Check all 8 neighbors (including diagonals)
    const neighbors = [
      { x: 0, y: -1 }, // up
      { x: 1, y: 0 },  // right
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }, // left
      { x: 1, y: -1 }, // up-right
      { x: 1, y: 1 },  // down-right
      { x: -1, y: 1 }, // down-left
      { x: -1, y: -1 } // up-left
    ];

    for (const neighbor of neighbors) {
      const newX = current.x + neighbor.x;
      const newY = current.y + neighbor.y;
      const key = `${newX},${newY}`;

      // Check bounds
      if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) continue;
      
      // Check if wall or already visited
      if (walls.has(key) || closedSet.has(key)) continue;

      // Calculate cost (diagonal movement costs more)
      const moveCost = Math.abs(neighbor.x) + Math.abs(neighbor.y) === 2 ? 1.4 : 1;
      const newG = current.g + moveCost;

      const existingNode = nodeMap.get(key);
      if (existingNode && newG >= existingNode.g) continue;

      const h = heuristic({ x: newX, y: newY }, goal);
      const newNode = new Node(newX, newY, newG, h);
      newNode.parent = current;

      nodeMap.set(key, newNode);

      if (!existingNode) {
        openSet.push(newNode);
      }
    }
  }

  return []; // No path found
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(() => {
    const walls = new Set<string>();
    // Add some default walls
    for (let i = 5; i < 15; i++) {
      walls.add(`${i},${10}`);
    }
    walls.add(`${10},${8}`);
    walls.add(`${10},${9}`);
    walls.add(`${10},${11}`);
    walls.add(`${10},${12}`);

    return {
      robot: { x: 2, y: 2 },
      goal: { x: 17, y: 17 },
      start: { x: 2, y: 2 },
      walls,
      path: [],
      nextHint: null,
      isPlaying: true,
      isSolved: false
    };
  });

  const [editMode, setEditMode] = useState(false);
  const [heuristicType, setHeuristicType] = useState<"manhattan" | "euclidean">("manhattan");
  const [stats, setStats] = useState({ pathLength: 0, wallCount: 0 });

  // Update stats and trigger animation
  useEffect(() => {
    setStats({
      pathLength: gameState.path.length,
      wallCount: gameState.walls.size
    });
    
    // Trigger animation frame for smooth rendering
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, [gameState.path, gameState.walls]);

  // Draw game on canvas with enhanced graphics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, "#0a0e27");
    gradient.addColorStop(1, "#16213e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid with subtle glow
    ctx.strokeStyle = "rgba(26, 40, 71, 0.5)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_HEIGHT);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw walls with enhanced styling
    gameState.walls.forEach((key) => {
      const [x, y] = key.split(",").map(Number);
      
      // Wall background
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      
      // Wall border with glow effect
      ctx.strokeStyle = "#0f3460";
      ctx.lineWidth = 1;
      ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      
      // Inner glow
      ctx.strokeStyle = "rgba(15, 52, 96, 0.5)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    });

    // Draw path with glow effect
    if (gameState.path.length > 0) {
      // Path glow
      ctx.strokeStyle = "rgba(0, 212, 255, 0.2)";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(gameState.path[0].x * CELL_SIZE + CELL_SIZE / 2, gameState.path[0].y * CELL_SIZE + CELL_SIZE / 2);
      for (let i = 1; i < gameState.path.length; i++) {
        ctx.lineTo(gameState.path[i].x * CELL_SIZE + CELL_SIZE / 2, gameState.path[i].y * CELL_SIZE + CELL_SIZE / 2);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      
      // Path line
      ctx.strokeStyle = "#00d4ff";
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(gameState.path[0].x * CELL_SIZE + CELL_SIZE / 2, gameState.path[0].y * CELL_SIZE + CELL_SIZE / 2);
      for (let i = 1; i < gameState.path.length; i++) {
        ctx.lineTo(gameState.path[i].x * CELL_SIZE + CELL_SIZE / 2, gameState.path[i].y * CELL_SIZE + CELL_SIZE / 2);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw hint with pulsing effect
    if (gameState.nextHint) {
      const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.3;
      ctx.fillStyle = `rgba(255, 0, 255, ${pulse})`;
      ctx.fillRect(
        gameState.nextHint.x * CELL_SIZE,
        gameState.nextHint.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
      
      // Hint border
      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        gameState.nextHint.x * CELL_SIZE,
        gameState.nextHint.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }

    // Draw start point with glow
    ctx.shadowColor = "#00ff00";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#00ff00";
    ctx.beginPath();
    ctx.arc(gameState.start.x * CELL_SIZE + CELL_SIZE / 2, gameState.start.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Start point border
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw goal point with glow
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(gameState.goal.x * CELL_SIZE + CELL_SIZE / 2, gameState.goal.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Goal point border
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw robot with enhanced glow and animation
    const robotX = gameState.robot.x * CELL_SIZE + CELL_SIZE / 2;
    const robotY = gameState.robot.y * CELL_SIZE + CELL_SIZE / 2;
    const robotRadius = CELL_SIZE / 2.5;
    
    // Robot outer glow
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "rgba(0, 212, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(robotX, robotY, robotRadius + 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Robot main body
    ctx.fillStyle = "#00d4ff";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(robotX, robotY, robotRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Robot outline
    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Robot inner detail
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(robotX - robotRadius / 3, robotY - robotRadius / 3, robotRadius / 3, 0, Math.PI * 2);
    ctx.fill();
  }, [gameState]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;

      const key = e.key.toLowerCase();
      const directions: { [key: string]: { x: number; y: number } } = {
        arrowup: { x: 0, y: -1 },
        w: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 },
        s: { x: 0, y: 1 },
        arrowleft: { x: -1, y: 0 },
        a: { x: -1, y: 0 },
        arrowright: { x: 1, y: 0 },
        d: { x: 1, y: 0 }
      };

      if (key in directions) {
        e.preventDefault();
        const dir = directions[key];
        const newX = gameState.robot.x + dir.x;
        const newY = gameState.robot.y + dir.y;

        // Check bounds and walls
        if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE && !gameState.walls.has(`${newX},${newY}`)) {
          const newRobot = { x: newX, y: newY };
          setGameState((prev) => ({
            ...prev,
            robot: newRobot,
            isSolved: newX === prev.goal.x && newY === prev.goal.y
          }));
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState.isPlaying, gameState.robot, gameState.walls, gameState.goal]);

  const handleSolve = () => {
    const path = aStar(gameState.robot, gameState.goal, gameState.walls, GRID_SIZE);
    setGameState((prev) => ({
      ...prev,
      path,
      nextHint: null,
      isSolved: path.length > 0 && path[path.length - 1].x === prev.goal.x && path[path.length - 1].y === prev.goal.y
    }));
  };

  const handleHint = () => {
    const path = aStar(gameState.robot, gameState.goal, gameState.walls, GRID_SIZE);
    if (path.length > 1) {
      setGameState((prev) => ({
        ...prev,
        path: [],
        nextHint: path[1]
      }));
    }
  };

  const handleReset = () => {
    setGameState((prev) => ({
      ...prev,
      robot: prev.start,
      path: [],
      nextHint: null,
      isSolved: false
    }));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    setGameState((prev) => {
      const newWalls = new Set(prev.walls);
      const key = `${x},${y}`;

      if (newWalls.has(key)) {
        newWalls.delete(key);
      } else {
        newWalls.add(key);
      }

      return { ...prev, walls: newWalls };
    });
  };

  return (
    <div className="min-h-screen game-container">
      <div className="game-wrapper">
        <header className="game-header">
          <h1 className="game-title">🤖 Robot Path Planning</h1>
          <p className="game-subtitle">A* Algorithm Visualization</p>
        </header>

        <div className="game-content">
          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              className={editMode ? "canvas-edit-mode" : ""}
              title={editMode ? "Click to add/remove walls" : "Use arrow keys or WASD to move"}
            />
          </div>

          <div className="controls-panel">
            <div className="info-section">
              <h2>Game Info</h2>
              <div className="info-item">
                <span>Robot Position:</span>
                <code>{gameState.robot.x}, {gameState.robot.y}</code>
              </div>
              <div className="info-item">
                <span>Goal Position:</span>
                <code>{gameState.goal.x}, {gameState.goal.y}</code>
              </div>
              <div className="info-item">
                <span>Distance:</span>
                <code>
                  {Math.round(
                    Math.sqrt(
                      Math.pow(gameState.goal.x - gameState.robot.x, 2) +
                      Math.pow(gameState.goal.y - gameState.robot.y, 2)
                    ) * 10
                  ) / 10}
                </code>
              </div>
              <div className="info-item">
                <span>Path Length:</span>
                <code>{stats.pathLength}</code>
              </div>
              <div className="info-item">
                <span>Walls:</span>
                <code>{stats.wallCount}</code>
              </div>
              {gameState.isSolved && (
                <div className="info-item success">
                  ✓ Goal Reached!
                </div>
              )}
            </div>

            <div className="controls-section">
              <h2>Controls</h2>
              <div className="control-group">
                <p className="control-hint">Use arrow keys or WASD to move</p>
                <div className="arrow-keys">
                  <div className="key">↑</div>
                  <div className="key">←</div>
                  <div className="key">↓</div>
                  <div className="key">→</div>
                </div>
              </div>

              <div className="button-group">
                <Button
                  onClick={handleSolve}
                  className="btn-solve"
                  title="Run A* algorithm to find optimal path"
                >
                  <Zap className="w-4 h-4" />
                  Solve
                </Button>
                <Button
                  onClick={handleHint}
                  className="btn-hint"
                  title="Get next step hint"
                >
                  <Lightbulb className="w-4 h-4" />
                  Hint
                </Button>
                <Button
                  onClick={handleReset}
                  className="btn-reset"
                  title="Reset game"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="settings-section">
              <h2>Settings</h2>
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={editMode}
                    onChange={(e) => setEditMode(e.target.checked)}
                  />
                  Edit Walls
                </label>
              </div>
              <div className="setting-item">
                <label>Heuristic:</label>
                <select
                  value={heuristicType}
                  onChange={(e) => setHeuristicType(e.target.value as "manhattan" | "euclidean")}
                >
                  <option value="manhattan">Manhattan Distance</option>
                  <option value="euclidean">Euclidean Distance</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <footer className="game-footer">
          <p>A* Algorithm: f(n) = g(n) + h(n) | Supports 8-directional movement</p>
        </footer>
      </div>
    </div>
  );
}
