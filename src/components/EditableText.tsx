import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

const EditableText = ({
  value,
  onSave,
  placeholder = "Click to edit",
  className,
  inputClassName,
}: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setEditValue(value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-transparent border-none outline-none w-full",
          "focus:ring-1 focus:ring-border rounded px-1 -mx-1",
          inputClassName
        )}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-text hover:bg-muted/30 rounded px-1 -mx-1 transition-colors",
        !value && "text-muted-foreground italic",
        className
      )}
    >
      {value || placeholder}
    </span>
  );
};

export default EditableText;
