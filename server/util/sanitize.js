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

    if (typeof obj === "string") {
      return filterXSS(obj);
    }

    return obj;
  };

  // BUN-SAFE MUTATION: Update values in-place instead of reassigning the whole object
  const processObject = (reqObj) => {
    if (!reqObj) return;
    const sanitized = sanitize(reqObj);

    // Clear keys starting with $ and update others
    Object.keys(reqObj).forEach((key) => {
      if (key.startsWith("$")) {
        delete reqObj[key];
      } else {
        reqObj[key] = sanitized[key];
      }
    });
  };

  processObject(req.body);
  processObject(req.query);
  processObject(req.params);

  next();
};
