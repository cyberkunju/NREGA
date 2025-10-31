

## **Phase 3: District Report Card Page Overhaul**

**(Goal: Implement the minimalist, detailed view for a single district with advanced data & filtering)**

### **Task 1: Apply Monochrome Styling & Basic Layout**

* **Objective:** Set up the overall structure and apply the minimalist black/white/grey theme consistently.
* **Actions:**
    1.  **Refactor CSS/Styling:** Remove any existing color styles (greens, reds, etc.) from the report card page components. Define a base monochrome palette (e.g., `#FFFFFF` background, `#111827` primary text, `#6B7280` secondary text, `#E5E7EB` subtle borders/backgrounds). Define your single accent color (e.g., `ACCENT_COLOR = '#10B981'`).
    2.  **Structure Components:** Create or modify components for the `Header`, `Summary`, `PrimaryCardsContainer`, `DetailedMetricsSection`, and `TimeFilterControls`.
    3.  **Basic Layout:** Arrange these components vertically using Flexbox or Grid. Ensure ample whitespace using padding and margins.
    4.  **Header:** Implement the large title (`District Report: {districtName}`), smaller subtitle (`Data for: {Month} {Year} | Last Updated: {Date}`), and the "**← Back to Map**" link (style it cleanly, applying `ACCENT_COLOR` only on hover/focus).

---

### **Task 2: Implement Natural Language Summary**

* **Objective:** Display the dynamic, easy-to-understand summary text.
* **Actions:**
    1.  **Create `<SummaryGenerator>` Component:** This component takes the full (capped) performance data object for the district as a prop.
    2.  **Implement Template Logic:** Inside the component, use `if/else` or `switch` based on `props.data.currentMonth.paymentPercentage` (already capped by the backend) to select the appropriate template string (Good, Average, Poor, Unavailable - see previous detailed plan).
    3.  **Implement Helper Functions:**
        * `formatNumber(num)`: Uses `num.toLocaleString('en-IN')`.
        * `roundToOneDecimal(num)`: Uses `num.toFixed(1)`.
        * `roundToWhole(num)`: Uses `Math.round(num)`.
        * `getTrendDescription(trend)`: Maps "improving" -> "getting better", "stable" -> "staying steady", "declining" -> "getting worse".
    4.  **Inject Data:** Use template literals or string replacement to fill placeholders in the chosen template with data formatted by your helper functions. Ensure `{STATE_NAME}` is included (using data from the enhanced API response).
    5.  **Render:** Display the final string within a styled `<p>` tag below the header. Ensure good line height and readability.

---

### **Task 3: Refine Primary Metric Cards**

* **Objective:** Display the 4 key metrics using the minimalist, monochrome design.
* **Actions:**
    1.  **Create `<MetricCard>` Component:** This component takes `title`, `value`, `unit` (optional), and `indicator` (optional icon/text) as props.
    2.  **Data:** Pass the capped data from the API response to four instances of `<MetricCard>`.
    3.  **Styling:** Apply subtle borders or background shades. Ensure consistent padding and alignment within each card.
    4.  **Value Display:** Use the largest, boldest font for the `value`.
    5.  **Icon/Indicator Implementation:**
        * **Payments Card:** Conditionally render a *monochrome* icon (`<CheckCircleIcon />`, `<AlertTriangleIcon />`, `<XCircleIcon />` from a library like Heroicons/Feather) based on the `paymentPercentage` value.
        * **Trend Card:** Display the correct monochrome arrow (`↑`, `→`, `↓`) next to the trend description text (`getTrendDescription(trend)`).
        * **Families/Days Cards:** Keep these focused on the number; icons are optional. If used, ensure they are simple and monochrome.
    6.  **Layout:** Arrange the four `<MetricCard>` components in a horizontal row (using Flexbox/Grid) with appropriate spacing. Ensure they wrap correctly on smaller screens if needed.

---

### **Task 4: Implement Collapsible Detailed Metrics Section**

* **Objective:** Provide access to secondary/tertiary metrics without cluttering the initial view.
* **Actions:**
    1.  **State:** Add React state to the parent report card component to manage the expanded/collapsed state (e.g., `const [isDetailsVisible, setIsDetailsVisible] = useState(false);`).
    2.  **Button:** Create the "Show More Details ↓" / "Show Less ↑" button. Style it cleanly. Its `onClick` handler should simply toggle the `isDetailsVisible` state.
    3.  **Conditional Rendering:** Wrap the detailed metrics content in a conditional block: `{isDetailsVisible && ( ... content ... )}`.
    4.  **Animation (Optional but Recommended):** Use a library like `Framer Motion` or simple CSS transitions on `max-height` and `opacity` to animate the expand/collapse smoothly.
    5.  **Content:**
        * **Fetch Necessary Data:** Ensure your API response for `/api/performance/:district_name` includes all the secondary/tertiary fields listed previously (Avg Daily Wage, HHs 100 Days, Projects Completed/Ongoing, Women %, Differently-Abled, Agri %, NRM %, Previous Month Payment %).
        * **Structure:** Create sub-components or use `<div>`s with clear subheadings ("Work & Wages", "Project Status", "Inclusion & Focus").
        * **Display:** Render each metric as a clean key-value pair ("Label:", "**Value**"). Format values appropriately (e.g., `toLocaleString`, add `₹` or `%`).
        * **Layout:** Use a CSS Grid with 2 or 3 columns for the key-value pairs within the expanded section for better desktop layout.

---

### **Task 5: Implement Month/Year Filtering Controls**

* **Objective:** Allow users to view historical data for the selected district.
* **Actions:**
    1.  **UI Components:** Add two `<select>` dropdown components near the top of the page (e.g., below the main subtitle).
        * **Financial Year Dropdown:** Populate with options from "2018-2019" up to the latest available year (e.g., "2025-2026").
        * **Month Dropdown:** Populate with month names ("Jan", "Feb", ..., "Dec").
    2.  **State Management:** Add React state to store the `selectedYear` and `selectedMonth`. Initialize them perhaps from the latest data fetched initially or set defaults.
    3.  **Event Handlers:** Add `onChange` handlers to both dropdowns that update the respective state variables.
    4.  **Data Fetching Logic:**
        * Create a `useEffect` hook that depends on `selectedYear`, `selectedMonth`, and the `districtName` (from URL params).
        * Inside this effect, construct the API call URL with the selected year and month as query parameters: `/api/performance/${districtName}?year=${selectedYear}&month=${selectedMonth}`.
        * Fetch data from this endpoint. Handle loading states (set a `loading` state to true before fetch, false after). Handle errors.
        * Update the main data state variable that feeds the Summary, Primary Cards, and Detailed Metrics components with the newly fetched data.
    5.  **User Feedback:** Ensure a loading indicator is shown briefly while the historical data is being fetched after changing a filter. Disable the dropdowns during the fetch.

---

### **Task 6: Final Review & Testing**

* **Consistency:** Check that all elements adhere to the monochrome theme and minimalist style.
* **Data Accuracy:** Verify that the correct (capped) data is displayed in all sections and matches the selected month/year.
* **Functionality:** Test the expand/collapse behavior, month/year filtering, and the "Back to Map" navigation.
* **Responsiveness:** Check the layout on different screen sizes (though primarily designed for desktop).
* **Readability:** Ensure text sizes, weights, and whitespace contribute to easy reading.

