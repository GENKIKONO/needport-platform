export async function reportError(error: Error, path?: string) {
  try {
    const response = await fetch("/api/log/client-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack,
        path: path || window.location.pathname,
      }),
    });

    if (!response.ok) {
      console.warn("Failed to report error to server:", response.status);
    }
  } catch (reportError) {
    console.warn("Failed to report error:", reportError);
  }
}

export function setupErrorReporting() {
  // Handle unhandled errors
  window.addEventListener("error", (event) => {
    reportError(event.error || new Error(event.message), event.filename);
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    reportError(error);
  });

  // Handle console errors (optional, for debugging)
  if (process.env.NODE_ENV === "development") {
    const originalError = console.error;
    console.error = (...args) => {
      originalError.apply(console, args);
      
      // Try to extract error from console.error arguments
      const errorArg = args.find(arg => arg instanceof Error);
      if (errorArg) {
        reportError(errorArg);
      }
    };
  }
}
