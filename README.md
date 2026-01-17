# GitTrend AI

<div align="center">

**Discover GitHub trending repositories using AI-powered search and explore your own starred projects with ease.**

</div>

## 📖 Overview

GitTrend AI is a modern web application that leverages Google's Gemini AI to help developers discover and explore GitHub repositories. The app provides two powerful features:

1. **AI-Powered Trending Discovery** - Find the latest trending GitHub repositories with real-time data using Gemini's Google Search grounding
2. **Smart Stars Search** - Fetch and search through your GitHub starred repositories using natural language queries powered by semantic search

## ✨ Features

### 🔥 Trending Repositories
- Browse real-time trending GitHub repositories
- Filter by time period (Today, This Week, This Month)
- Filter by programming language (JavaScript, TypeScript, Python, Rust, Go, Java, C++, and more)
- View grounding sources from Gemini Search
- AI-powered data extraction from github.com/trending

### ⭐ Stars Search
- Fetch all your GitHub starred repositories (with progress tracking)
- **AI Semantic Search**: Ask natural language queries like "Find React chart libraries" or "Show me Python data science projects"
- **Quick Filter**: Fast client-side filtering by name, description, or language
- Pagination support for large star collections
- View repository details including stars, language, and description

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **AI Model**: Google Gemini (gemini-3-flash-preview)
- **UI Components**: Lucide React icons
- **APIs**: 
  - GitHub REST API (for user stars)
  - Gemini AI API (for trending data and semantic search)

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- A Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/youlseol/git-trend-rag.git
   cd git-trend-rag
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## 📚 Usage

### Exploring Trending Repositories

1. Navigate to the **Trending** tab
2. Select your preferred time period (Today, This Week, This Month)
3. Choose a programming language or select "All"
4. Browse the AI-curated list of trending repositories
5. Click on any repository card to visit it on GitHub

### Searching Your Stars

1. Navigate to the **Stars** tab
2. Enter your GitHub username
3. Wait for the app to fetch all your starred repositories
4. Use one of two search methods:
   - **AI Search**: Enter a natural language query (e.g., "React testing libraries") and click Search
   - **Quick Filter**: Type keywords to filter by name, description, or language
5. Browse through the results with pagination

## 🏗️ Project Structure

```
git-trend-rag/
├── components/          # React components
│   ├── Layout.tsx      # Main layout with tab navigation
│   ├── TrendingView.tsx # Trending repositories view
│   ├── StarsView.tsx   # User stars search view
│   └── RepoCard.tsx    # Repository card component
├── services/           # API services
│   ├── geminiService.ts # Gemini AI integration
│   └── githubService.ts # GitHub API integration
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 🙏 Acknowledgments

- Powered by [Google Gemini AI](https://ai.google.dev/)
- GitHub API for repository data
- Built with [Vite](https://vitejs.dev/) and [React](https://react.dev/)
