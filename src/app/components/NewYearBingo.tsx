import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';
import { toast } from "sonner";
import Image from 'next/image';
import BingoCell from './BingoCell';
import { BACKGROUND }from '../constants/background';
import { DARK_BACKGROUND }from '../constants/dark_background';
import { THEMES }from '../constants/themes';
import './NewYearBingo.css';
import AddGoalDialog from './AddGoalDialog';
import { RotateCcw } from "lucide-react";

const GRID_SIZE = 5;
const TOTAL_GOALS = GRID_SIZE * GRID_SIZE;
const INITIAL_GRID = Array(TOTAL_GOALS).fill().map(() => ({ goal: '', icon: '' }));

// rows
const SHAPE_PATTERN = [
  'circle', 'quatrefoil', 'wavy', 'fancy', 'circle',
  'fancy', 'wavy', 'star', 'wavy', 'fancy',
  'star', 'circle', 'fancy', 'circle', 'star',
  'quatrefoil', 'wavy', 'quatrefoil', 'star', 'quatrefoil',
  'wavy', 'star', 'circle', 'quatrefoil', 'fancy'
];


const ORIGINAL_COLORS = [
  'rouge', 'vert', 'rose', 'jaune', 'bleu',
  'rose', 'jaune', 'vert', 'bleu', 'vert',
  'bleu', 'rose', 'rouge', 'vert', 'rouge',
  'jaune', 'rouge', 'bleu', 'jaune', 'rose',
  'vert', 'rose', 'jaune', 'rouge', 'bleu'
];

type SavedBoard = {
  username: string;
  email: string;
  goals: Array<{
    goal: string;
    icon: string;
    completed: boolean;
  }>;
  createdAt: string;
};

const NewYearBingo = () => {
  const [grid, setGrid] = useState(INITIAL_GRID);
  const [editingCell, setEditingCell] = useState(null);
  const [editedGoal, setEditedGoal] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [goalsLeft, setGoalsLeft] = useState(TOTAL_GOALS);
  const cellRefs = React.useRef([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(THEMES.WICKED);
  const [isViewMode, setIsViewMode] = useState(false);
  const [savedBoard, setSavedBoard] = useState<SavedBoard | null>(null);
  const [cellShapes, setCellShapes] = useState<string[]>([]);
  const [completedGoals, setCompletedGoals] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const filledGoals = grid.filter(cell => cell.goal !== '').length;
    setGoalsLeft(TOTAL_GOALS - filledGoals);
  }, [grid]);

  useEffect(() => {
    const completed = grid.filter(g => g.goal !== '').length;
    setCompletedGoals(completed);
  }, [grid]);

  const resetBoard = () => {
    localStorage.removeItem('bingoBoard');
    setGrid(Array(TOTAL_GOALS).fill({ goal: '', icon: '' }));
    setSavedBoard(null);
  };

  const handleSave = () => {
    if (!editedGoal.trim()) return;

    const newGrid = [...grid];
    newGrid[editingCell] = {
      goal: editedGoal,
      icon: selectedIcon
    };

    setGrid(newGrid);
    localStorage.setItem('bingoBoard', JSON.stringify({
      goals: newGrid,
      theme: currentTheme.name
    }));

    // Add confetti animation when saving a new goal
    confetti({
      particleCount: 200,
      spread: 140,
      origin: { y: 0.6 }
    });

    // Reset states and close popup
    setEditingCell(null);
    setEditedGoal('');
    setSelectedIcon('');
    setIsPopupOpen(false);
  };

  const handleGoalCompletion = (index: number) => {
    if (!savedBoard) return;

    try {
      const savedBoards = JSON.parse(localStorage.getItem('bingoBoards') || '{}');
      const newGoals = [...savedBoard.goals];
      newGoals[index].completed = !newGoals[index].completed;

      // Update localStorage
      savedBoards[savedBoard.username] = {
        ...savedBoard,
        goals: newGoals
      };
      localStorage.setItem('bingoBoards', JSON.stringify(savedBoards));

      confetti({
        particleCount: 200,
        spread: 140,
        origin: { y: 0.6 }
      });

      // Update state
      setSavedBoard({ ...savedBoard, goals: newGoals });
      toast.success(newGoals[index].completed ? 'Goal completed! 🎉' : 'Goal uncompleted');
    } catch (error) {
      toast.error('Failed to update goal status');
    }
  };

  const handleEdit = (index) => {
    setEditingCell(index);
    setEditedGoal(grid[index].goal || '');
    setSelectedIcon(grid[index].icon || '');
    setIsPopupOpen(true);
  };

  const handleInspire = () => {

    console.log('inspire');
    
    var defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0.4,
      decay: 0.95,
      startVelocity: 20,
      colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
    };
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star'],
      origin: { y: 0.3, x: 0.71 }
    });

  }

  const handleShuffle = () => {
    setIsShuffling(true);
    
    setTimeout(() => {
      const shuffledGrid = [...grid].sort(() => Math.random() - 0.5);
      setGrid(shuffledGrid);
      localStorage.setItem('bingoBoard', JSON.stringify({
        goals: shuffledGrid,
        theme: currentTheme.name
      }));
    }, 300); // Shuffle halfway through flip

    setTimeout(() => {
      setIsShuffling(false);
    }, 600); // Complete flip
  };

  // Initialize random shapes for cells
  useEffect(() => {
    setCellShapes(SHAPE_PATTERN);
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem('bingoBoard');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.goals) {
          setGrid(parsed.goals);
          setSavedBoard(parsed);
        }
        // Fix theme loading
        if (parsed.theme) {
          const savedTheme = Object.values(THEMES).find(t => t.name === parsed.theme);
          if (savedTheme) {
            setCurrentTheme(savedTheme);
          }
        }
      } catch (e) {
        console.error('Error loading saved board:', e);
      }
    }
  }, []);

  const renderCell = (cell, index) => {
    if (isViewMode && savedBoard) {
      const isCompleted = savedBoard.goals[index].completed;
      return (
        <div className="aspect-square w-full relative">
          {/* Shape overlay */}
          <div 
            className="absolute inset-1 pointer-events-none" 
            dangerouslySetInnerHTML={{ __html: CELL_SHAPES.find(s => s.id === cellShapes[index])?.svg || '' }} 
          />
          
          <Card 
            className={`h-full cursor-pointer transition-all ${
              theme.cardBg
            } ${
              isCompleted ? 'ring-4 ring-green-500 opacity-75' : ''
            } hover:scale-102 rounded-none`}
            onClick={() => handleGoalCompletion(index)}
          >
            {cell.goal ? (
              <>
                <div className="mb-2 relative z-10">
                  <span className="text-4xl">{cell.icon}</span>
                </div>
                <p className="text-sm line-clamp-3 relative z-10">{cell.goal}</p>
              </>
            ) : (
              <p className="text-gray-400 relative z-10">Click to add goal</p>
            )}
          </Card>
        </div>
      );
    }

    return (
      <BingoCell
        cell={cell}
        isEditing={editingCell === index}
        onEdit={() => handleEdit(index)}
        onSave={handleSave}
        editedGoal={editedGoal}
        onGoalChange={setEditedGoal}
        selectedIcon={selectedIcon}
        onIconSelect={setSelectedIcon}
        cellRef={el => cellRefs.current[index] = el}
        theme={currentTheme}
        shapeId={cellShapes[index]}
        colorClass={currentTheme.name === 'Original' ? ORIGINAL_COLORS[index] : ''}
      />
    );
  };

  // When setting theme, also update localStorage
  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
    
    // Update theme in localStorage while preserving existing goals
    const savedData = localStorage.getItem('bingoBoard');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      localStorage.setItem('bingoBoard', JSON.stringify({
        ...parsed,
        theme: newTheme.name
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B3D9F6] to-[#61BBFF] p-8 relative overflow-hidden">
      <div className="w-[35%] mx-auto">
        <div className="fixed left-1/2 ml-[410px] bottom-1/4 mb-[-372px] -translate-y-1/2 flex flex-col gap-3 z-10">
          {Object.values(THEMES).map((theme) => (
            <Button
              key={theme.name}
              onClick={() => handleThemeChange(theme)}
              variant="secondary"
              className={`
                bg-white hover:bg-white/90 
                
                font-afacad 
                flex items-center justify-between 
                border-0 border-black
                px-1
                h-[35px]
                w-[100px]
                transition-all duration-100 ease-in-out
                ${currentTheme.name === theme.name ? 'border-2' : ''}
              `}
            >
              <span className="text-black">{theme.name.toLowerCase()}</span>
              <div className="w-6 h-6 rounded-full relative overflow-hidden">
                {theme.name === 'Original' ? (
                  <div 
                    className="absolute inset-0" 
                    style={{ 
                      background: `conic-gradient(
                        #F5818B 0deg 72deg,
                        #F9D025 72deg 144deg,
                        #3EA345 144deg 216deg,
                        #326FC9 216deg 288deg,
                        #E04025 288deg 360deg
                      )`
                    }}
                  />
                ) : (
                  <div 
                    className="absolute inset-0" 
                    style={{ 
                      background: `linear-gradient(to right, 
                        ${theme.cardBg.replace('bg-[', '').replace(']', '')} 50%, 
                        ${theme.frameFill} 50%
                      )`
                    }}
                  />
                )}
              </div>
            </Button>
          ))}
        </div>

        <button
          onClick={handleShuffle}
          className="fixed w-60 h-60 top-[20%] right-1/2 mr-[550px] z-10 transition-transform hover:rotate-12 active:scale-110 w-12 h-12"
        >
          <Image 
            src="/shuffle.svg" 
            alt="Shuffle" 
            width={150}
            height={150}
            className="w-full h-full"
          />
        </button>

        <button
          onClick={handleInspire}
          className="fixed w-60 h-60 top-[20%] left-1/2 ml-[500px] z-10 transition-transform transition-all active:rotate-[-40deg] duration-150 ease-in-out w-12 h-12"
        >
          <Image 
            src="/inspire.svg" 
            alt="Inspire" 
            width={150}
            height={150}
            className="w-full h-full"
          />
        </button>

        <div
          className="fixed w-60 h-60 top-[40%] right-1/2 mr-[550px] z-10 transition-transform hover:scale-105 flex flex-col items-center justify-center"
          style={{ 
            backgroundImage: 'url(/counter.svg)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        >
          <p className="font-['Poiret_One'] text-[3em] leading-tight text-center mt-[-20px]">
            {completedGoals}/25
          </p>
          <p className="text-[1.2em]">COMPLETED</p>

        </div>

        {!isViewMode && (
          <div className="fixed w-60 h-60 top-[60%] right-1/2 mr-[550px] z-10">
            <Button
              onClick={resetBoard}
              variant="secondary"
              className="bg-[#326FC9] text-[1.1em] hover:bg-[#326FC9]/90 text-black border-2 border-black font-afacad h-[35px] w-[150px]"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Board
            </Button>
          </div>
        )}

        {/* Background Frame */}
        <div 
          className="fixed left-1/2 top-5 h-full -translate-x-1/2 pointer-events-none"
          style={{ width: 'min(850px, 910px)' }}
          dangerouslySetInnerHTML={{ 
            __html: currentTheme.isDark 
              ? DARK_BACKGROUND 
              : BACKGROUND.replace('#E04025', currentTheme.frameFill || '#E04025')
          }}
        />
        
        <div className="max-w-[936px] mx-auto relative h-full flex flex-col items-center">
          {/* Title Section */}
          <div className="mt-12 mb-4 text-center">
            <img 
              src="/bingo.gif"
              alt="New Year's Resolution Bingo" 
              className={`mx-auto w-[80%] ${currentTheme.isDark ? 'invert brightness-0' : ''}`}
            />
          </div>

          {/* Top text */}
          <p className={`font-['Afacad'] font-light text-[2rem] tracking-[2px] ml-[-20px] ${currentTheme.textColor}`}>
            TWENTY-FIVE INTENTIONS FOR FULL YEAR AHEAD!
          </p>

          {/* Grid */}
          <div className="w-[85%] ml-[-30px]">
            <div 
              className="grid grid-cols-5 gap-3 aspect-square w-full"
              data-shuffling={isShuffling}
            >
              {grid.map((cell, index) => (
                <div key={`cell-${index}`}>
                  {renderCell(cell, index)}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom text */}
          <p className={`font-['Poiret_One'] font-light tracking-[60px] text-[6rem] ml-[50px] mb-[-20px] ${currentTheme.textColor}`}>
            2025
          </p>
          <p className={`font-['Afacad'] font-light text-[2rem] tracking-[2px] mb-8 ${currentTheme.textColor}`}>
            LET'S GO! GROW & WIN FULL HOUSE!
          </p>
        </div>

      </div>

      <AddGoalDialog
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        editedGoal={editedGoal}
        setEditedGoal={setEditedGoal}
        selectedIcon={selectedIcon}
        setSelectedIcon={setSelectedIcon}
        onSave={handleSave}
        themeColor={currentTheme.frameFill}
      />
    </div>
  );
};

export default NewYearBingo;