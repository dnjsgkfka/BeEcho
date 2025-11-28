const isDevelopment = process.env.NODE_ENV === "development";

/**
 * 일반 로그
 */
export const log = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

/**
 * 에러 로그
 */
export const logError = (...args) => {
  console.error(...args);
};

/**
 * 경고 로그
 */
export const logWarn = (...args) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

