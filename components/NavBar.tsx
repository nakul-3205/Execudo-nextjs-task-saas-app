"use client";

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <nav className="backdrop-blur-lg bg-black/30 border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-semibold text-white hover:text-purple-300 transition duration-200">
          TodoMaster
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:scale-105 transition"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.imageUrl} alt="User avatar" />
                    <AvatarFallback className="bg-muted text-white">
                      {user.firstName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#1a1a1a] text-white border border-white/10 shadow-xl"
              >
                <DropdownMenuItem asChild className="hover:bg-purple-600/20 cursor-pointer transition">
                  <Link href="/subscribe" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Subscribe
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="hover:bg-red-600/20 cursor-pointer transition"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="text-white hover:text-purple-300 transition"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="border-white/20 text-white hover:bg-purple-600/10 transition"
              >
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
