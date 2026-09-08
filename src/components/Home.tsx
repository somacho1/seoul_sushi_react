import {
    useEffect,
    useState,
    type FormEvent
} from 'react';

import {
    Link,
    useNavigate
} from 'react-router-dom';

import { axiosInstance } from './Tool';
import styles from './Home.module.css';
import { useGlobalStore } from '../store/store';

/**
 * 지역별 맛집 카드 데이터 구조
 */
interface DistrictItem {
    name: string;
    subtitle: string;
    keyword: string;
    number: string;
}

/**
 * 인기 맛집 API 응답 구조
 */
interface PopularRestaurant {
    contentno: number;
    district: string;
    name: string;
    best_menu: string;
    new_menu: string | null;
    badge: string | null;
    price: string;
    address: string;
    phone: string | null;
    business_hours: string | null;
    parking: string;
    reservation: string;
    description: string | null;
    mapUrl: string | null;
    youtubeUrl: string | null;
    filename: string | null;
    orgname: string | null;
    filesize: number;
    cnt: number;
    seqno: number;
    visible: string;
    rdate: string;
    favoriteCount: number;
}

/**
 * 맛집 추가 이미지 API 응답 구조
 */
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

/**
 * 지역별 맛집 카드
 */
const districts: DistrictItem[] = [
    {
        name: '강남구',
        subtitle: '데이트와 모임 맛집',
        keyword: '강남구',
        number: '01'
    },
    {
        name: '종로구',
        subtitle: '퇴근 후 즐기는 숙성회',
        keyword: '종로구',
        number: '02'
    },
    {
        name: '성동구',
        subtitle: '감각적인 성수 맛집',
        keyword: '성동구',
        number: '03'
    },
    {
        name: '마포구',
        subtitle: '홍대·연남 인기 맛집',
        keyword: '마포구',
        number: '04'
    },
    {
        name: '송파구',
        subtitle: '잠실 주변 추천 맛집',
        keyword: '송파구',
        number: '05'
    },
    {
        name: '용산구',
        subtitle: '이태원·한남 분위기 맛집',
        keyword: '용산구',
        number: '06'
    }
];

/**
 * 메인 검색창 아래 인기 검색어
 */
const popularKeywords = [
    '숙성회',
    '시마아지',
    '오마카세',
    '데이트',
    '주차 가능'
];

/**
 * AI 추천 조건 예시.
 *
 * 버튼을 클릭하면 선택한 조건을
 * AI 추천 페이지의 query parameter로 전달한다.
 */
const aiRecommendationKeywords = [
    '데이트',
    '혼밥',
    '모임',
    '가성비',
    '특별한 날'
];

/**
 * 메인 페이지
 */
function Home() {
    const navigate = useNavigate();

    const {
        login
    } = useGlobalStore();

    /**
     * 통합 검색어
     */
    const [
        searchWord,
        setSearchWord
    ] = useState('');

    /**
     * 인기 맛집 TOP5
     */
    const [
        popularRestaurants,
        setPopularRestaurants
    ] = useState<PopularRestaurant[]>([]);

    /**
     * 인기 맛집별 대표 이미지.
     *
     * key:
     * contentno
     *
     * value:
     * 이미지 파일명
     */
    const [
        popularImageMap,
        setPopularImageMap
    ] = useState<{
        [contentno: number]:
        string | null;
    }>({});

    /**
     * 인기 맛집 조회 상태
     */
    const [
        popularLoading,
        setPopularLoading
    ] = useState(true);

    /**
     * 인기 맛집 조회 오류 여부
     */
    const [
        popularError,
        setPopularError
    ] = useState(false);

    /**
     * 페이지 최초 진입 시
     * 인기 맛집 TOP5 조회.
     */
    useEffect(() => {
        loadPopularRestaurants();
    }, []);

    /**
     * 인기 맛집 TOP5 조회.
     *
     * API:
     * GET /content/popular
     */
    const loadPopularRestaurants =
        async () => {
            try {
                setPopularLoading(true);
                setPopularError(false);

                const response =
                    await axiosInstance.get<
                        PopularRestaurant[]
                    >(
                        '/content/popular'
                    );

                const restaurantList =
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : [];

                setPopularRestaurants(
                    restaurantList
                );

                /**
                 * 인기 맛집 목록 조회 후
                 * 각 맛집의 대표 이미지도 조회.
                 */
                await loadPopularImages(
                    restaurantList
                );

            } catch (error) {

                console.error(
                    '인기 맛집 조회 실패:',
                    error
                );

                setPopularRestaurants([]);
                setPopularImageMap({});
                setPopularError(true);

            } finally {

                setPopularLoading(false);
            }
        };

    /**
     * 인기 맛집 대표 이미지 조회.
     *
     * API:
     * GET /content_image/list/{contentno}
     */
    const loadPopularImages =
        async (
            restaurantList:
                PopularRestaurant[]
        ) => {

            const imageEntries =
                await Promise.all(
                    restaurantList.map(
                        async restaurant => {
                            try {

                                const response =
                                    await axiosInstance.get<
                                        ContentImage[]
                                    >(
                                        `/content_image/list/${restaurant.contentno}`
                                    );

                                const images =
                                    Array.isArray(
                                        response.data
                                    )
                                        ? response.data
                                        : [];

                                /**
                                 * main_yn이 Y인 대표 이미지 우선.
                                 *
                                 * 대표 이미지가 없으면
                                 * 첫 번째 이미지를 사용한다.
                                 */
                                const mainImage =
                                    images.find(
                                        image =>
                                            image.main_yn
                                            === 'Y'
                                    )
                                    ?? images[0]
                                    ?? null;

                                return [
                                    restaurant.contentno,
                                    mainImage
                                        ?.filename
                                    ?? null
                                ] as const;

                            } catch (
                            imageError
                            ) {

                                console.error(
                                    `${restaurant.contentno}번 맛집 이미지 조회 실패:`,
                                    imageError
                                );

                                return [
                                    restaurant.contentno,
                                    null
                                ] as const;
                            }
                        }
                    )
                );

            setPopularImageMap(
                Object.fromEntries(
                    imageEntries
                )
            );
        };

    /**
     * 검색 결과 페이지 이동.
     */
    const moveSearch = (
        keyword: string
    ) => {

        const trimmedKeyword =
            keyword.trim();

        if (
            trimmedKeyword === ''
        ) {
            return;
        }

        navigate(
            `/search?word=${encodeURIComponent(
                trimmedKeyword
            )}`
        );
    };

    /**
     * 통합 검색 제출.
     */
    const submitSearch = (
        event:
            FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        const trimmedWord =
            searchWord.trim();

        if (
            trimmedWord === ''
        ) {

            alert(
                '검색어를 입력하세요.'
            );

            return;
        }

        moveSearch(
            trimmedWord
        );
    };

    /**
     * AI 맛집 추천 페이지 이동.
     *
     * 메인 AI 추천 버튼을 클릭하면
     * AI 추천 페이지로 이동한다.
     *
     * 추천 키워드를 선택한 경우에는
     * query parameter로 선택 조건을 함께 전달한다.
     *
     * 예)
     *
     * 일반 버튼:
     * /ai/recommend
     *
     * 가성비 버튼:
     * /ai/recommend?keyword=가성비
     */
    const openAiRecommendation = (
        keyword?: string
    ) => {

        /**
         * 추천 조건 버튼을 클릭한 경우.
         */
        if (keyword) {

            navigate(
                `/ai/recommend?keyword=${encodeURIComponent(
                    keyword
                )}`
            );

            return;
        }

        /**
         * 일반 AI 추천받기 버튼을 클릭한 경우.
         */
        navigate(
            '/ai/recommend'
        );
    };

    /**
     * 인기 맛집 대표 이미지 URL 생성.
     */
    const getRestaurantImage = (
        restaurant:
            PopularRestaurant
    ) => {

        const imageFilename =
            popularImageMap[
            restaurant.contentno
            ];

        /**
         * ContentImage 대표 이미지 사용.
         */
        if (imageFilename) {

            return (
                `${axiosInstance.defaults.baseURL}`
                + `/content_image/image/${imageFilename}`
            );
        }

        /**
         * Content 테이블 filename이 있는 경우
         * 보조 이미지로 사용.
         */
        if (restaurant.filename) {

            return (
                `${axiosInstance.defaults.baseURL}`
                + `/content/image/${restaurant.filename}`
            );
        }

        /**
         * 등록 이미지가 없으면
         * 기본 이미지 사용.
         */
        return '/images/sushi.jpg';
    };

    /**
     * 지도 URL 유효성 검사.
     *
     * DB에 문자열 "null"이 들어간 경우도
     * 잘못된 URL로 판단한다.
     */
    const hasValidMapUrl = (
        mapUrl: string | null
    ) => {

        if (!mapUrl) {
            return false;
        }

        const trimmedMapUrl =
            mapUrl.trim();

        return (
            trimmedMapUrl !== ''
            && trimmedMapUrl
                .toLowerCase()
            !== 'null'
        );
    };

    /**
     * 현재 인기 맛집 1위.
     *
     * 메인 히어로 이미지와
     * 오늘의 인기 맛집 카드에 사용한다.
     */
    const topRestaurant =
        popularRestaurants[0]
        ?? null;

    return (
        <main className={styles.home}>

            {/* =====================================
                히어로
            ====================================== */}
            <section className={styles.hero}>

                <div className={styles.heroText}>

                    <span className={styles.badge}>
                        SEOUL AGED SASHIMI GUIDE
                    </span>

                    <h1>
                        서울 숙성회 맛집을
                        <br />
                        더 쉽고 빠르게 찾으세요
                    </h1>

                    <p
                        className={
                            styles.heroDescription
                        }
                    >
                        지역별 맛집과 실제 방문 리뷰,
                        즐겨찾기 정보를 한곳에서
                        확인하고 나에게 맞는 숙성회
                        맛집을 찾아보세요.
                    </p>

                    {/* 통합 검색 */}
                    <form
                        className={
                            styles.searchBox
                        }
                        onSubmit={
                            submitSearch
                        }
                    >
                        <div
                            className={
                                styles.searchInputArea
                            }
                        >
                            <span
                                className={
                                    styles.searchIcon
                                }
                                aria-hidden="true"
                            >
                                🔍
                            </span>

                            <div
                                className={
                                    styles.searchInputContent
                                }
                            >
                                <label
                                    htmlFor="home-search"
                                >
                                    통합 검색
                                </label>

                                <input
                                    id="home-search"
                                    type="text"
                                    value={
                                        searchWord
                                    }
                                    placeholder="지역, 맛집명, 메뉴, 리뷰를 검색하세요"
                                    autoComplete="off"
                                    onChange={
                                        event =>
                                            setSearchWord(
                                                event
                                                    .target
                                                    .value
                                            )
                                    }
                                />
                            </div>

                            {
                                searchWord !== ''
                                && (
                                    <button
                                        type="button"
                                        className={
                                            styles.clearButton
                                        }
                                        aria-label="검색어 지우기"
                                        onClick={() => {
                                            setSearchWord(
                                                ''
                                            );
                                        }}
                                    >
                                        ×
                                    </button>
                                )
                            }

                        </div>

                        <button
                            type="submit"
                            className={
                                styles.searchButton
                            }
                        >
                            검색
                        </button>
                    </form>

                    {/* 인기 검색어 */}
                    <div
                        className={
                            styles.keywordArea
                        }
                    >
                        <span
                            className={
                                styles.keywordLabel
                            }
                        >
                            인기 검색어
                        </span>

                        <div
                            className={
                                styles.keywordList
                            }
                        >
                            {
                                popularKeywords.map(
                                    keyword => (
                                        <button
                                            type="button"
                                            key={
                                                keyword
                                            }
                                            onClick={() => {
                                                moveSearch(
                                                    keyword
                                                );
                                            }}
                                        >
                                            #{keyword}
                                        </button>
                                    )
                                )
                            }
                        </div>
                    </div>

                    {/* 주요 이동 버튼 */}
                    <div
                        className={
                            styles.heroActions
                        }
                    >
                        <button
                            type="button"
                            className={
                                styles.primaryButton
                            }
                            onClick={() => {
                                moveSearch(
                                    '숙성회'
                                );
                            }}
                        >
                            맛집 둘러보기
                        </button>

                        <button
                            type="button"
                            className={
                                styles.secondaryButton
                            }
                            onClick={() => {
                                moveSearch(
                                    '맛있어요'
                                );
                            }}
                        >
                            리뷰 찾아보기
                            <span>
                                →
                            </span>
                        </button>
                    </div>

                    {/* 임시 통계
                        통계 API 구현 후 실제 데이터로 교체 */}
                    <div className={styles.stats}>

                        <div>
                            <strong>
                                120+
                            </strong>

                            <span>
                                등록 맛집
                            </span>
                        </div>

                        <div>
                            <strong>
                                350+
                            </strong>

                            <span>
                                방문 리뷰
                            </span>
                        </div>

                        <div>
                            <strong>
                                25
                            </strong>

                            <span>
                                서울 지역
                            </span>
                        </div>

                    </div>
                </div>

                {/* 히어로 이미지 */}
                <div
                    className={
                        styles.heroVisual
                    }
                >
                    <div
                        className={
                            styles.heroImageFrame
                        }
                    >
                        <img
                            src={
                                topRestaurant
                                    ? getRestaurantImage(
                                        topRestaurant
                                    )
                                    : '/images/sushi.jpg'
                            }
                            alt={
                                topRestaurant
                                    ? `${topRestaurant.name} 대표 음식`
                                    : '서울 숙성회 모둠 사시미'
                            }
                            onError={
                                event => {
                                    event.currentTarget.src =
                                        '/images/sushi.jpg';
                                }
                            }
                        />
                    </div>

                    <div
                        className={
                            styles.recommendCard
                        }
                    >
                        <span>
                            오늘의 인기 맛집
                        </span>

                        <strong>
                            {
                                topRestaurant
                                    ?.name
                                ?? '인기 맛집 조회 중'
                            }
                        </strong>

                        <small>
                            {
                                topRestaurant
                                    ?.best_menu
                                ?? '숙성회 전문 맛집'
                            }
                        </small>
                    </div>

                    <div
                        className={
                            styles.scoreCard
                        }
                    >
                        <div>
                            <span>
                                ♥
                            </span>

                            <strong>
                                {
                                    topRestaurant
                                        ?.favoriteCount
                                    ?? 0
                                }
                            </strong>
                        </div>

                        <small>
                            이용자가 저장한 인기 맛집
                        </small>
                    </div>

                    <div
                        className={
                            styles.visualDecoration
                        }
                    />

                </div>
            </section>

            {/* =====================================
                AI 맞춤 추천
            ====================================== */}
            <section className={styles.aiSection}>

                <div className={styles.aiGlow} />

                <div className={styles.aiIconArea}>

                    <div className={styles.aiIcon}>
                        ✨
                    </div>

                    <span>
                        AI
                    </span>
                </div>

                <div className={styles.aiText}>

                    <span className={styles.aiEyebrow}>
                        AI RESTAURANT GUIDE
                    </span>

                    <h2>
                        오늘 어떤 맛집을 찾고 계신가요?
                    </h2>

                    <p>
                        상황과 취향을 알려주면 AI가
                        등록된 맛집과 방문 리뷰를 분석해
                        알맞은 숙성회 맛집을 추천해드립니다.
                    </p>

                    {/* AI 추천 조건 */}
                    <div
                        className={
                            styles.aiKeywordList
                        }
                    >
                        {
                            aiRecommendationKeywords.map(
                                keyword => (
                                    <button
                                        type="button"
                                        key={
                                            keyword
                                        }
                                        onClick={() => {
                                            openAiRecommendation(
                                                keyword
                                            );
                                        }}
                                    >
                                        {keyword}
                                    </button>
                                )
                            )
                        }
                    </div>
                </div>

                <div className={styles.aiAction}>

                    {/*
                     * AI 기능이 실제 연결됐으므로
                     * 기존 "준비 중" 문구를 변경.
                     */}
                    <span className={styles.aiStatus}>
                        이용 가능
                    </span>

                    {/*
                     * AI 맛집 추천 페이지로 이동.
                     */}
                    <button
                        type="button"
                        onClick={() => {
                            openAiRecommendation();
                        }}
                    >
                        AI 추천받기
                        <span>
                            →
                        </span>
                    </button>

                </div>
            </section>

            {/* =====================================
                지역별 탐색
            ====================================== */}
            <section className={styles.section}>

                <div
                    className={
                        styles.sectionHeader
                    }
                >
                    <div>
                        <span
                            className={
                                styles.sectionEyebrow
                            }
                        >
                            AREA
                        </span>

                        <h2>
                            지역별로 찾아보기
                        </h2>

                        <p>
                            서울 주요 지역의 숙성회
                            맛집과 방문 리뷰를
                            확인해보세요.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={
                            styles.sectionMore
                        }
                        onClick={() => {
                            moveSearch(
                                '서울'
                            );
                        }}
                    >
                        전체 지역 검색
                        <span>
                            →
                        </span>
                    </button>

                </div>

                <div
                    className={
                        styles.districtGrid
                    }
                >
                    {
                        districts.map(
                            item => (
                                <button
                                    type="button"
                                    key={
                                        item.name
                                    }
                                    className={
                                        styles.districtCard
                                    }
                                    onClick={() => {
                                        moveSearch(
                                            item.keyword
                                        );
                                    }}
                                >
                                    <span
                                        className={
                                            styles.districtNumber
                                        }
                                    >
                                        {item.number}
                                    </span>

                                    <div
                                        className={
                                            styles.districtIcon
                                        }
                                    >
                                        <span />
                                    </div>

                                    <div
                                        className={
                                            styles.districtContent
                                        }
                                    >
                                        <strong>
                                            {item.name}
                                        </strong>

                                        <small>
                                            {item.subtitle}
                                        </small>
                                    </div>

                                    <span
                                        className={
                                            styles.districtArrow
                                        }
                                    >
                                        →
                                    </span>
                                </button>
                            )
                        )
                    }
                </div>
            </section>

            {/* =====================================
                인기 맛집 TOP5
            ====================================== */}
            <section
                className={
                    `${styles.section} ${styles.popularSection}`
                }
            >

                <div
                    className={
                        styles.sectionHeader
                    }
                >
                    <div>
                        <span
                            className={
                                styles.sectionEyebrow
                            }
                        >
                            POPULAR TOP 5
                        </span>

                        <h2>
                            인기 숙성회 맛집
                        </h2>

                        <p>
                            이용자 즐겨찾기 수를
                            기준으로 선정한 인기
                            맛집입니다.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={
                            styles.sectionMore
                        }
                        onClick={() => {
                            moveSearch(
                                '숙성회'
                            );
                        }}
                    >
                        더 많은 맛집
                        <span>
                            →
                        </span>
                    </button>

                </div>

                {
                    popularLoading
                        ? (
                            <div className={styles.loadingState}>

                                <div
                                    className={
                                        styles.loadingSpinner
                                    }
                                />

                                <strong>
                                    인기 맛집을 불러오고 있습니다
                                </strong>

                                <p>
                                    잠시만 기다려주세요.
                                </p>

                            </div>
                        )
                        : popularError
                            ? (
                                <div className={styles.errorState}>

                                    <div
                                        className={
                                            styles.stateIcon
                                        }
                                    >
                                        !
                                    </div>

                                    <strong>
                                        인기 맛집을 불러오지 못했습니다
                                    </strong>

                                    <p>
                                        서버 상태를 확인한 뒤
                                        다시 시도해주세요.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            loadPopularRestaurants
                                        }
                                    >
                                        다시 불러오기
                                    </button>

                                </div>
                            )
                            : popularRestaurants.length
                                === 0
                                ? (
                                    <div className={styles.emptyState}>

                                        <div
                                            className={
                                                styles.stateIcon
                                            }
                                        >
                                            🍣
                                        </div>

                                        <strong>
                                            등록된 인기 맛집이 없습니다
                                        </strong>

                                        <p>
                                            즐겨찾기가 등록되면
                                            인기 맛집 순위가 표시됩니다.
                                        </p>

                                    </div>
                                )
                                : (
                                    <div
                                        className={
                                            styles.restaurantGrid
                                        }
                                    >
                                        {
                                            popularRestaurants.map(
                                                (
                                                    restaurant,
                                                    index
                                                ) => (
                                                    <article
                                                        key={
                                                            restaurant.contentno
                                                        }
                                                        className={
                                                            styles.restaurantCard
                                                        }
                                                    >

                                                        <div
                                                            className={
                                                                styles.restaurantImage
                                                            }
                                                        >
                                                            <img
                                                                src={
                                                                    getRestaurantImage(
                                                                        restaurant
                                                                    )
                                                                }
                                                                alt={
                                                                    restaurant.name
                                                                }
                                                                onError={
                                                                    event => {
                                                                        event.currentTarget.src =
                                                                            '/images/sushi.jpg';
                                                                    }
                                                                }
                                                            />

                                                            <span
                                                                className={
                                                                    styles.restaurantRank
                                                                }
                                                            >
                                                                TOP {index + 1}
                                                            </span>

                                                            <span
                                                                className={
                                                                    styles.restaurantDistrict
                                                                }
                                                            >
                                                                {
                                                                    restaurant.district
                                                                }
                                                            </span>
                                                        </div>

                                                        <div
                                                            className={
                                                                styles.restaurantBody
                                                            }
                                                        >

                                                            <div
                                                                className={
                                                                    styles.restaurantMeta
                                                                }
                                                            >
                                                                <span>
                                                                    대표 메뉴
                                                                </span>

                                                                <strong>
                                                                    ♥{' '}
                                                                    {
                                                                        restaurant.favoriteCount
                                                                    }
                                                                </strong>
                                                            </div>

                                                            <h3>
                                                                {
                                                                    restaurant.name
                                                                }
                                                            </h3>

                                                            <div
                                                                className={
                                                                    styles.menuName
                                                                }
                                                            >
                                                                {
                                                                    restaurant.best_menu
                                                                }
                                                            </div>

                                                            <p>
                                                                {
                                                                    restaurant.description
                                                                    || '등록된 맛집 소개가 없습니다.'
                                                                }
                                                            </p>

                                                            <div
                                                                className={
                                                                    styles.restaurantInfo
                                                                }
                                                            >
                                                                <span>
                                                                    {
                                                                        restaurant.price
                                                                        || '가격 정보 없음'
                                                                    }
                                                                </span>

                                                                <span>
                                                                    {
                                                                        restaurant.reservation
                                                                            === 'Y'
                                                                            ? '예약 가능'
                                                                            : '예약 불가'
                                                                    }
                                                                </span>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                className={
                                                                    styles.cardButton
                                                                }
                                                                onClick={() => {
                                                                    navigate(
                                                                        `/post/list/${restaurant.contentno}`
                                                                    );
                                                                }}
                                                            >
                                                                맛집 정보 보기
                                                                <span>
                                                                    →
                                                                </span>
                                                            </button>

                                                            {
                                                                hasValidMapUrl(
                                                                    restaurant.mapUrl
                                                                )
                                                                && (
                                                                    <a
                                                                        href={
                                                                            restaurant.mapUrl!
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className={
                                                                            styles.mapLink
                                                                        }
                                                                    >
                                                                        네이버 지도 보기
                                                                    </a>
                                                                )
                                                            }

                                                        </div>
                                                    </article>
                                                )
                                            )
                                        }
                                    </div>
                                )
                }

            </section>

            {/* =====================================
                서비스 특징
            ====================================== */}
            <section className={styles.featureSection}>

                <div className={styles.featureHeader}>
                    <span>
                        WHY 회친자들
                    </span>

                    <h2>
                        맛집 선택을 더 쉽게
                    </h2>

                    <p>
                        실제 이용자 활동을 바탕으로
                        필요한 정보를 한곳에서 제공합니다.
                    </p>
                </div>

                <div className={styles.featureGrid}>

                    <article>
                        <div className={styles.featureIcon}>
                            📍
                        </div>

                        <h3>
                            지역별 검색
                        </h3>

                        <p>
                            원하는 서울 지역의 맛집을
                            빠르게 탐색할 수 있습니다.
                        </p>
                    </article>

                    <article>
                        <div className={styles.featureIcon}>
                            ⭐
                        </div>

                        <h3>
                            실제 방문 리뷰
                        </h3>

                        <p>
                            이용자의 별점과 상세 후기를
                            확인할 수 있습니다.
                        </p>
                    </article>

                    <article>
                        <div className={styles.featureIcon}>
                            ♥
                        </div>

                        <h3>
                            즐겨찾기 관리
                        </h3>

                        <p>
                            마음에 드는 맛집을 저장하고
                            마이페이지에서 관리할 수 있습니다.
                        </p>
                    </article>

                    <article>
                        <div className={styles.featureIcon}>
                            ✨
                        </div>

                        <h3>
                            AI 맞춤 추천
                        </h3>

                        {/*
                         * AI 기능이 실제 구현됐으므로
                         * 기존 "준비 중" 설명을
                         * 실제 동작 방식으로 변경.
                         */}
                        <p>
                            등록된 맛집과 방문 리뷰를 분석해
                            취향과 상황에 맞는 맛집을 추천합니다.
                        </p>
                    </article>

                </div>
            </section>

            {/* =====================================
                리뷰 작성 안내
            ====================================== */}
            <section
                className={
                    styles.reviewBanner
                }
            >
                <div>
                    <span>
                        REAL REVIEW
                    </span>

                    <h2>
                        직접 방문한 맛집의 경험을
                        공유해보세요
                    </h2>

                    <p>
                        사진과 별점, 상세한 후기로
                        다른 이용자의 맛집 선택을
                        도와주세요.
                    </p>
                </div>

                {
                    login
                        ? (
                            <button
                                type="button"
                                className={
                                    styles.reviewBannerButton
                                }
                                onClick={() => {
                                    moveSearch(
                                        '숙성회'
                                    );
                                }}
                            >
                                리뷰 쓸 맛집 찾기
                                <span>
                                    →
                                </span>
                            </button>
                        )
                        : (
                            <Link
                                to="/member/login"
                                className={
                                    styles.reviewBannerButton
                                }
                            >
                                로그인하고 시작하기
                                <span>
                                    →
                                </span>
                            </Link>
                        )
                }
            </section>

            {/* =====================================
                Footer
            ====================================== */}
            <footer className={styles.footer}>

                <div className={styles.footerInner}>

                    <div className={styles.footerBrand}>
                        <strong>
                            🐟 회친자들
                        </strong>

                        <p>
                            서울 숙성회 맛집과
                            실제 방문 리뷰를 제공하는
                            맛집 정보 서비스입니다.
                        </p>
                    </div>

                    <div className={styles.footerMenu}>

                        <div>
                            <span>
                                SERVICE
                            </span>

                            <button
                                type="button"
                                onClick={() => {
                                    moveSearch(
                                        '숙성회'
                                    );
                                }}
                            >
                                맛집 검색
                            </button>

                            <Link to="/member/mypage">
                                마이페이지
                            </Link>
                        </div>

                        <div>
                            <span>
                                ACCOUNT
                            </span>

                            <Link to="/member/login">
                                로그인
                            </Link>

                            <Link to="/member/signup">
                                회원가입
                            </Link>
                        </div>

                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <span>
                        © 2026 회친자들.
                        All rights reserved.
                    </span>

                    <span>
                        서울 숙성회 맛집 안내 서비스
                    </span>
                </div>

            </footer>

        </main>
    );
}

export default Home;