"use client";

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { TodoItem } from "@/components/TodoItem";
import { ToDo, User } from "@/app/generated/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/Pagination";
import { useDebounceValue } from "usehooks-ts";
import { motion } from "framer-motion";
import { SignOutButton } from "@clerk/nextjs";

interface UserWithTodos extends User {
  todos: ToDo[];
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useDebounceValue("", 300);
  const [user, setUser] = useState<UserWithTodos | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUserData = useCallback(
    async (page: number) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin?email=${debouncedEmail}&page=${page}`);
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUser(data.user);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        toast({ title: "Success", description: "User data fetched successfully." });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedEmail, toast]
  );

  useEffect(() => {
    if (debouncedEmail) fetchUserData(1);
  }, [debouncedEmail, fetchUserData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedEmail(email);
  };

  const handleUpdateSubscription = async () => {
    toast({ title: "Updating Subscription", description: "Please wait..." });
    try {
      const response = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: debouncedEmail,
          isSubscribed: !user?.isSubscribed,
        }),
      });
      if (!response.ok) throw new Error("Failed to update subscription");
      fetchUserData(currentPage);
      toast({ title: "Success", description: "Subscription updated." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTodo = async (id: string, completed: boolean) => {
    toast({ title: "Updating Todo", description: "Please wait..." });
    try {
      const response = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: debouncedEmail, todoId: id, todoCompleted: completed }),
      });
      if (!response.ok) throw new Error("Failed to update todo");
      fetchUserData(currentPage);
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
      const response = await fetch("/api/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todoId: id }),
      });
      if (!response.ok) throw new Error("Failed to delete todo");
      fetchUserData(currentPage);
      toast({ title: "Success", description: "Todo deleted." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete todo.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 max-w-4xl mb-12 text-white"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
          Admin Dashboard
        </h1>
        <SignOutButton>
          <Button className="bg-red-600 hover:bg-red-700 text-white">Sign Out</Button>
        </SignOutButton>
      </div>

      {/* Search Card */}
      <Card className="bg-[#0a0a0a] border border-white/10 shadow-xl mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-white">Search User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email"
              className="bg-black text-white placeholder:text-white/50 border-white/20"
              required
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center text-white/70 py-10">Loading user data...</div>
      ) : user ? (
        <>
          {/* User Details */}
          <Card className="bg-[#0a0a0a] border border-white/10 text-white mb-6">
            <CardHeader>
              <CardTitle>User Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Email: {user.email}</p>
              <p>
                Subscription Status:{" "}
                <span className="font-semibold">
                  {user.isSubscribed ? "Subscribed" : "Not Subscribed"}
                </span>
              </p>
              {user.subscriptionEnds && (
                <p>
                  Subscription Ends:{" "}
                  {new Date(user.subscriptionEnds).toLocaleDateString()}
                </p>
              )}
              <Button
                onClick={handleUpdateSubscription}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {user.isSubscribed ? "Cancel Subscription" : "Subscribe User"}
              </Button>
            </CardContent>
          </Card>

          {/* Todos */}
          {user.todos.length > 0 ? (
            <Card className="bg-[#0a0a0a] border border-white/10 text-white">
              <CardHeader>
                <CardTitle>User Todos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {user.todos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      isAdmin={true}
                      onUpdate={handleUpdateTodo}
                      onDelete={handleDeleteTodo}
                    />
                  ))}
                </ul>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => fetchUserData(page)}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-white/60 py-10">This user has no todos.</div>
          )}
        </>
      ) : debouncedEmail ? (
        <div className="text-center text-white/60 py-10">No user found with this email.</div>
      ) : null}
    </motion.div>
  );
}
