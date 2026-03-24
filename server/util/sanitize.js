import { filterXSS } from "xss";

/**
 * CUSTOM NEXUS GUARD
 * Handles NoSQL Injection (removing $) and XSS Sanitization
 */
export const nexusGuard = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj instanceof Object && !Array.isArray(obj)) {
      const sanitizedObj = {};
      for (const key in obj) {
        // 1. NoSQL Injection Check: Skip keys starting with $
        if (key.startsWith("$")) continue;

        // 2. Recursive sanitize for nested objects
        let value = obj[key];
        if (typeof value === "object" && value !== null) {
          value = sanitize(value);
        }

        // 3. XSS Sanitization for strings
        if (typeof value === "string") {
          value = filterXSS(value);
        }

        sanitizedObj[key] = value;
      }
      return sanitizedObj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => sanitize(item));
    }

    // XSS Sanitization for direct strings (not in object)
    if (typeof obj === "string") {
      return filterXSS(obj);
    }

    return obj;
  };

  // Apply to body, query, and params
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};
