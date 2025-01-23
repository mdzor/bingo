import { Card } from "@/components/ui/card";
import { CELL_SHAPES } from '../constants/shapes';

interface BingoCellProps {
  cell: {
    goal: string;
    icon: string;
  };
  onEdit: () => void;
  cellRef: (element: HTMLDivElement) => void;
  theme: any; // You might want to type this properly
  shapeId: string;
  colorClass?: string;
}

const BingoCell = ({ 
  cell, 
  onEdit, 
  cellRef, 
  theme, 
  shapeId,
  colorClass
}: BingoCellProps) => {
  const shape = CELL_SHAPES.find(s => s.id === shapeId);
  
  return (
    <div className="aspect-square w-full relative" ref={cellRef}>
      <div className={`cell-flip`}>
        <Card 
          className={`h-full cursor-pointer transition-transform flex flex-col items-center justify-center text-center 
            ${colorClass || theme.cardBg} 
            ${theme.cardHoverBg} 
            ${theme.borderClass || 'border-white/10 border'} 
            p-4 rounded-none`}
          onClick={onEdit}
        >
          {/* Shape overlay */}
          <div 
            className="absolute inset-1 pointer-events-none" 
            dangerouslySetInnerHTML={{ __html: shape?.svg || '' }} 
          />
          
          {/* Content */}
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
    </div>
  );
};

export default BingoCell;