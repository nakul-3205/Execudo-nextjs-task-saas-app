"use client";

import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { TodoItem } from "@/components/TodoItem";
import { TodoForm } from "@/components/TodoForm";
import { ToDo } from "@/app/generated/prisma";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";
import { useDebounceValue } from "usehooks-ts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useUser();
  const { toast } = useToast();

  const [todos, setTodos] = useState<ToDo[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, 300);

  // ----------------------- FETCH TODOS -----------------------
  const fetchTodos = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/todos?page=${page}&search=${debouncedSearchTerm}`
        );
        if (!res.ok) throw new Error("Failed to fetch todos");

        const data = await res.json();
        setTodos(data.todos);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);

        toast({
          title: "Success",
          description: "Todos fetched successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch todos.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearchTerm, toast]
  );

  // ----------------------- FETCH SUBSCRIPTION -----------------------
  const fetchSubscriptionStatus = async () => {
    const res = await fetch("/api/subscription");
    if (res.ok) {
      const data = await res.json();
      setIsSubscribed(data.isSubscribed);
    }
  };

  useEffect(() => {
    fetchTodos(1);
    fetchSubscriptionStatus();
  }, [fetchTodos]);

  // ----------------------- HANDLERS -----------------------
  const handleAddTodo = async (title: string) => {
    toast({ title: "Adding Todo", description: "Please wait..." });
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) throw new Error("Failed to add todo");

      await fetchTodos(currentPage);
      toast({ title: "Success", description: "Todo added." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add todo.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTodo = async (id: string, completed: boolean) => {
    toast({ title: "Updating Todo", description: "Please wait..." });
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });

      if (!res.ok) throw new Error("Failed to update todo");

      await fetchTodos(currentPage);
      toast({ title: "Success", description: "Todo updated." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update todo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    toast({ title: "Deleting Todo", description: "Please wait..." });
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete todo");

      await fetchTodos(currentPage);
      toast({ title: "Success", description: "Todo deleted." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete todo.",
        variant: "destructive",
      });
    }
  };

  // ----------------------- UI -----------------------
  return (
    <motion.div
      className="container mx-auto p-4 max-w-3xl mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-extrabold text-center text-white mb-8 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
        Welcome, {user?.emailAddresses[0].emailAddress}!
      </h1>

      {/* Add Todo Card */}
      <motion.div
        className="mb-8 bg-white/10 border border-white/20 rounded-xl shadow-lg p-6 backdrop-blur-md"
        whileHover={{ scale: 1.01 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Add New Todo</h2>
        <TodoForm onSubmit={handleAddTodo} />
      </motion.div>

      {/* Alert if unsubscribed */}
      {!isSubscribed && todos.length >= 3 && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You&apos;ve reached the free todo limit.{" "}
            <Link href="/subscribe" className="underline font-semibold">
              Subscribe now
            </Link>{" "}
            to unlock unlimited todos.
          </AlertDescription>
        </Alert>
      )}

      {/* Todo List */}
      <motion.div
        className="bg-white/10 border border-white/20 rounded-xl shadow-lg p-6 backdrop-blur-md"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Your Todos</h2>
        <Input
          type="text"
          placeholder="Search todos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 border-white/30 bg-white/10 text-white placeholder-white/60"
        />

        {isLoading ? (
          <p className="text-white/70 text-center">Loading your todos...</p>
        ) : todos.length === 0 ? (
          <p className="text-white/60 text-center">
            No todos found. Start by adding one above.
          </p>
        ) : (
          <>
            <ul className="space-y-4">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </ul>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => fetchTodos(page)}
            />
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
