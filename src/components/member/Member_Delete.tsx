import {
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent
} from 'react';

import {
    Link,
    useNavigate,
    useParams
} from 'react-router-dom';

import {
    axiosInstance
} from '../Tool';

import {
    useGlobalStore
} from '../../store/store';

import './Member_Delete.css';

/**
 * 백엔드에서 조회하는 회원정보 구조
 */
interface MemberInfo {
    memberno: number;
    id: string;
    mname: string;
    joindate: string;
    birth: string | null;
    email: string | null;
    phone: string | null;
    grade: number;
    status: string | null;
}

/**
 * 회원탈퇴 페이지
 */
const Member_Delete = () => {
    const navigate =
        useNavigate();

    /**
     * 주소에 포함된 회원번호
     *
     * 예:
     * /member/delete/5
     */
    const {
        memberno: routeMemberno
    } = useParams();

    /**
     * 전역 로그인 정보
     */
    const {
        login,
        memberno: loginMemberno,
        id: loginId,
        resetUser
    } = useGlobalStore();

    /**
     * 조회한 회원정보
     */
    const [
        member,
        setMember
    ] = useState<MemberInfo | null>(
        null
    );

    /**
     * 회원정보 조회 중 여부
     */
    const [
        loading,
        setLoading
    ] = useState(true);

    /**
     * 회원정보 조회 오류
     */
    const [
        error,
        setError
    ] = useState('');

    /**
     * 주의사항 확인 체크박스
     */
    const [
        agreed,
        setAgreed
    ] = useState(false);

    /**
     * 사용자가 입력한 탈퇴 확인 문구
     */
    const [
        confirmText,
        setConfirmText
    ] = useState('');

    /**
     * 탈퇴 요청 처리 중 여부
     */
    const [
        deleting,
        setDeleting
    ] = useState(false);

    /**
     * 화면 메시지
     */
    const [
        message,
        setMessage
    ] = useState('');

    /**
     * 주소 회원번호를 숫자로 변환
     */
    const targetMemberno =
        Number(routeMemberno);

    /**
     * 로그인한 회원 본인 여부
     */
    const isMyAccount =
        Number(loginMemberno)
        === targetMemberno;

    /**
     * 탈퇴 확인 문구
     */
    const requiredConfirmText =
        '회원탈퇴';

    /**
     * 탈퇴 버튼 활성화 여부
     */
    const canDelete =
        agreed
        && confirmText.trim()
        === requiredConfirmText
        && !deleting;

    /**
     * 회원정보 조회
     *
     * API:
     * GET /member/read/{memberno}
     */
    useEffect(() => {
        /**
         * 비로그인 상태
         */
        if (!login) {
            setLoading(false);

            return;
        }

        /**
         * 잘못된 회원번호
         */
        if (
            !routeMemberno
            || Number.isNaN(
                targetMemberno
            )
            || targetMemberno <= 0
        ) {
            setError(
                '잘못된 회원탈퇴 주소입니다.'
            );

            setLoading(false);

            return;
        }

        /**
         * 다른 회원의 탈퇴 주소로 접근한 경우
         */
        if (!isMyAccount) {
            setError(
                '본인의 계정만 탈퇴할 수 있습니다.'
            );

            setLoading(false);

            return;
        }

        const loadMember =
            async () => {
                try {
                    setLoading(true);
                    setError('');

                    const response =
                        await axiosInstance.get<MemberInfo>(
                            `/member/read/${targetMemberno}`
                        );

                    setMember(
                        response.data
                    );
                } catch (loadError) {
                    console.error(
                        '회원정보 조회 실패:',
                        loadError
                    );

                    setError(
                        '회원정보를 불러오지 못했습니다.'
                    );
                } finally {
                    setLoading(false);
                }
            };

        loadMember();
    }, [
        login,
        routeMemberno,
        targetMemberno,
        isMyAccount
    ]);

    /**
     * 탈퇴 확인 문구 입력
     */
    const onConfirmTextChange = (
        event:
            ChangeEvent<HTMLInputElement>
    ) => {
        setConfirmText(
            event.target.value
        );

        setMessage('');
    };

    /**
     * 회원탈퇴 요청
     *
     * API:
     * DELETE /member/delete/{memberno}
     */
    const deleteMember =
        async (
            event:
                FormEvent<HTMLFormElement>
        ) => {
            event.preventDefault();

            /**
             * 로그인 검사
             */
            if (!login) {
                setMessage(
                    '로그인이 필요합니다.'
                );

                return;
            }

            /**
             * 본인 계정 검사
             */
            if (!isMyAccount) {
                setMessage(
                    '본인의 계정만 탈퇴할 수 있습니다.'
                );

                return;
            }

            /**
             * 주의사항 동의 검사
             */
            if (!agreed) {
                setMessage(
                    '회원탈퇴 주의사항을 확인해주세요.'
                );

                return;
            }

            /**
             * 확인 문구 검사
             */
            if (
                confirmText.trim()
                !== requiredConfirmText
            ) {
                setMessage(
                    '"회원탈퇴"를 정확히 입력해주세요.'
                );

                return;
            }

            /**
             * 중복 요청 방지
             */
            if (deleting) {
                return;
            }

            /**
             * 최종 확인
             */
            const confirmed =
                window.confirm(
                    '정말 회원탈퇴를 진행하시겠습니까?\n'
                    + '탈퇴한 계정은 복구할 수 없습니다.'
                );

            if (!confirmed) {
                return;
            }

            try {
                setDeleting(true);
                setMessage('');

                const response =
                    await axiosInstance.delete<number>(
                        `/member/delete/${targetMemberno}`
                    );

                const result =
                    Number(
                        response.data
                    );

                /**
                 * 백엔드 응답:
                 * 1 = 삭제 성공
                 * 0 = 삭제 실패
                 */
                if (result !== 1) {
                    setMessage(
                        '회원탈퇴에 실패했습니다. 다시 시도해주세요.'
                    );

                    return;
                }

                /**
                 * 탈퇴 성공 후
                 * 전역 로그인 정보 초기화
                 */
                resetUser();

                alert(
                    '회원탈퇴가 완료되었습니다.'
                );

                /**
                 * 뒤로가기로 탈퇴 페이지에
                 * 다시 접근하지 못하도록 replace 사용
                 */
                navigate(
                    '/',
                    {
                        replace: true
                    }
                );
            } catch (deleteError) {
                console.error(
                    '회원탈퇴 실패:',
                    deleteError
                );

                setMessage(
                    '회원탈퇴 처리 중 오류가 발생했습니다.'
                );
            } finally {
                setDeleting(false);
            }
        };

    /**
     * 비로그인 상태
     */
    if (!login) {
        return (
            <main className="member-delete-page">
                <section className="member-delete-state">
                    <div className="member-delete-state-icon">
                        🔒
                    </div>

                    <h1>
                        로그인이 필요합니다
                    </h1>

                    <p>
                        회원탈퇴는 로그인한
                        회원만 진행할 수 있습니다.
                    </p>

                    <button
                        type="button"
                        className="member-delete-state-button"
                        onClick={() => {
                            navigate(
                                '/member/login'
                            );
                        }}
                    >
                        로그인하기
                    </button>
                </section>
            </main>
        );
    }

    /**
     * 회원정보 조회 중
     */
    if (loading) {
        return (
            <main className="member-delete-page">
                <section className="member-delete-state">
                    <div className="member-delete-spinner" />

                    <h1>
                        회원정보를 확인하고 있습니다
                    </h1>
                </section>
            </main>
        );
    }

    /**
     * 조회 실패 또는 잘못된 접근
     */
    if (
        error
        || !member
        || !isMyAccount
    ) {
        return (
            <main className="member-delete-page">
                <section className="member-delete-state">
                    <div className="member-delete-state-icon">
                        !
                    </div>

                    <h1>
                        회원탈퇴를 진행할 수 없습니다
                    </h1>

                    <p>
                        {error
                            || '회원정보를 확인할 수 없습니다.'}
                    </p>

                    <button
                        type="button"
                        className="member-delete-state-button"
                        onClick={() => {
                            navigate(
                                '/member/mypage'
                            );
                        }}
                    >
                        마이페이지로 이동
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="member-delete-page">
            <div className="member-delete-container">
                {/* 페이지 상단 */}
                <header className="member-delete-header">
                    <div>
                        <span className="member-delete-eyebrow">
                            ACCOUNT WITHDRAWAL
                        </span>

                        <h1>
                            회원 탈퇴
                        </h1>

                        <p>
                            탈퇴 전에 아래 내용을
                            반드시 확인해주세요.
                        </p>
                    </div>

                    <Link
                        to={`/member/read/${targetMemberno}`}
                        className="member-delete-back-link"
                    >
                        ← 회원정보
                    </Link>
                </header>

                {/* 주의 아이콘 및 안내 */}
                <section className="member-delete-warning-card">
                    <div className="member-delete-warning-icon">
                        !
                    </div>

                    <div>
                        <h2>
                            탈퇴한 계정은 복구할 수 없습니다
                        </h2>

                        <p>
                            회원탈퇴가 완료되면 해당 계정으로
                            다시 로그인할 수 없습니다.
                        </p>
                    </div>
                </section>

                {/* 탈퇴 대상 회원정보 */}
                <section className="member-delete-member-card">
                    <div className="member-delete-member-avatar">
                        {member.mname
                            ?.trim()
                            .substring(
                                0,
                                1
                            )
                            || '?'}
                    </div>

                    <div className="member-delete-member-info">
                        <span>
                            탈퇴 대상 계정
                        </span>

                        <h2>
                            {member.mname}님
                        </h2>

                        <p>
                            @{member.id}
                        </p>
                    </div>

                    <div className="member-delete-member-meta">
                        <span>
                            가입일
                        </span>

                        <strong>
                            {member.joindate
                                || '-'}
                        </strong>
                    </div>
                </section>

                {/* 삭제되는 항목 안내 */}
                <section className="member-delete-content-card">
                    <h2>
                        회원탈퇴 시 확인사항
                    </h2>

                    <p className="member-delete-content-description">
                        다음 정보는 탈퇴 후 이용하거나
                        복구할 수 없습니다.
                    </p>

                    <ul className="member-delete-notice-list">
                        <li>
                            <span className="member-delete-notice-icon">
                                ✎
                            </span>

                            <div>
                                <strong>
                                    작성한 리뷰
                                </strong>

                                <p>
                                    내가 작성한 맛집 리뷰를
                                    더 이상 관리할 수 없습니다.
                                </p>
                            </div>
                        </li>

                        <li>
                            <span className="member-delete-notice-icon">
                                💬
                            </span>

                            <div>
                                <strong>
                                    작성한 댓글
                                </strong>

                                <p>
                                    내가 작성한 댓글을
                                    더 이상 수정하거나 삭제할 수 없습니다.
                                </p>
                            </div>
                        </li>

                        <li>
                            <span className="member-delete-notice-icon">
                                ♥
                            </span>

                            <div>
                                <strong>
                                    즐겨찾기 정보
                                </strong>

                                <p>
                                    저장한 맛집과 즐겨찾기 기록을
                                    이용할 수 없습니다.
                                </p>
                            </div>
                        </li>

                        <li>
                            <span className="member-delete-notice-icon">
                                👤
                            </span>

                            <div>
                                <strong>
                                    회원 계정
                                </strong>

                                <p>
                                    계정 정보와 로그인 권한이
                                    영구적으로 삭제됩니다.
                                </p>
                            </div>
                        </li>
                    </ul>

                    {/* 탈퇴 확인 폼 */}
                    <form
                        onSubmit={deleteMember}
                        className="member-delete-form"
                    >
                        {/* 주의사항 확인 */}
                        <label className="member-delete-agree">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={event => {
                                    setAgreed(
                                        event.target.checked
                                    );

                                    setMessage('');
                                }}
                            />

                            <span>
                                위 내용을 모두 확인했으며,
                                회원탈퇴에 동의합니다.
                            </span>
                        </label>

                        {/* 확인 문구 입력 */}
                        <div className="member-delete-confirm-field">
                            <label htmlFor="delete-confirm-text">
                                탈퇴를 계속하려면
                                <strong>
                                    회원탈퇴
                                </strong>
                                를 입력해주세요.
                            </label>

                            <input
                                id="delete-confirm-text"
                                type="text"
                                value={confirmText}
                                onChange={
                                    onConfirmTextChange
                                }
                                placeholder="회원탈퇴"
                                autoComplete="off"
                            />
                        </div>

                        {/* 오류 메시지 */}
                        {message !== '' && (
                            <div className="member-delete-message">
                                {message}
                            </div>
                        )}

                        {/* 하단 버튼 */}
                        <div className="member-delete-buttons">
                            <button
                                type="button"
                                className="member-delete-cancel-button"
                                onClick={() => {
                                    navigate(
                                        `/member/read/${targetMemberno}`
                                    );
                                }}
                            >
                                취소
                            </button>

                            <button
                                type="submit"
                                className="member-delete-submit-button"
                                disabled={!canDelete}
                            >
                                {deleting
                                    ? '탈퇴 처리 중...'
                                    : '회원탈퇴'}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
};

export default Member_Delete;