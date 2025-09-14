# معالج النصوص العربية - Arabic Text Processor

A comprehensive web application for processing and analyzing Arabic text, specifically designed for handling mixed Arabic-English content with timestamps and structured data.

## 🌟 Features

### Core Processing Capabilities
- **Timestamp Extraction**: Automatically extracts timestamps in (HH:MM) format
- **Arabic Text Separation**: Intelligently separates Arabic text segments from mixed content
- **Code Extraction**: Identifies and extracts various code formats:
  - Bank codes (8+ digits followed by alphanumeric)
  - Account codes (CA:###)
  - General English codes (XX:###)
- **Text Cleaning**: Removes extra spaces and normalizes content
- **Statistics Generation**: Provides detailed analysis of processed text

### User Interface Features
- **Bilingual Interface**: Full Arabic and English support
- **RTL Support**: Proper right-to-left text rendering
- **Real-time Processing**: Auto-process with debounced input
- **Export Options**: CSV and JSON export functionality
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Ready**: Prepared for dark theme implementation

## 🚀 Live Demo

The application is accessible at: [Your GitHub Pages URL]

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Modern CSS with CSS Grid/Flexbox
- **Processing**: Advanced Regular Expressions for Arabic text
- **Export**: Client-side CSV/JSON generation
- **Deployment**: GitHub Pages + Netlify ready

## 📁 Project Structure

```
arabic-text-processor/
├── index.html          # Main HTML file
├── style.css           # Comprehensive stylesheet
├── app.js             # Main application logic
├── README.md          # This file
└── .gitignore        # Git ignore file
```

## 🔧 Installation & Deployment

### GitHub Pages Deployment

1. **Create a new repository** on GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Arabic Text Processor"
   git branch -M main
   git remote add origin https://github.com/yourusername/arabic-text-processor.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to Pages section
   - Select source: Deploy from branch
   - Choose branch: main
   - Save settings

3. **Access your app** at: `https://yourusername.github.io/arabic-text-processor/`

### Netlify Deployment

1. **Connect to Netlify**:
   - Log in to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Deploy settings**:
   - Build command: (leave empty - static site)
   - Publish directory: (leave empty - root directory)
   - Click "Deploy site"

3. **Custom domain** (optional):
   - Go to Site settings > Domain management
   - Add your custom domain

## 📖 Usage Guide

### Basic Usage

1. **Input Text**: Paste your Arabic text with timestamps into the input area
2. **Select Options**: Choose which processing features to enable
3. **Process**: Click the process button or enable auto-processing
4. **View Results**: Examine the processed data in table format
5. **Export**: Download results as CSV or JSON

### Supported Text Formats

The application handles various text formats:

```
(06:51)شركةأسواقومخابزال/شركةأسواقومخابزالمختار
(11:38)مؤسسةدارسلتيللتجا/مؤسسةدارسلتيللتجارة/CA
(11:02)20250901SABSFRBSFR6BCFT12302807881/SAMAA
Unidentified Deposits Movement Aug'2025
```

### Processing Options

- **Extract Timestamps** ✅: Separates time stamps from content
- **Separate Arabic Text** ✅: Identifies and separates Arabic text segments
- **Extract English Codes**: Finds various code patterns
- **Clean Text**: Normalizes and cleans the processed text
- **Show Statistics** ✅: Displays comprehensive processing statistics

## 🎯 Use Cases

### Financial Data Processing
- Bank transaction records
- Account statements
- Payment processing logs

### Document Analysis
- Mixed Arabic-English documents
- Timestamped records
- Structured data extraction

### Text Mining
- Content analysis
- Pattern recognition
- Data extraction and transformation

## 🔧 Technical Details

### Regular Expression Patterns

```javascript
const patterns = {
    timestamp: /^\((\d{2}:\d{2})\)(.*)$/,
    arabic: /[\u0600-\u06FF]+/g,
    englishCodes: /[A-Z]{2,}:\d+/g,
    accountCodes: /CA:\d+/g,
    bankCodes: /\d{8}[A-Z0-9]+/g,
    separators: /[\/]/g
};
```

### Unicode Ranges Used
- Arabic: U+0600–U+06FF (basic Arabic block)
- Extended support for Arabic Supplement and Presentation Forms

### Browser Compatibility
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -m 'Add feature-name'`
5. Push: `git push origin feature-name`
6. Submit a Pull Request

## 🐛 Bug Reports & Feature Requests

Please use GitHub Issues to report bugs or request features. Include:
- Clear description of the issue/feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Browser and OS information

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Arabic language processing community
- Unicode Consortium for Arabic character specifications
- Open source contributors

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check existing documentation
- Review the code comments for implementation details

---

Made with ❤️ for the Arabic computing community