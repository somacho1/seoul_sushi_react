import {
    useCallback,
    useEffect,
    useState
} from 'react';

import {
    Link,
    useNavigate
} from 'react-router-dom';

import { axiosInstance } from '../Tool';
import { useGlobalStore } from '../../store/store';

import './FavoriteList.css';

interface Favorite {
    favoriteno: number;
    memberno: number;
    contentno: number;
    rdate: string;
}

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

interface FavoriteItem {
    favoriteno: number;
    rdate: string;
    content: Content;
    image: ContentImage | null;
}

interface ToggleResponse {
    success: boolean;
    memberno: number;
    contentno: number;
    favoriteno: number | null;
    count: number;
    message: string;
    favorite: boolean;
}

function FavoriteList() {
    const navigate = useNavigate();

    const {
        login,
        memberno
    } = useGlobalStore();

    const [
        favoriteItems,
        setFavoriteItems
    ] = useState<FavoriteItem[]>([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState(false);

    const [
        deletingMap,
        setDeletingMap
    ] = useState<{
        [contentno: number]: boolean;
    }>({});

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

    /**
     * 즐겨찾기 한 건에 해당하는
     * 맛집 정보와 대표 이미지 조회
     */
    const loadFavoriteItem = async (
        favorite: Favorite
    ): Promise<FavoriteItem | null> => {
        try {
            /**
             * 맛집 한 건 조회
             *
             * ContentCont의 한 건 조회 주소가
             * /content/read/{contentno}라고 가정
             */
            const contentResponse =
                await axiosInstance.get<Content>(
                    `/content/${favorite.contentno}`
                );

            const content =
                contentResponse.data;

            if (!content) {
                return null;
            }

            const imageResponse =
                await axiosInstance.get<
                    ContentImage[]
                >(
                    `/content_image/list/${favorite.contentno}`
                );

            const images =
                Array.isArray(
                    imageResponse.data
                )
                    ? imageResponse.data
                    : [];

            /**
             * main_yn = Y인 이미지를 우선 사용하고,
             * 없으면 첫 번째 이미지를 사용
             */
            const mainImage =
                images.find(
                    image =>
                        image.main_yn === 'Y'
                )
                ?? images[0]
                ?? null;

            return {
                favoriteno:
                    favorite.favoriteno,

                rdate:
                    favorite.rdate,

                content,

                image:
                    mainImage
            };
        } catch (loadError) {
            console.error(
                `${favorite.contentno}번 즐겨찾기 맛집 조회 실패:`,
                loadError
            );

            return null;
        }
    };

    /**
     * 회원 즐겨찾기 전체 목록 조회
     */
    const loadFavoriteList =
        useCallback(async () => {
            if (
                !login
                || memberno == null
                || Number(memberno) <= 0
            ) {
                setFavoriteItems([]);
                setLoading(false);

                return;
            }

            try {
                setLoading(true);
                setError(false);

                const favoriteResponse =
                    await axiosInstance.get<
                        Favorite[]
                    >(
                        `/favorite/list/${Number(memberno)}`
                    );

                const favorites =
                    Array.isArray(
                        favoriteResponse.data
                    )
                        ? favoriteResponse.data
                        : [];

                if (
                    favorites.length === 0
                ) {
                    setFavoriteItems([]);

                    return;
                }

                /**
                 * 각 즐겨찾기의 맛집 정보와
                 * 대표 이미지를 동시에 조회
                 */
                const itemResults =
                    await Promise.all(
                        favorites.map(
                            favorite =>
                                loadFavoriteItem(
                                    favorite
                                )
                        )
                    );

                const validItems =
                    itemResults.filter(
                        (
                            item
                        ): item is FavoriteItem =>
                            item !== null
                    );

                setFavoriteItems(
                    validItems
                );
            } catch (listError) {
                console.error(
                    '즐겨찾기 목록 조회 실패:',
                    listError
                );

                setFavoriteItems([]);
                setError(true);
            } finally {
                setLoading(false);
            }
        }, [
            login,
            memberno
        ]);

    useEffect(() => {
        loadFavoriteList();
    }, [loadFavoriteList]);

    /**
     * 비로그인 상태이면 로그인 페이지로 이동
     */
    const goLogin = () => {
        alert(
            '로그인 후 이용할 수 있습니다.'
        );

        navigate('/member/login');
    };

    /**
     * 즐겨찾기 해제
     */
    const removeFavorite = async (
        contentno: number
    ) => {
        if (
            !login
            || memberno == null
            || Number(memberno) <= 0
        ) {
            goLogin();

            return;
        }

        if (
            deletingMap[contentno]
        ) {
            return;
        }

        if (
            !window.confirm(
                '즐겨찾기에서 삭제할까요?'
            )
        ) {
            return;
        }

        try {
            setDeletingMap(
                previous => ({
                    ...previous,
                    [contentno]: true
                })
            );

            const response =
                await axiosInstance.post<
                    ToggleResponse
                >(
                    '/favorite/toggle',
                    {
                        memberno:
                            Number(memberno),

                        contentno
                    }
                );

            if (
                response.data.favorite
                === false
            ) {
                /**
                 * 서버 삭제 성공 후
                 * 화면에서도 즉시 제거
                 */
                setFavoriteItems(
                    previous =>
                        previous.filter(
                            item =>
                                item.content
                                    .contentno
                                !== contentno
                        )
                );
            } else {
                /**
                 * 데이터 상태가 예상과 다르면
                 * 전체 목록을 다시 조회
                 */
                await loadFavoriteList();
            }
        } catch (removeError: any) {
            console.error(
                '즐겨찾기 해제 실패:',
                removeError
            );

            const message =
                removeError?.response
                    ?.data
                    ?.message
                ?? '즐겨찾기 해제 중 오류가 발생했습니다.';

            alert(message);
        } finally {
            setDeletingMap(
                previous => ({
                    ...previous,
                    [contentno]: false
                })
            );
        }
    };

    /**
     * 로그인하지 않은 경우
     */
    if (
        !login
        || memberno == null
        || Number(memberno) <= 0
    ) {
        return (
            <div className="favorite-list-page">
                <div className="favorite-list-container">
                    <div className="favorite-login-box">
                        <div className="favorite-empty-icon">
                            ♡
                        </div>

                        <h2>
                            로그인이 필요합니다
                        </h2>

                        <p>
                            즐겨찾기한 맛집을 확인하려면 로그인해주세요.
                        </p>

                        <button
                            type="button"
                            className="favorite-login-btn"
                            onClick={goLogin}
                        >
                            로그인하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="favorite-list-page">
            <div className="favorite-list-container">
                <header className="favorite-list-header">
                    <div className="favorite-list-category">
                        MY FAVORITE
                    </div>

                    <h2 className="favorite-list-title">
                        ♥ 내 즐겨찾기
                    </h2>

                    <p className="favorite-list-summary">
                        내가 저장한 숙성회 맛집을 한곳에서 확인해보세요.
                    </p>
                </header>

                {loading ? (
                    <div className="favorite-status-box">
                        <div className="favorite-spinner" />

                        <strong>
                            즐겨찾기를 불러오고 있습니다.
                        </strong>
                    </div>
                ) : error ? (
                    <div className="favorite-status-box">
                        <div className="favorite-empty-icon">
                            !
                        </div>

                        <strong>
                            즐겨찾기를 불러오지 못했습니다.
                        </strong>

                        <p>
                            잠시 후 다시 시도해주세요.
                        </p>

                        <button
                            type="button"
                            className="favorite-retry-btn"
                            onClick={
                                loadFavoriteList
                            }
                        >
                            다시 불러오기
                        </button>
                    </div>
                ) : favoriteItems.length === 0 ? (
                    <div className="favorite-status-box">
                        <div className="favorite-empty-icon">
                            ♡
                        </div>

                        <strong>
                            아직 즐겨찾기한 맛집이 없습니다.
                        </strong>

                        <p>
                            관심 있는 맛집의 하트를 눌러 저장해보세요.
                        </p>

                        <Link
                            to="/"
                            className="favorite-home-btn"
                        >
                            맛집 둘러보기
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="favorite-list-count">
                            총{' '}
                            <strong>
                                {favoriteItems.length}
                            </strong>
                            개의 맛집
                        </div>

                        <div className="favorite-grid">
                            {favoriteItems.map(
                                item => {
                                    const {
                                        content,
                                        image
                                    } = item;

                                    const removing =
                                        deletingMap[
                                        content
                                            .contentno
                                        ] ?? false;

                                    return (
                                        <article
                                            key={
                                                item
                                                    .favoriteno
                                            }
                                            className="favorite-card"
                                        >
                                            <div className="favorite-image-box">
                                                {image ? (
                                                    <img
                                                        src={
                                                            `${axiosInstance.defaults.baseURL}/content_image/image/${image.filename}`
                                                        }
                                                        alt={
                                                            `${content.name} 음식 사진`
                                                        }
                                                        className="favorite-card-image"
                                                    />
                                                ) : (
                                                    <div className="favorite-no-image">
                                                        <span>
                                                            🍣
                                                        </span>

                                                        대표 이미지 없음
                                                    </div>
                                                )}

                                                <button
                                                    type="button"
                                                    className="favorite-remove-heart"
                                                    disabled={
                                                        removing
                                                    }
                                                    aria-label="즐겨찾기 해제"
                                                    title="즐겨찾기 해제"
                                                    onClick={() => {
                                                        removeFavorite(
                                                            content
                                                                .contentno
                                                        );
                                                    }}
                                                >
                                                    ♥
                                                </button>

                                                <div className="favorite-district">
                                                    {
                                                        content
                                                            .district
                                                    }
                                                </div>
                                            </div>

                                            <div className="favorite-card-body">
                                                <div className="favorite-card-top">
                                                    <h3 className="favorite-card-title">
                                                        {
                                                            content
                                                                .name
                                                        }
                                                    </h3>

                                                    <div className="favorite-card-menu">
                                                        {
                                                            content
                                                                .best_menu
                                                        }
                                                    </div>
                                                </div>

                                                {content.new_menu && (
                                                    <div className="favorite-new-menu">
                                                        새 메뉴 ·{' '}
                                                        {
                                                            content
                                                                .new_menu
                                                        }
                                                    </div>
                                                )}

                                                <div className="favorite-card-price">
                                                    {formatPrice(
                                                        content
                                                            .price
                                                    )}
                                                </div>

                                                <p className="favorite-card-description">
                                                    {
                                                        content
                                                            .description
                                                    }
                                                </p>

                                                <div className="favorite-card-address">
                                                    <span>
                                                        위치
                                                    </span>

                                                    {
                                                        content
                                                            .address
                                                    }
                                                </div>

                                                <div className="favorite-card-buttons">
                                                    <Link
                                                        to={
                                                            `/post/list/${content.contentno}`
                                                        }
                                                        className="favorite-card-btn favorite-review-btn"
                                                    >
                                                        리뷰보기
                                                    </Link>

                                                    {content.mapUrl ? (
                                                        <a
                                                            href={
                                                                content
                                                                    .mapUrl
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="favorite-card-btn favorite-map-btn"
                                                        >
                                                            네이버 지도
                                                        </a>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled
                                                            className="favorite-card-btn favorite-disabled-btn"
                                                        >
                                                            지도 준비중
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                }
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default FavoriteList;