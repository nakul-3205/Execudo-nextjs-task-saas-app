import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const publicRoutes = ["/", "/sign-in", "/sign-up", "/api/webhook(.*)"];
const isPublicRoute = createRouteMatcher(publicRoutes);


export default clerkMiddleware(async (auth, req) => {
  const {userId,sessionClaims}=await auth()
  const role = sessionClaims?.metadata?.role

// console.log("userId:", userId)
// console.log("sessionClaims:", sessionClaims)
// console.log("role:", sessionClaims?.metadata?.role)

  if (isAdminRoute(req) && role !== 'admin') {
    const url = new URL('/sign-up', req.url)
    return NextResponse.redirect(url)
  }
  if (!isAdminRoute(req) && role === 'admin') {
    const url = new URL('/admin/dashboard', req.url)
    return NextResponse.redirect(url)
  }
  if(!userId && !isPublicRoute(req) ){
     const url = new URL('/sign-up', req.url)
    return NextResponse.redirect(url)
  }
  if(userId && isPublicRoute(req) ){
    const url = new URL('/dashboard', req.url)
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}