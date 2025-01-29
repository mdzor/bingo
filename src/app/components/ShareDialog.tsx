import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
}

const ShareDialog = ({ isOpen, onOpenChange, shareUrl }: ShareDialogProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast.success('Share link copied to clipboard! 🎉', {
          duration: 2000,
          position: 'top-center',
        });
      })
      .catch(() => {
        toast.error('Failed to copy share link', {
          duration: 2000,
          position: 'top-center',
        });
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-afacad">Share Your Bingo Board</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Copy this link to share your bingo board with others:
          </p>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 p-2 border rounded-md text-sm bg-gray-50"
            />
            <Button
              onClick={handleCopy}
              className="bg-[#F9D025] hover:bg-[#F9D025]/90 text-black"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog; 