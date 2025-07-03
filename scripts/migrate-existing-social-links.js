/**
 * Migration script to add protection fields to existing social links
 * Run this script once to update existing social links in the database
 */

// ! RUN: node scripts/migrate-existing-social-links.js

import { connectToDb } from "../lib/db/connectToDb.js";
import { models } from "../lib/db/models/models.js";
import {
  generateProtectionKey,
  shouldProtectPlatform,
} from "../lib/utils/linkProtection.js";

async function migrateSocialLinks() {
  console.log("🔄 Starting social links migration...");

  try {
    await connectToDb();

    // Get all social link collections
    const collections = ["sociallinks", "s1sociallinks", "s2sociallinks"];

    for (const colName of collections) {
      const Model = models[colName];
      if (!Model) {
        console.log(`⚠️  Model ${colName} not found, skipping...`);
        continue;
      }

      console.log(`\n📊 Processing collection: ${colName}`);

      // Get all social links that don't have protection fields yet
      const socialLinks = await Model.find({
        $or: [
          { isProtected: { $exists: false } },
          { protectionKey: { $exists: false } },
        ],
      }).lean();

      console.log(`Found ${socialLinks.length} links to update`);

      let updatedCount = 0;
      let protectedCount = 0;

      for (const link of socialLinks) {
        const needsProtection = shouldProtectPlatform(link.platform);

        const updateData = {
          isProtected: needsProtection,
          protectionKey: needsProtection
            ? generateProtectionKey(link._id.toString(), link.platform)
            : "",
        };

        await Model.findByIdAndUpdate(link._id, updateData);

        updatedCount++;
        if (needsProtection) {
          protectedCount++;
          console.log(`🔒 Protected ${link.platform} link: ${link.label}`);
        }
      }

      console.log(`✅ Updated ${updatedCount} links in ${colName}`);
      console.log(`🔒 Protected ${protectedCount} links in ${colName}`);
    }

    console.log("\n🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the migration
migrateSocialLinks();
