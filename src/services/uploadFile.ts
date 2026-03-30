export const generateResourcePath = (str: string): string => {
  const urlPattern = /^(https?:\/\/|www\.)/i;
  if (urlPattern.test(str)) {
    return str;
  }
  return `${process.env.REACT_APP_API_URL}/resource/${str}`;
};

/**
 * Tính tổng kích thước (bytes) của danh sách files
 * @param list Danh sách files
 * @returns Tổng kích thước tính bằng bytes
 */
export const totalBytes = (list: File[]): number => {
  return list.reduce((s, f) => s + (f?.size ?? 0), 0);
};

/**
 * Tạo preview URL từ server URL hoặc path
 * Nếu là absolute URL (http/https) thì trả về nguyên bản
 * Nếu không thì dùng generateResourcePath để tạo full URL
 * @param url Server URL hoặc path
 * @returns Preview URL hoặc undefined nếu không có url
 */
export const makePreviewUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  const isAbsolute = /^https?:\/\//i.test(url);
  return isAbsolute ? url : generateResourcePath(url);
};

export const getImageSrc = (
  url: string,
  source: "ophim" | "phimapi",
): string => {
  if (!url) return "";
  if (source === "phimapi") {
    return url.startsWith("http") ? url : `https://phimimg.com/${url}`;
  }
  if (url.startsWith("http")) return url;
  return `https://img.ophim.live/uploads/movies/${url}`;
};
