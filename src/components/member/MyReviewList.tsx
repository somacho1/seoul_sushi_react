import {
    useEffect,
    useState
} from 'react';

import {
    Link,
    useNavigate
} from 'react-router-dom';

import { axiosInstance } from '../Tool';
import { useGlobalStore } from '../../store/store';

import './MyReplyList.css';

/**
 * 백엔드에서 전달받는 댓글 데이터 구조
 */
interface MyReply {
    replyno: number;
    postno: number;
    memberno: number;
    content: string;
    visible: string;
    rdate: string;
}

/**
 * 내가 작성한 댓글 목록 페이지
 */
function MyReplyList() {
    const navigate = useNavigate();

    /**
     * 전역 로그인 정보
     */
    const {
        login,
        memberno,
        id
    } = useGlobalStore();

    /**
     * 내가 작성한 댓글 목록
     */
    const [
        replies,
        setReplies
    ] = useState<MyReply[]>([]);

    /**
     * 댓글 목록 조회 중 여부
     */
    const [
        loading,
        setLoading
    ] = useState(true);

    /**
     * 댓글 목록 조회 실패 여부
     */
    const [
        error,
        setError
    ] = useState(false);


    /**
     * 현재 페이지 번호
     *
     * 내가 쓴 댓글은 한 페이지에 5개씩 표시한다.
     */
    const [
        currentPage,
        setCurrentPage
    ] = useState(1);

    /** 한 페이지에 표시할 댓글 개수 */
    const PAGE_SIZE = 5;

    /**
     * 댓글 삭제 처리 중인 댓글번호
     *
     * null이면 삭제 처리 중인 댓글이 없음
     */
    const [
        deletingReplyno,
        setDeletingReplyno
    ] = useState<number | null>(null);

    /**
     * 페이지 진입 또는 로그인 정보 변경 시
     * 내가 작성한 댓글 목록 재조회
     */
    useEffect(() => {
        loadMyReplies();
    }, [
        login,
        memberno
    ]);


    /**
     * 댓글 삭제 등으로 전체 개수가 줄었을 때
     * 현재 페이지가 범위를 벗어나지 않도록 보정한다.
     */
    useEffect(() => {
        const totalPages = Math.max(
            1,
            Math.ceil(replies.length / PAGE_SIZE)
        );

        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [replies.length, currentPage]);

    /**
     * 내가 작성한 댓글 목록 조회
     *
     * API:
     * GET /reply/list/member/{memberno}
     */
    const loadMyReplies =
        async () => {
            /**
             * 비로그인 상태이거나
             * 회원번호가 올바르지 않으면 요청하지 않음
             */
            if (
                !login
                || memberno == null
                || Number(memberno) <= 0
            ) {
                setReplies([]);
                setLoading(false);

                return;
            }

            try {
                setLoading(true);
                setError(false);

                const response =
                    await axiosInstance.get<
                        MyReply[]
                    >(
                        `/reply/list/member/${Number(memberno)}`
                    );

                const replyList =
                    Array.isArray(
                        response.data
                    )
                        ? response.data
                        : [];

                setReplies(
                    replyList
                );
                setCurrentPage(1);
            } catch (loadError) {
                console.error(
                    '내가 작성한 댓글 조회 실패:',
                    loadError
                );

                setReplies([]);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

    /**
     * 댓글 삭제
     *
     * API:
     * DELETE /reply/{replyno}
     *
     * 기존 ReplyCont의 댓글 삭제 API를 그대로 사용한다.
     */
    const deleteReply =
        async (
            replyno: number
        ) => {
            if (
                !window.confirm(
                    '이 댓글을 삭제할까요?'
                )
            ) {
                return;
            }

            /**
             * 이미 다른 댓글 삭제 요청이 처리 중이면
             * 중복 요청을 보내지 않음
             */
            if (
                deletingReplyno !== null
            ) {
                return;
            }

            try {
                setDeletingReplyno(
                    replyno
                );

                await axiosInstance.delete(
                    `/reply/${replyno}`
                );

                /**
                 * 삭제 성공 후 화면 목록에서도 제거
                 */
                setReplies(
                    previous =>
                        previous.filter(
                            reply =>
                                reply.replyno
                                !== replyno
                        )
                );

                alert(
                    '댓글을 삭제했습니다.'
                );
            } catch (deleteError) {
                console.error(
                    '댓글 삭제 실패:',
                    deleteError
                );

                alert(
                    '댓글 삭제에 실패했습니다.'
                );
            } finally {
                setDeletingReplyno(
                    null
                );
            }
        };

    /**
     * 댓글 공개 상태 표시
     */
    const getVisibleLabel = (
        visible: string
    ) => {
        return visible === 'Y'
            ? '공개'
            : '비공개';
    };

    /**
     * 댓글 내용 미리보기
     *
     * 목록 화면에서 댓글이 너무 길어지는 것을 방지한다.
     */
    const getContentPreview = (
        content: string
    ) => {
        if (
            !content
            || content.trim() === ''
        ) {
            return '작성된 댓글 내용이 없습니다.';
        }

        const normalizedContent =
            content
                .replace(
                    /\s+/g,
                    ' '
                )
                .trim();

        if (
            normalizedContent.length
            <= 180
        ) {
            return normalizedContent;
        }

        return `${normalizedContent.substring(
            0,
            180
        )}...`;
    };

    /** 전체 페이지 수 */
    const totalPages = Math.max(
        1,
        Math.ceil(replies.length / PAGE_SIZE)
    );

    /** 현재 페이지에서 보여줄 댓글만 잘라낸다. */
    const pagedReplies = replies.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    /** 페이지 번호 버튼 목록 */
    const pageNumbers = Array.from(
        { length: totalPages },
        (_, index) => index + 1
    );

    /**
     * 비로그인 상태
     */
    if (
        !login
        || memberno == null
        || Number(memberno) <= 0
    ) {
        return (
            <main className="my-reply-page">
                <div className="my-reply-container">
                    <section className="my-reply-login-required">
                        <div className="my-reply-login-icon">
                            💬
                        </div>

                        <h1>
                            로그인이 필요합니다
                        </h1>

                        <p>
                            내가 작성한 댓글은 로그인한
                            회원만 확인할 수 있습니다.
                        </p>

                        <button
                            type="button"
                            className="my-reply-primary-button"
                            onClick={() => {
                                navigate(
                                    '/member/login'
                                );
                            }}
                        >
                            로그인하기
                        </button>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className="my-reply-page">
            <div className="my-reply-container">
                {/* 페이지 제목 */}
                <header className="my-reply-header">
                    <div>
                        <span className="my-reply-eyebrow">
                            MY REPLY
                        </span>

                        <h1>
                            내가 쓴 댓글
                        </h1>

                        <p>
                            {id}님이 작성한 댓글을
                            확인하고 관리할 수 있습니다.
                        </p>
                    </div>

                    <Link
                        to="/member/mypage"
                        className="my-reply-back-button"
                    >
                        ← 마이페이지
                    </Link>
                </header>

                {/* 댓글 개수 요약 */}
                <section className="my-reply-summary-card">
                    <div className="my-reply-summary-icon">
                        💬
                    </div>

                    <div>
                        <span>
                            작성한 댓글
                        </span>

                        <strong>
                            {replies.length}개
                        </strong>
                    </div>
                </section>

                {loading ? (
                    /**
                     * 조회 중
                     */
                    <section className="my-reply-state-box">
                        <div className="my-reply-spinner" />

                        <strong>
                            내가 작성한 댓글을
                            불러오고 있습니다.
                        </strong>
                    </section>
                ) : error ? (
                    /**
                     * 조회 실패
                     */
                    <section className="my-reply-state-box">
                        <div className="my-reply-state-icon">
                            !
                        </div>

                        <strong>
                            댓글 목록을 불러오지
                            못했습니다.
                        </strong>

                        <p>
                            잠시 후 다시 시도해주세요.
                        </p>

                        <button
                            type="button"
                            className="my-reply-primary-button"
                            onClick={
                                loadMyReplies
                            }
                        >
                            다시 불러오기
                        </button>
                    </section>
                ) : replies.length === 0 ? (
                    /**
                     * 작성한 댓글 없음
                     */
                    <section className="my-reply-state-box">
                        <div className="my-reply-state-icon">
                            💬
                        </div>

                        <strong>
                            아직 작성한 댓글이 없습니다.
                        </strong>

                        <p>
                            다른 회원의 리뷰에 댓글을
                            남겨 의견을 나눠보세요.
                        </p>

                        <Link
                            to="/"
                            className="my-reply-primary-link"
                        >
                            맛집 둘러보기
                        </Link>
                    </section>
                ) : (
                    /**
                     * 댓글 목록
                     */
                    <section className="my-reply-list">
                        {pagedReplies.map(
                            reply => (
                                <article
                                    key={
                                        reply.replyno
                                    }
                                    className="my-reply-card"
                                >
                                    {/* 카드 상단 */}
                                    <div className="my-reply-card-header">
                                        <div className="my-reply-title-area">
                                            <span className="my-reply-number">
                                                댓글 #
                                                {reply.replyno}
                                            </span>

                                            <h2>
                                                게시글에 작성한 댓글
                                            </h2>
                                        </div>

                                        <span
                                            className={
                                                reply.visible
                                                    === 'Y'
                                                    ? 'my-reply-visible public'
                                                    : 'my-reply-visible private'
                                            }
                                        >
                                            {getVisibleLabel(
                                                reply.visible
                                            )}
                                        </span>
                                    </div>

                                    {/* 댓글 내용 */}
                                    <p className="my-reply-content">
                                        {getContentPreview(
                                            reply.content
                                        )}
                                    </p>

                                    {/* 댓글 부가정보 */}
                                    <div className="my-reply-meta-grid">
                                        <div>
                                            <span>
                                                게시글 번호
                                            </span>

                                            <strong>
                                                {reply.postno}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                작성일
                                            </span>

                                            <strong>
                                                {reply.rdate}
                                            </strong>
                                        </div>
                                    </div>

                                    {/* 하단 버튼 */}
                                    <div className="my-reply-card-buttons">
                                        {/*
                                         * 댓글이 작성된 게시글 상세로 이동
                                         *
                                         * 현재 백엔드에는
                                         * GET /post/{postno}가 존재하지만,
                                         * 프론트 라우터 주소는 프로젝트 설정에 따라
                                         * 다를 수 있다.
                                         *
                                         * 현재는 일반적으로 사용하는
                                         * /post/read/{postno}로 작성했다.
                                         * 실제 라우터가 다르면 이 주소만 수정하면 된다.
                                         */}
                                        <Link
                                            to={
                                                `/post/read/${reply.postno}`
                                            }
                                            className="my-reply-detail-button"
                                        >
                                            게시글 보기
                                        </Link>

                                        <button
                                            type="button"
                                            className="my-reply-delete-button"
                                            disabled={
                                                deletingReplyno
                                                === reply.replyno
                                            }
                                            onClick={() => {
                                                deleteReply(
                                                    reply.replyno
                                                );
                                            }}
                                        >
                                            {deletingReplyno
                                                === reply.replyno
                                                ? '삭제 중'
                                                : '댓글 삭제'}
                                        </button>
                                    </div>
                                </article>
                            )
                        )}
                    </section>
                )}

                {!loading && !error && replies.length > 0 && totalPages > 1 && (
                    <nav
                        className="my-reply-pagination"
                        aria-label="내 댓글 페이지 이동"
                    >
                        <button
                            type="button"
                            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                        >
                            이전
                        </button>

                        {pageNumbers.map(page => (
                            <button
                                key={page}
                                type="button"
                                className={currentPage === page ? 'active' : ''}
                                onClick={() => setCurrentPage(page)}
                                aria-current={currentPage === page ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                            disabled={currentPage === totalPages}
                        >
                            다음
                        </button>
                    </nav>
                )}

                {/* 페이지 하단 이동 */}
                <section className="my-reply-footer">
                    <div>
                        <span>
                            MY ACTIVITY
                        </span>

                        <h2>
                            다른 활동도 확인해보세요
                        </h2>
                    </div>

                    <div className="my-reply-footer-buttons">
                        <Link
                            to="/member/my-reviews"
                            className="my-reply-footer-secondary"
                        >
                            내가 쓴 리뷰
                        </Link>

                        <Link
                            to="/favorite/list"
                            className="my-reply-footer-secondary"
                        >
                            내 즐겨찾기
                        </Link>

                        <Link
                            to="/member/mypage"
                            className="my-reply-footer-primary"
                        >
                            마이페이지
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default MyReplyList;