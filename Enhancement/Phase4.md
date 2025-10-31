
## **Phase 4: Global UI Elements & Internationalization (i18n)**

**(Goal: Enhance overall usability, implement search autocomplete, add loading states, and enable multi-language support)**

### **Task 1: Enhance Search Bar Functionality**

  * **Objective:** Improve the district search experience with autocomplete suggestions.
  * **Actions:**
    1.  **Fetch District List:** In your main `App.js` or a top-level component, fetch the list of all district names from your `/api/districts` endpoint once on initial load. Store this list in state or context.
    2.  **Implement Autocomplete Logic:**
          * Modify your `<SearchBar>` component.
          * As the user types, filter the full district list (client-side is fine for \~700 districts) to find matches (case-insensitive, partial match).
          * Display the top 5-10 matches in a dropdown list positioned below the search input.
    3.  **Style Dropdown:** Style the suggestion list to match the minimalist theme (clean background, clear text, subtle hover effect on items).
    4.  **Handle Selection:** When a user clicks a suggestion or presses Enter on a highlighted suggestion:
          * Update the search input field with the full district name.
          * Close the dropdown.
          * Use `react-router`'s `Maps` function to go to the corresponding district report card page (`/district/[encodedDistrictName]`).
    5.  **No Results:** If the filter yields no results, display a "No districts found" message within the dropdown area.

-----

### **Task 2: Implement Loading State Indicators**

  * **Objective:** Provide visual feedback to the user during potentially slow operations (map loading, data fetching).
  * **Actions:**
    1.  **Map Loading:**
          * In your `<MapView>` component, use the `mapLoaded` state (set to true in the MapLibre `load` event).
          * Conditionally render a simple, centered loading indicator (e.g., a minimalist spinner or a "Loading Map..." message) that overlays the map container *until* `mapLoaded` is true. Ensure the indicator matches the monochrome aesthetic.
    2.  **Heatmap Data Loading:**
          * While fetching data from `/api/heatmap-data` (which populates `enrichedGeoJSON`), display the map loading indicator or a specific "Loading data..." message. Only add the MapLibre source and layers *after* this data is ready.
    3.  **Report Card Data Loading:**
          * In the `DistrictReportCard` component, use a `loading` state variable. Set it to `true` before fetching data (either initially or when changing month/year filters) and `false` when the fetch completes or errors out.
          * While `loading` is true:
              * Display skeleton loaders (grey placeholder shapes) mimicking the layout of the primary cards and summary text. This provides a better perceived performance than a simple spinner.
              * Alternatively, display a simple spinner/message overlaying the content area.

-----

### **Task 3: Set Up Internationalization (i18n) Framework**

  * **Objective:** Prepare the application codebase to support multiple languages.
  * **Actions:**
    1.  **Install Libraries:**
        ```bash
        npm install i18next react-i18next i18next-browser-languagedetector
        ```
    2.  **Create Configuration File (`src/i18n.js`):**
        ```javascript
        import i18n from 'i18next';
        import { initReactI18next } from 'react-i18next';
        import LanguageDetector from 'i18next-browser-languagedetector';
        // If loading translations via HTTP (recommended for scale)
        // import Backend from 'i18next-http-backend';

        i18n
          // .use(Backend) // Uncomment if using http backend
          .use(LanguageDetector) // Detect user language
          .use(initReactI18next) // Pass i18n down to react-i18next
          .init({
            // Define supported languages based on your list
            supportedLngs: ['en', 'hi', 'ta', 'te', 'ml', 'kn', 'mr', 'gu', 'pa', 'or', 'as', 'lus', 'mni', 'ne', 'kok'],
            fallbackLng: 'en', // Use English if detected language is not available
            debug: process.env.NODE_ENV === 'development', // Enable debug output in dev

            // Options for language detector (optional)
            detection: {
              order: ['localStorage', 'navigator', 'htmlTag'],
              caches: ['localStorage'], // Where to cache detected language
            },

            // Specify where translations live (if NOT using http backend)
            // Replace with actual translation resources
            resources: {
              en: {
                translation: {
                  // Add some initial English strings here
                  "search_placeholder": "Search for a district...",
                  "payment_timeliness": "Payment Timeliness",
                  // ... more strings
                }
              },
              hi: {
                translation: {
                  // Add corresponding Hindi strings here
                  "search_placeholder": "जिले के लिए खोजें...",
                  "payment_timeliness": "भुगतान समयबद्धता",
                   // ... more strings
                }
              }
              // Add other languages here...
            },

            interpolation: {
              escapeValue: false // React already safes from xss
            }
          });

        export default i18n;
        ```
    3.  **Initialize i18n:** Import your `i18n.js` file in your main application entry point (`src/index.js` or `src/App.js`):
        ```javascript
        // src/index.js
        import React, { Suspense } from 'react';
        import ReactDOM from 'react-dom/client';
        import App from './App';
        import './i18n'; // Import the i18n configuration

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(
          <React.StrictMode>
            {/* Wrap App with Suspense for loading translations if using backend */}
            <Suspense fallback="Loading...">
              <App />
            </Suspense>
          </React.StrictMode>
        );
        ```

-----

### **Task 4: Extract UI Strings & Implement Translations**

  * **Objective:** Replace all hardcoded text in your components with translation keys and provide initial translations (at least for English and Hindi to start).
  * **Actions:**
    1.  **Create Translation Files:** Set up your translation file structure. A common approach is `public/locales/{lng}/translation.json`.
          * `public/locales/en/translation.json`
          * `public/locales/hi/translation.json`
          * *(Add files for other languages)*
    2.  **Extract Strings:** Go through *every* component (`MapView`, `SearchBar`, `Legend`, `DistrictReportCard`, `MetricCard`, `SummaryGenerator`, etc.). Identify *all* user-visible text (labels, button text, titles, placeholders, summary templates, legend labels).
    3.  **Define Keys:** Assign a unique, descriptive key for each string (e.g., `map.legend.paymentTitle`, `reportCard.showMoreButton`, `summary.goodPerformanceTemplate`).
    4.  **Populate JSON Files:** Add the keys and their corresponding translations to each language file.
          * **`en/translation.json` Example:**
            ```json
            {
              "search_placeholder": "Search for district or state...",
              "map": {
                "legend": {
                  "paymentTitle": "Payment Timeliness",
                  "avgDaysTitle": "Average Days Worked",
                  "noData": "No data available"
                }
              },
              "reportCard": {
                "backButton": "← Back to Map",
                "showMoreButton": "Show More Details ↓",
                "showLessButton": "Show Less ↑",
                "paymentCardTitle": "Payments on Time",
                "familiesCardTitle": "Families Who Got Work",
                // ... more strings including summary templates ...
              },
              "trend": {
                 "improving": "Improving",
                 "stable": "Stable",
                 "declining": "Declining"
              }
            }
            ```
          * **`hi/translation.json` Example:** Fill in the Hindi equivalents for each key.
    5.  **Use `useTranslation` Hook:** In your functional components, import and use the hook:
        ```javascript
        import { useTranslation } from 'react-i18next';

        function MyComponent() {
          const { t } = useTranslation();

          return (
            <div>
              <input placeholder={t('search_placeholder')} />
              <h2>{t('map.legend.paymentTitle')}</h2>
              {/* For dynamic content like summaries: */}
              <p>{t('summary.goodPerformanceTemplate', {
                    DISTRICT_NAME: districtName,
                    PAYMENT_PERCENT: paymentPercent,
                    // ... other variables needed by the template
                 })}</p>
            </div>
          );
        }
        ```
    6.  **Handle Plurals/Formatting:** Use `i18next`'s features for handling plurals and number/date formatting if needed, although simple string interpolation might suffice here.

-----

### **Task 5: Implement Language Selection UI**

  * **Objective:** Allow users to choose their preferred language on first visit and change it later.
  * **Actions:**
    1.  **Onboarding Modal:**
          * Create a simple modal component (`<LanguageSelectionModal />`).
          * Use `i18next.language` and `localStorage` to check if a language has already been selected. If not, show the modal on the first load of the `App` component.
          * Display buttons or a list for each supported language (show the language name *in that language*, e.g., "English", "हिन्दी", "தமிழ்").
          * On selection, call `i18n.changeLanguage(lng)` and store the selected language code (e.g., 'hi') in `localStorage`. Close the modal.
    2.  **Persistent Language Switcher:**
          * Add a small dropdown or icon button (e.g., a globe icon `🌐`) to a consistent location (like the header or footer).
          * This switcher should display the list of supported languages.
          * On selection, call `i18n.changeLanguage(lng)` to change the language immediately and update the `localStorage` preference.

-----

### **Task 6: Testing i18n**

  * **Verify All Strings:** Check every part of the UI in each implemented language to ensure all text is translated and displays correctly.
  * **Test Language Switching:** Confirm that changing the language updates the entire UI instantly.
  * **Test Onboarding:** Clear `localStorage` and verify the language selection modal appears on first visit.
  * **Check Formatting:** Ensure numbers, dates, and placeholders in summaries are formatted correctly for each language context.

