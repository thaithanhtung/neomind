import ReactGA from 'react-ga4';

// Khởi tạo Google Analytics
export const initGA = (measurementId: string) => {
  if (measurementId) {
    ReactGA.initialize(measurementId);
  }
};

// Track page view
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

// Track events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

// Các event types cụ thể cho ứng dụng
export const AnalyticsEvents = {
  // User actions
  USER_LOGIN: 'user_login',
  USER_SIGNUP: 'user_signup',
  USER_LOGOUT: 'user_logout',

  // Mind map actions
  MINDMAP_CREATE: 'mindmap_create',
  MINDMAP_DELETE: 'mindmap_delete',
  MINDMAP_SELECT: 'mindmap_select',
  MINDMAP_VIEW: 'mindmap_view',

  // Node actions
  NODE_CREATE: 'node_create',
  NODE_DELETE: 'node_delete',
  NODE_CLICK: 'node_click',
  NODE_RESIZE: 'node_resize',
  NODE_CONNECT: 'node_connect',

  // Content actions
  TEXT_SELECT: 'text_select',
  TEXT_HIGHLIGHT: 'text_highlight',
  TOPIC_SUBMIT: 'topic_submit',

  // UI actions
  INPUT_TOGGLE: 'input_toggle',
  MINDMAP_LIST_VIEW: 'mindmap_list_view',
};

// Helper functions để track các events cụ thể
export const analytics = {
  // User events
  trackLogin: () => {
    trackEvent('User', AnalyticsEvents.USER_LOGIN);
  },
  trackSignup: () => {
    trackEvent('User', AnalyticsEvents.USER_SIGNUP);
  },
  trackLogout: () => {
    trackEvent('User', AnalyticsEvents.USER_LOGOUT);
  },

  // Mind map events
  trackMindMapCreate: (mindMapId?: string) => {
    trackEvent('MindMap', AnalyticsEvents.MINDMAP_CREATE, mindMapId);
  },
  trackMindMapDelete: (mindMapId?: string) => {
    trackEvent('MindMap', AnalyticsEvents.MINDMAP_DELETE, mindMapId);
  },
  trackMindMapSelect: (mindMapId?: string) => {
    trackEvent('MindMap', AnalyticsEvents.MINDMAP_SELECT, mindMapId);
  },
  trackMindMapView: (mindMapId?: string) => {
    trackEvent('MindMap', AnalyticsEvents.MINDMAP_VIEW, mindMapId);
  },

  // Node events
  trackNodeCreate: (nodeId?: string, topic?: string) => {
    trackEvent(
      'Node',
      AnalyticsEvents.NODE_CREATE,
      `${nodeId || 'unknown'}_${topic || 'no-topic'}`
    );
  },
  trackNodeDelete: (nodeId?: string) => {
    trackEvent('Node', AnalyticsEvents.NODE_DELETE, nodeId);
  },
  trackNodeClick: (nodeId?: string) => {
    trackEvent('Node', AnalyticsEvents.NODE_CLICK, nodeId);
  },
  trackNodeResize: (nodeId?: string) => {
    trackEvent('Node', AnalyticsEvents.NODE_RESIZE, nodeId);
  },
  trackNodeConnect: (sourceId?: string, targetId?: string) => {
    trackEvent(
      'Node',
      AnalyticsEvents.NODE_CONNECT,
      `${sourceId || 'unknown'}_to_${targetId || 'unknown'}`
    );
  },

  // Content events
  trackTextSelect: (textLength?: number) => {
    trackEvent('Content', AnalyticsEvents.TEXT_SELECT, undefined, textLength);
  },
  trackTextHighlight: (textLength?: number) => {
    trackEvent(
      'Content',
      AnalyticsEvents.TEXT_HIGHLIGHT,
      undefined,
      textLength
    );
  },
  trackTopicSubmit: (topic?: string) => {
    trackEvent('Content', AnalyticsEvents.TOPIC_SUBMIT, topic);
  },

  // UI events
  trackInputToggle: (isOpen: boolean) => {
    trackEvent('UI', AnalyticsEvents.INPUT_TOGGLE, isOpen ? 'open' : 'close');
  },
  trackMindMapListView: () => {
    trackEvent('UI', AnalyticsEvents.MINDMAP_LIST_VIEW);
  },
};
