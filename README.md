# LinkedIn Easy Apply Bot

**Status: Beta** 🚧

An automated TypeScript bot that streamlines the LinkedIn Easy Apply process using Puppeteer for browser automation. This tool automatically fills out job application forms and manages the application workflow.

## Project Concept

This bot automates the repetitive task of applying to LinkedIn jobs through the Easy Apply feature. It navigates LinkedIn's job search interface, filters relevant positions, and automatically completes application forms using predefined user data and intelligent form-filling algorithms.

**Key Technical Features:**
- Browser automation with Puppeteer
- Multi-page form handling
- Intelligent field detection and filling
- Database integration for application tracking
- AI-powered form completion (optional)
- Sequential job processing with error recovery

## Prerequisites

- Node.js 16+
- PostgreSQL database
- LinkedIn account
- OpenAI API key (optional, for AI features)

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/linkedin-easy-apply-bot.git
cd linkedin-easy-apply-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Database setup**
```bash
# Create PostgreSQL database
createdb linkedin_bot

# Run migrations
npx prisma migrate dev
npx prisma generate
```

4. **Environment configuration**
```bash
# Copy environment template
cp .env.example .env
# Edit .env with your database credentials
```

5. **Bot configuration**
```bash
# Copy configuration template
cp config.example.ts config.ts
# Edit config.ts with your personal information
```

## Configuration

### Environment Variables (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/linkedin_bot"
LINKEDIN_EMAIL=your-email@example.com
LINKEDIN_PASSWORD=your-password
OPENAI_API_KEY=your-openai-key (optional)
LIMIT=10
HEADLESS_MODE=false
```

### Bot Configuration (config.ts)
```typescript
export const config = {
  LINKEDIN_EMAIL: "your-email@example.com",
  LINKEDIN_PASSWORD: "your-password",
  PHONE: "+1234567890",
  HOME_CITY: "Your City, Country",
  CV_PATH: "/path/to/your/resume.pdf",
  COVER_LETTER_PATH: "/path/to/your/cover-letter.pdf",
  
  // Job search parameters
  KEYWORDS: "javascript developer",
  LOCATION: "Spain",
  WORKPLACE: {
    REMOTE: true,
    ON_SITE: true,
    HYBRID: true
  },
  
  // Form filling configurations
  YEARS_OF_EXPERIENCE: {
    "javascript": "5",
    "react": "3"
  },
  
  BOOLEANS: {
    "visa.*sponsor": false,
    "authorized.*work": true
  },
  
  // Additional configurations...
};
```

## Usage

### Test Mode (No submissions)
```bash
npm run start
```

### Production Mode (Submit applications)
```bash
npm run start SUBMIT
```

### Interactive Controls
- **Space**: Pause/Resume execution
- **Ctrl+C**: Stop bot gracefully

## Technical Architecture

### Core Components

- **`scripts/apply.ts`**: Main execution script and orchestration
- **`apply/`**: Core application logic and form submission
- **`apply-form/`**: Form filling modules (text, boolean, multiple choice)
- **`fetch/`**: Job discovery and filtering logic
- **`login/`**: LinkedIn authentication handling
- **`selectors/`**: CSS selectors for LinkedIn elements
- **`utils/`**: Database, keyboard handling, and utility functions

### Form Filling Strategy

The bot uses a multi-layered approach for form completion:

1. **Configuration matching**: Regex-based field identification
2. **AI completion**: OpenAI integration for complex fields
3. **Default values**: Intelligent fallbacks for unmatched fields
4. **Field verification**: Pre-filling validation to avoid duplicates

### Error Handling

- Sequential job processing to avoid rate limiting
- Automatic retry logic for failed applications
- Database logging for application tracking
- Graceful error recovery and resource cleanup

## Beta Status & Limitations

⚠️ **This project is in beta stage**

**Known limitations:**
- LinkedIn UI changes may break selectors
- Rate limiting may occur with high-volume usage
- Some form types may not be fully supported
- Browser detection mechanisms may interfere

**Recommended usage:**
- Test thoroughly before production use
- Monitor execution and adjust selectors as needed
- Use reasonable application limits
- Respect LinkedIn's terms of service

## Legal & Ethical Considerations

**Important:** This tool is for educational and personal use only.

- Comply with LinkedIn's Terms of Service
- Use responsibly to avoid account limitations
- Apply only to relevant positions
- Respect company application processes
- Do not use for spam or mass applications

## Contributing

Contributions are welcome! This project benefits from community collaboration.

**How to contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

**Areas needing contribution:**
- LinkedIn selector updates
- Form filling improvements
- Error handling enhancements
- Documentation improvements
- Testing and validation

## Issues & Support

Found a bug or need help? Please open an issue:

- **Bug reports**: Include error logs and configuration details
- **Feature requests**: Describe the use case and expected behavior
- **Questions**: Check existing issues before posting

[Open an Issue](https://github.com/your-username/linkedin-easy-apply-bot/issues)

## Creator & Supervision

**Created and supervised by:** [Your Name]

This project was developed to automate repetitive job application tasks while maintaining quality and relevance in the application process.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

The use of this bot is at your own risk. The developers are not responsible for:
- LinkedIn account suspensions or limitations
- Violations of terms of service
- Consequences of misuse

Use this tool ethically and responsibly.
