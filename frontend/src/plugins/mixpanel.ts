import mixpanel from 'mixpanel-browser'
import type { App } from 'vue'
import type { Router } from 'vue-router'

const MIXPANEL_TOKEN = '9de4b0427a56365f6ede1f0db19f2733'

// Initialize Mixpanel
mixpanel.init(MIXPANEL_TOKEN, {
  debug: import.meta.env.DEV,
  track_pageview: false, // We'll handle this manually with the router
  persistence: 'localStorage'
})

// Export for direct usage in components
export { mixpanel }

// Vue plugin
export const mixpanelPlugin = {
  install(app: App, options?: { router?: Router }) {
    // Make mixpanel available globally
    app.config.globalProperties.$mixpanel = mixpanel

    // Auto-track page views if router is provided
    if (options?.router) {
      options.router.afterEach((to) => {
        mixpanel.track('Page View', {
          page: to.path,
          name: to.name as string,
          title: document.title
        })
      })
    }
  }
}

// Helper functions for common tracking patterns
export const analytics = {
  // Identify a user (call after login)
  identify(userId: string, traits?: Record<string, any>) {
    mixpanel.identify(userId)
    if (traits) {
      mixpanel.people.set(traits)
    }
  },

  // Reset identity (call on logout)
  reset() {
    mixpanel.reset()
  },

  // Track a custom event
  track(event: string, properties?: Record<string, any>) {
    mixpanel.track(event, properties)
  },

  // Set user properties
  setUserProperties(properties: Record<string, any>) {
    mixpanel.people.set(properties)
  },

  // Increment a numeric property
  increment(property: string, value: number = 1) {
    mixpanel.people.increment(property, value)
  }
}

// TypeScript declaration for global properties
declare module 'vue' {
  interface ComponentCustomProperties {
    $mixpanel: typeof mixpanel
  }
}
