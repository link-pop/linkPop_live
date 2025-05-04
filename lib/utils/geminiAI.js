import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Common leetspeak replacements
const leetMap = {
  a: "[a@4]",
  i: "[i1!]",
  e: "[e3]",
  o: "[o0]",
  s: "[s5$]",
  t: "[t7]",
  l: "[l1]",
  u: "[u\u00fc\u00fb\u00fa]", // Include Unicode variations
};

// Convert a word to a regex pattern that matches its leetspeak variations
function createLeetRegex(word) {
  const pattern = word
    .split("")
    .map((char) => leetMap[char.toLowerCase()] || char)
    .join("[\\s]*"); // Allow optional spaces between characters
  return pattern;
}

// Function to normalize spaced out words
function normalizeText(text) {
  // Remove excessive spaces between characters
  return text.replace(/\s+/g, " ");
}

export async function censorText(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze the following text for inappropriate or offensive content, including:
    1. Direct offensive words
    2. Leetspeak variations (where numbers replace letters, like '1' for 'i', '3' for 'e', '0' for 'o', etc.)
    3. Intentionally misspelled offensive words
    4. Offensive phrases and insults
    5. Words with spaces between letters (like "f u c k")
    6. Complex letter-number combinations

    For any inappropriate content found:
    1. Replace the entire offensive word or phrase with asterisks (*)
    2. Use the same number of asterisks as characters in the original word
    3. Preserve spaces and punctuation
    4. Be thorough and catch subtle variations

    Return only the censored text, with no additional commentary.
    Text to analyze: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let processedText = response.text().trim();

    // Apply regex-based censoring with leetspeak support
    const offensivePatterns = [
      {
        pattern: new RegExp(createLeetRegex("ass") + "(?![a-z])", "gi"),
        replacement: "***",
      },
      {
        pattern: new RegExp(createLeetRegex("bitch"), "gi"),
        replacement: "*****",
      },
      {
        pattern: new RegExp(createLeetRegex("shit"), "gi"),
        replacement: "****",
      },
      {
        pattern: new RegExp(createLeetRegex("fuck"), "gi"),
        replacement: "****",
      },
      {
        pattern: new RegExp(createLeetRegex("slut"), "gi"),
        replacement: "****",
      },
      {
        pattern: new RegExp(createLeetRegex("fucking"), "gi"),
        replacement: "*******",
      },
      // Common variations with spaces
      {
        pattern: /f\s*[u\*]\s*c\s*k(?:\s*i\s*n\s*g)?/gi,
        replacement: (match) => "*".repeat(match.replace(/\s+/g, "").length),
      },
      {
        pattern: /s\s*[l1]\s*[u\*]\s*[t7]/gi,
        replacement: (match) => "*".repeat(match.replace(/\s+/g, "").length),
      },
      // Add more patterns as needed
    ];

    // First normalize any spaced out text
    processedText = normalizeText(processedText);

    // Apply each pattern
    offensivePatterns.forEach(({ pattern, replacement }) => {
      if (typeof replacement === "function") {
        processedText = processedText.replace(pattern, replacement);
      } else {
        processedText = processedText.replace(pattern, replacement);
      }
    });

    return processedText;
  } catch (error) {
    console.error("Error validating text with Gemini:", error);
    // Apply fallback validation with the same patterns
    let fallbackText = normalizeText(text);
    const offensivePatterns = [
      {
        pattern: new RegExp(createLeetRegex("ass") + "(?![a-z])", "gi"),
        replacement: "***",
      },
      {
        pattern: new RegExp(createLeetRegex("bitch"), "gi"),
        replacement: "*****",
      },
      {
        pattern: new RegExp(createLeetRegex("shit"), "gi"),
        replacement: "****",
      },
      {
        pattern: new RegExp(createLeetRegex("fuck"), "gi"),
        replacement: "****",
      },
      {
        pattern: new RegExp(createLeetRegex("slut"), "gi"),
        replacement: "****",
      },
      {
        pattern: new RegExp(createLeetRegex("fucking"), "gi"),
        replacement: "*******",
      },
      // Common variations with spaces
      {
        pattern: /f\s*[u\*]\s*c\s*k(?:\s*i\s*n\s*g)?/gi,
        replacement: (match) => "*".repeat(match.replace(/\s+/g, "").length),
      },
      {
        pattern: /s\s*[l1]\s*[u\*]\s*[t7]/gi,
        replacement: (match) => "*".repeat(match.replace(/\s+/g, "").length),
      },
    ];

    offensivePatterns.forEach(({ pattern, replacement }) => {
      if (typeof replacement === "function") {
        fallbackText = fallbackText.replace(pattern, replacement);
      } else {
        fallbackText = fallbackText.replace(pattern, replacement);
      }
    });
    return fallbackText;
  }
}
