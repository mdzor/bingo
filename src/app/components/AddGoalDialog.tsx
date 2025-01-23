import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EmojiSelector } from "./EmojiSelector";

interface AddGoalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editedGoal: string;
  setEditedGoal: (goal: string) => void;
  selectedIcon: string;
  setSelectedIcon: (icon: string) => void;
  onSave: () => void;
  themeColor: string;
}

const AddGoalDialog = ({
  isOpen,
  onOpenChange,
  editedGoal,
  setEditedGoal,
  selectedIcon,
  setSelectedIcon,
  onSave,
  themeColor
}: AddGoalDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-full max-w-lg bg-white shadow-xl rounded-lg backdrop-blur-xl"
        style={{ border: `15px solid ${themeColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle className="text-3xl font-['Afacad'] font-light text-gray-800 ml-[25px]">
        + ADD YOUR GOAL
        </DialogTitle>
        
        <div className="p-6 space-y-6">
            <EmojiSelector 
              selectedEmoji={selectedIcon} 
              onEmojiSelect={setSelectedIcon} 
            />

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your goal..."
              value={editedGoal}
              onChange={(e) => setEditedGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && editedGoal.trim()) {
                  onSave();
                  onOpenChange(false);
                }
              }}
              className="w-full text-lg px-4 py-3 border rounded"
              autoFocus
            />
          </div>

          <button 
            onClick={() => {
              onSave();
              onOpenChange(false);
            }}
            className="w-full py-3 text-lg font-medium bg-black text-white rounded transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!editedGoal.trim()}
          >
            Save Goal
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddGoalDialog; 