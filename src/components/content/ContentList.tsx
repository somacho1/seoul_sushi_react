import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { axiosInstance } from '../Tool';
import { useGlobalStore } from '../../store/store';
import './ContentList.css';

interface Content {
    contentno: number;
    district: string;
    name: string;
    best_menu: string;
    new_menu: string | null;
    badge: string | null;
    price: string;
    address: string;
    phone: string;
    business_hours: string;
    parking: string;
    reservation: string;
    description: string;
    mapUrl: string | null;
}

interface ContentImage {
    imgno: number;
    contentno: number;
    orgname: string;
    filename: string;
    filesize: number;
    seqno: number;
    main_yn: string;
    rdate: string;
}

interface FavoriteCheckResponse {
    success: boolean;
    memberno: number;
    contentno: number;
    favorite: boolean;
}

interface FavoriteCountResponse {
    success: boolean;
    contentno: number;
    count: number;
}

interface FavoriteToggleResponse {
    success: boolean;
    memberno: number;
    contentno: number;
    favoriteno: number | null;
    count: number;
    message: string;
    favorite: boolean;
}

interface RatingSummaryResponse {
    contentno: number;
    averageRating: number;
    reviewCount: number;
}

interface StarRatingProps {
    rating: number;
}

function StarRating({
    rating
}: StarRatingProps) {
    const safeRating = Math.max(
        0,
        Math.min(5, Number(rating) || 0)
    );

    const fillPercentage =
        (safeRating / 5) * 100;

    return (
        <span
            className="content-star-rating"
            role="img"
            aria-label={`평균 별점 ${safeRating.toFixed(1)}점`}
        >
            <span className="content-star-background">
                ★★★★★
            </span>

            <span
                className="content-star-foreground"
                style={{
                    width: `${fillPercentage}%`
                }}
                aria-hidden="true"
            >
                ★★★★★
            </span>
        </span>
    );
}

function ContentList() {
    const { district } = useParams();

    const {
        grade,
        memberno,
        login
    } = useGlobalStore();

    const [data, setData] =
        useState<Content[]>([]);

    const [imageMap, setImageMap] =
        useState<{
            [key: number]: ContentImage[];
        }>({});

    const [currentIndex, setCurrentIndex] =
        useState<{
            [key: number]: number;
        }>({});

    const [selectedImage, setSelectedImage] =
        useState<string | null>(null);

    /**
     * 맛집별 즐겨찾기 여부
     *
     * 예:
     * {
     *   1: true,
     *   2: false
     * }
     */
    const [favoriteMap, setFavoriteMap] =
        useState<{
            [key: number]: boolean;
        }>({});

    /**
     * 맛집별 즐겨찾기 개수
     */
    const [
        favoriteCountMap,
        setFavoriteCountMap
    ] = useState<{
        [key: number]: number;
    }>({});

    /**
     * 즐겨찾기 버튼 처리 중 여부
     * 연속 클릭에 의한 중복 요청 방지
     */
    const [
        favoriteLoadingMap,
        setFavoriteLoadingMap
    ] = useState<{
        [key: number]: boolean;
    }>({});

    /**
     * 별점 평균
     */

    const [ratingMap, setRatingMap] =
        useState<{
            [key: number]: {
                averageRating: number;
                reviewCount: number;
            };
        }>({});

    /**
     * 지역 또는 로그인 정보가 바뀌면
     * 맛집 목록을 다시 조회
     */
    useEffect(() => {
        loadData();
    }, [district, login, memberno]);

    /**
     * 이미지 자동 슬라이드
     */
    useEffect(() => {
        const timer = window.setInterval(() => {
            setCurrentIndex(previous => {
                const next = {
                    ...previous
                };

                data.forEach(item => {
                    const images =
                        imageMap[item.contentno];

                    if (
                        images
                        && images.length > 1
                    ) {
                        next[item.contentno] =
                            (
                                (
                                    previous[item.contentno]
                                    ?? 0
                                )
                                + 1
                            )
                            % images.length;
                    }
                });

                return next;
            });
        }, 3500);

        return () => {
            window.clearInterval(timer);
        };
    }, [data, imageMap]);

    /**
     * 이미지 원본 모달에서
     * ESC를 누르면 닫기
     */
    useEffect(() => {
        if (!selectedImage) {
            return;
        }

        const handleEscape = (
            event: KeyboardEvent
        ) => {
            if (event.key === 'Escape') {
                setSelectedImage(null);
            }
        };

        window.addEventListener(
            'keydown',
            handleEscape
        );

        document.body.style.overflow =
            'hidden';

        return () => {
            window.removeEventListener(
                'keydown',
                handleEscape
            );

            document.body.style.overflow =
                '';
        };
    }, [selectedImage]);

    /**
     * 맛집 목록 조회
     */
    const loadData = () => {
        axiosInstance
            .get(`/content/list/${district}`)
            .then(response => response.data)
            .then((result: Content[]) => {
                const contentList =
                    Array.isArray(result)
                        ? result
                        : [];

                setData(contentList);

                setImageMap({});
                setCurrentIndex({});
                setFavoriteMap({});
                setFavoriteCountMap({});

                loadImages(contentList);

                contentList.forEach(item => {

                    loadFavorite(
                        item.contentno
                    );

                    loadRating(
                        item.contentno
                    );

                });
            })
            .catch(error => {
                console.error(
                    '맛집 목록 조회 실패:',
                    error
                );

                setData([]);
            });
    };

    /**
     * 맛집별 이미지 조회
     */
    const loadImages = (
        contentList: Content[]
    ) => {
        contentList.forEach(item => {
            axiosInstance
                .get(
                    `/content_image/list/${item.contentno}`
                )
                .then(
                    response =>
                        response.data
                )
                .then(
                    (
                        images:
                            ContentImage[]
                    ) => {
                        setImageMap(
                            previous => ({
                                ...previous,

                                [item.contentno]:
                                    Array.isArray(
                                        images
                                    )
                                        ? images
                                        : []
                            })
                        );
                    }
                )
                .catch(error => {
                    console.error(
                        `${item.contentno}번 맛집 이미지 조회 실패:`,
                        error
                    );

                    setImageMap(
                        previous => ({
                            ...previous,
                            [item.contentno]:
                                []
                        })
                    );
                });
        });
    };

    /**
     * 즐겨찾기 여부 및 개수 조회
     */
    const loadFavorite = (
        contentno: number
    ) => {
        /**
         * 즐겨찾기 개수는
         * 로그인 여부와 관계없이 조회
         */
        axiosInstance
            .get<FavoriteCountResponse>(
                `/favorite/count/content/${contentno}`
            )
            .then(response => {
                setFavoriteCountMap(
                    previous => ({
                        ...previous,
                        [contentno]:
                            Number(
                                response.data.count
                            ) || 0
                    })
                );
            })
            .catch(error => {
                console.error(
                    `${contentno}번 맛집 즐겨찾기 개수 조회 실패:`,
                    error
                );

                setFavoriteCountMap(
                    previous => ({
                        ...previous,
                        [contentno]: 0
                    })
                );
            });

        /**
         * 비로그인 상태면
         * 즐겨찾기 여부는 false
         */
        if (
            !login
            || memberno == null
            || Number(memberno) <= 0
        ) {
            setFavoriteMap(
                previous => ({
                    ...previous,
                    [contentno]: false
                })
            );

            return;
        }

        axiosInstance
            .get<FavoriteCheckResponse>(
                '/favorite/check',
                {
                    params: {
                        memberno:
                            Number(memberno),

                        contentno
                    }
                }
            )
            .then(response => {
                setFavoriteMap(
                    previous => ({
                        ...previous,
                        [contentno]:
                            Boolean(
                                response
                                    .data
                                    .favorite
                            )
                    })
                );
            })
            .catch(error => {
                console.error(
                    `${contentno}번 맛집 즐겨찾기 여부 조회 실패:`,
                    error
                );

                setFavoriteMap(
                    previous => ({
                        ...previous,
                        [contentno]: false
                    })
                );
            });
    };

    /**
     * 즐겨찾기 등록·해제
     */
    const toggleFavorite = async (
        contentno: number
    ) => {
        if (
            !login
            || memberno == null
            || Number(memberno) <= 0
        ) {
            alert(
                '로그인 후 즐겨찾기를 이용할 수 있습니다.'
            );

            return;
        }

        /**
         * 이미 처리 중인 맛집이면
         * 추가 요청을 보내지 않음
         */
        if (
            favoriteLoadingMap[contentno]
        ) {
            return;
        }

        try {
            setFavoriteLoadingMap(
                previous => ({
                    ...previous,
                    [contentno]: true
                })
            );

            const response =
                await axiosInstance.post<
                    FavoriteToggleResponse
                >(
                    '/favorite/toggle',
                    {
                        memberno:
                            Number(memberno),

                        contentno
                    }
                );

            const result =
                response.data;

            setFavoriteMap(
                previous => ({
                    ...previous,
                    [contentno]:
                        Boolean(
                            result.favorite
                        )
                })
            );

            setFavoriteCountMap(
                previous => ({
                    ...previous,
                    [contentno]:
                        Number(result.count)
                        || 0
                })
            );
        } catch (error: any) {
            console.error(
                '즐겨찾기 등록·해제 실패:',
                error
            );

            const message =
                error?.response
                    ?.data
                    ?.message
                ?? '즐겨찾기 처리 중 오류가 발생했습니다.';

            alert(message);
        } finally {
            setFavoriteLoadingMap(
                previous => ({
                    ...previous,
                    [contentno]: false
                })
            );
        }
    };

    /**
   * 별점 평균
   */
    const loadRating = (
        contentno: number
    ) => {

        axiosInstance
            .get<RatingSummaryResponse>(
                `/post/rating/${contentno}`
            )
            .then(response => {

                setRatingMap(previous => ({
                    ...previous,

                    [contentno]: {
                        averageRating:
                            Number(
                                response.data.averageRating
                            ) || 0,

                        reviewCount:
                            Number(
                                response.data.reviewCount
                            ) || 0
                    }
                }));

            })
            .catch(error => {

                console.error(error);

                setRatingMap(previous => ({
                    ...previous,

                    [contentno]: {
                        averageRating: 0,
                        reviewCount: 0
                    }
                }));

            });

    };

    /**
     * 관리자 이미지 추가
     */
    const uploadImages = (
        contentno: number,
        files: FileList | null
    ) => {
        if (
            !files
            || files.length === 0
        ) {
            return;
        }

        const formData =
            new FormData();

        for (
            let index = 0;
            index < files.length;
            index++
        ) {
            formData.append(
                'files',
                files[index]
            );
        }

        axiosInstance
            .post(
                `/content_image/upload/${contentno}`,
                formData,
                {
                    headers: {
                        'Content-Type':
                            'multipart/form-data'
                    }
                }
            )
            .then(() => {
                alert(
                    '사진 업로드 완료'
                );

                setCurrentIndex(
                    previous => ({
                        ...previous,
                        [contentno]: 0
                    })
                );

                loadData();
            })
            .catch(error => {
                console.error(
                    '사진 업로드 실패:',
                    error
                );

                alert(
                    '사진 업로드에 실패했습니다.'
                );
            });
    };

    /**
     * 관리자 이미지 삭제
     */
    const deleteImage = (
        contentno: number,
        imgno: number
    ) => {
        if (
            !window.confirm(
                '현재 사진을 삭제할까요?'
            )
        ) {
            return;
        }

        axiosInstance
            .delete(
                `/content_image/${imgno}`
            )
            .then(() => {
                alert(
                    '사진 삭제 완료'
                );

                setCurrentIndex(
                    previous => ({
                        ...previous,
                        [contentno]: 0
                    })
                );

                loadData();
            })
            .catch(error => {
                console.error(
                    '사진 삭제 실패:',
                    error
                );

                alert(
                    '사진 삭제에 실패했습니다.'
                );
            });
    };

    /**
     * 이전 이미지
     */
    const prevImage = (
        contentno: number,
        images: ContentImage[]
    ) => {
        setCurrentIndex(previous => {
            const current =
                previous[contentno]
                ?? 0;

            return {
                ...previous,

                [contentno]:
                    current === 0
                        ? images.length - 1
                        : current - 1
            };
        });
    };

    /**
     * 다음 이미지
     */
    const nextImage = (
        contentno: number,
        images: ContentImage[]
    ) => {
        setCurrentIndex(previous => {
            const current =
                previous[contentno]
                ?? 0;

            return {
                ...previous,

                [contentno]:
                    (
                        current + 1
                    )
                    % images.length
            };
        });
    };

    /**
     * 이미지 점 선택
     */
    const selectImage = (
        contentno: number,
        index: number
    ) => {
        setCurrentIndex(
            previous => ({
                ...previous,
                [contentno]: index
            })
        );
    };

    /**
     * 뱃지 표시
     */
    const getBadgeLabel = (
        badge: string | null
    ) => {
        if (badge === 'NEW') {
            return '🆕 NEW';
        }

        if (badge === 'HOT') {
            return '🔥 HOT';
        }

        if (badge === 'BEST') {
            return '⭐ BEST';
        }

        if (badge === 'EVENT') {
            return '🎉 EVENT';
        }

        return '';
    };

    /**
     * 가격 표시
     */
    const formatPrice = (
        price: string
    ) => {
        if (!price) {
            return '';
        }

        const numericPrice =
            price.replace(
                /[^0-9]/g,
                ''
            );

        if (!numericPrice) {
            return price;
        }

        return `${Number(
            numericPrice
        ).toLocaleString()
            }원`;
    };

    const gridCount =
        data.length <= 1
            ? 1
            : data.length === 2
                ? 2
                : 3;

    return (
        <div className="content-list-page">
            <div className="content-list-container">
                <header className="content-list-header">
                    <div className="content-list-category">
                        SASHIMI PLACE
                    </div>

                    <h2 className="content-list-title">
                        📍 {district} 숙성회 맛집
                    </h2>

                    <p className="content-list-summary">
                        총 {data.length}곳의 숙성회 맛집을 확인해보세요.
                    </p>
                </header>

                {data.length === 0 ? (
                    <div className="content-list-empty">
                        <div className="content-list-empty-icon">
                            🍣
                        </div>

                        <strong>
                            등록된 맛집이 없습니다.
                        </strong>

                        <p>
                            다른 지역을 선택하거나 나중에 다시 확인해주세요.
                        </p>
                    </div>
                ) : (
                    <div
                        className={
                            `content-grid content-grid-${gridCount}`
                        }
                    >
                        {data.map(item => {
                            const images =
                                imageMap[
                                item.contentno
                                ] || [];

                            const storedIndex =
                                currentIndex[
                                item.contentno
                                ] ?? 0;

                            const current =
                                images.length > 0
                                    ? Math.min(
                                        storedIndex,
                                        images.length
                                        - 1
                                    )
                                    : 0;

                            const image =
                                images[current];

                            const isFavorite =
                                favoriteMap[
                                item.contentno
                                ] ?? false;

                            const favoriteCount =
                                favoriteCountMap[
                                item.contentno
                                ] ?? 0;

                            const rating =
                                ratingMap[
                                item.contentno
                                ] ?? {

                                    averageRating: 0,

                                    reviewCount: 0
                                };

                            const isFavoriteLoading =
                                favoriteLoadingMap[
                                item.contentno
                                ] ?? false;

                            return (
                                <article
                                    key={
                                        item.contentno
                                    }
                                    className="content-card"
                                >
                                    <div className="content-image-box">
                                        {image ? (
                                            <img
                                                src={
                                                    `${axiosInstance.defaults.baseURL}/content_image/image/${image.filename}`
                                                }
                                                alt={
                                                    `${item.name} 음식 사진`
                                                }
                                                className="content-card-image"
                                                onClick={() => {
                                                    setSelectedImage(
                                                        `${axiosInstance.defaults.baseURL}/content_image/image/${image.filename}`
                                                    );
                                                }}
                                            />
                                        ) : (
                                            <div className="content-empty-image">
                                                <span>
                                                    대표 이미지
                                                </span>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            className={
                                                isFavorite
                                                    ? 'content-favorite-btn active'
                                                    : 'content-favorite-btn'
                                            }
                                            disabled={
                                                isFavoriteLoading
                                            }
                                            aria-label={
                                                isFavorite
                                                    ? '즐겨찾기 해제'
                                                    : '즐겨찾기 등록'
                                            }
                                            title={
                                                isFavorite
                                                    ? '즐겨찾기 해제'
                                                    : '즐겨찾기 등록'
                                            }
                                            onClick={event => {
                                                event.stopPropagation();

                                                toggleFavorite(
                                                    item.contentno
                                                );
                                            }}
                                        >
                                            <span className="content-favorite-heart">
                                                {isFavorite
                                                    ? '♥'
                                                    : '♡'}
                                            </span>

                                            <span className="content-favorite-count">
                                                {favoriteCount}
                                            </span>
                                        </button>

                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="content-arrow content-arrow-left"
                                                    aria-label="이전 사진"
                                                    onClick={event => {
                                                        event.stopPropagation();

                                                        prevImage(
                                                            item.contentno,
                                                            images
                                                        );
                                                    }}
                                                >
                                                    ‹
                                                </button>

                                                <button
                                                    type="button"
                                                    className="content-arrow content-arrow-right"
                                                    aria-label="다음 사진"
                                                    onClick={event => {
                                                        event.stopPropagation();

                                                        nextImage(
                                                            item.contentno,
                                                            images
                                                        );
                                                    }}
                                                >
                                                    ›
                                                </button>

                                                <div className="content-image-dots">
                                                    {images.map(
                                                        (
                                                            _,
                                                            index
                                                        ) => (
                                                            <button
                                                                type="button"
                                                                key={
                                                                    index
                                                                }
                                                                aria-label={
                                                                    `${index + 1}번째 사진 보기`
                                                                }
                                                                className={
                                                                    current
                                                                        === index
                                                                        ? 'content-image-dot active'
                                                                        : 'content-image-dot'
                                                                }
                                                                onClick={
                                                                    event => {
                                                                        event.stopPropagation();

                                                                        selectImage(
                                                                            item.contentno,
                                                                            index
                                                                        );
                                                                    }
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="content-card-body">
                                        <div className="content-card-main">
                                            <h3 className="content-card-title">
                                                {item.name}
                                            </h3>

                                            <div className="content-card-menu">
                                                {item.best_menu}
                                            </div>

                                            {item.badge
                                                && item.new_menu
                                                && (
                                                    <div className="content-new-menu">
                                                        {getBadgeLabel(
                                                            item.badge
                                                        )}

                                                        <span>
                                                            ·
                                                        </span>

                                                        {item.new_menu}
                                                    </div>
                                                )}

                                            <div className="content-card-price">
                                                {formatPrice(
                                                    item.price
                                                )}
                                            </div>
                                            <div className="content-rating-box">
                                                {rating.reviewCount > 0 ? (
                                                    <>
                                                        <StarRating
                                                            rating={
                                                                rating.averageRating
                                                            }
                                                        />

                                                        <span className="content-rating-score">
                                                            {rating.averageRating.toFixed(1)}
                                                        </span>

                                                        <span className="content-rating-divider">
                                                            ·
                                                        </span>

                                                        <span className="content-rating-count">
                                                            리뷰 {rating.reviewCount}개
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="content-rating-empty">
                                                        아직 등록된 리뷰가 없습니다.
                                                    </span>
                                                )}
                                            </div>

                                            <p className="content-card-description">
                                                {item.description}
                                            </p>
                                        </div>

                                        {grade <= 5 && (
                                            <div className="content-admin-box">
                                                <label className="content-upload-label">
                                                    사진 추가

                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        className="content-file-input"
                                                        onChange={event => {
                                                            uploadImages(
                                                                item.contentno,
                                                                event
                                                                    .target
                                                                    .files
                                                            );

                                                            event.target.value =
                                                                '';
                                                        }}
                                                    />
                                                </label>

                                                {image && (
                                                    <button
                                                        type="button"
                                                        className="content-delete-image-btn"
                                                        onClick={() => {
                                                            deleteImage(
                                                                item.contentno,
                                                                image.imgno
                                                            );
                                                        }}
                                                    >
                                                        현재 사진 삭제
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <div className="content-card-buttons">
                                            <Link
                                                to={
                                                    `/post/list/${item.contentno}`
                                                }
                                                className="content-card-btn content-review-btn"
                                            >
                                                리뷰보기
                                            </Link>

                                            {item.mapUrl ? (
                                                <a
                                                    href={
                                                        item.mapUrl
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="content-card-btn content-detail-btn"
                                                >
                                                    네이버 지도
                                                </a>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="content-card-btn content-disabled-btn"
                                                >
                                                    준비중
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedImage && (
                <div
                    className="content-image-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-label="사진 원본 보기"
                    onClick={() => {
                        setSelectedImage(null);
                    }}
                >
                    <button
                        type="button"
                        className="content-modal-close"
                        aria-label="사진 닫기"
                        onClick={() => {
                            setSelectedImage(null);
                        }}
                    >
                        ×
                    </button>

                    <img
                        src={selectedImage}
                        alt="맛집 음식 원본"
                        className="content-modal-image"
                        onClick={event => {
                            event.stopPropagation();
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default ContentList;