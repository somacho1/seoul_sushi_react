import type {
    ReactNode
} from "react";

import {
    axiosInstance
} from "../Tool";

/**
 * ContentImage 출력 URL
 */
export const getContentImageUrl = (
    filename: string
): string => {
    const baseUrl =
        axiosInstance.defaults.baseURL ?? "";

    return (
        `${baseUrl}/content_image/image/`
        + encodeURIComponent(filename)
    );
};

/**
 * 가격 표시
 *
 * 69000 -> 69,000원
 * 69,000원 -> 69,000원
 */
export const formatPrice = (
    price: string | null
): string => {
    if (
        price === null
        || price.trim() === ""
    ) {
        return "";
    }

    const numericPrice =
        price.replace(
            /[^0-9]/g,
            ""
        );

    if (numericPrice === "") {
        return price;
    }

    return (
        Number(
            numericPrice
        ).toLocaleString()
        + "원"
    );
};

/**
 * 별점 안전 변환
 */
export const getSafeRating = (
    rating: number
): number => {
    const parsed =
        Number(rating);

    if (Number.isNaN(parsed)) {
        return 0;
    }

    return Math.min(
        5,
        Math.max(
            0,
            parsed
        )
    );
};

/**
 * 검색어 강조
 */
export const highlightText = (
    text:
        string
        | null
        | undefined,
    keyword: string
): ReactNode => {
    if (!text) {
        return "";
    }

    const trimmedKeyword =
        keyword.trim();

    if (trimmedKeyword === "") {
        return text;
    }

    const escapedKeyword =
        trimmedKeyword.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

    const parts =
        text.split(
            new RegExp(
                `(${escapedKeyword})`,
                "gi"
            )
        );

    return parts.map(
        (part, index) => {
            const matched =
                part.toLowerCase()
                === trimmedKeyword
                    .toLowerCase();

            if (!matched) {
                return part;
            }

            return (
                <mark
                    key={`${part}-${index}`}
                    className="search-highlight"
                >
                    {part}
                </mark>
            );
        }
    );
};