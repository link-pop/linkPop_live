# Translations System

This directory contains the translation files for the application.

## Structure

- `index.js` - Exports the `getTranslation` function and `languages` object
- `en.js` - English translations
- `uk.js` - Ukrainian translations
- Add more language files as needed

## How to add a new language

1. Create a new file named with the language code (e.g., `fr.js` for French)
2. Copy the structure from an existing language file (e.g., `en.js`)
3. Translate the values (keep the keys the same)
4. Import the new language in `index.js` and add it to both the `languages` object and the `translations` object

## Usage

In your components:

```jsx
import { useTranslation } from "@/components/Context/TranslationContext";

function MyComponent() {
  const { t } = useTranslation();

  return <p>{t("someTranslationKey")}</p>;
}
```

For strings with parameters:

```jsx
// You can use parameters in translations with {{paramName}} syntax
// Example in en.js: "welcomeMessage": "Hello, {{name}}!"

const { t } = useTranslation();
const message = t("welcomeMessage", { name: "John" }); // "Hello, John!"
```
