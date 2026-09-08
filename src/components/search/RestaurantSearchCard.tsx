import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import type {
    Content,
    ContentImage
} from "./searchTypes";

import {
    formatPrice,
    getContentImageUrl,
    highlightText
} from "./searchUtils";

interface RestaurantSearchCardProps {
    content: Content;
    contentImage:
        ContentImage | null;
    imageLoaded: boolean;
    keyword: string;
}

function RestaurantSearchCard({
    content,
    contentImage,
    imageLoaded,
    keyword
}: RestaurantSearchCardProps) {
    const [
        imageError,
        setImageError
    ] = useState(false);

    /**
     * 다른 이미지로 변경되면
     * 이전 오류 상태 초기화
     */
    useEffect(() => {
        setImageError(false);
    }, [contentImage?.filename]);

    const showImage =
        imageLoaded
        && contentImage !== null
        && !imageError;

    return (
        <Link
            to={`/post/list/${content.contentno}`}
            className="search-link"
        >
            <article className="restaurant-search-card">
                {/* 대표 이미지 */}
                <div className="search-image-area">
                    {!imageLoaded ? (
                        <div className="search-image-placeholder">
                            <div className="search-spinner" />

                            <small>
                                이미지 불러오는 중
                            </small>
                        </div>
                    ) : showImage ? (
                        <img
                            src={getContentImageUrl(
                                contentImage.filename
                            )}
                            alt={`${content.name} 대표 이미지`}
                            className="search-image"
                            loading="lazy"
                            onError={() =>
                                setImageError(true)
                            }
                        />
                    ) : (
                        <div className="search-image-placeholder">
                            <span>
                                🍣
                            </span>

                            <small>
                                대표 이미지 없음
                            </small>
                        </div>
                    )}

                    {content.badge
                        && content.badge.trim()
                        !== "" && (
                        <span className="search-image-badge">
                            {content.badge}
                        </span>
                    )}

                    <div className="search-image-overlay" />
                </div>

                {/* 맛집 정보 */}
                <div className="search-info">
                    <div className="card-heading-row">
                        <div>
                            <span className="search-area">
                                {highlightText(
                                    content.district,
                                    keyword
                                )}
                            </span>

                            <h3 className="search-name">
                                {highlightText(
                                    content.name,
                                    keyword
                                )}
                            </h3>
                        </div>

                        <span className="card-arrow">
                            →
                        </span>
                    </div>

                    <div className="search-menu">
                        <span>
                            대표 메뉴
                        </span>

                        <strong>
                            {highlightText(
                                content.best_menu,
                                keyword
                            )}
                        </strong>
                    </div>

                    {content.new_menu
                        && content.new_menu.trim()
                        !== "" && (
                        <div className="search-new-menu">
                            <span>
                                NEW
                            </span>

                            <strong>
                                {highlightText(
                                    content.new_menu,
                                    keyword
                                )}
                            </strong>
                        </div>
                    )}

                    {content.price
                        && content.price.trim()
                        !== "" && (
                        <div className="search-price">
                            {formatPrice(
                                content.price
                            )}
                        </div>
                    )}

                    {content.description
                        && content.description.trim()
                        !== "" && (
                        <p className="search-description">
                            {highlightText(
                                content.description,
                                keyword
                            )}
                        </p>
                    )}

                    <div className="search-address">
                        <span aria-hidden="true">
                            📍
                        </span>

                        <span>
                            {highlightText(
                                content.address,
                                keyword
                            )}
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}

export default RestaurantSearchCard;