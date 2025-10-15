# Stagewise Integration Guide

## 🎯 What is Stagewise?

Stagewise is an AI-powered development tool that provides a browser-based toolbar for editing your web application in real-time. It allows you to:

- **Click** on any element in your running app
- **Describe** what changes you want to make
- **Watch** as AI agents automatically update your code

Stagewise works seamlessly with popular AI coding assistants like:
- ✅ Cursor
- ✅ GitHub Copilot  
- ✅ Windsurf
- ✅ Cline
- ✅ Roo Code
- ✅ And more!

## 📦 Installation

The Stagewise toolbar has already been integrated into this project. The integration includes:

1. **`stagewise` package** - Installed as a dev dependency
2. **`StagewiseProvider` component** - Located in `src/components/providers/stagewise-provider.tsx`
3. **Root layout integration** - Automatically loads in development mode only

## 🚀 How to Use Stagewise

### Step 1: Start Your Development Server

First, start your Next.js development server as usual:

```bash
npm run dev
```

Your application will be running at `http://localhost:3000` (or your configured port).

### Step 2: Start Stagewise

In a **separate terminal window**, run the Stagewise CLI:

```bash
npm run stagewise
```

Or directly with npx:

```bash
npx stagewise@latest
```

The Stagewise CLI will:
1. Ask for your development server's port (default: 3000)
2. Set up a proxy server that injects the Stagewise toolbar
3. Provide you with a new URL to access your app (usually `http://localhost:8080`)

### Step 3: Access Your App Through Stagewise

Open your browser and navigate to the URL provided by Stagewise (e.g., `http://localhost:8080`).

You should now see the Stagewise toolbar in your browser!

### Step 4: Make AI-Powered Changes

1. **Click** on any element in your app to select it
2. **Type** a description of what you want to change (e.g., "Change this button color to blue")
3. **Submit** your prompt
4. **Watch** as Stagewise sends the context to your AI agent and applies the changes

## 🎨 Usage Examples

### Example 1: Change Button Style
1. Click on a button
2. Prompt: "Make this button larger and change the color to purple"
3. Stagewise will update the button's styles in your codebase

### Example 2: Add New Feature
1. Click on a component
2. Prompt: "Add a search icon to the left of this input field"
3. Stagewise will add the icon component and update the layout

### Example 3: Fix Layout Issues
1. Click on a container
2. Prompt: "Center this content vertically and add more padding"
3. Stagewise will adjust the CSS/Tailwind classes

## ⚙️ How It Works

### In Development Mode
When running `npm run dev`, the `StagewiseProvider` component:
- Detects development mode (`NODE_ENV === 'development'`)
- Creates a container for the Stagewise toolbar
- Attempts to load toolbar assets from `/_stagewise/`
- Shows helpful console messages if Stagewise CLI isn't running

### The Stagewise CLI
When you run `npm run stagewise`:
- Creates a proxy server that sits between your browser and dev server
- Injects the Stagewise toolbar script into your HTML
- Establishes a connection with your AI coding assistant
- Streams changes back to your code editor

## 🔧 Configuration

### Default Configuration
The integration uses sensible defaults:
- **Auto-detection**: Automatically detects React components
- **Development-only**: Never loads in production builds
- **Zero config**: Works out of the box

### Advanced Configuration
You can customize Stagewise behavior by modifying the `StagewiseProvider` component in `src/components/providers/stagewise-provider.tsx`.

## 🐛 Troubleshooting

### Toolbar Not Appearing?

**Problem**: The Stagewise toolbar doesn't show up in the browser.

**Solution**:
1. Make sure you're running `npm run stagewise` in a separate terminal
2. Access your app through the Stagewise proxy URL (e.g., `http://localhost:8080`)
3. Check that you're in development mode (`npm run dev`, not `npm run start`)

### Console Warnings?

**Problem**: Seeing warnings about Stagewise in the browser console.

**Solution**:
This is expected! The warnings provide helpful guidance:
```
⚠️ Stagewise toolbar not detected.
To enable Stagewise AI-powered editing:
1. Open a new terminal window
2. Run: npm run stagewise
3. Follow the CLI prompts
4. Refresh this page
```

Just follow the instructions to enable Stagewise.

### Changes Not Applying?

**Problem**: Prompts are being sent but code isn't changing.

**Solution**:
1. Make sure your AI coding assistant (Cursor, Copilot, etc.) is running and connected
2. Check the Stagewise CLI terminal for any error messages
3. Verify that your codebase is accessible to the AI agent

## 🔒 Production Builds

**Important**: The Stagewise toolbar is **automatically disabled** in production builds.

The integration includes a check for `process.env.NODE_ENV !== 'development'`, ensuring that:
- No toolbar code is loaded in production
- No performance impact on your production app
- No security concerns from dev tools in production

## 📚 Additional Resources

- **Stagewise Documentation**: [https://stagewise.io](https://stagewise.io)
- **GitHub Repository**: [https://github.com/stagewise-io/stagewise](https://github.com/stagewise-io/stagewise)
- **Discord Community**: [Join Discord](https://discord.gg/gkdGsDYaKA)

## 🎓 Best Practices

1. **Be Specific**: Provide clear, detailed prompts for better results
2. **Select Precisely**: Click on the exact element you want to modify
3. **Iterate**: Make incremental changes rather than large sweeping modifications
4. **Review Changes**: Always review the AI-generated changes before committing
5. **Use Version Control**: Keep your code versioned so you can easily revert changes if needed

## 📝 License

Stagewise is licensed under AGPLv3. See the [Stagewise repository](https://github.com/stagewise-io/stagewise) for more details.

---

**Happy coding with AI! 🚀**

