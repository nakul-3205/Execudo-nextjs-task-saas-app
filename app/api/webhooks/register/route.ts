import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export async function POST(req:Request) {
    const WEBHOOK_SECRET=process.env.WEBHOOK_SECRET
    if(!WEBHOOK_SECRET){
        throw new Error('Please add WEBHOOK_SECRET in env variables')
    }
    const headerPayload=headers();
    const svixid=(await headerPayload).get("svix-id");
    const timestamp=(await headerPayload).get("svix-timestamp");
    const signature=(await headerPayload).get("svix-signature");
    if(!svixid||!timestamp||!signature){
        return new Response('Error occured at svix header')
    }
    const payload=await req.json()
    const body=JSON.stringify(payload)
    const wh=new Webhook(WEBHOOK_SECRET)
     let evt:WebhookEvent
     try {
        evt=wh.verify(body,{
            'svix-id':svixid,
            'svix-timestamp':timestamp,
            "svix-signature": signature,
        }) as WebhookEvent
     } catch (error) {
        console.error('error verifying webhook')
        return new Response('Error Occured',{status:400})

     }
     const {id}=evt.data
     const eventType=evt.type
     if(eventType==='user.created'){
        try {
            const {email_addresses,primary_email_address_id}=evt.data
            const primaryEmail=email_addresses.find(
                (email)=>email.id===primary_email_address_id
            )
            if(!primaryEmail)return new Response('No primary email found',{status:400});
             const newUser=await prisma.user.create({
                     data:{
                        id:evt.data.id,
                        email:primaryEmail.email_address,
                        isSubscribed:false
                     }
            })
            console.log('New User Created',newUser)
        } catch (error) {
            return new Response('Error creating user in databse',{status:400})
        }
     }
     return new Response('webhook recieved Sucessfully',{status:200})

}