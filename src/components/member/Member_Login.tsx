import React, { useState, type ChangeEvent } from 'react';
import { enter_chk, axiosInstance } from '../Tool.js';
import { useGlobalStore } from '../../store/store.js';
import { Link, useNavigate } from 'react-router-dom';
import SimpleModal, { type SimpleModalTypePayload } from '../SimpleModal.js';

/**
 * 회원 로그인 화면
 *
 * - 아이디와 비밀번호를 JSON 본문으로 전송
 * - 비밀번호를 쿠키나 전역 상태에 저장하지 않음
 * - 개발환경에서는 관리자·일반회원 테스트 버튼 제공
 */
const Member_Login_plain = () => {
  const navigate = useNavigate();

  /** 로그인 API 요청 중인지 확인 */
  const [loading, setLoading] = useState(false);

  /** 안내 모달 */
  const [modal, setModal] = useState<SimpleModalTypePayload>({
    show: false,
    title: '',
    message: '',
    onConfirm: undefined,
  });

  const openModal = (payload: SimpleModalTypePayload) => {
    setModal({
      show: true,
      title: payload.title,
      message: payload.message,
      onConfirm: payload.onConfirm ?? undefined,
    });
  };

  const closeModal = () => {
    setModal(previous => ({
      ...previous,
      show: false,
    }));
  };

  /**
   * 로그인 성공 후 회원정보를 저장하기 위한 전역 상태 함수
   *
   * password, storePassword 관련 상태는 사용하지 않는다.
   */
  const {
    setLogin,
    setId,
    setGrade,
    setMemberno
  } = useGlobalStore();

  /** 로그인 입력값 */
  const [input, setInput] = useState({
    id: '',
    password: '',
  });

  /** 아이디·비밀번호 입력 처리 */
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(previous => ({
      ...previous,
      [event.target.id]: event.target.value,
    }));
  };

  /** 관리자 테스트 계정 입력 */
  const setAdminTestAccount = () => {
    setInput({
      id: 'admin',
      password: '1234',
    });
  };

  /** 일반회원 테스트 계정 입력 */
  const setMemberTestAccount = () => {
    setInput({
      id: 'user1',
      password: '1234',
    });
  };

  /** 로그인 요청 */
  const send = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    const trimmedId = input.id.trim();

    if (!trimmedId) {
      openModal({
        show: true,
        title: '로그인 확인',
        message: '아이디를 입력해주세요.',
      });

      return;
    }

    if (!input.password) {
      openModal({
        show: true,
        title: '로그인 확인',
        message: '비밀번호를 입력해주세요.',
      });

      return;
    }

    try {
      setLoading(true);

      /**
       * 로그인 정보를 URL이 아닌 JSON 본문으로 전송
       *
       * POST /member/login
       * {
       *   "id": "user1",
       *   "password": "1234"
       * }
       */
      const loginResult = await axiosInstance.post<number>(
        '/member/login',
        {
          id: trimmedId,
          password: input.password,
        }
      );

      if (loginResult.data !== 1) {
        openModal({
          show: true,
          title: '로그인 실패',
          message: '아이디 또는 비밀번호를 다시 확인해주세요.',
        });

        return;
      }

      /**
       * 로그인 성공 후 회원 상세정보 조회
       *
       * 관리자 여부를 확인할 grade와
       * 리뷰·댓글 작성에 사용할 memberno를 가져온다.
       */
      const memberResult = await axiosInstance.get(
        `/member/read_id/${encodeURIComponent(trimmedId)}`
      );

      const memberResultData = memberResult.data;

      if (
        !memberResultData
        || memberResultData.memberno == null
        || memberResultData.id == null
      ) {
        openModal({
          show: true,
          title: '로그인 오류',
          message: '회원정보를 불러오지 못했습니다.',
        });

        return;
      }

      /** 로그인 회원정보를 전역 상태에 저장 */
      setLogin(true);
      setId(memberResultData.id);
      setGrade(memberResultData.grade);
      setMemberno(memberResultData.memberno);

      /** 메인 화면으로 이동 */
      navigate('/');
    } catch (error) {
      console.error('로그인 요청 실패:', error);

      openModal({
        show: true,
        title: '로그인 오류',
        message: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 72px)',
        background: 'linear-gradient(180deg,#F8FEFF 0%,#F1F9FA 100%)',
        padding: '70px 20px 100px',
      }}
    >
      <form
        onSubmit={send}
        style={{
          maxWidth: '520px',
          margin: '0 auto',
          padding: '42px',
          background: '#fff',
          borderRadius: '22px',
          boxShadow: '0 18px 45px rgba(10,35,66,.10)',
          border: '1px solid rgba(10,35,66,.08)',
          textAlign: 'left',
        }}
      >
        {/* 로그인 제목 */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '34px',
          }}
        >
          <div
            style={{
              color: '#00A88F',
              fontSize: '12px',
              fontWeight: 900,
              letterSpacing: '1.5px',
              marginBottom: '10px',
            }}
          >
            LOGIN
          </div>

          <h2
            style={{
              fontFamily: "'Jua', sans-serif",
              fontSize: '38px',
              color: '#0A2342',
              marginBottom: '10px',
            }}
          >
            로그인
          </h2>

          <p
            style={{
              color: '#6B8794',
              fontSize: '15px',
              margin: 0,
            }}
          >
            회친자들에 오신 것을 환영합니다.
          </p>
        </div>

        {/* 아이디 입력 */}
        <div className="mb-3">
          <label
            htmlFor="id"
            className="form-label"
            style={{ fontWeight: 700 }}
          >
            아이디
          </label>

          <input
            type="text"
            className="form-control"
            id="id"
            placeholder="아이디"
            autoComplete="username"
            autoFocus
            disabled={loading}
            onKeyDown={event => enter_chk(event, 'password')}
            onChange={onChange}
            value={input.id}
            style={{
              height: '48px',
              borderRadius: '14px',
            }}
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="form-label"
            style={{ fontWeight: 700 }}
          >
            패스워드
          </label>

          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="패스워드"
            autoComplete="current-password"
            disabled={loading}
            onKeyDown={event => enter_chk(event, 'btnSend')}
            onChange={onChange}
            value={input.password}
            style={{
              height: '48px',
              borderRadius: '14px',
            }}
          />
        </div>

        {/* 로그인 버튼 */}
        <button
          id="btnSend"
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{
            width: '100%',
            height: '48px',
            borderRadius: '14px',
          }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        {/*
         * 테스트 계정 버튼
         *
         * npm run dev로 실행한 개발환경에서만 표시한다.
         * 화면 녹화와 관리자·회원 기능 테스트에 사용한다.
         */}
        {import.meta.env.DEV && (
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '12px',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              disabled={loading}
              onClick={setAdminTestAccount}
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '14px',
              }}
            >
              관리자 테스트
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              disabled={loading}
              onClick={setMemberTestAccount}
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '14px',
              }}
            >
              회원 테스트
            </button>
          </div>
        )}

        {/* 회원가입 이동 */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '28px',
            color: '#6B8794',
            fontSize: '14px',
          }}
        >
          계정이 없으신가요?{' '}

          <Link
            to="/member/signup"
            style={{
              color: '#00A88F',
              fontWeight: 700,
            }}
          >
            회원가입
          </Link>
        </div>
      </form>

      <SimpleModal
        show={modal.show}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={closeModal}
      />
    </div>
  );
};

export default Member_Login_plain;