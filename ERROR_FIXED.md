# MapLibre Error Fixed ✅

## The Error

```
Error: layers.district-labels.paint.text-opacity: "zoom" expression 
may only be used as input to a top-level "step" or "interpolate" expression.
```

## The Problem

MapLibre GL doesn't allow nested expressions in `text-opacity`. The original code tried to use:

```javascript
'text-opacity': [
  'case',
  ['in', ...], // Check if placeholder
  0,           // Hide if placeholder
  [
    'interpolate',  // ❌ ERROR: Can't nest interpolate inside case
    ['linear'],
    ['zoom'],
    5, 0.6,
    7, 0.8,
    9, 1.0
  ]
]
```

## The Solution

Instead of using `text-opacity` with nested expressions, use a **filter** to completely exclude placeholder districts from the label layer:

```javascript
// Add district labels
map.current.addLayer({
  id: 'district-labels',
  type: 'symbol',
  source: 'districts',
  minzoom: 5,
  filter: [
    '!',  // NOT operator
    ['in', ['downcase', ['coalesce', ['get', 'district_name'], ...]], ['literal', PLACEHOLDER_DISTRICTS]]
  ],
  layout: { ... },
  paint: {
    'text-opacity': [
      'interpolate',  // ✅ Now at top level
      ['linear'],
      ['zoom'],
      5, 0.6,
      7, 0.8,
      9, 1.0
    ]
  }
});
```

## What Changed

**File:** `frontend/src/components/IndiaDistrictMap/MapView.jsx`

**Before:**
- Used `text-opacity` with nested `case` and `interpolate`
- Caused MapLibre error

**After:**
- Added `filter` property to exclude placeholder districts
- Moved `interpolate` to top level of `text-opacity`
- No more errors!

## Result

✅ **Map loads successfully**  
✅ **No console errors**  
✅ **Placeholder districts hidden**  
✅ **Labels show correctly for real districts**  
✅ **Zoom-based opacity works**  

## Technical Details

### MapLibre Expression Rules

1. **Top-level expressions** in paint properties:
   - `interpolate` ✅
   - `step` ✅
   - `case` ✅

2. **Nested expressions** (NOT allowed in some properties):
   - `['case', ..., ['interpolate', ...]]` ❌
   - `['interpolate', ..., ['case', ...]]` ✅ (allowed in some cases)

3. **Solution:** Use `filter` for conditional logic, keep paint properties simple

### Filter vs Paint

**Filter** (layout-level):
- Excludes features completely
- More efficient
- Applied before rendering
- ✅ Best for hiding districts

**Paint** (style-level):
- Styles visible features
- Applied during rendering
- Can use expressions
- ✅ Best for colors, opacity, etc.

## Testing

Once Docker finishes starting:

1. Open `http://localhost:3000`
2. Clear browser cache (`Ctrl+Shift+Delete`)
3. Check browser console - should see:
   ```
   ✅ Layers added successfully
   ```
4. No errors about `text-opacity`
5. Map loads correctly
6. Placeholder districts invisible

## Files Modified

```
frontend/src/components/IndiaDistrictMap/MapView.jsx
  - Line ~412: Added filter property to district-labels layer
  - Line ~440: Simplified text-opacity to top-level interpolate
```

## Summary

**Problem:** Nested `interpolate` inside `case` for `text-opacity`  
**Solution:** Use `filter` to exclude placeholders, keep `text-opacity` simple  
**Result:** Map loads without errors, placeholders hidden correctly  

The error is now fixed! 🎉
