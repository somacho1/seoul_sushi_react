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

import './Member_Update.css';

/**
 * 백엔드에서 전달받는 회원정보 타입
 */
interface MemberInfo {
  memberno: number;
  id: string;
  mname: string;
  birth: string;
  email: string;
  phone: string;
  joindate?: string;
  grade?: number;
  status?: string;
}

/**
 * 회원정보 수정 입력 타입
 */
interface MemberUpdateInput {
  memberno: number;
  id: string;
  mname: string;
  birth: string;
  email: string;
  phone: string;
}

/**
 * 회원정보 수정 페이지
 */
const Member_Update = () => {
  const navigate = useNavigate();

  /**
   * 주소에서 회원번호 가져오기
   *
   * 주소 예:
   * /member/update/5
   */
  const {
    memberno: routeMemberno
  } = useParams();

  /**
   * 로그인한 사용자 정보
   */
  const {
    login,
    memberno: loginMemberno,
    id: loginId
  } = useGlobalStore();

  /**
   * 입력값
   */
  const [
    input,
    setInput
  ] = useState<MemberUpdateInput>({
    memberno: 0,
    id: '',
    mname: '',
    birth: '',
    email: '',
    phone: ''
  });

  /**
   * 회원정보 조회 중 여부
   */
  const [
    loading,
    setLoading
  ] = useState(true);

  /**
   * 회원정보 저장 중 여부
   */
  const [
    submitting,
    setSubmitting
  ] = useState(false);

  /**
   * 화면 메시지
   */
  const [
    message,
    setMessage
  ] = useState('');

  /**
   * 메시지 종류
   */
  const [
    messageType,
    setMessageType
  ] = useState<
    'success'
    | 'error'
    | ''
  >('');

  /**
   * 주소의 회원번호를 숫자로 변환
   */
  const targetMemberno =
    Number(routeMemberno);

  /**
   * 로그인한 회원 본인인지 검사
   *
   * 일반 회원이 주소의 회원번호를 임의로 바꾸어
   * 다른 회원정보를 수정하는 것을 프론트에서 1차 방지한다.
   */
  const isMyAccount =
    Number(loginMemberno)
    === targetMemberno;

  /**
   * 회원정보 조회
   *
   * API:
   * GET /member/read/{memberno}
   */
  useEffect(() => {
    /**
     * 로그인하지 않은 경우
     */
    if (!login) {
      setLoading(false);

      return;
    }

    /**
     * 유효하지 않은 회원번호인 경우
     */
    if (
      !routeMemberno
      || Number.isNaN(targetMemberno)
      || targetMemberno <= 0
    ) {
      setMessage(
        '잘못된 회원정보 주소입니다.'
      );

      setMessageType('error');
      setLoading(false);

      return;
    }

    /**
     * 로그인한 회원과 주소의 회원번호가 다른 경우
     */
    if (!isMyAccount) {
      setMessage(
        '본인의 회원정보만 수정할 수 있습니다.'
      );

      setMessageType('error');
      setLoading(false);

      return;
    }

    const loadMemberInfo =
      async () => {
        try {
          setLoading(true);
          setMessage('');
          setMessageType('');

          const response =
            await axiosInstance.get<MemberInfo>(
              `/member/read/${targetMemberno}`
            );

          const member =
            response.data;

          setInput({
            memberno:
              Number(
                member.memberno
              ),

            id:
              member.id
              ?? '',

            mname:
              member.mname
              ?? '',

            birth:
              member.birth
              ?? '',

            email:
              member.email
              ?? '',

            phone:
              member.phone
              ?? ''
          });
        } catch (error) {
          console.error(
            '회원정보 조회 실패:',
            error
          );

          setMessage(
            '회원정보를 불러오지 못했습니다.'
          );

          setMessageType('error');
        } finally {
          setLoading(false);
        }
      };

    loadMemberInfo();
  }, [
    login,
    routeMemberno,
    targetMemberno,
    isMyAccount
  ]);

  /**
   * 입력값 변경
   */
  const onChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const {
      id,
      value
    } = e.target;

    setInput(previous => ({
      ...previous,
      [id]: value
    }));

    /**
     * 수정 입력을 시작하면 기존 메시지 제거
     */
    setMessage('');
    setMessageType('');
  };

  /**
   * 이메일 형식 검사
   */
  const isValidEmail = (
    email: string
  ) => {
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(
      email
    );
  };

  /**
   * 회원정보 저장
   *
   * API:
   * PUT /member/update
   */
  const send = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    /**
     * 로그인 검사
     */
    if (!login) {
      setMessage(
        '로그인이 필요합니다.'
      );

      setMessageType('error');

      return;
    }

    /**
     * 본인 계정 검사
     */
    if (!isMyAccount) {
      setMessage(
        '본인의 회원정보만 수정할 수 있습니다.'
      );

      setMessageType('error');

      return;
    }

    /**
     * 이름 검사
     */
    if (
      input.mname.trim()
      === ''
    ) {
      setMessage(
        '이름을 입력해주세요.'
      );

      setMessageType('error');

      return;
    }

    /**
     * 생년월일 검사
     */
    if (
      input.birth.trim()
      === ''
    ) {
      setMessage(
        '생년월일을 입력해주세요.'
      );

      setMessageType('error');

      return;
    }

    /**
     * 이메일 검사
     */
    if (
      input.email.trim()
      === ''
    ) {
      setMessage(
        '이메일을 입력해주세요.'
      );

      setMessageType('error');

      return;
    }

    if (
      !isValidEmail(
        input.email.trim()
      )
    ) {
      setMessage(
        '올바른 이메일 형식을 입력해주세요.'
      );

      setMessageType('error');

      return;
    }

    /**
     * 전화번호 검사
     */
    if (
      input.phone.trim()
      === ''
    ) {
      setMessage(
        '전화번호를 입력해주세요.'
      );

      setMessageType('error');

      return;
    }

    /**
     * 중복 요청 방지
     */
    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setMessage('');
      setMessageType('');

      const response =
        await axiosInstance.put<number>(
          '/member/update',
          {
            memberno:
              input.memberno,

            mname:
              input.mname.trim(),

            birth:
              input.birth.trim(),

            email:
              input.email.trim(),

            phone:
              input.phone.trim()
          }
        );

      const result =
        Number(response.data);

      if (result === 1) {
        setMessage(
          '회원정보가 수정되었습니다.'
        );

        setMessageType(
          'success'
        );

        /**
         * 수정된 내용을 확인할 수 있도록
         * 회원정보 조회 화면으로 이동
         */
        window.setTimeout(
          () => {
            navigate(
              `/member/read/${input.memberno}`
            );
          },
          800
        );

        return;
      }

      setMessage(
        '회원정보 수정에 실패했습니다.'
      );

      setMessageType(
        'error'
      );
    } catch (error) {
      console.error(
        '회원정보 수정 오류:',
        error
      );

      setMessage(
        '서버 통신 중 오류가 발생했습니다.'
      );

      setMessageType(
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 비로그인 상태
   */
  if (!login) {
    return (
      <main className="member-update-page">
        <section className="member-update-state">
          <div className="member-update-state-icon">
            🔒
          </div>

          <h1>
            로그인이 필요합니다
          </h1>

          <p>
            회원정보를 수정하려면
            로그인해주세요.
          </p>

          <button
            type="button"
            className="member-update-primary-button"
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
      <main className="member-update-page">
        <section className="member-update-state">
          <div className="member-update-spinner" />

          <h1>
            회원정보를 불러오고 있습니다
          </h1>
        </section>
      </main>
    );
  }

  /**
   * 다른 회원번호로 접근했거나
   * 주소가 잘못된 경우
   */
  if (
    !isMyAccount
    || input.memberno <= 0
  ) {
    return (
      <main className="member-update-page">
        <section className="member-update-state">
          <div className="member-update-state-icon">
            !
          </div>

          <h1>
            회원정보를 수정할 수 없습니다
          </h1>

          <p>
            {message
              || '본인의 회원정보만 수정할 수 있습니다.'}
          </p>

          <button
            type="button"
            className="member-update-primary-button"
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
    <main className="member-update-page">
      <div className="member-update-container">
        {/* 페이지 상단 */}
        <header className="member-update-header">
          <div>
            <span className="member-update-eyebrow">
              ACCOUNT SETTINGS
            </span>

            <h1>
              회원정보 수정
            </h1>

            <p>
              회원님의 기본 정보를
              확인하고 수정할 수 있습니다.
            </p>
          </div>

          <Link
            to={`/member/read/${targetMemberno}`}
            className="member-update-back-link"
          >
            ← 회원정보
          </Link>
        </header>

        {/* 수정 폼 */}
        <section className="member-update-card">
          <form onSubmit={send}>
            {/* 아이디 */}
            <div className="member-update-field">
              <label htmlFor="member-id">
                아이디
              </label>

              <input
                id="member-id"
                type="text"
                value={
                  input.id
                  || loginId
                  || ''
                }
                readOnly
                className="member-update-readonly"
              />

              <p className="member-update-help">
                아이디는 변경할 수 없습니다.
              </p>
            </div>

            {/* 이름 */}
            <div className="member-update-field">
              <label htmlFor="mname">
                이름
                <span>*</span>
              </label>

              <input
                id="mname"
                type="text"
                value={input.mname}
                onChange={onChange}
                placeholder="이름을 입력해주세요."
                maxLength={30}
                autoFocus
              />
            </div>

            {/* 생년월일 */}
            <div className="member-update-field">
              <label htmlFor="birth">
                생년월일
                <span>*</span>
              </label>

              <input
                id="birth"
                type="date"
                value={input.birth}
                onChange={onChange}
              />
            </div>

            {/* 이메일 */}
            <div className="member-update-field">
              <label htmlFor="email">
                이메일
                <span>*</span>
              </label>

              <input
                id="email"
                type="email"
                value={input.email}
                onChange={onChange}
                placeholder="example@email.com"
                maxLength={100}
              />
            </div>

            {/* 전화번호 */}
            <div className="member-update-field">
              <label htmlFor="phone">
                전화번호
                <span>*</span>
              </label>

              <input
                id="phone"
                type="tel"
                value={input.phone}
                onChange={onChange}
                placeholder="010-1234-5678"
                maxLength={20}
              />

              <p className="member-update-help">
                예: 010-1234-5678
              </p>
            </div>

            {/* 처리 메시지 */}
            {message !== '' && (
              <div
                className={
                  messageType
                    === 'success'
                    ? 'member-update-message success'
                    : 'member-update-message error'
                }
              >
                {message}
              </div>
            )}

            {/* 하단 버튼 */}
            <div className="member-update-buttons">
              <button
                type="button"
                className="member-update-cancel-button"
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
                className="member-update-save-button"
                disabled={submitting}
              >
                {submitting
                  ? '저장 중...'
                  : '회원정보 저장'}
              </button>
            </div>
          </form>
        </section>

        {/* 기타 계정 기능 */}
        <section className="member-update-account-menu">
          <div>
            <span>
              SECURITY
            </span>

            <h2>
              계정 보안 관리
            </h2>

            <p>
              비밀번호 변경과 회원 탈퇴를
              관리할 수 있습니다.
            </p>
          </div>

          <div className="member-update-account-buttons">
            <Link
              to="/member/update_password"
              className="member-update-password-link"
            >
              비밀번호 변경
            </Link>

            <Link
              to={`/member/delete/${targetMemberno}`}
              className="member-update-delete-link"
            >
              회원 탈퇴
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Member_Update;