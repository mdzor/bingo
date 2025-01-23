import { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const EmojiSelector = ({ selectedEmoji, onEmojiSelect }) => {
    const [showPicker, setShowPicker] = useState(false);
  
    return (
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full">
            {selectedEmoji || 'Pick an Icon'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" sideOffset={5}>
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              onEmojiSelect(emojiData.emoji);
              setShowPicker(false);
            }}
            width="100%"
            height={400}
            lazyLoadEmojis={true}
            skinTonesDisabled
            searchDisabled={false}
          />
        </PopoverContent>
      </Popover>
    );
  };