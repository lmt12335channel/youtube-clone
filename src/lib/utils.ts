import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Dùng để kết hợp và quản lý các class của Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Chuyển đổi thời lượng video (mili giây) thành định dạng chuỗi MM:SS
export const formatDuration = (duration: number) => {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  const formattedSeconds = seconds.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }

  return `${formattedMinutes}:${formattedSeconds}`;
};

// Định dạng các số lớn thành dạng rút gọn (ví dụ: 1500 -> "1.5K")
export const formatCompactNumber = (number: number) => {
  const formatter = Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
  });
  return formatter.format(number);
};

// Chuyển đổi chuỗi snake_case thành Title Case
export const snakeCaseToTitle = (s: string) =>
  s.replace(/^_*(.)|_+(.)/g, (_, c, d) =>
    c ? c.toUpperCase() : " " + d.toUpperCase()
  );