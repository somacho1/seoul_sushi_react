import {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  Link,
  useLocation
} from 'react-router-dom';

import {
  useGlobalStore
} from './store/store';

import {
  axiosInstance
} from './components/Tool';

import './Menu.css';

/**
 * 맛집 메뉴 항목
 */
interface ContentItem {
  contentno: number;
  name: string;
}

/**
 * 지역별 메뉴 그룹
 */
interface MenuGroup {
  district: string;
  item: ContentItem[];
}

/**
 * 전체 공통 상단 메뉴
 */
function Menu() {
  const location =
    useLocation();

  /**
   * 전역 로그인 상태
   */
  const {
    login,
    grade,
    id
  } = useGlobalStore();

  /**
   * 지역별 맛집 메뉴
   */
  const [
    menu,
    setMenu
  ] = useState<MenuGroup[]>([]);

  /**
   * 지역 메뉴 열림 여부
   */
  const [
    openRestaurantMenu,
    setOpenRestaurantMenu
  ] = useState(false);

  /**
   * 사용자 메뉴 열림 여부
   */
  const [
    openUserMenu,
    setOpenUserMenu
  ] = useState(false);

  /**
   * 모바일 메뉴 열림 여부
   */
  const [
    openMobileMenu,
    setOpenMobileMenu
  ] = useState(false);

  /**
   * 헤더 바깥 클릭 감지를 위한 Ref
   */
  const headerRef =
    useRef<HTMLElement | null>(
      null
    );

  /**
   * 지역별 맛집 메뉴 조회
   *
   * API:
   * GET /content/menu
   */
  useEffect(() => {
    axiosInstance
      .get('/content/menu')
      .then(result =>
        result.data
      )
      .then(data => {
        setMenu(
          Array.isArray(
            data?.main
          )
            ? data.main
            : []
        );
      })
      .catch(error => {
        console.error(
          '메뉴 조회 실패:',
          error
        );

        setMenu([]);
      });
  }, [login]);

  /**
   * 주소가 변경되면
   * 열려 있는 메뉴를 모두 닫는다.
   */
  useEffect(() => {
    setOpenRestaurantMenu(false);
    setOpenUserMenu(false);
    setOpenMobileMenu(false);
  }, [location.pathname]);

  /**
   * 헤더 외부를 클릭하면
   * 열려 있는 드롭다운을 닫는다.
   */
  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      if (
        headerRef.current
        && !headerRef.current.contains(
          target
        )
      ) {
        setOpenRestaurantMenu(false);
        setOpenUserMenu(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  /**
   * 현재 주소가 메뉴 주소와 일치하는지 확인
   */
  const isActive = (
    path: string
  ) => {
    if (path === '/') {
      return (
        location.pathname === '/'
      );
    }

    return location.pathname
      .startsWith(path);
  };

  /**
   * 사용자 이름 첫 글자
   */
  const userInitial =
    id?.trim()
      .substring(0, 1)
      .toUpperCase()
    || '?';

  return (
    <header
      ref={headerRef}
      className="site-header"
    >
      <div className="site-header-inner">
        {/* 로고 */}
        <Link
          to="/"
          className="site-logo"
          aria-label="회친자들 홈"
        >
          <span className="site-logo-icon">
            🐟
          </span>

          <span className="site-logo-text">
            회친자들
          </span>
        </Link>

        {/* 데스크톱 메뉴 */}
        <nav className="site-nav">
          <Link
            to="/"
            className={
              isActive('/')
                ? 'site-nav-link active'
                : 'site-nav-link'
            }
          >
            홈
          </Link>

          {/* 지역별 맛집 메뉴 */}
          <div className="site-menu-group">
            <button
              type="button"
              className={
                openRestaurantMenu
                  ? 'site-nav-link site-menu-trigger active'
                  : 'site-nav-link site-menu-trigger'
              }
              aria-expanded={
                openRestaurantMenu
              }
              onClick={() => {
                setOpenRestaurantMenu(
                  previous =>
                    !previous
                );

                setOpenUserMenu(false);
              }}
            >
              지역별 맛집

              <span
                className={
                  openRestaurantMenu
                    ? 'site-chevron open'
                    : 'site-chevron'
                }
              >
                ▾
              </span>
            </button>

            {openRestaurantMenu && (
              <div className="restaurant-dropdown">
                <div className="dropdown-header">
                  <span>
                    AREA GUIDE
                  </span>

                  <strong>
                    서울 지역별 맛집
                  </strong>
                </div>

                <div className="restaurant-dropdown-grid">
                  {menu.length > 0 ? (
                    menu.map(group => (
                      <Link
                        key={
                          group.district
                        }
                        to={
                          `/content/list/${encodeURIComponent(
                            group.district
                          )}`
                        }
                        className="restaurant-dropdown-item"
                      >
                        <span className="restaurant-dropdown-icon">
                          📍
                        </span>

                        <span className="restaurant-dropdown-content">
                          <strong>
                            {group.district}
                          </strong>

                          <small>
                            등록 맛집 보기
                          </small>
                        </span>

                        <span className="restaurant-dropdown-arrow">
                          →
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="restaurant-dropdown-empty">
                      등록된 지역 메뉴가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/search?word=숙성회"
            className="site-nav-link"
          >
            인기 맛집
          </Link>

          <Link
            to="/ai/recommend"
            className="site-nav-link site-ai-link"
          >
            AI 추천
          </Link>

          {/* 로그인 상태 */}
          {login ? (
            <div className="site-user-group">
              <button
                type="button"
                className={
                  openUserMenu
                    ? 'site-user-button active'
                    : 'site-user-button'
                }
                aria-expanded={
                  openUserMenu
                }
                onClick={() => {
                  setOpenUserMenu(
                    previous =>
                      !previous
                  );

                  setOpenRestaurantMenu(false);
                }}
              >
                <span className="site-user-avatar">
                  {userInitial}
                </span>

                <span className="site-user-info">
                  <strong>
                    {id}
                  </strong>
                </span>

                <span
                  className={
                    openUserMenu
                      ? 'site-chevron open'
                      : 'site-chevron'
                  }
                >
                  ▾
                </span>
              </button>

              {openUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-profile">
                    <span className="user-dropdown-avatar">
                      {userInitial}
                    </span>

                    <div>
                      <strong>
                        {id}
                      </strong>

                      <small>
                        내 계정
                      </small>
                    </div>
                  </div>

                  <div className="user-dropdown-divider" />

                  <Link
                    to="/member/mypage"
                    className="user-dropdown-link"
                  >
                    마이페이지
                  </Link>

                  <Link
                    to="/member/my-reviews"
                    className="user-dropdown-link"
                  >
                    내가 쓴 리뷰
                  </Link>

                  <Link
                    to="/member/my-replies"
                    className="user-dropdown-link"
                  >
                    내가 쓴 댓글
                  </Link>

                  <Link
                    to="/favorite/list"
                    className="user-dropdown-link"
                  >
                    즐겨찾기
                  </Link>

                  {/* 관리자 전용 메뉴 */}
                  {grade <= 5 && (
                    <>
                      <div className="user-dropdown-divider" />

                      <span className="user-dropdown-label">
                        관리
                      </span>

                      <Link
                        to="/content/content"
                        className="user-dropdown-link admin"
                      >
                        맛집 관리
                      </Link>

                      <Link
                        to="/member/find_all"
                        className="user-dropdown-link admin"
                      >
                        회원 관리
                      </Link>
                    </>
                  )}

                  <div className="user-dropdown-divider" />

                  <Link
                    to="/member/logout"
                    className="user-dropdown-link logout"
                  >
                    로그아웃
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="site-auth-menu">
              <Link
                to="/member/login"
                className="site-login-link"
              >
                로그인
              </Link>

              <Link
                to="/member/signup"
                className="site-signup-link"
              >
                회원가입
              </Link>
            </div>
          )}
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <button
          type="button"
          className={
            openMobileMenu
              ? 'mobile-menu-button active'
              : 'mobile-menu-button'
          }
          aria-label="모바일 메뉴 열기"
          aria-expanded={
            openMobileMenu
          }
          onClick={() => {
            setOpenMobileMenu(
              previous =>
                !previous
            );

            setOpenRestaurantMenu(false);
            setOpenUserMenu(false);
          }}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {openMobileMenu && (
        <div className="mobile-menu-panel">
          <div className="mobile-menu-inner">
            {login && (
              <div className="mobile-user-card">
                <span className="mobile-user-avatar">
                  {userInitial}
                </span>

                <div>
                  <small>
                    로그인 중
                  </small>

                  <strong>
                    {id}님
                  </strong>
                </div>
              </div>
            )}

            <Link
              to="/"
              className="mobile-menu-link"
            >
              홈
            </Link>

            <button
              type="button"
              className="mobile-menu-link mobile-menu-section-button"
              onClick={() => {
                setOpenRestaurantMenu(
                  previous =>
                    !previous
                );
              }}
            >
              지역별 맛집

              <span>
                {openRestaurantMenu
                  ? '−'
                  : '+'}
              </span>
            </button>

            {openRestaurantMenu && (
              <div className="mobile-district-list">
                {menu.map(group => (
                  <Link
                    key={
                      group.district
                    }
                    to={
                      `/content/list/${encodeURIComponent(
                        group.district
                      )}`
                    }
                  >
                    {group.district}
                  </Link>
                ))}
              </div>
            )}

            <Link
              to="/search?word=숙성회"
              className="mobile-menu-link"
            >
              인기 맛집
            </Link>

            <button
              type="button"
              className="mobile-menu-link mobile-ai-button"
              onClick={() => {
                alert(
                  'AI 맛집 추천 기능을 준비하고 있습니다.'
                );
              }}
            >
              AI 추천
            </button>

            <div className="mobile-menu-divider" />

            {login ? (
              <>
                <Link
                  to="/member/mypage"
                  className="mobile-menu-link"
                >
                  마이페이지
                </Link>

                <Link
                  to="/member/my-reviews"
                  className="mobile-menu-link"
                >
                  내가 쓴 리뷰
                </Link>

                <Link
                  to="/favorite/list"
                  className="mobile-menu-link"
                >
                  즐겨찾기
                </Link>

                {grade <= 5 && (
                  <>
                    <div className="mobile-menu-divider" />

                    <Link
                      to="/content/content"
                      className="mobile-menu-link admin"
                    >
                      맛집 관리
                    </Link>

                    <Link
                      to="/member/find_all"
                      className="mobile-menu-link admin"
                    >
                      회원 목록
                    </Link>
                  </>
                )}

                <div className="mobile-menu-divider" />

                <Link
                  to="/member/logout"
                  className="mobile-menu-link logout"
                >
                  로그아웃
                </Link>
              </>
            ) : (
              <div className="mobile-auth-buttons">
                <Link
                  to="/member/login"
                  className="mobile-login-button"
                >
                  로그인
                </Link>

                <Link
                  to="/member/signup"
                  className="mobile-signup-button"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Menu;