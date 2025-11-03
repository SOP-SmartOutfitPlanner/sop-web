'use client';

import { useEffect } from 'react';

/**
 * Stagewise Provider Component
 * 
 * This component integrates the Stagewise AI-powered editing toolbar into the application.
 * It only loads in development mode to prevent it from affecting production builds.
 * 
 * Features:
 * - AI-powered element selection and editing
 * - Real-time code changes through browser toolbar
 * - Works with Cursor, GitHub Copilot, and other AI agents
 * 
 * @see https://stagewise.io
 */
export function StagewiseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only load Stagewise in development mode
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Check if Stagewise is already loaded
    if (document.getElementById('stagewise-toolbar-root')) {
      return;
    }

    // Create root container for Stagewise toolbar
    const toolbarRoot = document.createElement('div');
    toolbarRoot.id = 'stagewise-toolbar-root';
    document.body.appendChild(toolbarRoot);

    // Stagewise toolbar will be loaded by the CLI when needed
    console.log('🚀 Stagewise provider initialized');
    console.log('💡 To use Stagewise:');
    console.log('   1. Run "npm run stagewise" in another terminal');
    console.log('   2. Select elements in the browser');
    console.log('   3. Describe changes you want to make');
    console.log('   4. Refresh this page');

    // Cleanup on unmount
    return () => {
      toolbarRoot.remove();
    };
  }, []);

  return <>{children}</>;
}

