interface TrackViewOptions {
  needId?: string;
  utm?: Record<string, string>;
}

export async function trackView(options: TrackViewOptions = {}) {
  try {
    const path = window.location.pathname;
    const utm = options.utm || extractUTMParams();
    
    const response = await fetch("/api/track/view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path,
        needId: options.needId,
        utm,
      }),
    });

    if (!response.ok) {
      console.warn("Failed to track page view:", response.status);
    }
  } catch (error) {
    console.warn("Failed to track page view:", error);
  }
}

function extractUTMParams(): Record<string, string> {
  const urlParams = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  
  const utmParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  
  utmParams.forEach(param => {
    const value = urlParams.get(param);
    if (value) {
      utm[param] = value;
    }
  });
  
  return Object.keys(utm).length > 0 ? utm : {};
}

// Hook for tracking page views in React components
export function usePageTracking(needId?: string) {
  const trackPageView = () => {
    trackView({ needId });
  };

  return { trackPageView };
}
