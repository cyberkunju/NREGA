#!/usr/bin/env python3
"""
Automated Translation Script for MGNREGA Report Card
Translates English strings to Hindi, Telugu, Tamil, and Marathi using Google Translate API
"""

import json
import os
import requests
import time
from pathlib import Path

# Google Translate API Configuration
GOOGLE_API_KEY = 'AIzaSyB-derrOCH8uh7LaqFllT3rf5KnE0kc238'
GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2'

# Target languages
TARGET_LANGUAGES = {
    'hi': 'Hindi (हिंदी)',
    'te': 'Telugu (తెలుగు)',
    'ta': 'Tamil (தமிழ்)',
    'mr': 'Marathi (मराठी)'
}

# Load English strings
ENGLISH_FILE = 'frontend/public/locales/en/translation.json'

def flatten_dict(d, prefix=''):
    """Convert nested dict to flat key-value pairs"""
    items = []
    for k, v in d.items():
        new_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key))
        else:
            items.append((new_key, v))
    return items

def unflatten_dict(flat_dict):
    """Convert flat key-value pairs back to nested dict"""
    result = {}
    for key, value in flat_dict.items():
        parts = key.split('.')
        current = result
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        current[parts[-1]] = value
    return result

def translate_with_google(text, target_language):
    """Translate text using Google Translate API"""
    try:
        response = requests.post(
            GOOGLE_TRANSLATE_URL,
            params={
                'key': GOOGLE_API_KEY,
                'target': target_language,
                'source': 'en',
                'format': 'text'
            },
            json={
                'q': text
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            translated = result['data']['translations'][0]['translatedText']
            return translated
        else:
            print(f"❌ Error translating '{text}': {response.status_code}")
            print(f"Response: {response.text}")
            return text
    except Exception as e:
        print(f"❌ Exception translating '{text}': {e}")
        return text

def batch_translate():
    """Main function to translate all strings"""
    
    print("=" * 80)
    print("🌍 MGNREGA Report Card - Automated Translation")
    print("=" * 80)
    print()
    
    # Load English strings
    print(f"📂 Loading English strings from: {ENGLISH_FILE}")
    with open(ENGLISH_FILE, 'r', encoding='utf-8') as f:
        english_data = json.load(f)
    
    # Flatten English strings
    flat_english = flatten_dict(english_data)
    
    print(f"✅ Found {len(flat_english)} strings to translate")
    print()
    
    # Translate to each language
    for lang_code, lang_name in TARGET_LANGUAGES.items():
        print("=" * 80)
        print(f"🌐 Translating to {lang_name} ({lang_code.upper()})...")
        print("=" * 80)
        
        flat_translated = {}
        success_count = 0
        error_count = 0
        
        for i, (key, text) in enumerate(flat_english, 1):
            # Skip if text contains only symbols or numbers
            if not any(c.isalpha() for c in text):
                flat_translated[key] = text
                print(f"  [{i}/{len(flat_english)}] ⏭️  {key}: '{text}' (skipped - no letters)")
                continue
            
            # Translate
            translated = translate_with_google(text, lang_code)
            flat_translated[key] = translated
            
            if translated != text:
                success_count += 1
                print(f"  [{i}/{len(flat_english)}] ✅ {key}")
                print(f"       EN: {text}")
                print(f"       {lang_code.upper()}: {translated}")
            else:
                error_count += 1
                print(f"  [{i}/{len(flat_english)}] ⚠️  {key}: Translation failed, kept original")
            
            # Rate limiting - be nice to the API
            time.sleep(0.1)
        
        # Convert back to nested structure
        nested_translated = unflatten_dict(flat_translated)
        
        # Save to file
        output_path = f'frontend/public/locales/{lang_code}/translation.json'
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(nested_translated, f, ensure_ascii=False, indent=2)
        
        print()
        print(f"📊 Translation Summary for {lang_name}:")
        print(f"   ✅ Successfully translated: {success_count}")
        print(f"   ⚠️  Errors/Skipped: {error_count}")
        print(f"   💾 Saved to: {output_path}")
        print()
    
    print("=" * 80)
    print("✨ All translations complete!")
    print("=" * 80)
    print()
    print("📁 Translation files created:")
    for lang_code, lang_name in TARGET_LANGUAGES.items():
        print(f"   ✓ frontend/public/locales/{lang_code}/translation.json ({lang_name})")
    print()
    print("🚀 Next steps:")
    print("   1. Review the translations for accuracy")
    print("   2. Run: cd frontend && npm start")
    print("   3. Test language switching in the app")
    print()

if __name__ == '__main__':
    try:
        batch_translate()
    except KeyboardInterrupt:
        print("\n\n⚠️  Translation interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
