import { Card } from "@/components/ui/card";
import { CELL_SHAPES } from '../constants/shapes';
import { useState } from 'react';

interface GridCell {
  goal: string;
  icon: string;
}

type Theme = {
  name: string;
  background: string;
  cardBg: string;
  cardHoverBg: string;
  overlayBg: string;
  emoji: string;
  textColor: string;
  frameFill: string;
  isDark?: boolean;
  borderClass?: string;
};

type BingoCellProps = {
  cell: GridCell;
  onEdit: () => void;
  onSave: () => void;
  editedGoal: string;
  onGoalChange: (value: string) => void;
  selectedIcon: string;
  onIconSelect: (value: string) => void;
  cellRef: (el: HTMLDivElement) => void;
  theme: Theme;
  shapeId: string;
  colorClass: string;
  isLocked: boolean;
  isTagged?: boolean;
  onTag?: () => void;
  isDauberMode?: boolean;
};

const BingoCell = ({ 
  cell, 
  onEdit, 
  cellRef, 
  theme, 
  shapeId,
  colorClass,
  isLocked,
  isTagged = false,
  onTag,
  isDauberMode = false
}: BingoCellProps) => {
  const shape = CELL_SHAPES.find(s => s.id === shapeId);
  
  const [isShaking, setIsShaking] = useState(false);
  
  const handleClick = () => {
    if (isLocked && isDauberMode && onTag) {
      handleTag();
    } else if (!isLocked) {
      onEdit();
    }
  };
  
  const handleTag = () => {
    if (isDauberMode) {
      setIsShaking(true);
      onTag();
      setTimeout(() => setIsShaking(false), 300);
    }
  };
  
  return (
    <div className="aspect-square w-full relative" ref={cellRef}>
      <div className={`cell-flip ${isShaking ? 'cell-shake' : ''}`}>
        <Card 
          className={`h-full cursor-pointer transition-transform flex flex-col items-center justify-center text-center 
            ${colorClass || theme.cardBg} 
            ${theme.cardHoverBg} 
            ${theme.borderClass || 'border-white/10 border'} 
            ${isDauberMode ? 'cursor-crosshair' : ''}
            p-4 rounded-none`}
          onClick={handleClick}
        >
          {/* Shape overlay */}
          <div 
            className={`absolute inset-1 pointer-events-none ${isTagged ? 'opacity-20' : ''}`}
            dangerouslySetInnerHTML={{ __html: shape?.svg || '' }} 
          />
          
          {/* Content */}
          {cell.goal ? (
            <>
              <div className="mb-2 relative z-10">
                <span className="text-4xl">{cell.icon}</span>
              </div>
              <p className="text-sm relative z-10 leading-loose">{cell.goal}</p>
            </>
          ) : (
            <p className="text-gray-400 relative z-10">Click to add goal</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BingoCell;