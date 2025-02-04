import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';
import { toast, Toaster } from "sonner";
import Image from 'next/image';
import BingoCell from './BingoCell';
import { BACKGROUND }from '../constants/background';
import { DARK_BACKGROUND }from '../constants/dark_background';
import { THEMES }from '../constants/themes';
import './NewYearBingo.css';
import AddGoalDialog from './AddGoalDialog';
import { RotateCcw } from "lucide-react";
import { bingoGoals } from '../constants/inspirations';
import ShareDialog from './ShareDialog';
import { Plus, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import html2canvas from 'html2canvas';

const GRID_SIZE = 5;
const TOTAL_GOALS = GRID_SIZE * GRID_SIZE;
const INITIAL_GRID = Array(TOTAL_GOALS).fill(null).map(() => ({ goal: '', icon: '' }));

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

type CellShape = {
  id: string;
  svg: string;
};

type GridCell = {
  goal: string;
  icon: string;
};

type Theme = {
  name: string;
  background: string;
  cardBg: string;
  cardHoverBg: string;
  overlayBg: string;
  emoji: string;
  textColor: string;
  frameFill: string;
  isDark: boolean;
  borderClass?: string;
};

const CELL_SHAPES: CellShape[] = [
  { id: 'circle', svg: '...' },
  { id: 'quatrefoil', svg: '...' },
];

// Update the SavedBoardData type
type SavedBoardData = {
  goals: Array<{
    goal: string;
    icon: string;
  }>;
  theme: string;
  isLocked: boolean;
  name: string;
  createdAt: string;
  taggedCells?: boolean[];  // Add this optional property
};

// Add this new type
type EditBoardNameDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  onSave: (name: string) => void;
  mode: 'add' | 'edit';
};

// Add this new component
const EditBoardNameDialog = ({ isOpen, onOpenChange, initialName = '', onSave, mode }: EditBoardNameDialogProps) => {
  const [name, setName] = useState(initialName);

  const handleSave = () => {
    onSave(name);
    onOpenChange(false);
    setName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Board' : 'Edit Board Name'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add this new type
type DeleteConfirmDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  boardName: string;
  onConfirm: () => void;
};

// Add this new component
const DeleteConfirmDialog = ({ isOpen, onOpenChange, boardName, onConfirm }: DeleteConfirmDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Delete Board</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete &quot;{boardName}&quot;?</p>
          <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const NewYearBingo = () => {
  const [grid, setGrid] = useState(INITIAL_GRID);
  const [editingCell, setEditingCell] = useState<number | null>(null);
  const [editedGoal, setEditedGoal] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const cellRefs = React.useRef<HTMLDivElement[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES.ORIGINAL);
  const [isViewMode] = useState(false);
  const [savedBoard, setSavedBoard] = useState<SavedBoard | null>(null);
  const [cellShapes, setCellShapes] = useState<string[]>([]);
  const [completedGoals, setCompletedGoals] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [inspiration, setInspiration] = useState<string | null>(null);
  const [isInspiring, setIsInspiring] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [savedBoards, setSavedBoards] = useState<Record<string, SavedBoardData>>({});
  const [currentBoardName, setCurrentBoardName] = useState<string>('');
  const [isEditBoardNameOpen, setIsEditBoardNameOpen] = useState(false);
  const [editingBoardName, setEditingBoardName] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [isDauberMode, setIsDauberMode] = useState(false);
  const [taggedCells, setTaggedCells] = useState<boolean[]>(Array(TOTAL_GOALS).fill(false));
  const [dauberPosition, setDauberPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isLocked) {
      const taggedCount = taggedCells.filter(Boolean).length;
      setCompletedGoals(taggedCount);
    } else {
      const filledGoals = grid.filter(cell => cell.goal !== '').length;
      setCompletedGoals(filledGoals);
    }
  }, [grid, isLocked, taggedCells]);

  const resetBoard = () => {
    localStorage.removeItem('bingoBoard');
    setGrid(Array(TOTAL_GOALS).fill({ goal: '', icon: '' }));
    setSavedBoard(null);
    setIsLocked(false);
    toast.success('Board reset successfully! Start fresh ✨');
  };

  const handleSave = () => {
    if (!editedGoal.trim() || editingCell === null) return;

    const newGrid = [...grid];
    newGrid[editingCell] = {
      goal: editedGoal,
      icon: selectedIcon
    };

    setGrid(newGrid);

    // Save to multiple boards
    const boardName = currentBoardName || `Board ${Object.keys(savedBoards).length + 1}`;
    const updatedBoards = {
      ...savedBoards,
      [boardName]: {
        goals: newGrid,
        theme: currentTheme.name,
        isLocked,
        name: boardName,
        createdAt: new Date().toISOString(),
        taggedCells: taggedCells
      }
    };

    localStorage.setItem('bingoBoards', JSON.stringify(updatedBoards));
    setSavedBoards(updatedBoards);
    setCurrentBoardName(boardName);

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
    } catch (err) {
      console.error('Failed to update goal status:', err);
      toast.error('Failed to update goal status');
    }
  };

  const handleLock = () => {
    setIsLocked(true);
    
    // Update lock status in savedBoards
    const updatedBoards = { ...savedBoards };
    if (currentBoardName) {
      updatedBoards[currentBoardName] = {
        ...updatedBoards[currentBoardName],
        isLocked: true
      };
      setSavedBoards(updatedBoards);
      localStorage.setItem('bingoBoards', JSON.stringify(updatedBoards));
    }
    
    toast.success('Board locked! Your goals are now set in stone. 🔒');
  };

  const handleEdit = (index: number) => {
    if (isLocked) return;
    setEditingCell(index);
    setEditedGoal(grid[index].goal || '');
    setSelectedIcon(grid[index].icon || '');
    setIsPopupOpen(true);
  };

  const handleInspire = () => {
    if (isInspiring || isLocked) return;
    
    setIsInspiring(true);
    const randomGoal = bingoGoals[Math.floor(Math.random() * bingoGoals.length)];
    setInspiration(randomGoal.text);

    setTimeout(() => {
      setInspiration(null);
      setIsInspiring(false);
    }, 2000);
    
    // Existing confetti code
    const defaults = {
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
  };

  const handleShuffle = () => {
    if (isLocked) return;
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
        if (parsed.isLocked) {
          setIsLocked(parsed.isLocked);
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loadParam = urlParams.get('load');
    
    if (loadParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(atob(loadParam)));
        if (decodedData.goals) {
          const filledGoals = decodedData.goals.filter(cell => cell.goal !== '').length;
          if (filledGoals === TOTAL_GOALS) {
            const shuffledGoals = [...decodedData.goals].sort(() => Math.random() - 0.5);
            setGrid(shuffledGoals);
            setIsLocked(true);
          } else {
            setGrid(decodedData.goals);
          }

          // Generate unique board name with incrementing number
          let baseName = decodedData.name || 'Shared Board';
          let boardName = baseName;
          let counter = 1;
          
          while (savedBoards[boardName]) {
            boardName = `${baseName} (${counter})`;
            counter++;
          }

          const updatedBoards = {
            ...savedBoards,
            [boardName]: {
              goals: decodedData.goals,
              theme: decodedData.theme || currentTheme.name,
              isLocked: filledGoals === TOTAL_GOALS,
              name: boardName,
              createdAt: new Date().toISOString(),
              taggedCells: decodedData.taggedCells || Array(TOTAL_GOALS).fill(false)
            }
          };
          
          localStorage.setItem('bingoBoards', JSON.stringify(updatedBoards));
          setSavedBoards(updatedBoards);
          setCurrentBoardName(boardName);

          if (decodedData.theme) {
            const savedTheme = Object.values(THEMES).find(t => t.name === decodedData.theme);
            if (savedTheme) {
              setCurrentTheme(savedTheme);
            }
          }

          toast.success('Board loaded and saved! 🎯', {
            duration: 2000,
            position: 'top-center',
          });

          // Redirect to home page after loading
          window.history.replaceState({}, '', '/');
        }
      } catch (e) {
        console.error('Error loading shared board:', e);
        toast.error('Invalid share link', {
          duration: 2000,
          position: 'top-center',
        });
        // Redirect to home page if there's an error
        window.history.replaceState({}, '', '/');
      }
    }
    setIsLoading(false);
  }, [savedBoards, currentTheme.name]);

  const handleShareBoard = () => {
    const boardData = {
      goals: grid,
      theme: currentTheme.name,
      name: currentBoardName // Include the board name in shared data
    };
    
    const base64Data = btoa(encodeURIComponent(JSON.stringify(boardData)));
    const generatedUrl = `${window.location.origin}/?load=${base64Data}`;
    
    setShareUrl(generatedUrl);
    setIsShareDialogOpen(true);
  };

  const loadBoard = (boardName: string) => {
    const board = savedBoards[boardName];
    if (board) {
      setGrid(board.goals);
      setIsLocked(board.isLocked);
      setCurrentBoardName(boardName);
      // Load tagged cells if they exist, otherwise initialize with false
      setTaggedCells(board.taggedCells || Array(TOTAL_GOALS).fill(false));
      
      const savedTheme = Object.values(THEMES).find(t => t.name === board.theme);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }

      toast.success(`Loaded board: ${boardName}`);
    }
  };

  const handleCellTag = (index: number) => {
    if (isLocked && isDauberMode) {
      const newTaggedCells = [...taggedCells];
      newTaggedCells[index] = !newTaggedCells[index];
      setTaggedCells(newTaggedCells);

      // Add confetti effect when tagging a cell
      if (!taggedCells[index]) {  // Only trigger when marking, not unmarking
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }

      // Save to localStorage
      const updatedBoards = { ...savedBoards };
      if (currentBoardName) {
        updatedBoards[currentBoardName] = {
          ...updatedBoards[currentBoardName],
          taggedCells: newTaggedCells
        };
        setSavedBoards(updatedBoards);
        localStorage.setItem('bingoBoards', JSON.stringify(updatedBoards));
      }
    }
  };

  const renderCell = (cell: GridCell, index: number) => {
    return (
      <BingoCell
        cell={cell}
        onEdit={() => handleEdit(index)}
        onSave={handleSave}
        editedGoal={editedGoal}
        onGoalChange={setEditedGoal}
        selectedIcon={selectedIcon}
        onIconSelect={setSelectedIcon}
        cellRef={(el: HTMLDivElement) => cellRefs.current[index] = el}
        theme={currentTheme}
        shapeId={cellShapes[index]}
        colorClass={currentTheme.name === 'Full' ? ORIGINAL_COLORS[index] : ''}
        isLocked={isLocked}
        isTagged={taggedCells[index]}
        onTag={() => handleCellTag(index)}
        isDauberMode={isDauberMode}
      />
    );
  };

  const handleThemeChange = (newTheme: Theme) => {
    setCurrentTheme(newTheme);
    
    // Update theme in savedBoards for current board
    if (currentBoardName) {
      const updatedBoards = { ...savedBoards };
      updatedBoards[currentBoardName] = {
        ...updatedBoards[currentBoardName],
        theme: newTheme.name
      };
      setSavedBoards(updatedBoards);
      localStorage.setItem('bingoBoards', JSON.stringify(updatedBoards));
    }
  };

  // Update this useEffect to load the first board
  useEffect(() => {
    const boards = localStorage.getItem('bingoBoards');
    if (boards) {
      const parsedBoards = JSON.parse(boards);
      setSavedBoards(parsedBoards);
      
      // Load the first board if no current board is selected
      if (!currentBoardName && Object.keys(parsedBoards).length > 0) {
        const firstBoardName = Object.keys(parsedBoards)[0];
        const firstBoard = parsedBoards[firstBoardName];
        
        setGrid(firstBoard.goals);
        setIsLocked(firstBoard.isLocked);
        setCurrentBoardName(firstBoardName);
        // Load tagged cells for the first board
        setTaggedCells(firstBoard.taggedCells || Array(TOTAL_GOALS).fill(false));
        
        // Set theme for the first board
        const savedTheme = Object.values(THEMES).find(t => t.name === firstBoard.theme);
        if (savedTheme) {
          setCurrentTheme(savedTheme);
        }
      }
    }
  }, [currentBoardName]); // Add currentBoardName as dependency

  // Add these new handlers
  const handleAddBoard = () => {
    setEditingBoardName(null);
    setIsEditBoardNameOpen(true);
  };

  const handleEditBoardName = (oldName: string) => {
    setEditingBoardName(oldName);
    setIsEditBoardNameOpen(true);
  };

  const handleSaveBoardName = (newName: string) => {
    if (!newName.trim()) return;

    const updatedBoards = { ...savedBoards };

    if (editingBoardName) {
      // Editing existing board
      const boardData = updatedBoards[editingBoardName];
      delete updatedBoards[editingBoardName];
      updatedBoards[newName] = { ...boardData, name: newName };
      if (currentBoardName === editingBoardName) {
        setCurrentBoardName(newName);
      }
    } else {
      // Adding new board
      updatedBoards[newName] = {
        goals: Array(TOTAL_GOALS).fill({ goal: '', icon: '' }),
        theme: currentTheme.name,
        isLocked: false,
        name: newName,
        createdAt: new Date().toISOString(),
        taggedCells: Array(TOTAL_GOALS).fill(false) // Initialize taggedCells for new boards
      };
      setCurrentBoardName(newName);
      setGrid(Array(TOTAL_GOALS).fill({ goal: '', icon: '' }));
      setTaggedCells(Array(TOTAL_GOALS).fill(false));
    }

    setSavedBoards(updatedBoards);
    localStorage.setItem('bingoBoards', JSON.stringify(updatedBoards));
    toast.success(editingBoardName ? 'Board renamed successfully!' : 'New board created!');
  };

  // Add this new handler
  const handleDeleteBoard = (boardName: string) => {
    setBoardToDelete(boardName);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteBoard = () => {
    if (!boardToDelete) return;

    const updatedBoards = { ...savedBoards };
    delete updatedBoards[boardToDelete];
    setSavedBoards(updatedBoards);
    localStorage.setItem('bingoBoards', JSON.stringify(updatedBoards));

    // If we're deleting the current board, switch to another board
    if (currentBoardName === boardToDelete) {
      const nextBoardName = Object.keys(updatedBoards)[0];
      if (nextBoardName) {
        loadBoard(nextBoardName);
      } else {
        // No boards left, reset to empty state
        setGrid(INITIAL_GRID);
        setCurrentBoardName('');
        setIsLocked(false);
      }
    }

    setBoardToDelete(null);
    toast.success('Board deleted successfully');
  };

  // Update the renderBoardsList function to include the delete button
  const renderBoardsList = () => (
    <div className="absolute w-[300px] top-[40%] left-1/2 ml-[470px] z-10">
      <Card className="p-4 bg-white/90 border-2 border-black">
        <div className="flex justify-between items-center mb-2 border-b pb-2">
          <h3 className="font-afacad text-xl">Saved Boards</h3>
          <Button
            onClick={handleAddBoard}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Status</th>
                <th className="w-8"></th>
                <th className="w-8"></th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(savedBoards).map(([name, board]) => {
                // Calculate completion status
                const filledGoals = board.isLocked
                  ? (board.taggedCells?.filter(Boolean).length || 0)
                  : board.goals.filter(cell => cell.goal !== '').length;
                
                // Only show status if there are filled goals
                const statusText = filledGoals > 0 ? `${filledGoals}/25` : '';
                
                return (
                  <tr 
                    key={name}
                    className={`
                      ${currentBoardName === name ? 'bg-gray-200' : ''}
                    `}
                  >
                    <td className="py-2 cursor-pointer" onClick={() => loadBoard(name)}>{name}</td>
                    <td className="py-2 text-sm text-gray-600 cursor-pointer" onClick={() => loadBoard(name)}>
                      {statusText}
                    </td>
                    <td className="text-center">
                      {board.isLocked && <span title="Locked">🔒</span>}
                    </td>
                    <td>
                      <Button
                        onClick={() => handleEditBoardName(name)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        disabled={board.isLocked}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </td>
                    <td>
                      <Button
                        onClick={() => handleDeleteBoard(name)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:text-red-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // Add mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDauberMode) {
        setDauberPosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDauberMode]);

  // Add this new function
  const handleDownloadBoard = async () => {
    try {
      const boardElement = document.querySelector('.board-container') as HTMLElement;
      if (!boardElement) return;

      const canvas = await html2canvas(boardElement, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Cast yearText to HTMLElement
          const yearText = clonedDoc.querySelector('.year-text') as HTMLElement;
          if (yearText) {
            // Add additional margin-top for the PDF version
            yearText.style.marginTop = '-30px';
            yearText.style.marginBottom = '0px';
          }


          // Cast cellContents NodeList to HTMLElement array
          const cellContents = clonedDoc.querySelectorAll('.bingo-cell-content');
          cellContents.forEach(cell => {
            const cellElement = cell as HTMLElement;
            cellElement.style.paddingTop = '30px';
            cellElement.style.paddingBottom = '30px';
          });
        }
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${currentBoardName || 'bingo-board'}.png`;
        link.href = url;
        link.click();
        
        // Cleanup
        URL.revokeObjectURL(url);
      }, 'image/png');

      toast.success('Board downloaded successfully! 📥');
    } catch (error) {
      console.error('Error downloading board:', error);
      toast.error('Failed to download board');
    }
  };

  // Add useEffect for viewport meta tag
  useEffect(() => {
    // Add viewport meta tag for better mobile scaling
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(meta);

    // Cleanup
    return () => {
      document.getElementsByTagName('head')[0].removeChild(meta);
    };
  }, []);

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="min-h-screen bg-gradient-to-b from-[#B3D9F6] to-[#61BBFF] p-8 relative overflow-hidden">
        {inspiration && (
          <div 
            className="floating-message absolute left-1/2 ml-[620px] top-[20%] z-50 text-xl font-afacad"
            style={{ maxWidth: '80vw' }}
          >
            {inspiration}
          </div>
        )}

        <div className="w-[35%] mx-auto relative">
          {/* Theme selection (now absolute) */}
          <div className="absolute left-1/2 ml-[410px] bottom-1/4 mb-[-395px] -translate-y-1/2 flex flex-col gap-3 z-10">
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
                  {theme.name === 'Full' ? (
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

          {/* Shuffle (absolute) */}
          <button
            onClick={handleShuffle}
            disabled={isLocked}
            className={`absolute w-40 h-40 top-[17%] right-1/2 mr-[550px] z-10 transition-transform hover:rotate-12 active:scale-110 w-12 h-12 ${
              isLocked ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            <Image 
              src="/shuffle.svg" 
              alt="Shuffle" 
              width={150}
              height={150}
              className="w-full h-full"
            />
          </button>

          {/* Inspire button (now absolute) */}
          <button
            onClick={handleInspire}
            disabled={isInspiring || isLocked}
            className={`absolute w-40 h-40 top-[18%] left-1/2 ml-[490px] z-10 transition-transform transition-all active:rotate-[-40deg] duration-150 ease-in-out w-12 h-12 ${
              isInspiring || isLocked ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            <Image 
              src="/inspire.svg" 
              alt="Inspire" 
              width={150}
              height={150}
              className="w-full h-full"
            />
          </button>

          {/* Completed Goals (absolute) */}
          <div
            className="absolute w-60 h-60 top-[40%] right-1/2 mr-[550px] z-10 transition-transform hover:scale-105 flex flex-col items-center justify-center"
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
            <p className="text-[1.2em]">{isLocked ? 'COMPLETED' : 'FILLED'}</p>
          </div>

          {/* Arrow image */}
          <div className="absolute w-[130px] top-[40%] right-1/2 mr-[700px] mt-[200px] z-10">
            <Image 
              src="/arrow.svg" 
              alt="Arrow" 
              width={150}
              height={150}
              className="w-full h-full"
            />
          </div>

          {/* Reset and Share buttons (absolute) */}
          {!isViewMode && (
            <div className="absolute w-60 h-60 top-[63%] right-1/2 mr-[450px] z-10 flex flex-col gap-2">
              <Button
                onClick={handleLock}
                variant="secondary"
                disabled={completedGoals < TOTAL_GOALS || isLocked}
                className={`
                  bg-[#E04025] text-[1.1em] 
                  hover:bg-[#E04025]/90 text-black 
                  border-2 border-black font-afacad 
                  h-[35px] w-[150px]
                  ${(completedGoals < TOTAL_GOALS || isLocked) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLocked ? '🔒 Locked' : '🔓 Lock Board'}
              </Button>
              <Button
                onClick={resetBoard}
                variant="secondary"
                disabled={isLocked}
                className={`
                  bg-[#326FC9] text-[1.1em] 
                  hover:bg-[#326FC9]/90 text-black 
                  border-2 border-black font-afacad 
                  h-[35px] w-[150px]
                  ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Board
              </Button>
              <Button
                onClick={handleShareBoard}
                variant="secondary"
                className="bg-[#F9D025] text-[1.1em] hover:bg-[#F9D025]/90 text-black border-2 border-black font-afacad h-[35px] w-[150px]"
              >
                Share
              </Button>
              <Button
                onClick={handleDownloadBoard}
                variant="secondary"
                className="bg-[#3EA345] text-[1.1em] hover:bg-[#3EA345]/90 text-black border-2 border-black font-afacad h-[35px] w-[150px]"
              >
                Export Board
              </Button>
            </div>
          )}

          {/* Add class name to the container we want to capture */}
          <div className="board-container">
            {/* Background Frame */}
            <div 
              className="absolute left-1/2 top-0 h-full -translate-x-1/2 pointer-events-none"
              style={{ 
                width: 'min(850px, 910px)',
                position: 'absolute',
                minHeight: '100%'
              }}
              dangerouslySetInnerHTML={{ 
                __html: currentTheme.isDark 
                  ? DARK_BACKGROUND 
                  : BACKGROUND.replace('#E04025', currentTheme.frameFill || '#E04025')
              }}
            />

            <div className="max-w-[936px] mx-auto relative h-full flex flex-col items-center">
              {/* Title Section */}
              <div className="mt-12 mb-4 text-center">
                <Image 
                  src={'/bingo.gif'}
                  alt="New Year's Resolution Bingo" 
                  className={`min-w-[700px] ${currentTheme.isDark ? 'invert brightness-0' : ''}`}
                  width={700}
                  height={200}
                  priority
                  unoptimized={true}
                />
              </div>

              {/* Top text */}
              <p className={`belowlogo font-['Afacad'] whitespace-nowrap font-light text-[2rem] tracking-[2px] ml-[-20px] ${currentTheme.textColor}`}>
                TWENTY-FIVE INTENTIONS FOR FULL YEAR AHEAD!
              </p>

              {/* Grid */}
              <div className=" ml-[-30px]">
                <div 
                  className="grid min-w-[750px] grid-cols-5 gap-3 aspect-square w-full max-w-[750px]"
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
              <p className={`font-['Poiret_One'] font-light tracking-[60px] text-[6rem] ml-[50px] mb-[-20px] year-text ${currentTheme.textColor}`}>
                2025
              </p>
              <p className={`font-['Afacad'] font-light text-[2rem] tracking-[2px] whitespace-nowrap mb-8 ${currentTheme.textColor}`}>
                LET&apos;S GO! GROW &amp; WIN FULL HOUSE!
              </p>
            </div>
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

        <ShareDialog 
          isOpen={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          shareUrl={shareUrl}
        />

        {/* Add renderBoardsList after the Inspire button */}
        {renderBoardsList()}

        <EditBoardNameDialog
          isOpen={isEditBoardNameOpen}
          onOpenChange={setIsEditBoardNameOpen}
          initialName={editingBoardName || ''}
          onSave={handleSaveBoardName}
          mode={editingBoardName ? 'edit' : 'add'}
        />

        <DeleteConfirmDialog
          isOpen={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          boardName={boardToDelete || ''}
          onConfirm={confirmDeleteBoard}
        />

        {isLocked && (
          <>
            <div className="absolute w-[300px] top-[40%] left-1/2 ml-[470px] mt-[320px] z-10">
              <Card className="p-4 bg-white/90 border-2 border-black">
                <div className="flex items-center justify-between">
                  <h3 className="font-afacad text-xl">Dauber</h3>
                  <Button
                    onClick={() => setIsDauberMode(!isDauberMode)}
                    variant={isDauberMode ? "secondary" : "ghost"}
                    className={`p-2 ${isDauberMode ? 'bg-blue-200' : ''}`}
                  >
                    <Image
                      src="/dauber.svg"
                      alt="Dauber"
                      width={100}
                      height={100}
                    />
                  </Button>
                </div>
              </Card>
            </div>

            {isDauberMode && (
              <div
                className="fixed w-[100px] h-[100px] ml-[30px] mt-[60px] pointer-events-none z-50"
                style={{
                  left: `${dauberPosition.x - 25}px`,
                  top: `${dauberPosition.y - 25}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Image
                  src="/dauber.svg"
                  alt="Dauber"
                  width={100}
                  height={100}
                  className="w-full h-full"
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default NewYearBingo;