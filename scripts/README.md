# Test Data Generation Scripts

This directory contains utility scripts for generating test data for the application.

## Landing Page Generator

The `generate-test-landingpages.js` script creates 100 test landing pages in the database with randomized data.

### Usage

You need to provide a MongoDB connection string to use this script. You can do this in two ways:

1. **Via environment variables**: Add `MONGO_URL` to your `.env.local` file

   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database
   ```

2. **Via command line arguments**:
   ```bash
   npm run generate-landingpages -- --mongodb-uri mongodb+srv://username:password@cluster.mongodb.net/database
   ```

### Features

- Creates 100 landing pages with randomized data
- All pages are associated with user ID: 681f459bae3c9d0ca0c8623e
- Automatically removes existing test landing pages for the user before creating new ones
- Processes pages in batches for better performance
- Provides progress updates during creation

### Help

For a quick reminder of how to use the script, run:

```bash
npm run generate-landingpages:help
```
