# Atomy Selector Extension

Chrome extension for extracting product option selectors from Atomy Shop (KR/JP/MY) and AZA Mall.

## Features

- ✅ Support multiple Atomy sites: KR, JP, MY
- ✅ Support AZA Mall (atomyaza.co.kr)
- ✅ Extract product options with stock information
- ✅ One-click copy spec selectors
- ✅ Draggable floating panel
- ✅ Real-time stock status display

## Installation

### From Chrome Web Store
Coming soon...

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension directory

## Usage

### AZA Mall (atomyaza.co.kr)

1. Visit any product page on AZA Mall (e.g., `https://atomyaza.co.kr/m/shop/view.php?gs_id=641066`)
2. The extension automatically displays a floating panel with product options
3. Click "Copy" button next to any option to copy the spec selector
4. Spec selector format: `gs_id|option_name,param1,param2,price,pv,io_no`
   - Example: `641066|3박스,15000,861,9900,5000,4396664`

### Atomy Shop (KR/JP/MY)

1. Visit any product page on Atomy Shop
2. The extension displays available options with stock information
3. Click "Copy" to copy the option selector
4. Format varies by region (single option or option1|option2)

## Spec Selector Format

### AZA Mall
```
gs_id|option_name,param1,param2,price,pv,io_no

Example:
641066|3박스,15000,861,9900,5000,4396664
```

### Atomy Shop
```
option_name
or
option1|option2

Example:
3박스
or
색상:블랙|사이즈:L
```

## Supported Sites

- `https://atomyaza.co.kr/shop/view.php*`
- `https://atomyaza.co.kr/m/shop/view.php*`
- `https://shop.atomy.com/kr/*`
- `https://kr.atomy.com/product/*`
- `https://jp.atomy.com/product/*`
- `https://my.atomy.com/product/*`

## Development

### File Structure

```
atomy-selector-extension/
├── manifest.json       # Extension manifest
├── content.js          # Main content script
├── content.css         # Styles for floating panel
├── popup.html          # Extension popup
└── README.md           # This file
```

### Making Changes

1. Edit the files
2. Go to `chrome://extensions/`
3. Click reload button for this extension
4. Refresh the product page to see changes

## Changelog

### v1.0.0 (2026-01-30)
- ✨ Add AZA Mall support with new spec selector format (gs_id|data-value)
- 🔧 Optimize payload generation (skip GET request when gs_id provided)
- 📝 Add validation for spec selector format
- 🎨 Improve UI/UX with draggable panel
- 🐛 Bug fixes and performance improvements

## License

MIT

## Author

Ray Hsu
