# Language Selection Onboarding

Beautiful first-time user experience for language selection with 15 Indian languages in native scripts.

## Quick Start

```jsx
import LanguageSelection from './components/Onboarding/LanguageSelection';

<LanguageSelection onComplete={() => console.log('Language selected!')} />
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onComplete` | function | Yes | Callback fired when user selects a language |

## Features

- 15 languages with native script display
- Responsive grid layout
- Smooth animations
- Persistent language preference
- One-time display (uses localStorage)

## Languages Supported

1. English
2. हिन्दी (Hindi)
3. தமிழ் (Tamil)
4. తెలుగు (Telugu)
5. മലയാളം (Malayalam)
6. ಕನ್ನಡ (Kannada)
7. मराठी (Marathi)
8. ગુજરાતી (Gujarati)
9. ਪੰਜਾਬੀ (Punjabi)
10. ଓଡ଼ିଆ (Odia)
11. অসমীয়া (Assamese)
12. Mizo
13. মেইতেই লোন (Manipuri)
14. नेपाली (Nepali)
15. ককবরক (Kokborok)

## Testing

To reset and see onboarding again:

```javascript
localStorage.removeItem('hasCompletedOnboarding');
window.location.reload();
```

## Customization

Edit `LANGUAGES` array in `LanguageSelection.jsx` to modify language list.

Edit CSS variables in `LanguageSelection.css` for styling changes.
