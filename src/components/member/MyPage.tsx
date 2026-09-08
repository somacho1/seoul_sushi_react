import {
    Link,
    useNavigate
} from 'react-router-dom';

import { useGlobalStore } from '../../store/store';

import './MyPage.css';

function MyPage() {
    const navigate = useNavigate();

    const {
        login,
        memberno,
        id,
        grade
    } = useGlobalStore();

    /**
     * 권한 표시
     */
    const getGradeLabel = (
        memberGrade: number
    ) => {
        if (memberGrade <= 5) {
            return '관리자';
        }

        return '일반 회원';
    };

    /**
     * 비로그인 상태
     */
    if (
        !login
        || memberno == null
        || Number(memberno) <= 0
    ) {
        return (
            <main className="mypage-page">
                <div className="mypage-container">
                    <section className="mypage-login-required">
                        <div className="mypage-login-icon">
                            👤
                        </div>

                        <h1>
                            로그인이 필요합니다
                        </h1>

                        <p>
                            마이페이지는 로그인한 회원만
                            이용할 수 있습니다.
                        </p>

                        <button
                            type="button"
                            className="mypage-primary-btn"
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
        <main className="mypage-page">
            <div className="mypage-container">
                {/* 상단 제목 */}
                <header className="mypage-header">
                    <span className="mypage-eyebrow">
                        MY PAGE
                    </span>

                    <h1>
                        마이페이지
                    </h1>

                    <p>
                        회원 정보와 내가 이용한 서비스를
                        한곳에서 확인하세요.
                    </p>
                </header>

                {/* 회원 프로필 */}
                <section className="mypage-profile-card">
                    <div className="mypage-profile-main">
                        <div className="mypage-avatar">
                            {id
                                ? id
                                    .charAt(0)
                                    .toUpperCase()
                                : 'M'}
                        </div>

                        <div className="mypage-profile-info">
                            <span className="mypage-profile-label">
                                로그인 회원
                            </span>

                            <h2>
                                {id}님
                            </h2>

                            <p>
                                회친자들과 함께 서울의
                                숙성회 맛집을 찾아보세요.
                            </p>
                        </div>
                    </div>

                    <div className="mypage-profile-meta">
                        <div>
                            <span>
                                회원 번호
                            </span>

                            <strong>
                                {memberno}
                            </strong>
                        </div>

                        <div>
                            <span>
                                회원 등급
                            </span>

                            <strong>
                                {getGradeLabel(
                                    Number(grade)
                                )}
                            </strong>
                        </div>
                    </div>
                </section>

                {/* 사용자 서비스 */}
                <section className="mypage-section">
                    <div className="mypage-section-header">
                        <div>
                            <span>
                                MY ACTIVITY
                            </span>

                            <h2>
                                나의 활동
                            </h2>
                        </div>

                        <p>
                            리뷰, 댓글, 즐겨찾기 활동을
                            관리할 수 있습니다.
                        </p>
                    </div>

                    <div className="mypage-menu-grid">
                        {/* 내 즐겨찾기 */}
                        <Link
                            to="/favorite/list"
                            className="mypage-menu-card"
                        >
                            <div className="mypage-menu-icon favorite">
                                ♥
                            </div>

                            <div className="mypage-menu-content">
                                <h3>
                                    내 즐겨찾기
                                </h3>

                                <p>
                                    내가 하트를 누른 맛집을
                                    모아서 확인합니다.
                                </p>
                            </div>

                            <span className="mypage-menu-arrow">
                                →
                            </span>
                        </Link>

                        {/* 내가 쓴 리뷰 */}
                        <Link
                            to="/member/my-reviews"
                            className="mypage-menu-card"
                        >
                            <div className="mypage-menu-icon review">
                                ✎
                            </div>

                            <div className="mypage-menu-content">
                                <h3>
                                    내가 쓴 리뷰
                                </h3>

                                <p>
                                    내가 작성한 맛집 리뷰를
                                    확인하고 관리합니다.
                                </p>
                            </div>

                            <span className="mypage-menu-arrow">
                                →
                            </span>
                        </Link>


                        {/* 내가 쓴 댓글 */}
                        <Link
                            to="/member/my-replies"
                            className="mypage-menu-card"
                        >

                            <div className="mypage-menu-icon reply">
                                💬
                            </div>

                            <div className="mypage-menu-content">
                                <h3>
                                    내가 쓴 댓글
                                </h3>

                                <p>
                                    내가 작성한 댓글을
                                    확인하고 관리합니다.
                                </p>
                            </div>

                            <span className="mypage-menu-arrow">
                                →
                            </span>

                        </Link>
                        {/* 회원정보 관리 */}
                        <Link
                            to={`/member/read/${memberno}`}
                            className="mypage-menu-card"
                        >
                            <div className="mypage-menu-icon member">
                                ⚙
                            </div>

                            <div className="mypage-menu-content">
                                <h3>
                                    회원정보 관리
                                </h3>

                                <p>
                                    비밀번호와 회원 정보를
                                    확인하고 수정합니다.
                                </p>
                            </div>

                            <span className="mypage-menu-arrow">
                                →
                            </span>
                        </Link>
                    </div>
                </section>

                {/* 맛집 탐색 바로가기 */}
                <section className="mypage-explore-section">
                    <div className="mypage-explore-text">
                        <span className="mypage-explore-eyebrow">
                            RESTAURANT DISCOVERY
                        </span>

                        <h2>
                            새로운 맛집을 찾아보세요
                        </h2>

                        <p>
                            지역별 맛집과 인기 맛집을 둘러보고
                            새로운 식당을 발견해보세요.
                        </p>
                    </div>

                    <div className="mypage-explore-buttons">
                        {/* 지역별 맛집 */}
                        <Link
                            to="/"
                            className="mypage-explore-button secondary"
                        >
                            <span className="mypage-explore-button-icon">
                                📍
                            </span>

                            <span>
                                지역별 맛집
                            </span>
                        </Link>

                        {/* 인기 맛집이 표시되는 홈 화면 */}
                        <Link
                            to="/"
                            className="mypage-explore-button secondary"
                        >
                            <span className="mypage-explore-button-icon">
                                🔥
                            </span>

                            <span>
                                인기 맛집
                            </span>
                        </Link>

                        {/* AI 추천 기능은 구현 후 실제 주소로 변경 */}
                        <button
                            type="button"
                            className="mypage-explore-button primary"
                            onClick={() => {
                                alert(
                                    'AI 맛집 추천 기능을 준비하고 있습니다.'
                                );
                            }}
                        >
                            <span className="mypage-explore-button-icon">
                                ✨
                            </span>

                            <span>
                                AI 추천
                            </span>
                        </button>
                    </div>
                </section>

                {/* 관리자 전용 */}
                {Number(grade) <= 5 && (
                    <section className="mypage-admin-section">
                        <div>
                            <span>
                                ADMIN
                            </span>

                            <h2>
                                관리자 메뉴
                            </h2>

                            <p>
                                맛집과 회원 정보를 관리할
                                수 있습니다.
                            </p>
                        </div>

                        <div className="mypage-admin-buttons">
                            <Link
                                to="/content/content"
                                className="mypage-admin-btn"
                            >
                                맛집 관리
                            </Link>

                            <Link
                                to="/member/find_all"
                                className="mypage-admin-btn"
                            >
                                회원 목록
                            </Link>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}

export default MyPage;