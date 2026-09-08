import {
    useEffect,
    useState,
    type CSSProperties
} from 'react';
import {
    useNavigate,
    useParams
} from 'react-router-dom';
import { axiosInstance } from '../Tool';
import { useGlobalStore } from '../../store/store';

const PAGE_SIZE = 5;

type SortType =
    | 'latest'
    | 'rating'
    | 'recom'
    | 'cnt';

interface Post {
    postno: number;
    contentno: number;
    memberno: number;
    title: string;
    content: string;
    recom: number;
    cnt: number;
    replycnt: number;
    rating: number;
    word: string;
    visible: string;
    rdate: string;
}

interface PostImage {
    imageno: number;
    postno: number;
    filename: string;
    orgname: string;
    filesize: number;
    rdate: string;
}

interface ContentInfo {
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
    youtubeUrl: string | null;
    filename: string | null;
    orgname: string | null;
    filesize: number;
    cnt: number;
    seqno: number;
    visible: string;
    rdate: string;
}

interface PagingResponse {
    list: Post[];
    page: number;
    size: number;
    sort?: SortType;
    totalElements: number;
    totalPages: number;
    startPage: number;
    endPage: number;
    hasPrevious: boolean;
    hasNext: boolean;
    first: boolean;
    last: boolean;
}

function Post() {
    const { login } = useGlobalStore();
    const { contentno } = useParams();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] =
        useState<ContentInfo | null>(null);

    const [contentLoading, setContentLoading] =
        useState(false);

    const [showVideo, setShowVideo] =
        useState(true);

    const [data, setData] =
        useState<Post[]>([]);

    const [imageMap, setImageMap] =
        useState<{
            [key: number]: PostImage | null;
        }>({});

    const [page, setPage] =
        useState(1);

    const [sort, setSort] =
        useState<SortType>('latest');

    const [totalPages, setTotalPages] =
        useState(0);

    const [totalElements, setTotalElements] =
        useState(0);

    const [startPage, setStartPage] =
        useState(1);

    const [endPage, setEndPage] =
        useState(1);

    const [hasPrevious, setHasPrevious] =
        useState(false);

    const [hasNext, setHasNext] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    /**
     * 맛집이 바뀌면 페이징과 정렬 초기화
     */
    useEffect(() => {
        setPage(1);
        setSort('latest');
        setShowVideo(true);
    }, [contentno]);

    /**
     * 맛집 정보 조회
     */
    useEffect(() => {
        loadContent();
    }, [contentno]);

    /**
     * 리뷰 목록 조회
     */
    useEffect(() => {
        loadData();
    }, [contentno, page, sort]);

    /**
     * 맛집 정보 조회
     */
    const loadContent = () => {
        if (!contentno) {
            setRestaurant(null);
            return;
        }

        setContentLoading(true);

        axiosInstance
            .get<ContentInfo>(
                `/content/${contentno}`
            )
            .then(result => result.data)
            .then(contentData => {
                console.log(
                    'CONTENT INFO:',
                    contentData
                );

                setRestaurant(contentData);
            })
            .catch(err => {
                console.error(
                    '맛집 정보 조회 실패:',
                    err
                );

                setRestaurant(null);
            })
            .finally(() => {
                setContentLoading(false);
            });
    };

    /**
     * 리뷰 페이징 목록 조회
     */
    const loadData = () => {
        if (!contentno) {
            setData([]);
            setTotalPages(0);
            setTotalElements(0);
            return;
        }

        setLoading(true);

        axiosInstance
            .get<PagingResponse>(
                `/post/list_by_contentno/${contentno}/page/${page}`
                + `?size=${PAGE_SIZE}`
                + `&sort=${sort}`
            )
            .then(result => result.data)
            .then(res => {
                console.log(
                    'POST PAGING:',
                    res
                );

                const posts =
                    res.list ?? [];

                setData(posts);

                setTotalPages(
                    res.totalPages ?? 0
                );

                setTotalElements(
                    res.totalElements ?? 0
                );

                setStartPage(
                    res.startPage ?? 1
                );

                setEndPage(
                    res.endPage ?? 1
                );

                setHasPrevious(
                    res.hasPrevious ?? false
                );

                setHasNext(
                    res.hasNext ?? false
                );

                /*
                 * 이전 페이지 이미지가 잠깐
                 * 표시되는 현상 방지
                 */
                setImageMap({});

                loadImages(posts);
            })
            .catch(err => {
                console.error(
                    '리뷰 목록 조회 실패:',
                    err
                );

                setData([]);
                setImageMap({});
                setTotalPages(0);
                setTotalElements(0);
                setStartPage(1);
                setEndPage(1);
                setHasPrevious(false);
                setHasNext(false);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    /**
     * 현재 페이지 리뷰의 대표 이미지 조회
     */
    const loadImages = (
        posts: Post[]
    ) => {
        posts.forEach(post => {
            axiosInstance
                .get<PostImage[]>(
                    `/post/image/list/${post.postno}`
                )
                .then(result => result.data)
                .then(images => {
                    setImageMap(prev => ({
                        ...prev,
                        [post.postno]:
                            images.length > 0
                                ? images[0]
                                : null
                    }));
                })
                .catch(err => {
                    console.error(
                        `${post.postno}번 리뷰 이미지 조회 실패:`,
                        err
                    );

                    setImageMap(prev => ({
                        ...prev,
                        [post.postno]: null
                    }));
                });
        });
    };

    /**
     * 유튜브 일반 URL을 embed URL로 변환
     *
     * 지원 형식:
     * youtube.com/watch?v=
     * youtu.be/
     * youtube.com/shorts/
     * youtube.com/embed/
     */
    const getYoutubeEmbedUrl = (
        url: string | null | undefined
    ): string | null => {
        if (!url || url.trim() === '') {
            return null;
        }

        const trimmedUrl = url.trim();

        try {
            const parsedUrl =
                new URL(trimmedUrl);

            const hostname =
                parsedUrl.hostname
                    .replace('www.', '')
                    .toLowerCase();

            /*
             * https://youtu.be/VIDEO_ID
             */
            if (hostname === 'youtu.be') {
                const videoId =
                    parsedUrl.pathname
                        .split('/')
                        .filter(Boolean)[0];

                return videoId
                    ? `https://www.youtube.com/embed/${videoId}`
                    : null;
            }

            if (
                hostname === 'youtube.com'
                || hostname === 'm.youtube.com'
            ) {
                /*
                 * https://youtube.com/watch?v=VIDEO_ID
                 */
                if (
                    parsedUrl.pathname === '/watch'
                ) {
                    const videoId =
                        parsedUrl.searchParams.get(
                            'v'
                        );

                    return videoId
                        ? `https://www.youtube.com/embed/${videoId}`
                        : null;
                }

                /*
                 * https://youtube.com/shorts/VIDEO_ID
                 */
                if (
                    parsedUrl.pathname.startsWith(
                        '/shorts/'
                    )
                ) {
                    const videoId =
                        parsedUrl.pathname
                            .split('/')
                            .filter(Boolean)[1];

                    return videoId
                        ? `https://www.youtube.com/embed/${videoId}`
                        : null;
                }

                /*
                 * 이미 embed 형식인 경우
                 */
                if (
                    parsedUrl.pathname.startsWith(
                        '/embed/'
                    )
                ) {
                    return trimmedUrl;
                }
            }

            return null;

        } catch {
            /*
             * URL 객체가 처리하지 못한 경우를 위한 보조 처리
             */
            const watchMatch =
                trimmedUrl.match(
                    /[?&]v=([^&]+)/
                );

            if (watchMatch?.[1]) {
                return `https://www.youtube.com/embed/${watchMatch[1]}`;
            }

            const shortMatch =
                trimmedUrl.match(
                    /youtu\.be\/([^?&/]+)/
                );

            if (shortMatch?.[1]) {
                return `https://www.youtube.com/embed/${shortMatch[1]}`;
            }

            const shortsMatch =
                trimmedUrl.match(
                    /\/shorts\/([^?&/]+)/
                );

            if (shortsMatch?.[1]) {
                return `https://www.youtube.com/embed/${shortsMatch[1]}`;
            }

            return null;
        }
    };

    /**
     * 리뷰 상세 이동
     */
    const read = (
        postno: number
    ) => {
        navigate(
            `/post/read/${postno}`
        );
    };

    /**
     * 페이지 이동
     */
    const movePage = (
        nextPage: number
    ) => {
        if (nextPage < 1) {
            return;
        }

        if (
            totalPages > 0
            && nextPage > totalPages
        ) {
            return;
        }

        if (nextPage === page) {
            return;
        }

        setPage(nextPage);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    /**
     * 정렬 변경
     */
    const changeSort = (
        nextSort: SortType
    ) => {
        if (sort === nextSort) {
            return;
        }

        setSort(nextSort);
        setPage(1);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    /**
     * 별점 표시
     */
    const getRatingText = (
        rating: number
    ) => {
        const safeRating =
            typeof rating === 'number'
                && !Number.isNaN(rating)
                ? rating
                : 0;

        return safeRating.toFixed(1);
    };

    const youtubeEmbedUrl =
        getYoutubeEmbedUrl(
            restaurant?.youtubeUrl
        );

    const pageNumbers =
        totalPages > 0
            && endPage >= startPage
            ? Array.from(
                {
                    length:
                        endPage
                        - startPage
                        + 1
                },
                (_, index) =>
                    startPage + index
            )
            : [];

    const currentStart =
        totalElements === 0
            ? 0
            : (
                page - 1
            ) * PAGE_SIZE + 1;

    const currentEnd =
        Math.min(
            page * PAGE_SIZE,
            totalElements
        );

    return (
        <div
            style={{
                width: '100%',
                minHeight:
                    'calc(100vh - 72px)',
                background:
                    'linear-gradient(180deg, #F8FEFF 0%, #F1F9FA 100%)',
                padding:
                    '60px 20px 100px',
                boxSizing: 'border-box'
            }}
        >
            <div
                style={{
                    maxWidth: '1100px',
                    margin: '0 auto'
                }}
            >
                {/* 상단 제목 */}
                <div
                    style={{
                        marginBottom: '22px',
                        display: 'flex',
                        justifyContent:
                            'space-between',
                        alignItems:
                            'flex-end',
                        gap: '20px',
                        flexWrap: 'wrap'
                    }}
                >
                    <div>
                        <div
                            style={{
                                color: '#00A88F',
                                fontSize: '12px',
                                fontWeight: 900,
                                letterSpacing:
                                    '1.5px',
                                marginBottom:
                                    '8px'
                            }}
                        >
                            REVIEW
                        </div>

                        <h2
                            style={{
                                fontFamily:
                                    "'Jua', sans-serif",
                                fontSize: '38px',
                                color: '#0A2342',
                                margin:
                                    '0 0 8px'
                            }}
                        >
                            {restaurant?.name
                                ? `${restaurant.name} 리뷰`
                                : '게시글 목록'}
                        </h2>

                        <p
                            style={{
                                color: '#6B8794',
                                fontSize: '15px',
                                margin: 0
                            }}
                        >
                            {restaurant?.description
                                || '맛집에 대한 다양한 리뷰를 확인해보세요.'}
                        </p>
                    </div>

                    {login && (
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/post/create/${contentno}`
                                )
                            }
                            style={{
                                height: '46px',
                                padding:
                                    '0 24px',
                                background:
                                    '#00C9A7',
                                color: '#fff',
                                border: 'none',
                                borderRadius:
                                    '14px',
                                fontSize:
                                    '15px',
                                fontWeight: 800,
                                cursor:
                                    'pointer',
                                boxShadow:
                                    '0 10px 24px rgba(0, 201, 167, 0.28)'
                            }}
                        >
                            리뷰 작성
                        </button>
                    )}
                </div>

                {/* 맛집 정보 로딩 */}
                {contentLoading && (
                    <div
                        style={{
                            marginBottom:
                                '18px',
                            padding:
                                '18px 20px',
                            background:
                                '#FFFFFF',
                            border:
                                '1px solid rgba(10, 35, 66, 0.08)',
                            borderRadius:
                                '16px',
                            color:
                                '#6B8794',
                            textAlign:
                                'center'
                        }}
                    >
                        맛집 정보를 불러오는 중입니다.
                    </div>
                )}

                {/* 맛집 기본 정보 카드 */}
                {restaurant && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent:
                                'space-between',
                            alignItems:
                                'center',
                            flexWrap: 'wrap',
                            gap: '18px',
                            marginBottom:
                                '18px',
                            padding:
                                '20px 22px',
                            background:
                                '#FFFFFF',
                            border:
                                '1px solid rgba(10, 35, 66, 0.08)',
                            borderRadius:
                                '20px',
                            boxShadow:
                                '0 14px 36px rgba(10, 35, 66, 0.08)'
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                minWidth:
                                    '260px'
                            }}
                        >
                            <div
                                style={{
                                    marginBottom:
                                        '7px',
                                    color:
                                        '#0A2342',
                                    fontSize:
                                        '20px',
                                    fontWeight:
                                        900
                                }}
                            >
                                {restaurant.name}
                            </div>

                            <div
                                style={{
                                    display:
                                        'flex',
                                    flexWrap:
                                        'wrap',
                                    gap:
                                        '8px 18px',
                                    color:
                                        '#5A7A8A',
                                    fontSize:
                                        '14px',
                                    lineHeight:
                                        '1.6'
                                }}
                            >
                                {restaurant.address && (
                                    <span>
                                        📍{' '}
                                        {
                                            restaurant.address
                                        }
                                    </span>
                                )}

                                {restaurant.phone && (
                                    <span>
                                        ☎{' '}
                                        {
                                            restaurant.phone
                                        }
                                    </span>
                                )}

                                {restaurant.business_hours && (
                                    <span>
                                        🕒{' '}
                                        {
                                            restaurant.business_hours
                                        }
                                    </span>
                                )}
                            </div>
                        </div>

                        <div
                            style={{
                                display:
                                    'flex',
                                gap: '10px',
                                flexWrap:
                                    'wrap'
                            }}
                        >
                            {restaurant.mapUrl && (
                                <a
                                    href={
                                        restaurant.mapUrl
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={mapButtonStyle}
                                >
                                    📍 지도에서 보기
                                </a>
                            )}

                            {youtubeEmbedUrl && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowVideo(
                                            prev =>
                                                !prev
                                        )
                                    }
                                    style={videoToggleButtonStyle}
                                >
                                    🎥 영상{' '}
                                    {showVideo
                                        ? '접기'
                                        : '보기'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* 유튜브 영상 */}
                {restaurant
                    && youtubeEmbedUrl
                    && showVideo && (
                        <section
                            style={{
                                marginBottom:
                                    '22px',
                                padding:
                                    '22px',
                                background:
                                    '#FFFFFF',
                                border:
                                    '1px solid rgba(10, 35, 66, 0.08)',
                                borderRadius:
                                    '22px',
                                boxShadow:
                                    '0 16px 40px rgba(10, 35, 66, 0.09)'
                            }}
                        >
                            <div
                                style={{
                                    display:
                                        'flex',
                                    justifyContent:
                                        'space-between',
                                    alignItems:
                                        'center',
                                    gap: '12px',
                                    marginBottom:
                                        '14px'
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            color:
                                                '#00A88F',
                                            fontSize:
                                                '12px',
                                            fontWeight:
                                                900,
                                            letterSpacing:
                                                '1px',
                                            marginBottom:
                                                '4px'
                                        }}
                                    >
                                        VIDEO
                                    </div>

                                    <h3
                                        style={{
                                            margin: 0,
                                            color:
                                                '#0A2342',
                                            fontSize:
                                                '21px',
                                            fontWeight:
                                                900
                                        }}
                                    >
                                        🎥 맛집 소개 영상
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowVideo(
                                            false
                                        )
                                    }
                                    style={{
                                        width: '38px',
                                        height:
                                            '38px',
                                        border:
                                            '1px solid #DDEFF2',
                                        borderRadius:
                                            '11px',
                                        background:
                                            '#FFFFFF',
                                        color:
                                            '#5A7A8A',
                                        fontSize:
                                            '17px',
                                        cursor:
                                            'pointer'
                                    }}
                                    aria-label="영상 접기"
                                >
                                    ×
                                </button>
                            </div>

                            <div
                                style={{
                                    position:
                                        'relative',
                                    width: '100%',
                                    paddingTop:
                                        '56.25%',
                                    overflow:
                                        'hidden',
                                    borderRadius:
                                        '18px',
                                    background:
                                        '#000000'
                                }}
                            >
                                <iframe
                                    src={
                                        youtubeEmbedUrl
                                    }
                                    title={`${restaurant.name} 유튜브 영상`}
                                    loading="lazy"
                                    allow="
                                    accelerometer;
                                    autoplay;
                                    clipboard-write;
                                    encrypted-media;
                                    gyroscope;
                                    picture-in-picture;
                                    web-share
                                "
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                    style={{
                                        position:
                                            'absolute',
                                        inset: 0,
                                        width:
                                            '100%',
                                        height:
                                            '100%',
                                        border: 0
                                    }}
                                />
                            </div>
                        </section>
                    )}

                {/* 리뷰 개수 및 정렬 */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent:
                            'space-between',
                        alignItems:
                            'center',
                        gap: '14px',
                        flexWrap: 'wrap',
                        marginBottom:
                            '18px',
                        padding:
                            '14px 16px',
                        background:
                            'rgba(255,255,255,.72)',
                        border:
                            '1px solid rgba(10, 35, 66, 0.07)',
                        borderRadius:
                            '16px'
                    }}
                >
                    <div
                        style={{
                            color:
                                '#5A7A8A',
                            fontSize:
                                '14px',
                            fontWeight: 800
                        }}
                    >
                        총 리뷰{' '}
                        <strong
                            style={{
                                color:
                                    '#00A88F'
                            }}
                        >
                            {totalElements}
                        </strong>
                        개
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems:
                                'center',
                            gap: '8px',
                            flexWrap: 'wrap'
                        }}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                changeSort(
                                    'latest'
                                )
                            }
                            style={getSortButtonStyle(
                                sort ===
                                'latest'
                            )}
                        >
                            최신순
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                changeSort(
                                    'rating'
                                )
                            }
                            style={getSortButtonStyle(
                                sort ===
                                'rating'
                            )}
                        >
                            평점순
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                changeSort(
                                    'recom'
                                )
                            }
                            style={getSortButtonStyle(
                                sort ===
                                'recom'
                            )}
                        >
                            추천순
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                changeSort(
                                    'cnt'
                                )
                            }
                            style={getSortButtonStyle(
                                sort ===
                                'cnt'
                            )}
                        >
                            조회순
                        </button>
                    </div>
                </div>

                {/* 리뷰 로딩 */}
                {loading ? (
                    <div
                        style={{
                            background:
                                '#fff',
                            borderRadius:
                                '22px',
                            padding:
                                '60px 20px',
                            textAlign:
                                'center',
                            color:
                                '#6B8794',
                            boxShadow:
                                '0 18px 45px rgba(10, 35, 66, 0.10)',
                            border:
                                '1px solid rgba(10, 35, 66, 0.08)'
                        }}
                    >
                        리뷰를 불러오는 중입니다.
                    </div>
                ) : (
                    <>
                        {/* 리뷰 카드 목록 */}
                        <div
                            style={{
                                display:
                                    'flex',
                                flexDirection:
                                    'column',
                                gap: '18px'
                            }}
                        >
                            {data.length ===
                                0 ? (
                                <div
                                    style={{
                                        background:
                                            '#fff',
                                        borderRadius:
                                            '22px',
                                        padding:
                                            '60px 20px',
                                        textAlign:
                                            'center',
                                        color:
                                            '#6B8794',
                                        boxShadow:
                                            '0 18px 45px rgba(10, 35, 66, 0.10)',
                                        border:
                                            '1px solid rgba(10, 35, 66, 0.08)'
                                    }}
                                >
                                    등록된 게시글이 없습니다.
                                </div>
                            ) : (
                                data.map(item => {
                                    const image =
                                        imageMap[
                                        item.postno
                                        ];

                                    return (
                                        <div
                                            key={
                                                item.postno
                                            }
                                            onClick={() =>
                                                read(
                                                    item.postno
                                                )
                                            }
                                            style={{
                                                display:
                                                    'flex',
                                                gap:
                                                    '22px',
                                                background:
                                                    '#fff',
                                                borderRadius:
                                                    '24px',
                                                padding:
                                                    '22px',
                                                boxShadow:
                                                    '0 18px 45px rgba(10, 35, 66, 0.10)',
                                                border:
                                                    '1px solid rgba(10, 35, 66, 0.08)',
                                                cursor:
                                                    'pointer',
                                                transition:
                                                    'transform .18s ease, box-shadow .18s ease'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.transform =
                                                    'translateY(-3px)';

                                                e.currentTarget.style.boxShadow =
                                                    '0 22px 50px rgba(10, 35, 66, 0.14)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform =
                                                    'translateY(0)';

                                                e.currentTarget.style.boxShadow =
                                                    '0 18px 45px rgba(10, 35, 66, 0.10)';
                                            }}
                                        >
                                            {image ? (
                                                <img
                                                    src={`${axiosInstance.defaults.baseURL}/post/image/${image.filename}`}
                                                    alt={
                                                        image.orgname
                                                    }
                                                    style={{
                                                        width:
                                                            '220px',
                                                        height:
                                                            '150px',
                                                        objectFit:
                                                            'cover',
                                                        borderRadius:
                                                            '18px',
                                                        border:
                                                            '1px solid #EAF3F5',
                                                        flexShrink:
                                                            0
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width:
                                                            '220px',
                                                        height:
                                                            '150px',
                                                        borderRadius:
                                                            '18px',
                                                        background:
                                                            '#F0FAFA',
                                                        display:
                                                            'flex',
                                                        alignItems:
                                                            'center',
                                                        justifyContent:
                                                            'center',
                                                        color:
                                                            '#9BB3BE',
                                                        fontSize:
                                                            '14px',
                                                        flexShrink:
                                                            0
                                                    }}
                                                >
                                                    이미지 없음
                                                </div>
                                            )}

                                            <div
                                                style={{
                                                    flex: 1,
                                                    display:
                                                        'flex',
                                                    flexDirection:
                                                        'column',
                                                    justifyContent:
                                                        'space-between',
                                                    minWidth:
                                                        0
                                                }}
                                            >
                                                <div>
                                                    {/* 별점 */}
                                                    <div
                                                        style={{
                                                            marginBottom:
                                                                '12px',
                                                            display:
                                                                'flex',
                                                            alignItems:
                                                                'center',
                                                            gap:
                                                                '2px'
                                                        }}
                                                    >
                                                        {[
                                                            1,
                                                            2,
                                                            3,
                                                            4,
                                                            5
                                                        ].map(
                                                            star => (
                                                                <span
                                                                    key={
                                                                        star
                                                                    }
                                                                    style={{
                                                                        color:
                                                                            star <=
                                                                                item.rating
                                                                                ? '#FFD700'
                                                                                : '#D9D9D9',
                                                                        fontSize:
                                                                            '22px'
                                                                    }}
                                                                >
                                                                    ★
                                                                </span>
                                                            )
                                                        )}

                                                        <span
                                                            style={{
                                                                marginLeft:
                                                                    '8px',
                                                                color:
                                                                    '#666',
                                                                fontWeight:
                                                                    700
                                                            }}
                                                        >
                                                            {getRatingText(
                                                                item.rating
                                                            )}
                                                        </span>
                                                    </div>

                                                    <h3
                                                        style={{
                                                            margin:
                                                                '4px 0 8px',
                                                            color:
                                                                '#0A2342',
                                                            fontSize:
                                                                '22px',
                                                            fontWeight:
                                                                900
                                                        }}
                                                    >
                                                        {
                                                            item.title
                                                        }
                                                    </h3>

                                                    <p
                                                        style={{
                                                            margin:
                                                                0,
                                                            color:
                                                                '#5A7A8A',
                                                            fontSize:
                                                                '15px',
                                                            lineHeight:
                                                                '1.6',
                                                            display:
                                                                '-webkit-box',
                                                            WebkitLineClamp:
                                                                2,
                                                            WebkitBoxOrient:
                                                                'vertical',
                                                            overflow:
                                                                'hidden'
                                                        }}
                                                    >
                                                        {
                                                            item.content
                                                        }
                                                    </p>
                                                </div>

                                                <div
                                                    style={{
                                                        display:
                                                            'flex',
                                                        justifyContent:
                                                            'space-between',
                                                        alignItems:
                                                            'center',
                                                        marginTop:
                                                            '18px',
                                                        color:
                                                            '#7B97A5',
                                                        fontSize:
                                                            '14px',
                                                        gap:
                                                            '12px',
                                                        flexWrap:
                                                            'wrap'
                                                    }}
                                                >
                                                    <div>
                                                        👁{' '}
                                                        {
                                                            item.cnt
                                                        }
                                                        &nbsp;&nbsp;
                                                        👍{' '}
                                                        {
                                                            item.recom
                                                        }
                                                        &nbsp;&nbsp;
                                                        💬{' '}
                                                        {
                                                            item.replycnt
                                                        }
                                                    </div>

                                                    <div>
                                                        {item.rdate?.substring(
                                                            0,
                                                            10
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* 현재 출력 범위 */}
                        {totalElements >
                            0 && (
                                <div
                                    style={{
                                        marginTop:
                                            '28px',
                                        textAlign:
                                            'center',
                                        color:
                                            '#7B97A5',
                                        fontSize:
                                            '14px'
                                    }}
                                >
                                    {currentStart}
                                    -
                                    {currentEnd}
                                    {' / '}
                                    {totalElements}
                                </div>
                            )}

                        {/* 페이지네이션 */}
                        {totalPages >
                            1 && (
                                <div
                                    style={{
                                        display:
                                            'flex',
                                        justifyContent:
                                            'center',
                                        alignItems:
                                            'center',
                                        flexWrap:
                                            'wrap',
                                        gap: '8px',
                                        marginTop:
                                            '18px'
                                    }}
                                >
                                    <button
                                        type="button"
                                        disabled={
                                            !hasPrevious
                                        }
                                        onClick={() =>
                                            movePage(
                                                page - 1
                                            )
                                        }
                                        style={getMoveButtonStyle(
                                            hasPrevious
                                        )}
                                    >
                                        이전
                                    </button>

                                    {pageNumbers.map(
                                        pageNo => (
                                            <button
                                                type="button"
                                                key={
                                                    pageNo
                                                }
                                                onClick={() =>
                                                    movePage(
                                                        pageNo
                                                    )
                                                }
                                                style={getPageButtonStyle(
                                                    page ===
                                                    pageNo
                                                )}
                                            >
                                                {pageNo}
                                            </button>
                                        )
                                    )}

                                    <button
                                        type="button"
                                        disabled={
                                            !hasNext
                                        }
                                        onClick={() =>
                                            movePage(
                                                page + 1
                                            )
                                        }
                                        style={getMoveButtonStyle(
                                            hasNext
                                        )}
                                    >
                                        다음
                                    </button>
                                </div>
                            )}
                    </>
                )}
            </div>
        </div>
    );
}

const mapButtonStyle:
    CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '44px',
    padding: '0 18px',
    borderRadius: '13px',
    background: '#03C75A',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 800,
    textDecoration: 'none',
    boxShadow:
        '0 8px 18px rgba(3, 199, 90, 0.20)'
};

const videoToggleButtonStyle:
    CSSProperties = {
    height: '44px',
    padding: '0 18px',
    border:
        '1px solid #FF5A5F',
    borderRadius: '13px',
    background: '#FFFFFF',
    color: '#E63946',
    fontSize: '14px',
    fontWeight: 800,
    cursor: 'pointer'
};

const getSortButtonStyle = (
    active: boolean
): CSSProperties => ({
    height: '40px',
    padding: '0 16px',
    borderRadius: '12px',

    border: active
        ? '1px solid #00C9A7'
        : '1px solid #DDEFF2',

    background: active
        ? '#00C9A7'
        : '#FFFFFF',

    color: active
        ? '#FFFFFF'
        : '#5A7A8A',

    fontSize: '14px',
    fontWeight: 800,
    cursor: 'pointer',

    boxShadow: active
        ? '0 8px 18px rgba(0, 201, 167, 0.22)'
        : 'none',

    transition:
        'all .18s ease'
});

const getPageButtonStyle = (
    active: boolean
): CSSProperties => ({
    width: '42px',
    height: '42px',
    borderRadius: '12px',

    border: active
        ? '1px solid #00C9A7'
        : '1px solid #DDEFF2',

    background: active
        ? '#00C9A7'
        : '#FFFFFF',

    color: active
        ? '#FFFFFF'
        : '#0A2342',

    fontWeight: 800,
    cursor: 'pointer',

    boxShadow: active
        ? '0 8px 18px rgba(0, 201, 167, 0.22)'
        : 'none'
});

const getMoveButtonStyle = (
    enabled: boolean
): CSSProperties => ({
    minWidth: '74px',
    height: '42px',
    padding: '0 14px',
    borderRadius: '12px',
    border:
        '1px solid #DDEFF2',

    background: enabled
        ? '#FFFFFF'
        : '#F1F5F6',

    color: enabled
        ? '#0A2342'
        : '#A8B8C0',

    fontWeight: 800,

    cursor: enabled
        ? 'pointer'
        : 'not-allowed'
});

export default Post;