# Cloudinary File Deletion Feature

This document describes the automatic file deletion feature that removes files from Cloudinary when posts are deleted from the database.

## Overview

When any post that contains files is deleted, the system automatically:

1. Identifies all files associated with the post
2. Deletes the files from Cloudinary
3. Cleans up attachment records from the database
4. Provides detailed logging of the deletion process

## Supported Collections

### Collections with Attachment Model (Separate Files)

- **feeds** - Social media posts with file attachments
- **storeitems** - Store items with product images/videos
- **chatmessages** - Chat messages with file attachments

These collections store file references as ObjectIds in the `files` field, which point to records in the `attachments` collection.

### Collections with Direct File Arrays

- **features** - Feature posts with directly stored file objects

These collections store file objects directly in the `files` field.

### Collections with Image Fields

- **users** - User profiles with profile and cover images
- **landingpages** - Landing pages with profile and cover images

These collections have specific image fields:

- `profileImage` - Main profile image
- `originalProfileImage` - Original uncropped profile image
- `coverImage` - Cover/banner image
- `originalCoverImage` - Original uncropped cover image

## File Structure

```
lib/utils/cloudinary/
├── deleteFromCloudinary.js      # Core Cloudinary deletion functions
└── deletePostFiles.js           # Main post file deletion logic
```

## Core Functions

### `deleteFromCloudinary(fileIds, resourceType)`

Deletes files from Cloudinary using their public IDs.

**Parameters:**

- `fileIds` (Array) - Array of Cloudinary public IDs
- `resourceType` (String) - 'image' or 'video'

**Returns:**

- Object with success status, deletion counts, and detailed results

### `deletePostFiles(post, col)`

Main function that handles file deletion for any post type.

**Parameters:**

- `post` (Object) - The post being deleted
- `col` (Object/String) - Collection information

**Returns:**

- Object with deletion results for attachments, direct files, and image fields

### `extractPublicIdsFromFiles(files)`

Extracts Cloudinary public IDs from various file formats.

**Supports:**

- File URLs (strings)
- File objects with `fileId` property
- File objects with `fileUrl` property
- File objects with `url` property

## Integration

The file deletion is automatically triggered in the `removeOne` function in `lib/actions/crud.js`. When any post is deleted:

1. The system checks if the user has permission to delete the post
2. Before deleting the post, it calls `deletePostFiles()` to clean up files
3. The post is deleted from the database
4. Success/warning messages are logged

## Configuration

### Environment Variables Required

```env
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Feature Toggle

The feature can be disabled using the constant in `lib/utils/constants.js`:

```javascript
export const CLOUDINARY_DELETION_ENABLED = true; // Set to false to disable
```

## Error Handling

The system is designed to be fault-tolerant:

- If file deletion fails, the post deletion still proceeds
- Failed file deletions are logged as warnings, not errors
- Detailed error information is provided for debugging
- Individual file deletion failures don't stop the entire process

## Logging

The system provides comprehensive logging:

```
✅ Deleted file from Cloudinary: sample_image_id
✅ Deleted 3 attachment files for feeds post 507f1f77bcf86cd799439011
❌ Failed to delete file from Cloudinary: invalid_id
❌ Warning: Failed to delete some files: Cloudinary credentials not configured
```

## Testing

Test the functionality by:

1. Creating a post with files in any supported collection
2. Deleting the post through the UI
3. Checking the console logs for deletion confirmations
4. Verifying files are removed from your Cloudinary media library

## Security Considerations

- Only the post owner can delete posts (ownership is verified)
- Cloudinary credentials are stored securely as environment variables
- Failed deletions don't expose sensitive information
- The system gracefully handles missing credentials

## Performance Notes

- Files are deleted sequentially to avoid rate limiting
- Cloudinary's free tier has deletion limits that are respected
- Large numbers of files may take time to process
- Database operations are optimized with direct model access

## Troubleshooting

### Common Issues

1. **Files not being deleted from Cloudinary**

   - Check environment variables are set correctly
   - Verify Cloudinary credentials have deletion permissions
   - Check the logs for specific error messages

2. **Database attachment records not being cleaned up**

   - Ensure the attachment model is accessible
   - Check for database connection issues
   - Verify the `relatedPostId` field is correctly set

3. **Public ID extraction failing**
   - Check console logs for extraction attempts
   - Verify Cloudinary URL patterns match expected format
   - Ensure file objects have the expected properties

### Debug Mode

Enable detailed logging by checking the console output when deleting posts. All operations are logged with emoji prefixes for easy identification:

- ✅ Success operations
- ❌ Error operations

## Future Enhancements

Potential improvements:

- Bulk deletion API for better performance
- Retry logic for failed deletions
- Background job processing for large deletions
- Admin interface to manually clean up orphaned files
- Analytics on file deletion patterns
