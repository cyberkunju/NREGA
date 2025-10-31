
## **Phase 5: Performance Tuning, Final Testing, & Deployment**

**(Goal: Optimize performance, conduct thorough testing, deploy the final application, and prepare submission materials)**

### **Task 1: Performance Tuning & Optimization**

  * **Objective:** Ensure the application is fast, smooth, and responsive, especially the map interactions, even with data for all \~700+ districts.
  * **Actions:**
    1.  **GeoJSON Optimization:**
          * **Simplify Geometry:** If not already done, use `mapshaper` (offline command-line tool) to simplify the all-India district GeoJSON/TopoJSON file. Experiment with simplification levels (e.g., `10%`, `5%`) to find the best balance between detail and file size/rendering speed. Test the visual impact.
            ```bash
            # Example using mapshaper
            mapshaper india_districts.json -simplify 10% keep-shapes -o india_districts_simplified_10pct.json
            ```
          * **Use TopoJSON:** Ensure you are loading the smaller TopoJSON file and converting it to GeoJSON client-side using `topojson-client` just before adding it to the MapLibre source.
    2.  **MapLibre Performance:**
          * **Layer Optimization:** Review MapLibre layer definitions. Ensure filters (`['case']`, `['match']`) and expressions (`['interpolate']`, `['get']`) are efficient. Avoid overly complex expressions if possible.
          * **Source Updates:** When updating heatmap data (changing metrics), only update the necessary paint properties (`setPaintProperty`) rather than removing/re-adding layers or sources.
          * **Interaction Debouncing:** If hover effects or tooltips feel laggy during rapid mouse movement, consider debouncing the `mousemove` event handler slightly (e.g., using `lodash.debounce` or a simple `setTimeout` pattern).
    3.  **React Performance:**
          * **Profiling:** Use React DevTools Profiler to identify components that re-render unnecessarily, especially during map interactions or state updates.
          * **Memoization:** Apply `React.memo` to components that receive props but don't need to re-render if the props haven't changed. Use `useCallback` for event handlers passed down as props, and `useMemo` for expensive calculations within components.
          * **Code Splitting:** Use `React.lazy` and `Suspense` to split off large components (like the main map view or potentially heavy charting libraries if added later) into separate chunks, improving initial load time.
          * **Bundle Analysis:** Use tools like `source-map-explorer` or `webpack-bundle-analyzer` to inspect your final build bundle size and identify large dependencies that could potentially be optimized or replaced.
    4.  **API/Backend Check:** While less likely to be a bottleneck with the current setup, quickly review the response times of your `/api/heatmap-data` and `/api/performance/:district_name` endpoints under simulated load (e.g., using `k6` or `autocannon`) to ensure the database queries remain efficient.

-----

### **Task 2: Comprehensive Testing**

  * **Objective:** Catch bugs, verify functionality across different scenarios, and ensure a high-quality user experience.
  * **Actions:**
    1.  **Cross-Browser Testing:** Test the entire application on the latest versions of major desktop browsers (Chrome, Firefox, Safari, Edge). Pay close attention to map rendering and interactions.
    2.  **Cross-Device Testing (Simulated & Real):**
          * Use browser developer tools to simulate various mobile viewports.
          * If possible, test on at least one physical Android and iOS device to check touch interactions, performance, and layout quirks.
    3.  **Network Condition Testing:** Use browser developer tools to throttle the network speed (e.g., "Slow 3G", "Fast 3G") and verify:
          * Loading indicators display correctly.
          * The application remains usable (though potentially slower).
          * Hover effects don't become overly laggy.
    4.  **Data Scenario Testing:**
          * Test districts with \>100% (verify capping works everywhere).
          * Test districts with missing data (ensure graceful handling in map, tooltips, and report card).
          * Test districts with very low/high values for different metrics (verify heatmap colors and legend are correct).
          * Test the month/year filter extensively, including edge cases (e.g., switching years, months with no data).
    5.  **Internationalization (i18n) Testing:**
          * Switch to **every** implemented language.
          * Check **all** UI text elements (including error messages, tooltips, summaries, labels) for correct translation.
          * Verify layout doesn't break with potentially longer/shorter text in different languages.
          * Test number and date formatting if language-specific formats are used.
    6.  **Functional Testing:** Retest all core user flows:
          * GPS detection -\> Report Card.
          * Map Hover -\> Tooltip -\> Click -\> Report Card.
          * Search -\> Select -\> Report Card.
          * Changing Heatmap Metric -\> Map & Legend Update.
          * Changing Month/Year Filter -\> Report Card Update.
          * Show/Hide Detailed Metrics.
          * Language Switching.
    7.  **Accessibility Check (Basic):** Use browser tools or extensions (like Axe DevTools) to run a basic accessibility scan. Check for sufficient color contrast (especially with the monochrome theme), keyboard navigability (can you tab through elements?), and semantic HTML.

-----

### **Task 3: Final Deployment to GCE VM**

  * **Objective:** Deploy the latest, tested, and optimized code to the production GCE VM (`e2-small` recommended).
  * **Actions:**
    1.  **Build Frontend:** Create a production build of your React app: `npm run build`.
    2.  **Deploy Frontend:**
          * SSH into your GCE VM.
          * Remove old build files: `sudo rm -rf /var/www/mgnrega-frontend/build/*`.
          * Copy the *contents* of your local `build` folder to `/var/www/mgnrega-frontend/build/` on the VM (using `gcloud compute scp --recurse`).
          * Verify Nginx permissions if necessary.
    3.  **Deploy Backend API:**
          * Copy your updated backend Node.js code to `/opt/mgnrega-api/` on the VM (using `gcloud compute scp --recurse`).
          * SSH into the VM, navigate to `/opt/mgnrega-api/`.
          * Install dependencies: `npm install --production`.
          * Reload the application using PM2: `pm2 reload mgnrega-api` (or `pm2 restart mgnrega-api`). Check `pm2 status`.
    4.  **Deploy ETL Script (if changed):**
          * Copy updated ETL script files to `/opt/mgnrega-etl/` (using `gcloud compute scp --recurse`).
          * SSH in, navigate to `/opt/mgnrega-etl/`, run `npm install --production`. (No restart needed as it's run by cron).
    5.  **Database Schema (if changed):** If you made any database schema changes, SSH into the VM, connect to PostgreSQL using `sudo -u postgres psql mgnrega`, and apply the `ALTER TABLE` or other necessary SQL commands.
    6.  **Nginx/Cron Config (if changed):** If you modified Nginx configuration (`/etc/nginx/sites-available/nrega.cyberkunju.dev`) or the cron job (`crontab -e`), ensure those changes are applied on the VM and services are reloaded (`sudo systemctl reload nginx`).
    7.  **Final Check:** Access your production URL (`https://nrega.cyberkunju.dev`) and perform a quick smoke test to ensure everything is running.

-----

### **Task 4: Prepare Submission Materials**

  * **Objective:** Create the Loom video and gather necessary information for submission.
  * **Actions:**
    1.  **Record Loom Video (\<2 minutes):**
          * **Introduction:** Briefly state the project goal (making MGNREGA data accessible).
          * **Demo:** Walk through the live application:
              * Show the map heatmap, hover tooltips.
              * Demonstrate switching heatmap metrics and the legend updating.
              * Show the search functionality.
              * Click a district and show the Report Card (primary cards, summary).
              * Demonstrate the "Show More Details" section.
              * Show the month/year filtering.
              * Briefly demonstrate language switching (if time allows).
          * **Code Walkthrough (Brief):** Quickly show key parts:
              * MapLibre component setup (source, layers, styling).
              * Backend API endpoint structure (how data is fetched/processed).
              * Database schema (briefly mention tables).
              * ETL script logic (how data is fetched from gov API).
              * (Mention self-hosted setup on GCE VM).
          * **Decisions:** Briefly mention key technical decisions (e.g., using MapLibre for performance, capping data, self-hosting on GCE for cost/compliance).
          * **Keep it Concise:** Practice to stay under the 2-minute limit\!
    2.  **Get Hosted URL:** Your final URL is `https://nrega.cyberkunju.dev`.
    3.  **Final Review:** Double-check all project requirements against your implementation and documentation.
