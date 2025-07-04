"use client";

import { useState } from "react";
import { ToDo } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface TodoItemProps {
  todo: ToDo;
  isAdmin?: boolean;
  onUpdate: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({
  todo,
  isAdmin = false,
  onUpdate,
  onDelete,
}: TodoItemProps) {
  const [isCompleted, setIsCompleted] = useState(todo.completed);

  const toggleComplete = () => {
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState);
    onUpdate(todo.id, newCompletedState);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-neutral-900 border border-white/10 text-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
          <span
            className={`text-base font-semibold ${
              isCompleted
                ? "line-through text-white/40 italic"
                : "text-white"
            }`}
          >
            {todo.title}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className={`transition-colors border border-white/20 ${
                isCompleted
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
              onClick={toggleComplete}
            >
              {isCompleted ? (
                <XCircle className="mr-1 h-4 w-4" />
              ) : (
                <CheckCircle className="mr-1 h-4 w-4" />
              )}
              {isCompleted ? "Undo" : "Complete"}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="hover:bg-red-700 bg-red-600 text-white transition"
              onClick={() => onDelete(todo.id)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>

            {isAdmin && (
              <span className="ml-2 text-xs text-white/50 font-mono">
                User: {todo.userId}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
