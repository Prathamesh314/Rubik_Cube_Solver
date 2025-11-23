import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import dbConnect, { tables } from '@/db/postgres';
import { sql } from 'kysely';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Cloudinary configuration is missing required environment variables. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    console.log("Userid: ", userId, " file: ", file)

    if (!file || !userId) {
        console.log("File and userId are required.")
      return NextResponse.json(
        { success: false, message: "File and userId are required." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'user-profiles',
          public_id: `user-${userId}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const imageUrl = result.secure_url;
    console.log("Image url: ", imageUrl)
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: "Image upload failed." },
        { status: 500 }
      );
    }

    // Get db instance using helper
    const postgresDb = await dbConnect();

    // Update database
    await sql`
      UPDATE ${sql.table(tables.user)}
      SET profile_picture_url = ${imageUrl}
      WHERE id = ${userId}
    `.execute(postgresDb.connection());

    return NextResponse.json({
      success: true,
      url: imageUrl
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}