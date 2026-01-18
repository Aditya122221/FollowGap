# FollowGap - Instagram Follower Checker

A privacy-focused web application that helps you discover which Instagram accounts you follow that don't follow you back. All processing happens locally in your browser - your data never leaves your device.

## What is FollowGap?

FollowGap is a web-based tool designed to analyze your Instagram follower data. Here's what it does:

1. **Analyzes Instagram Data**: It processes the JSON files you download from Instagram containing your following and followers lists
2. **Identifies Non-Followers**: Compares your following list with your followers list to find accounts that don't follow you back
3. **Privacy-First Approach**: All data processing happens entirely in your browser - no uploads to any server, ensuring complete privacy and security
4. **User-Friendly Interface**: Provides an intuitive, step-by-step interface with multiple theme options for a comfortable experience
5. **Multiple File Support**: Handles Instagram data that may be split across multiple files (e.g., followers_1.json, followers_2.json)
6. **Direct Profile Links**: Click on any username to open their Instagram profile directly
7. **Visual Tracking**: Mark profiles you've already checked with visual indicators

## How to Run Locally

### Prerequisites

- Node.js (version 16 or higher recommended)
- npm (comes with Node.js) or yarn

### Installation Steps

1. **Navigate to the project directory**
   ```bash
   cd checkfollowers
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - The terminal will display a local URL (usually `http://localhost:5173`)
   - Open this URL in your web browser

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` folder. You can preview the production build with:

```bash
npm run preview
```

## How This Website Works (Step-by-Step Process)

### Step 1: Download Your Instagram Data

1. Go to Instagram settings on your mobile app or web browser
2. Navigate to **Settings > Your activity > Download your information**
3. Request a download of your data (select JSON format)
4. Instagram will email you a download link
5. Extract the downloaded ZIP file
6. Locate the following files:
   - `following.json` (contains accounts you follow)
   - `followers.json` or `followers_1.json`, `followers_2.json`, etc. (contains your followers)

### Step 2: Upload Following File

1. On the FollowGap website, click the **"Upload following.json"** button
2. Select your `following.json` file from the downloaded Instagram data
3. The file name will appear with a checkmark once selected

### Step 3: Upload Followers File(s)

1. Click the **"Upload followers.json"** button
2. Select your followers file(s):
   - If you have a single `followers.json`, select that
   - If you have multiple files (followers_1.json, followers_2.json, etc.), select all of them at once (hold Ctrl/Cmd while selecting)
3. The number of selected files will be displayed

### Step 4: Analyze Data

1. Click the **"Find Accounts Not Following Back"** button
2. The application will:
   - Read and parse the following.json file
   - Extract all usernames from your following list
   - Read and parse the followers.json file(s)
   - Extract all usernames from your followers list
   - Compare the two lists to find accounts you follow that don't follow you back

### Step 5: View Results

1. Once analysis is complete, you'll see:
   - **Statistics**: Total accounts you're following, total followers, and count of accounts not following back
   - **Account List**: A grid of all accounts that don't follow you back
2. Click on any username to open their Instagram profile in a new tab
3. Clicked profiles can be visually marked (click again to unmark)
4. Use the **"Analyze Different Files"** button to start a new analysis

### Technical Process Behind the Scenes

1. **File Reading**: Uses the browser's FileReader API to read JSON files locally
2. **JSON Parsing**: Parses the Instagram JSON structure to extract usernames (handles different Instagram data formats)
3. **Data Extraction**: Extracts usernames from either:
   - `relationships_following` array (for following.json)
   - `relationships_followers` array or direct array (for followers.json)
4. **Comparison Algorithm**: Uses Set data structures for efficient O(1) lookups to compare lists
5. **Sorting**: Alphabetically sorts the results for easy browsing
6. **State Management**: React hooks manage the application state and UI updates

## Tech Stack Used

### Frontend Framework
- **React 19.2.0**: Modern JavaScript library for building user interfaces with component-based architecture
- **React DOM 19.2.0**: React renderer for web browsers

### Build Tools
- **Vite 7.2.4**: Next-generation frontend build tool providing fast development server and optimized production builds
- **@vitejs/plugin-react 5.1.1**: Official Vite plugin for React with Fast Refresh support

### Code Quality
- **ESLint 9.39.1**: JavaScript linter for identifying and fixing code issues
- **eslint-plugin-react-hooks 7.0.1**: React Hooks linting rules
- **eslint-plugin-react-refresh 0.4.24**: React Fast Refresh linting rules

### Development Dependencies
- **@types/react 19.2.5**: TypeScript type definitions for React
- **@types/react-dom 19.2.3**: TypeScript type definitions for React DOM
- **@eslint/js 9.39.1**: ESLint JavaScript plugin
- **globals 16.5.0**: Global variable definitions for ESLint

### Key Technologies
- **JavaScript (ES6+)**: Modern JavaScript features including async/await, Promises, and arrow functions
- **HTML5 FileReader API**: For reading files locally in the browser
- **CSS3**: For styling with theme support and responsive design
- **Local Storage API**: For persisting theme preferences across sessions

## Features

- ✅ Privacy-focused (all processing happens client-side)
- ✅ Support for multiple follower files
- ✅ Multiple theme options (Default, Dark Blue, Teal, Charcoal)
- ✅ Visual progress indicators during analysis
- ✅ Clickable links to Instagram profiles
- ✅ Visual tracking of checked profiles
- ✅ Responsive design
- ✅ Error handling with helpful messages

## Privacy & Security

Your Instagram data never leaves your browser. The application:
- Processes all files locally using JavaScript
- Does not use any external APIs or servers
- Does not store any data
- Does not transmit any information over the network

## Troubleshooting

If you encounter issues:

1. **No accounts found**: Ensure your JSON files are the correct format from Instagram's data download
2. **Multiple files**: If you have multiple followers files, select all of them at once
3. **Browser console**: Open browser developer tools (F12) to see detailed error messages
4. **File format**: Make sure you're uploading the JSON files directly from Instagram's download, not modified versions

## License

This project is private and not licensed for public use.
