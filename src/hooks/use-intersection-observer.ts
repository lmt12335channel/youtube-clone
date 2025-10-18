"use client";

import { useEffect, useRef, useState } from "react";

// Định nghĩa props cho hook, cho phép tùy chỉnh các tùy chọn của IntersectionObserver
interface UseIntersectionObserverProps extends IntersectionObserverInit {}

export const useIntersectionObserver = (
    options?: UseIntersectionObserverProps
) => {
    // State để theo dõi xem phần tử có đang trong tầm nhìn hay không
    const [isIntersecting, setIsIntersecting] = useState(false);
    // Ref để gắn vào phần tử cần theo dõi
    const targetRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Cập nhật state dựa trên trạng thái của phần tử
                setIsIntersecting(entry.isIntersecting);
            },
            { ...options }
        );

        const currentTarget = targetRef.current;
        if (currentTarget) {
            // Bắt đầu theo dõi phần tử
            observer.observe(currentTarget);
        }

        // Cleanup: Ngừng theo dõi khi component bị unmount
        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [options]);

    return { targetRef, isIntersecting };
};