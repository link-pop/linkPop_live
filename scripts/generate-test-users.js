const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { faker } = require("@faker-js/faker");

// Load environment variables
dotenv.config({ path: ".env.local" });

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

  // Women-oriented hair colors with more realistic distribution
  const femaleHairColors = [
    { value: "blonde", weight: 0.25 },
    { value: "brown", weight: 0.35 },
    { value: "black", weight: 0.2 },
    { value: "red", weight: 0.1 },
    { value: "gray", weight: 0.05 },
    { value: "other", weight: 0.05 },
  ];

  // Women-oriented body types with more realistic distribution
  const femaleBodyTypes = [
    { value: "slim", weight: 0.25 },
    { value: "average", weight: 0.3 },
    { value: "curvy", weight: 0.25 },
    { value: "athletic", weight: 0.1 },
    { value: "plus-size", weight: 0.1 },
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

  // Generate a truly unique ID for each image
  const generateUniqueId = () => {
    return `${firstName}-${index}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`;
  };

  // Get unique profile images using Robohash which generates consistent but unique images based on text
  const getUniqueAvatarImage = () => {
    // Using Robohash which creates unique avatars based on input text
    // Add timestamp and random number to ensure uniqueness between runs
    return `https://robohash.org/${generateUniqueId()}?set=set4&size=400x400&bgset=bg1`;
  };

  // Get unique profile image
  const getUniqueProfileImage = () => {
    return `https://robohash.org/${generateUniqueId()}?set=set4&size=400x400&bgset=bg2`;
  };

  // Get a unique cover image - using a different robohash set
  const getUniqueCoverImage = () => {
    return `https://robohash.org/${generateUniqueId()}?set=set2&size=800x300&bgset=bg1`;
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

    // Account profile fields
    age: faker.number.int({ min: 18, max: 45 }),
    raceEthnicity: faker.helpers.arrayElement([
      "asian",
      "black",
      "hispanic",
      "middleEastern",
      "nativeAmerican",
      "pacificIslander",
      "white",
      "multiracial",
      "other",
    ]),
    hairColor: weightedRandom(femaleHairColors),
    bodyType: weightedRandom(femaleBodyTypes),

    // Status
    isAvailable: faker.datatype.boolean(0.8),

    // Images - using Robohash which guarantees unique images
    profileImage: getUniqueProfileImage(),
    originalProfileImage: getUniqueProfileImage(),
    coverImage: getUniqueCoverImage(),
    originalCoverImage: getUniqueCoverImage(),

    // Location
    city: faker.location.city(),
    region: faker.location.state(),
    country: faker.location.country(),
    countryCode: faker.location.countryCode(),

    // Subscription settings
    subscriptionPrice: faker.helpers.arrayElement([
      4.99, 9.99, 14.99, 19.99, 24.99, 29.99,
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

  // Much more diverse categories for different images
  const womanCategories = [
    "woman,portrait,face",
    "woman,model,fashion",
    "woman,beauty,portrait",
    "woman,style,fashion",
    "woman,casual,portrait",
    "woman,professional,headshot",
    "woman,outdoor,portrait",
    "woman,elegant,portrait",
    "woman,natural,portrait",
    "woman,lifestyle,portrait",
  ];

  // Get a different category for each image
  const randomCategory = (i) =>
    womanCategories[Math.floor(Math.random() * womanCategories.length)];

  // Generate a truly unique ID for each image
  const generateUniqueId = () => {
    return `${firstName}-${index}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`;
  };

  // Get unique profile images using Robohash which generates consistent but unique images based on text
  const getUniqueAvatarImage = () => {
    // Using Robohash which creates unique avatars based on input text
    // Add timestamp and random number to ensure uniqueness between runs
    return `https://robohash.org/${generateUniqueId()}?set=set4&size=400x400&bgset=bg1`;
  };

  // Get unique profile image
  const getUniqueProfileImage = () => {
    return `https://robohash.org/${generateUniqueId()}?set=set4&size=400x400&bgset=bg2`;
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

    // Fan preferences - these are what the fan likes, not their own attributes
    preferAge: faker.number.int({ min: 18, max: 50 }),
    hairColor: faker.helpers.arrayElement([
      "black",
      "brown",
      "blonde",
      "red",
      "gray",
      "white",
      "any",
    ]),
    bodyType: faker.helpers.arrayElement([
      "slim",
      "athletic",
      "average",
      "curvy",
      "muscular",
      "plus-size",
      "any",
    ]),

    // Status
    isAvailable: faker.datatype.boolean(0.8),

    // Images - using Robohash which guarantees unique images
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
