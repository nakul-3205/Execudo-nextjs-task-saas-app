import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"; // Ensure this is imported

// Important: Next.js configuration for webhook routes
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
     console.log("--- Webhook POST function started! ---")
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET; // Ensure your .env uses CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('You need to add a CLERK_WEBHOOK_SECRET environment variable.');
  }

  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature =(await headerPayload) .get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers for webhook.");
    return new NextResponse("Error occured -- no svix headers", { status: 400 });
  }

  const payload: WebhookEvent = await req.json(); // Type the payload
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook signature:', err); // Log the actual error
    return new NextResponse('Error Occured during webhook verification', { status: 400 });
  }

  console.log('--- Webhook Event Received ---');
  console.log('Event Type:', evt.type);
  console.log('User ID from Clerk:', evt.data.id);
  console.log('Full Webhook Data:', JSON.stringify(evt.data, null, 2)); // Log full data for inspection

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    console.log('Processing user.created event...');
    try {
      const { email_addresses, primary_email_address_id } = evt.data;

      console.log('Email Addresses from payload:', email_addresses);
      console.log('Primary Email Address ID from payload:', primary_email_address_id);

      // Robust check for primary email
      if (!email_addresses || email_addresses.length === 0 || !primary_email_address_id) {
        console.error(`User ${id} created without valid email addresses or primary email ID in payload.`);
        return new NextResponse('No primary email found or invalid payload structure', { status: 400 });
      }

      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
      );

      if (!primaryEmail) {
        console.error(`Primary email address with ID ${primary_email_address_id} not found in email_addresses array for user ${id}.`);
        return new NextResponse('Primary email not found in payload array', { status: 400 });
      }

      console.log('Attempting to create user in DB with ID:', evt.data.id, 'and Email:', primaryEmail.email_address);

      const newUser = await prisma.user.create({
        data: {
          id: evt.data.id, // Use Clerk's user ID as your primary key
          email: primaryEmail.email_address,
          isSubscribed: false, // Default to false as per your schema
        }
      });
      console.log('SUCCESS: New User Created in DB:', newUser);
      return new NextResponse('User created in database successfully', { status: 201 });
    } catch (dbError: any) { // Use 'any' for error type for now to log full error
      // This catch block specifically handles errors during the Prisma create operation
      console.error(`ERROR: Database error creating user ${id}:`, dbError);
      // Check for unique constraint violation (P2002) if user already exists
      if (dbError.code === 'P2002' && dbError.meta?.target?.includes('id')) {
        console.warn(`User ${id} already exists in database (unique constraint violation).`);
        return new NextResponse('User already exists in database', { status: 200 }); // Return 200 if already exists
      }
      return new NextResponse(`Error creating user in database: ${dbError.message}`, { status: 500 });
    }
  }

  // Handle user.deleted event
  if (eventType === 'user.deleted') {
    console.log('Processing user.deleted event for user ID:', id);
    try {
      await prisma.user.delete({
        where: { id: id },
      });
      console.log('SUCCESS: User deleted from DB:', id);
      return new NextResponse('User deleted from database', { status: 200 });
    } catch (deleteError: any) {
      console.error(`ERROR: Database error deleting user ${id}:`, deleteError);
      // If user not found in DB, it's not a critical error for the webhook
      if (deleteError.code === 'P2025') { // P2025 is Prisma's "record not found" error
        console.warn(`User ${id} not found in database for deletion (already deleted or never existed).`);
        return new NextResponse('User deletion webhook processed (user not found)', { status: 200 });
      }
      return new NextResponse(`Error deleting user from database: ${deleteError.message}`, { status: 500 });
    }
  }

  // For unhandled event types, acknowledge receipt
  console.log('Unhandled webhook event type:', eventType);
  return new NextResponse('Webhook event received and processed (or ignored)', { status: 200 });
}
