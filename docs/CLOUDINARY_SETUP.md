# Cloudinary File Deletion Setup

## Problem

Files are not being deleted from Cloudinary when posts are deleted because the required API credentials are missing.

## Current Status

✅ **Working**: File uploads (uses `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_NAME`)
❌ **Not Working**: File deletion (missing `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`)

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Cloudinary API Credentials (required for file deletion)
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# These should already exist in your .env.local:
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dwsjc2cnc
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_NAME=dozlwiow
```

## How to Get Cloudinary API Credentials

1. **Login to Cloudinary Console**

   - Go to https://console.cloudinary.com/
   - Login with your account

2. **Navigate to Security Settings**

   - Click on the gear icon (Settings) in the top right
   - Go to "Security" tab
   - Or directly visit: https://console.cloudinary.com/console/settings/security

3. **Copy API Credentials**

   - Copy your **API Key**
   - Copy your **API Secret**
   - These are different from your Cloud Name and Upload Preset

4. **Add to Environment File**
   - Open your `.env.local` file
   - Add the credentials as shown above
   - Restart your development server

## Testing the Fix

After adding the credentials:

1. **Restart your development server**

   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

2. **Test file deletion**

   - Create a post with files
   - Delete the post
   - Check the console logs for successful deletion messages

3. **Expected Success Logs**
   ```
   🗑️ Starting file deletion for [collection] post [id]
   📎 Found [X] attachments for post [id]
   🖼️ Deleting [X] images from Cloudinary
   ✅ Deleted file from Cloudinary: [file_id] (ok)
   ✅ Successfully deleted [X] files for [collection] document [id]
   ```

## Troubleshooting

### Error: "Cloudinary credentials not found"

- Check that `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are in `.env.local`
- Make sure there are no spaces around the `=` sign
- Restart your development server after adding credentials

### Error: "Invalid API credentials"

- Double-check your API Key and Secret from Cloudinary console
- Make sure you're using the correct account credentials

### Error: "Resource not found"

- This is normal for files that don't exist in Cloudinary
- The deletion process will continue and report success

## File Deletion Process

The system handles three types of file storage:

1. **Attachment Collections** (`feeds`, `storeitems`)

   - Files stored as ObjectId references to `attachments` collection
   - Deletes from Cloudinary then removes database records

2. **Direct File Collections** (`chatmessages`)

   - Files stored directly in the `files` array
   - Extracts public IDs and deletes from Cloudinary

3. **Image Field Collections** (`users`, `landingpages`)
   - Image URLs in specific fields (`profileImage`, `coverImage`, etc.)
   - Extracts public IDs from URLs and deletes from Cloudinary

## Security Notes

- ⚠️ **Never commit** `.env.local` to version control
- ✅ API credentials are server-side only (not exposed to client)
- ✅ Deletion includes `invalidate=true` to clear CDN cache immediately
- ✅ Graceful error handling - post deletion continues even if file cleanup fails
