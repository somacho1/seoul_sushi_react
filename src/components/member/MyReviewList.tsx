import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../Tool';
import { useGlobalStore } from '../../store/store';
import './MyReviewList.css';

/** 백엔드에서 전달받는 리뷰 데이터 */
interface MyReview {
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

/** 한 페이지에 표시할 리뷰 개수 */
const PAGE_SIZE = 5;

/** 내가 작성한 리뷰 목록 */
function MyReviewList() {
    const navigate = useNavigate();
    const { login, memberno, id } = useGlobalStore();

    const [reviews, setReviews] = useState<MyReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    /**
     * 로그인한 회원이 작성한 리뷰 조회
     * GET /post/list/member/{memberno}
     */
    const loadMyReviews = useCallback(async () => {
        if (!login || Number(memberno) <= 0) {
            setReviews([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(false);

            const response = await axiosInstance.get<MyReview[]>(
                `/post/list/member/${Number(memberno)}`
            );

            setReviews(Array.isArray(response.data) ? response.data : []);
            setCurrentPage(1);
        } catch (loadError) {
            console.error('내가 작성한 리뷰 조회 실패:', loadError);
            setReviews([]);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [login, memberno]);

    /** 로그인 정보가 변경되면 리뷰 목록 재조회 */
    useEffect(() => {
        loadMyReviews();
    }, [loadMyReviews]);

    /** 리뷰 삭제 등으로 페이지 수가 줄었을 때 현재 페이지 보정 */
    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));

        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [reviews.length, currentPage]);

    /** 리뷰 내용이 길면 목록에서는 일부만 표시 */
    const getContentPreview = (content: string) => {
        if (!content || content.trim() === '') {
            return '작성된 리뷰 내용이 없습니다.';
        }

        const normalizedContent = content.replace(/\s+/g, ' ').trim();

        return normalizedContent.length <= 180
            ? normalizedContent
            : `${normalizedContent.substring(0, 180)}...`;
    };

    /** 공개 상태 문구 */
    const getVisibleLabel = (visible: string) => {
        return visible === 'Y' ? '공개' : '비공개';
    };

    /** 별점 값을 0~5 범위로 제한 */
    const getRating = (rating: number) => {
        const normalizedRating = Number(rating);

        if (Number.isNaN(normalizedRating)) {
            return 0;
        }

        return Math.min(5, Math.max(0, normalizedRating));
    };

    const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
    const pagedReviews = reviews.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    /** 비로그인 상태 */
    if (!login || Number(memberno) <= 0) {
        return (
            <main className="my-review-page">
                <div className="my-review-container">
                    <section className="my-review-login-required">
                        <div className="my-review-login-icon">✍️</div>
                        <h1>로그인이 필요합니다</h1>
                        <p>내가 작성한 리뷰는 로그인한 회원만 확인할 수 있습니다.</p>

                        <button
                            type="button"
                            className="my-review-primary-button"
                            onClick={() => navigate('/member/login')}
                        >
                            로그인하기
                        </button>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className="my-review-page">
            <div className="my-review-container">
                {/* 페이지 제목 */}
                <header className="my-review-header">
                    <div>
                        <span className="my-review-eyebrow">MY REVIEW</span>
                        <h1>내가 쓴 리뷰</h1>
                        <p>{id}님이 작성한 숙성회 맛집 리뷰를 확인하고 관리할 수 있습니다.</p>
                    </div>

                    <Link to="/member/mypage" className="my-review-back-button">
                        ← 마이페이지
                    </Link>
                </header>

                {/* 작성한 리뷰 개수 */}
                <section className="my-review-summary-card">
                    <div className="my-review-summary-icon">✍️</div>
                    <div>
                        <span>작성한 리뷰</span>
                        <strong>{reviews.length}개</strong>
                    </div>
                </section>

                {loading ? (
                    <section className="my-review-state-box">
                        <div className="my-review-spinner" />
                        <strong>내가 작성한 리뷰를 불러오고 있습니다.</strong>
                    </section>
                ) : error ? (
                    <section className="my-review-state-box">
                        <div className="my-review-state-icon">!</div>
                        <strong>리뷰 목록을 불러오지 못했습니다.</strong>
                        <p>잠시 후 다시 시도해주세요.</p>

                        <button
                            type="button"
                            className="my-review-primary-button"
                            onClick={loadMyReviews}
                        >
                            다시 불러오기
                        </button>
                    </section>
                ) : reviews.length === 0 ? (
                    <section className="my-review-state-box">
                        <div className="my-review-state-icon">✍️</div>
                        <strong>아직 작성한 리뷰가 없습니다.</strong>
                        <p>방문한 숙성회 맛집의 리뷰를 작성해보세요.</p>

                        <Link to="/" className="my-review-primary-link">
                            맛집 둘러보기
                        </Link>
                    </section>
                ) : (
                    <>
                        {/* 리뷰 목록 */}
                        <section className="my-review-list">
                            {pagedReviews.map(review => {
                                const rating = getRating(review.rating);

                                return (
                                    <article key={review.postno} className="my-review-card">
                                        <div className="my-review-card-header">
                                            <div className="my-review-card-title-area">
                                                {/* 별점 */}
                                                <div className="my-review-rating-row">
                                                    <div
                                                        className="my-review-stars"
                                                        aria-label={`별점 ${rating}점`}
                                                    >
                                                        <span className="my-review-stars-background">
                                                            ★★★★★
                                                        </span>

                                                        <span
                                                            className="my-review-stars-foreground"
                                                            style={{ width: `${(rating / 5) * 100}%` }}
                                                        >
                                                            ★★★★★
                                                        </span>
                                                    </div>

                                                    <span className="my-review-rating-score">
                                                        {rating.toFixed(1)}
                                                    </span>
                                                </div>

                                                <h2>{review.title}</h2>
                                            </div>

                                            <span
                                                className={
                                                    review.visible === 'Y'
                                                        ? 'my-review-visible public'
                                                        : 'my-review-visible private'
                                                }
                                            >
                                                {getVisibleLabel(review.visible)}
                                            </span>
                                        </div>

                                        {/* 리뷰 내용 */}
                                        <p className="my-review-content">
                                            {getContentPreview(review.content)}
                                        </p>

                                        {/* 검색어 */}
                                        {review.word && (
                                            <div className="my-review-keyword">
                                                <span>#</span>
                                                {review.word}
                                            </div>
                                        )}

                                        {/* 리뷰 통계 */}
                                        <div className="my-review-stat-grid">
                                            <div>
                                                <span>조회수</span>
                                                <strong>{review.cnt}</strong>
                                            </div>

                                            <div>
                                                <span>추천수</span>
                                                <strong>{review.recom}</strong>
                                            </div>

                                            <div>
                                                <span>댓글 수</span>
                                                <strong>{review.replycnt}</strong>
                                            </div>

                                            <div>
                                                <span>작성일</span>
                                                <strong>{review.rdate?.substring(0, 10)}</strong>
                                            </div>
                                        </div>

                                        {/* 상세 및 수정 이동 */}
                                        <div className="my-review-card-buttons">
                                            <Link
                                                to={`/post/read/${review.postno}`}
                                                className="my-review-detail-button"
                                            >
                                                상세보기
                                            </Link>

                                            <Link
                                                to={`/post/update/${review.postno}`}
                                                className="my-review-update-button"
                                            >
                                                수정하기
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <nav
                                className="my-review-pagination"
                                aria-label="내 리뷰 페이지 이동"
                            >
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                                >
                                    이전
                                </button>

                                {pageNumbers.map(page => (
                                    <button
                                        key={page}
                                        type="button"
                                        className={currentPage === page ? 'active' : ''}
                                        aria-current={currentPage === page ? 'page' : undefined}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage(page => Math.min(totalPages, page + 1))
                                    }
                                >
                                    다음
                                </button>
                            </nav>
                        )}
                    </>
                )}

                {/* 다른 활동으로 이동 */}
                <section className="my-review-footer">
                    <div>
                        <span>MY ACTIVITY</span>
                        <h2>다른 활동도 확인해보세요</h2>
                    </div>

                    <div className="my-review-footer-buttons">
                        <Link
                            to="/member/my-replies"
                            className="my-review-footer-secondary"
                        >
                            내가 쓴 댓글
                        </Link>

                        <Link
                            to="/favorite/list"
                            className="my-review-footer-secondary"
                        >
                            내 즐겨찾기
                        </Link>

                        <Link to="/member/mypage" className="my-review-footer-primary">
                            마이페이지
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default MyReviewList;