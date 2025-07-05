import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE=10
console.log("Loading app/api/todos/route.ts");
export async function GET(req:NextRequest){
const {userId}=await auth()
    if(!userId)return NextResponse.json({error:'Unauthorized'},{status:400});
    const {searchParams}=new URL(req.url)
    const page=parseInt(searchParams.get('page')||'1')
    const search=searchParams.get('search')||""
    try {
       const todos= await prisma.toDo.findMany({
            where:{
                userId,
                title:{
                    contains:search,
                    mode:'insensitive'
                }
            },orderBy:{createdAt:'desc'},
            take:ITEMS_PER_PAGE,
            skip:(page-1)*ITEMS_PER_PAGE
        })
        const totalItems=await prisma.toDo.count({
            where:{
                userId,
                title:{
                    contains:'search',
                    mode:'insensitive'
                }
            }
        })
        const totalPage=Math.ceil(totalItems/ITEMS_PER_PAGE)
        return NextResponse.json({
            todos,
            currentpage:page,
            totalPage
        })
    } catch (error) {
        return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
    }

}

export async function POST(req:NextRequest){
    const { userId } = await auth();
    console.log(userId)

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { todos: true },
  });
  console.log("User:", user);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.isSubscribed && user.todos.length >= 3) {
    return NextResponse.json(
      {
        error:
          "Free users can only create up to 3 todos. Please subscribe for more.",
      },
      { status: 403 }
    );
  }
   console.log('hit route')
  const { title } = await req.json();

  const todo = await prisma.toDo.create({
    data: { title, userId },
  });

  return NextResponse.json(todo, { status: 201 });
}