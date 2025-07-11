// import {PrismaClient} from '@prisma/client'
import { PrismaClient } from '../app/generated/prisma'

const client =()=>{
    return new PrismaClient()
}
const globalForPrisma=globalThis as unknown as {prisma:PrismaClient | undefined}
const prisma=globalForPrisma.prisma??client()

if(process.env.NODE_ENV!=='production')globalForPrisma.prisma=prisma
export default prisma
