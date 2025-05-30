const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { faker } = require("@faker-js/faker");

// Load environment variables
dotenv.config({ path: ".env.local" });

// Import creator tags constants
const {
  RACE_ETHNICITY_TAGS,
  HAIR_COLOR_TAGS,
  BODY_TYPE_TAGS,
  GENDER_TAGS,
} = require("../lib/constants/creatorTags");

// Import the reusable image generation functions
const {
  generateUnsplashURL,
  generateFallbackImage,
  generateUniqueId,
} = require("../lib/utils/generateUnsplashURL");

// Get the command line arguments
const args = process.argv.slice(2);
let mongodbUriArg = "";
let userTypeArg = "all"; // Default to generating both types
let totalUsersArg = 50; // Default number of users

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--mongodb-uri" && i + 1 < args.length) {
    mongodbUriArg = args[i + 1];
    i++; // Skip the next argument as it's the value
  } else if (args[i] === "--type" && i + 1 < args.length) {
    userTypeArg = args[i + 1].toLowerCase();
    i++; // Skip the next argument as it's the value
  } else if (args[i] === "--count" && i + 1 < args.length) {
    totalUsersArg = parseInt(args[i + 1], 10);
    i++; // Skip the next argument as it's the value
  }
}

// Configuration
const TOTAL_USERS = totalUsersArg;
const USER_TYPE = userTypeArg; // 'creator', 'fan', or 'all'
const CREATOR_PREFIX = "TestCreator";
const FAN_PREFIX = "TestFan";

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

    // Import the schema and register the model
    const { usersSchema } = require("../lib/db/models/UserModel");
    if (!mongoose.models.users) {
      mongoose.model("users", usersSchema);
    }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

// Generate a random creator user
function generateCreator(index) {
  // Generate first name without spaces or special characters
  const firstName = faker.person
    .firstName({ sex: "female" })
    .replace(/[^a-zA-Z0-9]/g, ""); // Remove non-alphanumeric chars

  // Create proper last name - alphanumeric only
  const lastName = faker.person.lastName().replace(/[^a-zA-Z0-9]/g, "");

  // Create username without spaces
  const username = `${firstName}${index}`;

  // Create name without special characters - use this as the actual user name in DB
  const name = `${firstName}${lastName}`;

  const email = faker.internet.email({
    firstName: firstName,
    lastName: lastName,
  });
  const clerkId = `user_${faker.string.alphanumeric(24)}`;

  // Use constants for hair colors with realistic distribution weights
  const femaleHairColors = [
    { value: "blonde", weight: 0.25 },
    { value: "brunette", weight: 0.35 },
    { value: "black hair", weight: 0.2 },
    { value: "redhead", weight: 0.1 },
    { value: "gray hair", weight: 0.05 },
    { value: "brown hair", weight: 0.05 },
  ];

  // Use constants for body types with realistic distribution weights
  const femaleBodyTypes = [
    { value: "slim", weight: 0.25 },
    { value: "average", weight: 0.3 },
    { value: "curvy", weight: 0.25 },
    { value: "athletic", weight: 0.1 },
    { value: "thick", weight: 0.1 },
  ];

  // Helper function for weighted random selection
  const weightedRandom = (items) => {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
      random -= item.weight;
      if (random < 0) return item.value;
    }
    return items[0].value; // Fallback
  };

  // Generate creator attributes
  const raceEthnicity = faker.helpers.arrayElement(RACE_ETHNICITY_TAGS);
  const hairColor = weightedRandom(femaleHairColors);
  const bodyType = weightedRandom(femaleBodyTypes);

  // Generate realistic profile images using Unsplash based on creator tags
  const getRealisticProfileImage = () => {
    try {
      return generateUnsplashURL({ raceEthnicity, hairColor, bodyType });
    } catch (error) {
      console.warn(
        `Failed to generate Unsplash URL for ${name}, using fallback`
      );
      return generateFallbackImage(generateUniqueId(firstName, index));
    }
  };

  // Get unique avatar image (smaller version)
  const getUniqueAvatarImage = () => {
    try {
      return generateUnsplashURL(
        { raceEthnicity, hairColor, bodyType },
        { size: "400x400" }
      );
    } catch (error) {
      return generateFallbackImage(generateUniqueId(firstName, index), {
        size: "400x400",
      });
    }
  };

  // Get a unique cover image - using different search terms
  const getUniqueCoverImage = () => {
    try {
      return generateUnsplashURL(
        { raceEthnicity, hairColor, bodyType },
        { size: "800x300" }
      );
    } catch (error) {
      return generateFallbackImage(generateUniqueId(firstName, index), {
        size: "800x300",
      });
    }
  };

  // Create lastUploadedCreatorTags based on the user's attributes
  const age = faker.number.int({ min: 18, max: 45 });
  const gender = faker.helpers.arrayElement(GENDER_TAGS);

  const lastUploadedCreatorTags = {
    raceEthnicity: [raceEthnicity],
    hairColor: [hairColor],
    bodyType: [bodyType],
    gender: [gender],
    age: [age],
  };

  return {
    // Required fields
    clerkId: clerkId,
    name: name, // Use the name without spaces
    email: email,
    avatar: getUniqueAvatarImage(),

    // Set as creator
    profileType: "creator",
    onboardingFinished: true,

    // Account profile fields using constants
    age: age,
    raceEthnicity: raceEthnicity,
    hairColor: hairColor,
    bodyType: bodyType,

    // Creator tags tracking - simulates that this creator has uploaded content with these tags
    lastUploadedCreatorTags: lastUploadedCreatorTags,
    lastVisitedCreatorsTags: {
      raceEthnicity: [],
      hairColor: [],
      bodyType: [],
      gender: [],
      age: [],
    },

    // Status
    isAvailable: faker.datatype.boolean(1),

    // Images - using Unsplash for realistic images based on creator attributes
    profileImage: getRealisticProfileImage(),
    originalProfileImage: getRealisticProfileImage(),
    coverImage: getUniqueCoverImage(),
    originalCoverImage: getUniqueCoverImage(),

    // Location
    city: faker.location.city(),
    region: faker.location.state(),
    country: faker.location.country(),
    countryCode: faker.location.countryCode(),

    // Subscription settings - include both free and paid creators
    subscriptionPrice: faker.helpers.arrayElement([
      0,
      0,
      0, // Add multiple 0s to increase chance of free creators
      4.99,
      9.99,
      14.99,
      19.99,
      24.99,
      29.99,
    ]),

    // Social and account settings
    showFansCount: faker.datatype.boolean(0.7),
    showMediaCount: faker.datatype.boolean(0.8),
    enableComments: faker.datatype.boolean(0.9),
    showActivityStatus: faker.datatype.boolean(0.6),
    autoFollowBackMyFans: faker.datatype.boolean(0.5),

    // Verification
    idVerified: faker.datatype.boolean(0.7),
    idVerificationDate: faker.datatype.boolean(0.7) ? faker.date.past() : null,

    // These are typically set by the system, but we'll add them for completeness
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
}

// Generate a random fan user
function generateFan(index) {
  // Generate first name without spaces or special characters
  const firstName = faker.person
    .firstName({ sex: "female" })
    .replace(/[^a-zA-Z0-9]/g, ""); // Remove non-alphanumeric chars

  // Create proper last name - alphanumeric only
  const lastName = faker.person.lastName().replace(/[^a-zA-Z0-9]/g, "");

  // Create username without spaces
  const username = `${firstName}${index}`;

  // Create name without special characters - use this as the actual user name in DB
  const name = `${firstName}${lastName}`;

  const email = faker.internet.email({
    firstName: firstName,
    lastName: lastName,
  });
  const clerkId = `user_${faker.string.alphanumeric(24)}`;

  // Get unique profile images using Robohash for fans (they don't typically upload content)
  const getUniqueAvatarImage = () => {
    return generateFallbackImage(generateUniqueId(firstName, index));
  };

  // Get unique profile image
  const getUniqueProfileImage = () => {
    return generateFallbackImage(generateUniqueId(firstName, index));
  };

  return {
    // Required fields
    clerkId: clerkId,
    name: name, // Use the name without spaces
    email: email,
    avatar: getUniqueAvatarImage(),

    // Set as fan
    profileType: "fan",
    onboardingFinished: true,

    // Fan preferences using constants - these are what the fan likes, not their own attributes
    preferAge: faker.number.int({ min: 18, max: 50 }),
    preferHairColor: faker.helpers.arrayElement([...HAIR_COLOR_TAGS, "any"]),
    preferBodyType: faker.helpers.arrayElement([...BODY_TYPE_TAGS, "any"]),
    preferGender: faker.helpers.arrayElement([...GENDER_TAGS, "any"]),
    preferCreatorName: faker.datatype.boolean(0.3)
      ? faker.person.firstName().replace(/[^a-zA-Z0-9]/g, "")
      : "", // 30% chance of having a creator name preference

    // Creator tags tracking - fans typically don't upload content, so these should be empty
    lastUploadedCreatorTags: {
      raceEthnicity: [],
      hairColor: [],
      bodyType: [],
      gender: [],
      age: [],
    },
    lastVisitedCreatorsTags: {
      raceEthnicity: [],
      hairColor: [],
      bodyType: [],
      gender: [],
      age: [],
    },

    // Status
    isAvailable: faker.datatype.boolean(1),

    // Images - using Robohash for fans
    profileImage: faker.datatype.boolean(0.7) ? getUniqueProfileImage() : "",
    originalProfileImage: faker.datatype.boolean(0.7)
      ? getUniqueProfileImage()
      : "",

    // Location data - might be more sparse for fans
    city: faker.datatype.boolean(0.6) ? faker.location.city() : "",
    country: faker.datatype.boolean(0.7) ? faker.location.country() : "",

    // Randomly store some hidden suggestions
    hiddenSuggestions: [],

    // Less likely to have completed verification
    idVerified: faker.datatype.boolean(0.3),

    // Social and account settings
    showActivityStatus: faker.datatype.boolean(0.4),

    // These are typically set by the system, but we'll add them for completeness
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
}

// Create users
async function createUsers() {
  try {
    let creatorCount = 0;
    let fanCount = 0;

    // Get the model
    const UserModel = mongoose.models.users;

    // Determine how many of each type to create
    if (USER_TYPE === "creator") {
      creatorCount = TOTAL_USERS;
    } else if (USER_TYPE === "fan") {
      fanCount = TOTAL_USERS;
    } else {
      // 'all'
      creatorCount = Math.ceil(TOTAL_USERS / 2);
      fanCount = TOTAL_USERS - creatorCount;
    }

    console.log(
      `Starting creation of ${creatorCount} creators and ${fanCount} fans...`
    );

    // First, check if there are already test users
    if (creatorCount > 0) {
      const existingCreatorCount = await UserModel.countDocuments({
        clerkId: { $regex: /^user_/ },
        name: { $regex: new RegExp(CREATOR_PREFIX, "i") },
      });

      if (existingCreatorCount > 0) {
        console.log(
          `Found ${existingCreatorCount} existing test creators. Deleting...`
        );
        await UserModel.deleteMany({
          clerkId: { $regex: /^user_/ },
          name: { $regex: new RegExp(CREATOR_PREFIX, "i") },
        });
        console.log("Existing test creators deleted.");
      }
    }

    if (fanCount > 0) {
      const existingFanCount = await UserModel.countDocuments({
        clerkId: { $regex: /^user_/ },
        name: { $regex: new RegExp(FAN_PREFIX, "i") },
      });

      if (existingFanCount > 0) {
        console.log(
          `Found ${existingFanCount} existing test fans. Deleting...`
        );
        await UserModel.deleteMany({
          clerkId: { $regex: /^user_/ },
          name: { $regex: new RegExp(FAN_PREFIX, "i") },
        });
        console.log("Existing test fans deleted.");
      }
    }

    let created = 0;
    let skipped = 0;
    const createdUsers = [];

    // Create creators
    if (creatorCount > 0) {
      console.log(`Creating ${creatorCount} creators...`);
      for (let i = 1; i <= creatorCount; i++) {
        const user = generateCreator(i);

        try {
          const createdUser = await UserModel.create(user);
          createdUsers.push(createdUser);
          created++;

          if (created % 10 === 0) {
            console.log(`Progress: ${created}/${TOTAL_USERS} users created`);
          }
        } catch (error) {
          console.error(`Error creating creator ${user.name}:`, error.message);
          skipped++;
        }
      }
    }

    // Create fans
    if (fanCount > 0) {
      console.log(`Creating ${fanCount} fans...`);
      for (let i = 1; i <= fanCount; i++) {
        const user = generateFan(i);

        try {
          const createdUser = await UserModel.create(user);
          createdUsers.push(createdUser);
          created++;

          if (created % 10 === 0) {
            console.log(`Progress: ${created}/${TOTAL_USERS} users created`);
          }
        } catch (error) {
          console.error(`Error creating fan ${user.name}:`, error.message);
          skipped++;
        }
      }
    }

    console.log(`Successfully created ${created} test users`);

    if (skipped > 0) {
      console.log(`Skipped ${skipped} users due to errors`);
    }

    // Print some sample users
    console.log("\nSample created users (first 5):");
    for (let i = 0; i < Math.min(5, createdUsers.length); i++) {
      console.log(`- ${createdUsers[i].name} (${createdUsers[i].email})`);
      console.log(`  ID: ${createdUsers[i]._id}`);
      console.log(`  Type: ${createdUsers[i].profileType}`);
      if (createdUsers[i].profileType === "creator") {
        console.log(
          `  Subscription price: $${createdUsers[i].subscriptionPrice}`
        );
      }
    }
    if (createdUsers.length > 5) {
      console.log(`... and ${createdUsers.length - 5} more`);
    }

    return { created, skipped };
  } catch (error) {
    console.error("Error creating users:", error);
    return { created: 0, skipped: 0 };
  }
}

// Main function
async function main() {
  try {
    await connectToDatabase();
    const { created, skipped } = await createUsers();

    // Verify creation
    let actualCount = 0;
    const UserModel = mongoose.models.users;

    if (USER_TYPE === "creator" || USER_TYPE === "all") {
      const creatorCount = await UserModel.countDocuments({
        clerkId: { $regex: /^user_/ },
        name: { $regex: new RegExp(CREATOR_PREFIX, "i") },
      });
      console.log(
        `Verification: Found ${creatorCount} test creators in database.`
      );
      actualCount += creatorCount;
    }

    if (USER_TYPE === "fan" || USER_TYPE === "all") {
      const fanCount = await UserModel.countDocuments({
        clerkId: { $regex: /^user_/ },
        name: { $regex: new RegExp(FAN_PREFIX, "i") },
      });
      console.log(`Verification: Found ${fanCount} test fans in database.`);
      actualCount += fanCount;
    }

    if (actualCount !== created) {
      console.warn("WARNING: Verification count doesn't match created count!");
      console.warn(`Created: ${created}, Found: ${actualCount}`);
    }

    console.log("Operation completed successfully!");
  } catch (error) {
    console.error("Error in main function:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Print usage information
function printUsage() {
  console.log("Usage:");
  console.log("npm run generate-users -- [options]");
  console.log("\nOptions:");
  console.log("  --mongodb-uri <uri>   MongoDB connection string");
  console.log(
    "  --type <type>         User type to generate: 'creator', 'fan', or 'all' (default: 'all')"
  );
  console.log(
    "  --count <number>      Number of users to generate (default: 50)"
  );
  console.log("\nExamples:");
  console.log(
    "  npm run generate-users -- --mongodb-uri mongodb://localhost:27017/mydb --type creator --count 20"
  );
  console.log(
    "  npm run generate-users -- --mongodb-uri mongodb://localhost:27017/mydb --type fan --count 30"
  );
  console.log(
    "  npm run generate-users -- --mongodb-uri mongodb://localhost:27017/mydb --count 100"
  );
}

// Check if help was requested
if (args.includes("--help") || args.includes("-h")) {
  printUsage();
  process.exit(0);
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
  printUsage();
  process.exit(1);
}

// Validate user type
if (!["creator", "fan", "all"].includes(USER_TYPE)) {
  console.error(
    `ERROR: Invalid user type '${USER_TYPE}'. Must be 'creator', 'fan', or 'all'.`
  );
  printUsage();
  process.exit(1);
}

// Validate total users
if (isNaN(TOTAL_USERS) || TOTAL_USERS <= 0) {
  console.error(
    `ERROR: Invalid count '${TOTAL_USERS}'. Must be a positive number.`
  );
  printUsage();
  process.exit(1);
}

main();
