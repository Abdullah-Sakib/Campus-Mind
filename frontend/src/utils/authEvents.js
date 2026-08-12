// A tiny pub-sub so code outside the React tree (the axios interceptor)
// can trigger a logout that's implemented inside AuthContext, without
// creating a circular import or needing React context there.
import { Alert } from 'react-native';

let unauthorizedHandler = null;
let isHandling = false;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

// Called by the axios response interceptor when a request comes back 401.
// Guarded against being fired multiple times in a row (e.g. several
// in-flight requests all failing at once after a token expires).
export const triggerUnauthorized = async () => {
  if (isHandling || !unauthorizedHandler) return;
  isHandling = true;
  try {
    await unauthorizedHandler();
    Alert.alert('Session expired', 'Please log in again to continue.');
  } finally {
    isHandling = false;
  }
};
