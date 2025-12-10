# 🤖 Robot Path Planning Game

A sophisticated interactive game featuring the **A* pathfinding algorithm** with an elegant futuristic minimalism design.

## 🎮 Game Features

### Core Algorithm
- **A* Pathfinding Algorithm**: Complete implementation with f(n) = g(n) + h(n)
- **Heuristics Support**: Manhattan Distance and Euclidean Distance
- **8-Directional Movement**: Supports movement in all 8 directions
- **Optimal Path Finding**: Guarantees the shortest path when one exists

### Interactive Controls
- **Manual Control**: Use arrow keys (↑ ↓ ← →) or WASD to move the robot
- **Solve Button**: Automatically finds and displays the optimal path
- **Hint Button**: Shows only the next recommended step
- **Reset Button**: Restarts the game to initial state
- **Wall Editing Mode**: Create custom mazes by clicking on the grid

### Visual Features
- **Futuristic Minimalism Design**: Dark background with neon cyan/purple accents
- **Glow Effects**: Glowing robot and path visualization
- **Real-time Statistics**: Position, distance, path length, wall count
- **Smooth Animations**: Fluid transitions and interactive feedback

## 📁 Project Structure

```
robot_path_planning/
├── client/src/
│   ├── pages/Home.tsx          # Main game component
│   └── styles/game.css         # Game styling
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🚀 Live Demo

Visit: https://3000-iclyr164aw4fnf275zw9n-8f8ba4ca.manusvm.computer

## 🎯 How to Play

1. **Move**: Use arrow keys or WASD
2. **Solve**: Click "Solve" to see the optimal path
3. **Hint**: Click "Hint" for the next step
4. **Edit**: Enable "Edit Walls" to create mazes
5. **Reset**: Click "Reset" to start over

## 🔧 Technical Details

- **Grid**: 20 × 20 cells (30px each)
- **Algorithm**: A* with Manhattan/Euclidean heuristics
- **Technology**: React + TypeScript + HTML5 Canvas
- **Design**: Futuristic Minimalism with Neon accents

## 🎓 Educational Value

Perfect for learning:
- A* pathfinding algorithm
- Heuristic functions
- Graph traversal
- Algorithm visualization
- Game development

---

**Ready for your technical interview!** 🎯
