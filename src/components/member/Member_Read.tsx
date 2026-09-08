import {
  useEffect,
  useState
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
  type Member
} from './MemberType';

import './Member_Read.css';

const Member_Read = () => {
  const navigate = useNavigate();

  /**
   * 주소의 회원번호
   *
   * 예:
   * /member/read/5
   */
  const {
    memberno
  } = useParams();

  /**
   * 조회한 회원정보
   */
  const [
    data,
    setData
  ] = useState<Member | null>(null);

  /**
   * 로딩 여부
   */
  const [
    loading,
    setLoading
  ] = useState(true);

  /**
   * 오류 메시지
   */
  const [
    error,
    setError
  ] = useState('');

  /**
   * 회원정보 조회
   */
  useEffect(() => {
    const loadMember =
      async () => {
        try {
          setLoading(true);
          setError('');

          const response =
            await axiosInstance.get<Member>(
              `/member/read/${memberno}`
            );

          setData(
            response.data
          );
        } catch (err) {
          console.error(
            '회원정보 조회 실패:',
            err
          );

          setError(
            '회원정보를 불러오지 못했습니다.'
          );
        } finally {
          setLoading(false);
        }
      };

    loadMember();
  }, [memberno]);

  /**
   * 이름 첫 글자
   *
   * 프로필 원 안에 표시
   */
  const getInitial = () => {
    if (
      !data?.mname
      || data.mname.trim() === ''
    ) {
      return '?';
    }

    return data.mname
      .trim()
      .substring(0, 1);
  };

  /**
   * 로딩 화면
   */
  if (loading) {
    return (
      <main className="member-read-page">
        <section className="member-read-state">
          <div className="member-read-spinner" />

          <h1>
            회원정보를 불러오고 있습니다
          </h1>
        </section>
      </main>
    );
  }

  /**
   * 오류 화면
   */
  if (
    error
    || !data
  ) {
    return (
      <main className="member-read-page">
        <section className="member-read-state">
          <div className="member-read-state-icon">
            !
          </div>

          <h1>
            회원정보를 불러오지 못했습니다
          </h1>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="member-read-primary-button"
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
    <main className="member-read-page">
      <div className="member-read-container">
        {/* 상단 제목 */}
        <header className="member-read-header">
          <div>
            <span className="member-read-eyebrow">
              ACCOUNT
            </span>

            <h1>
              회원정보 관리
            </h1>

            <p>
              회원정보를 확인하고
              계정 설정을 관리할 수 있습니다.
            </p>
          </div>

          <Link
            to="/member/mypage"
            className="member-read-back-link"
          >
            ← 마이페이지
          </Link>
        </header>

        {/* 프로필 카드 */}
        <section className="member-read-profile-card">
          <div className="member-read-profile-top">
            <div className="member-read-avatar">
              {getInitial()}
            </div>

            <div className="member-read-profile-text">
              <span className="member-read-id">
                @{data.id}
              </span>

              <h2>
                {data.mname}
              </h2>

              <p>
                회원님의 기본 정보입니다.
              </p>
            </div>

            <span className="member-read-status">
              정상 회원
            </span>
          </div>

          {/* 회원정보 목록 */}
          <div className="member-read-info-grid">
            <div className="member-read-info-item">
              <span>
                아이디
              </span>

              <strong>
                {data.id}
              </strong>
            </div>

            <div className="member-read-info-item">
              <span>
                이름
              </span>

              <strong>
                {data.mname}
              </strong>
            </div>

            <div className="member-read-info-item">
              <span>
                생년월일
              </span>

              <strong>
                {data.birth || '-'}
              </strong>
            </div>

            <div className="member-read-info-item">
              <span>
                이메일
              </span>

              <strong>
                {data.email || '-'}
              </strong>
            </div>

            <div className="member-read-info-item">
              <span>
                전화번호
              </span>

              <strong>
                {data.phone || '-'}
              </strong>
            </div>

            <div className="member-read-info-item">
              <span>
                가입일
              </span>

              <strong>
                {data.joindate || '-'}
              </strong>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="member-read-buttons">
            <button
              type="button"
              className="member-read-secondary-button"
              onClick={() => {
                navigate(
                  '/member/update_password'
                );
              }}
            >
              비밀번호 변경
            </button>

            <button
              type="button"
              className="member-read-primary-button"
              onClick={() => {
                navigate(
                  `/member/update/${data.memberno}`
                );
              }}
            >
              회원정보 수정
            </button>
          </div>
        </section>

        {/* 계정 관리 */}
        <section className="member-read-security-card">
          <div>
            <span className="member-read-security-label">
              SECURITY
            </span>

            <h2>
              계정 보안 관리
            </h2>

            <p>
              주기적인 비밀번호 변경으로
              계정을 안전하게 관리하세요.
            </p>
          </div>

          <div className="member-read-security-links">
            <Link
              to="/member/update_password"
              className="member-read-password-link"
            >
              비밀번호 변경
            </Link>

            <Link
              to={`/member/delete/${data.memberno}`}
              className="member-read-delete-link"
            >
              회원 탈퇴
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Member_Read;