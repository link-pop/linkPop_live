const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { faker } = require("@faker-js/faker");

// Load environment variables
dotenv.config({ path: ".env.local" });

// Get the command line arguments
const args = process.argv.slice(2);
let mongodbUriArg = "";

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--mongodb-uri" && i + 1 < args.length) {
    mongodbUriArg = args[i + 1];
    i++; // Skip the next argument as it's the value
  }
}

// Get the LandingPageModel
const LandingPageModel =
  require("../lib/db/models/LandingPageModel").default ||
  require("../lib/db/models/LandingPageModel");

// User ID to associate with the landing pages
const USER_ID = "6831f19765479a0bbd99cef7";
const TOTAL_PAGES = 100;

// Prioritize command line arg, then env var, then default
const MONGO_URL =
  mongodbUriArg ||
  process.env.MONGO_URL ||
  "mongodb://localhost:27017/your-database-name";

// Connect to MongoDB
async function connectToDatabase() {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log(
      `Using MongoDB URI: ${MONGO_URL.replace(
        /\/\/([^:]+):([^@]+)@/,
        "//***:***@"
      )}`
    ); // Hide credentials in logs
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

// Generate a random landing page
function generateLandingPage(index) {
  const fontFamilies = [
    "default",
    "arial",
    "roboto",
    "montserrat",
    "poppins",
    "opensans",
  ];
  const buttonRoundness = ["none", "small", "medium", "large", "full"];
  const animations = ["none", "pulse", "bounce", "shake", "spin"];
  const shadowOptions = ["none", "light", "medium", "strong"];

  const testName = `Test${index}`;

  return {
    createdBy: USER_ID,
    name: testName,
    username: testName, // Use simple Test1, Test2 format
    bio: faker.lorem.paragraph(),
    profileImage: faker.image.avatar(),
    originalProfileImage: faker.image.avatar(),
    coverImage: faker.image.url(),
    originalCoverImage: faker.image.url(),
    active: true, // Always active
    textColor: faker.color.rgb(),
    bgColor: faker.color.rgb(),
    buttonTextColor: faker.color.rgb(),
    buttonBgColor: faker.color.rgb(),
    socialIconsType: Math.random() > 0.5 ? "type1" : "type2",
    textShadow: shadowOptions[Math.floor(Math.random() * shadowOptions.length)],
    textShadowColor: faker.color.rgb(),
    buttonRoundness:
      buttonRoundness[Math.floor(Math.random() * buttonRoundness.length)],
    buttonAnimation: animations[Math.floor(Math.random() * animations.length)],
    buttonShadow:
      shadowOptions[Math.floor(Math.random() * shadowOptions.length)],
    shadowColor: faker.color.rgb(),
    fontFamily: fontFamilies[Math.floor(Math.random() * fontFamilies.length)],
    textFontSize: ["small", "default", "large"][Math.floor(Math.random() * 3)],
    buttonFontSize: ["small", "default", "large"][
      Math.floor(Math.random() * 3)
    ],
    showOnline: faker.datatype.boolean(),
    showCity: faker.datatype.boolean(),
    responseTime: `${Math.floor(Math.random() * 24)} hours`,
    promotion: Math.random() > 0.7 ? faker.commerce.productName() : "",
    promotionTextColor: faker.color.rgb(),
    promotionEndsIn: `${Math.floor(Math.random() * 30) + 1} days`,
    disableLinkLogos: faker.datatype.boolean(0.3),
    distanceFromVisitor: `${Math.floor(Math.random() * 100)} km`,
    facebookPixelId: Math.random() > 0.8 ? faker.string.numeric(16) : "",
    geoFilterActive: faker.datatype.boolean(0.2),
    geoFilterMode: Math.random() > 0.5 ? "allow" : "block",
    geoFilterLocations: Array.from(
      { length: Math.floor(Math.random() * 5) },
      () => faker.location.country()
    ),
  };
}

// Create landing pages
async function createLandingPages() {
  try {
    console.log(`Starting creation of ${TOTAL_PAGES} test landing pages...`);

    // First, check if there are already test landing pages for this specific user
    const existingCount = await LandingPageModel.countDocuments({
      createdBy: USER_ID,
      name: { $regex: /^Test/ },
    });

    if (existingCount > 0) {
      console.log(
        `Found ${existingCount} existing test landing pages for this user. Deleting...`
      );
      await LandingPageModel.deleteMany({
        createdBy: USER_ID,
        name: { $regex: /^Test/ },
      });
      console.log("Existing test landing pages for this user deleted.");
    }

    // Check for global Test pages by other users
    const globalTestPages = await LandingPageModel.find({
      username: { $regex: /^Test\d+$/ },
    })
      .select("username")
      .lean();

    const takenUsernames = new Set(
      globalTestPages.map((page) => page.username)
    );
    console.log(
      `Found ${takenUsernames.size} Test pages by other users that we'll need to work around.`
    );

    // Create landing pages one by one to check for username conflicts
    let created = 0;
    let skipped = 0;
    const createdUsernames = [];

    for (let i = 1; i <= TOTAL_PAGES; i++) {
      const landingPage = generateLandingPage(i);

      // Skip if username already exists in the database from another user
      if (takenUsernames.has(landingPage.username)) {
        console.log(
          `Skipping ${landingPage.username} - already taken by another user`
        );
        skipped++;
        continue;
      }

      // Add to our tracked set to avoid duplicates later in our own batch
      takenUsernames.add(landingPage.username);

      try {
        await LandingPageModel.create(landingPage);
        createdUsernames.push(landingPage.username);
        created++;

        if (created % 10 === 0) {
          console.log(
            `Progress: ${created}/${TOTAL_PAGES} landing pages created`
          );
        }
      } catch (error) {
        console.error(
          `Error creating landing page ${landingPage.username}:`,
          error.message
        );
        skipped++;
      }
    }

    console.log(
      `Successfully created ${created} test landing pages for user ID: ${USER_ID}`
    );

    if (skipped > 0) {
      console.log(
        `Skipped ${skipped} pages due to username conflicts or errors`
      );
    }

    // Print some example URLs
    console.log("\nSample URLs to access (first 5):");
    for (let i = 0; i < Math.min(5, createdUsernames.length); i++) {
      console.log(`http://localhost:3000/${createdUsernames[i]}`);
    }
    if (createdUsernames.length > 5) {
      console.log(`... and ${createdUsernames.length - 5} more`);
    }

    return { created, skipped };
  } catch (error) {
    console.error("Error creating landing pages:", error);
    return { created: 0, skipped: 0 };
  }
}

// Main function
async function main() {
  try {
    await connectToDatabase();
    const { created, skipped } = await createLandingPages();

    // Verify creation
    const actualCount = await LandingPageModel.countDocuments({
      createdBy: USER_ID,
      name: { $regex: /^Test/ },
    });

    console.log(
      `Verification: Found ${actualCount} landing pages in database.`
    );

    if (actualCount !== created) {
      console.warn("WARNING: Verification count doesn't match created count!");
      console.warn(`Created: ${created}, Found: ${actualCount}`);
    }

    // Verify all pages are active
    const inactiveCount = await LandingPageModel.countDocuments({
      createdBy: USER_ID,
      name: { $regex: /^Test/ },
      active: false,
    });

    if (inactiveCount > 0) {
      console.warn(`WARNING: Found ${inactiveCount} inactive pages!`);
    } else {
      console.log("All pages are active ✓");
    }

    console.log("Operation completed successfully!");
  } catch (error) {
    console.error("Error in main function:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Check if we have all required information
if (
  !MONGO_URL ||
  MONGO_URL === "mongodb://localhost:27017/your-database-name"
) {
  console.error(
    "ERROR: MongoDB URI is not provided. Please provide it by either:"
  );
  console.error(
    "1. Adding it to .env.local file as MONGO_URL=your-connection-string"
  );
  console.error(
    "2. Passing it as a command line argument: --mongodb-uri your-connection-string"
  );
  console.error("");
  console.error("Example:");
  console.error(
    "npm run generate-landingpages -- --mongodb-uri mongodb+srv://username:password@cluster.mongodb.net/db"
  );
  process.exit(1);
}

main();
