"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils"; // assuming you're using a cn() util for class merging
import { motion } from "framer-motion";

interface TodoFormProps {
  onSubmit: (title: string) => void;
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle("");
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-3 p-4 rounded-2xl backdrop-blur-xl shadow-md bg-black/30 border border-white/10",
        "transition-all duration-300 ease-in-out"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className={cn(
          "flex-grow bg-white/10 text-white placeholder:text-white/50",
          "focus:ring-2 focus:ring-purple-500 focus:outline-none rounded-xl px-4 py-2 backdrop-blur-md"
        )}
        required
      />
      <Button
        type="submit"
        variant="secondary"
        className={cn(
          "rounded-xl px-4 py-2 bg-gradient-to-tr from-purple-500 to-indigo-600",
          "hover:scale-105 transition-transform shadow-lg text-white font-medium"
        )}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Add
      </Button>
    </motion.form>
  );
}
