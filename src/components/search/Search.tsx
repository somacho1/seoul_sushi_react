import {
    useEffect,
    useState,
    type FormEvent
} from "react";

import {
    useNavigate,
    useSearchParams
} from "react-router-dom";

import {
    axiosInstance
} from "../Tool";

import RestaurantSearchCard
    from "./RestaurantSearchCard";

import ReviewSearchCard
    from "./ReviewSearchCard";

import type {
    Content,
    ContentImage,
    ContentImageMap,
    ImageLoadedMap,
    Post,
    SearchTab
} from "./searchTypes";

import "./Search.css";

function Search() {
    const navigate =
        useNavigate();

    const [searchParams] =
        useSearchParams();

    const word =
        searchParams
            .get("word")
            ?.trim()
        ?? "";

    const [
        inputWord,
        setInputWord
    ] = useState(word);

    const [
        contents,
        setContents
    ] = useState<Content[]>([]);

    const [
        posts,
        setPosts
    ] = useState<Post[]>([]);

    const [
        contentImageMap,
        setContentImageMap
    ] = useState<ContentImageMap>({});

    const [
        imageLoadedMap,
        setImageLoadedMap
    ] = useState<ImageLoadedMap>({});

    const [
        activeTab,
        setActiveTab
    ] = useState<SearchTab>("all");

    const [
        loading,
        setLoading
    ] = useState(false);

    const [
        error,
        setError
    ] = useState(false);

    const popularKeywords = [
        "강남구",
        "숙성회",
        "시마아지",
        "오마카세",
        "데이트"
    ];

    const totalCount =
        contents.length
        + posts.length;

    const showRestaurants =
        activeTab === "all"
        || activeTab === "restaurant";

    const showReviews =
        activeTab === "all"
        || activeTab === "review";

    /**
     * URL 검색어가 바뀌면
     * 입력창과 탭 초기화
     */
    useEffect(() => {
        setInputWord(word);
        setActiveTab("all");
    }, [word]);

    /**
     * 통합검색 및 이미지 조회
     */
    useEffect(() => {
        const controller =
            new AbortController();

        let cancelled = false;

        const search = async () => {
            if (word === "") {
                setContents([]);
                setPosts([]);
                setContentImageMap({});
                setImageLoadedMap({});
                setLoading(false);
                setError(false);

                return;
            }

            setLoading(true);
            setError(false);
            setContentImageMap({});
            setImageLoadedMap({});

            try {
                const [
                    contentResult,
                    postResult
                ] = await Promise.all([
                    axiosInstance.get<Content[]>(
                        "/content/search",
                        {
                            params: {
                                word
                            },
                            signal:
                                controller.signal
                        }
                    ),

                    axiosInstance.get<Post[]>(
                        "/post/search",
                        {
                            params: {
                                word
                            },
                            signal:
                                controller.signal
                        }
                    )
                ]);

                if (cancelled) {
                    return;
                }

                const contentList =
                    Array.isArray(
                        contentResult.data
                    )
                        ? contentResult.data
                        : [];

                const postList =
                    Array.isArray(
                        postResult.data
                    )
                        ? postResult.data
                        : [];

                setContents(contentList);
                setPosts(postList);
                setLoading(false);

                /**
                 * 각 맛집 이미지 조회
                 */
                contentList.forEach(
                    async content => {
                        try {
                            const imageResult =
                                await axiosInstance
                                    .get<ContentImage[]>(
                                        `/content_image/list/${content.contentno}`,
                                        {
                                            signal:
                                                controller.signal
                                        }
                                    );

                            if (cancelled) {
                                return;
                            }

                            const images =
                                Array.isArray(
                                    imageResult.data
                                )
                                    ? imageResult.data
                                    : [];

                            /**
                             * 대표 이미지 우선,
                             * 없으면 첫 이미지
                             */
                            const mainImage =
                                images.find(
                                    image =>
                                        image.main_yn
                                        === "Y"
                                )
                                ?? images[0]
                                ?? null;

                            setContentImageMap(
                                previous => ({
                                    ...previous,
                                    [content.contentno]:
                                        mainImage
                                })
                            );

                            setImageLoadedMap(
                                previous => ({
                                    ...previous,
                                    [content.contentno]:
                                        true
                                })
                            );
                        } catch (
                        imageError
                        ) {
                            const code =
                                (
                                    imageError as {
                                        code?: string;
                                    }
                                ).code;

                            if (
                                code
                                === "ERR_CANCELED"
                            ) {
                                return;
                            }

                            console.error(
                                `${content.contentno}번 맛집 이미지 조회 실패:`,
                                imageError
                            );

                            setContentImageMap(
                                previous => ({
                                    ...previous,
                                    [content.contentno]:
                                        null
                                })
                            );

                            setImageLoadedMap(
                                previous => ({
                                    ...previous,
                                    [content.contentno]:
                                        true
                                })
                            );
                        }
                    }
                );
            } catch (
            searchError
            ) {
                const code =
                    (
                        searchError as {
                            code?: string;
                        }
                    ).code;

                if (
                    code
                    === "ERR_CANCELED"
                ) {
                    return;
                }

                console.error(
                    "통합 검색 실패:",
                    searchError
                );

                if (!cancelled) {
                    setContents([]);
                    setPosts([]);
                    setContentImageMap({});
                    setImageLoadedMap({});
                    setError(true);
                    setLoading(false);
                }
            }
        };

        search();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [word]);

    /**
     * 검색 실행
     */
    const submitSearch = (
        event:
            FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const trimmedWord =
            inputWord.trim();

        if (trimmedWord === "") {
            alert(
                "검색어를 입력하세요."
            );

            return;
        }

        navigate(
            `/search?word=${encodeURIComponent(
                trimmedWord
            )}`
        );
    };

    /**
     * 인기 검색어 실행
     */
    const searchKeyword = (
        keyword: string
    ) => {
        setInputWord(keyword);

        navigate(
            `/search?word=${encodeURIComponent(
                keyword
            )}`
        );
    };

    return (
        <main className="search-page">
            <div className="search-container">
                {/* 상단 검색 */}
                <section className="search-hero">
                    <span className="search-eyebrow">
                        SEARCH
                    </span>

                    <h1 className="search-page-title">
                        서울 숙성회 통합검색
                    </h1>

                    <p className="search-page-description">
                        지역, 맛집명, 대표 메뉴,
                        리뷰 내용을 한 번에
                        검색해보세요.
                    </p>

                    <form
                        className="search-form"
                        onSubmit={submitSearch}
                    >
                        <div className="search-input-wrap">
                            <span
                                className="search-icon"
                                aria-hidden="true"
                            >
                                🔍
                            </span>

                            <input
                                type="text"
                                value={inputWord}
                                placeholder="맛집, 메뉴, 지역, 리뷰를 검색하세요"
                                autoComplete="off"
                                onChange={event =>
                                    setInputWord(
                                        event.target
                                            .value
                                    )
                                }
                            />

                            {inputWord !== "" && (
                                <button
                                    type="button"
                                    className="search-clear-btn"
                                    aria-label="검색어 지우기"
                                    onClick={() =>
                                        setInputWord("")
                                    }
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="search-submit-btn"
                        >
                            검색
                        </button>
                    </form>

                    <div className="popular-keywords">
                        <span className="popular-label">
                            인기 검색어
                        </span>

                        <div className="keyword-list">
                            {popularKeywords.map(
                                keyword => (
                                    <button
                                        type="button"
                                        key={keyword}
                                        onClick={() =>
                                            searchKeyword(
                                                keyword
                                            )
                                        }
                                    >
                                        #{keyword}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </section>

                {/* 결과 요약 */}
                {word !== "" && (
                    <>
                        <section className="search-summary">
                            <div>
                                <span className="summary-label">
                                    검색 결과
                                </span>

                                <h2>
                                    “{word}”
                                </h2>
                            </div>

                            <div className="summary-count">
                                총{" "}
                                <strong>
                                    {totalCount}
                                </strong>
                                건
                            </div>
                        </section>

                        {/* 검색 결과 필터 */}
                        <div className="search-tabs">
                            <button
                                type="button"
                                className={
                                    activeTab === "all"
                                        ? "search-tab active"
                                        : "search-tab"
                                }
                                onClick={() =>
                                    setActiveTab(
                                        "all"
                                    )
                                }
                            >
                                전체
                                <span>
                                    {totalCount}
                                </span>
                            </button>

                            <button
                                type="button"
                                className={
                                    activeTab
                                        === "restaurant"
                                        ? "search-tab active"
                                        : "search-tab"
                                }
                                onClick={() =>
                                    setActiveTab(
                                        "restaurant"
                                    )
                                }
                            >
                                맛집
                                <span>
                                    {contents.length}
                                </span>
                            </button>

                            <button
                                type="button"
                                className={
                                    activeTab === "review"
                                        ? "search-tab active"
                                        : "search-tab"
                                }
                                onClick={() =>
                                    setActiveTab(
                                        "review"
                                    )
                                }
                            >
                                리뷰
                                <span>
                                    {posts.length}
                                </span>
                            </button>
                        </div>
                    </>
                )}

                {/* 로딩 */}
                {loading && (
                    <div className="search-state-card">
                        <div className="search-spinner" />

                        <strong>
                            검색 결과를
                            불러오는 중입니다.
                        </strong>
                    </div>
                )}

                {/* 오류 */}
                {!loading
                    && error && (
                        <div className="search-state-card error">
                            <strong>
                                검색 중 오류가
                                발생했습니다.
                            </strong>

                            <span>
                                잠시 후 다시
                                시도해주세요.
                            </span>
                        </div>
                    )}

                {/* 검색어 없음 */}
                {!loading
                    && !error
                    && word === "" && (
                        <div className="search-state-card">
                            <strong>
                                검색어를 입력해주세요.
                            </strong>

                            <span>
                                지역, 메뉴, 맛집명,
                                리뷰 내용을 검색할 수
                                있습니다.
                            </span>
                        </div>
                    )}

                {/* 결과 없음 */}
                {!loading
                    && !error
                    && word !== ""
                    && totalCount === 0 && (
                        <div className="search-state-card empty">
                            <div className="empty-icon">
                                🔎
                            </div>

                            <strong>
                                검색 결과가 없습니다.
                            </strong>

                            <span>
                                다른 검색어로 다시
                                시도해보세요.
                            </span>
                        </div>
                    )}

                {/* 검색 결과 */}
                {!loading
                    && !error
                    && totalCount > 0 && (
                        <>
                            {showRestaurants && (
                                <section className="search-section">
                                    <div className="section-heading">
                                        <div>
                                            <span className="section-kicker">
                                                RESTAURANT
                                            </span>

                                            <h2>
                                                맛집
                                            </h2>
                                        </div>

                                        <span className="section-count">
                                            {contents.length}건
                                        </span>
                                    </div>

                                    {contents.length === 0 ? (
                                        <div className="search-empty">
                                            검색된 맛집이
                                            없습니다.
                                        </div>
                                    ) : (
                                        <div className="restaurant-results">
                                            {contents.map(
                                                content => (
                                                    <RestaurantSearchCard
                                                        key={
                                                            content.contentno
                                                        }
                                                        content={
                                                            content
                                                        }
                                                        contentImage={
                                                            contentImageMap[
                                                            content.contentno
                                                            ]
                                                            ?? null
                                                        }
                                                        imageLoaded={
                                                            imageLoadedMap[
                                                            content.contentno
                                                            ]
                                                            ?? false
                                                        }
                                                        keyword={
                                                            word
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>
                                    )}
                                </section>
                            )}

                            {showReviews && (
                                <section className="search-section review-section">
                                    <div className="section-heading">
                                        <div>
                                            <span className="section-kicker">
                                                REVIEW
                                            </span>

                                            <h2>
                                                리뷰
                                            </h2>
                                        </div>

                                        <span className="section-count">
                                            {posts.length}건
                                        </span>
                                    </div>

                                    {posts.length === 0 ? (
                                        <div className="search-empty">
                                            검색된 리뷰가
                                            없습니다.
                                        </div>
                                    ) : (
                                        <div className="review-results">
                                            {posts.map(
                                                post => (
                                                    <ReviewSearchCard
                                                        key={
                                                            post.postno
                                                        }
                                                        post={
                                                            post
                                                        }
                                                        keyword={
                                                            word
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>
                                    )}
                                </section>
                            )}
                        </>
                    )}
            </div>
        </main>
    );
}

export default Search;