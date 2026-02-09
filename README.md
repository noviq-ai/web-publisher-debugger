# Web Publisher Debugger

A Chrome extension for debugging SEO, AdTech (Prebid.js, GPT), and tracking (GA4, GTM) with AI-powered analysis.

[日本語版 README](README.ja.md)

## Screenshots

![AI Assistant](docs/images/screenshot-ai.png)
![AdTech Debugging](docs/images/screenshot-adtech.png)
![SEO Analysis](docs/images/screenshot-seo.png)

## Features

### SEO Analysis
- Meta tags and Open Graph validation
- Structured data (JSON-LD) inspection
- Canonical URL and robots directives check
- Mobile viewport verification

### AdTech Debugging
- **Prebid.js**: Real-time auction monitoring, bid analysis, timeout tracking
- **Google Publisher Tag (GPT)**: Slot configuration, targeting parameters, refresh detection

### Tracking Analysis
- **Google Tag Manager**: Container detection, dataLayer event monitoring
- **Google Analytics 4**: Configuration validation, event tracking
- **Tracking Pixels**: Facebook, Twitter, LinkedIn, Pinterest pixel detection

### AI Assistant (Beta)
- Natural language queries about page data
- 100% local processing with your own Claude or GPT API key
- Privacy-focused: API keys stored locally, never transmitted to our servers

## Installation

### From Chrome Web Store
[Install from Chrome Web Store](https://chromewebstore.google.com/detail/web-publisher-debugger/pokhcojolaodbjgchijleddjmpchchjd)

### Manual Installation (Development)

1. Clone the repository
```bash
git clone https://github.com/noviq-ai/web-publisher-debugger.git
cd web-publisher-debugger
```

2. Install dependencies
```bash
npm install
```

3. Build the extension
```bash
npm run build
```

4. Load in Chrome
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Usage

1. Click the extension icon in your browser toolbar
2. Navigate to any webpage you want to analyze
3. The side panel will display collected data organized by category:
   - **SEO**: Meta tags, structured data, and more
   - **AdTech**: Prebid.js and GPT slot information
   - **Tracking**: GTM, GA4, and pixel data

4. (Optional) Configure the AI Assistant in Settings to ask questions about the page data

## Privacy

- All data is processed **locally in your browser**
- No data is sent to external servers (except AI providers when using the AI feature)
- API keys are stored locally using Chrome's encrypted storage
- See our full [Privacy Policy](PRIVACY.md)

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Vercel AI SDK
- Chrome Extension Manifest V3

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE) - Copyright (c) 2025 Noviq LLC
