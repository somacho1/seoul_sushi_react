import React, { useState, type ChangeEvent } from 'react'
import { enter_chk, axiosInstance } from '../Tool.js'
import { useGlobalStore } from '../../store/store.js'
import { Link, useNavigate } from 'react-router-dom'
import SimpleModal, { type SimpleModalTypePayload } from '../SimpleModal.js';

const Member_Login_plain = () => {
  // -------------------------------------------------------------------------------
  // SimpleModal
  // -------------------------------------------------------------------------------
  const [modal, setModal] = useState<SimpleModalTypePayload>({
    show: false,
    title: '',
    message: '',
    onConfirm: undefined,
  });

  const openModal = (payload: SimpleModalTypePayload) =>
    setModal({
      show: true,
      title: payload.title,
      message: payload.message,
      onConfirm: payload.onConfirm ?? undefined,
    });

  const closeModal = () =>
    setModal((m) => ({ ...m, show: false }));

  // -------------------------------------------------------------------------------

  const navigate = useNavigate();

  const {
    setLogin,
    id,
    setId,
    storeId,
    setStoreId,
    password,
    setPassword,
    storePassword,
    setStorePassword,
    grade,
    setGrade,
    setMemberno
  } = useGlobalStore();

  console.log('-> Cookie 로그인 정보');
  console.log('-> id:', id);
  console.log('-> storeId:', storeId);
  console.log('-> password:', password);
  console.log('-> storePassword:', storePassword);

  const [input, setInput] = useState({
    id: 'user1',
    password: '1234',
    grade: 99
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput({
      ...input,
      [e.target.id]: e.target.value,
    });
  };

  const setStoreIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setStoreId(true);
    } else {
      setStoreId(false);
    }
  };

  const setStorePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setStorePassword(true);
    } else {
      setStorePassword(false);
    }
  };

  const test = () => {
    setInput({
      id: 'user',
      password: '1234',
      grade: 5
    });
  };

  const send = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const loginResult = await axiosInstance.post(
      `/member/login?id=${input.id}&password=${input.password}`
    );

    const loginResultData = loginResult.data;

    console.log('-> axiosInstance data:' + loginResultData);

    if (loginResultData === 1) {
      console.log('로그인 성공');

      setLogin(true);

      if (storeId === true) {
        setId(input.id);
        setStoreId(true);
      } else {
        setId('');
        setStoreId(false);
      }

      if (storePassword === true) {
        setPassword(input.password);
        setStorePassword(true);
      } else {
        setPassword('');
        setStorePassword(false);
      }

      const memberResult = await axiosInstance.get(
        `/member/read_id/${input.id}`
      );

      const memberResultData = memberResult.data;

      console.log('-> memberResultData.grade:' + memberResultData.grade);
      console.log('-> memberResultData.memberno:' + memberResultData.memberno);

      setGrade(memberResultData.grade);
      setId(memberResultData.id);
      setMemberno(memberResultData.memberno);

      navigate('/');
    } else {
      openModal({
        show: true,
        title: '로그인 실패',
        message: '로그인 정보를 다시 입력해주세요.',
      });
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 72px)',
        background: 'linear-gradient(180deg,#F8FEFF 0%,#F1F9FA 100%)',
        padding: '70px 20px 100px'
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
          textAlign: 'left'
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '34px'
          }}
        >
          <div
            style={{
              color: '#00A88F',
              fontSize: '12px',
              fontWeight: 900,
              letterSpacing: '1.5px',
              marginBottom: '10px'
            }}
          >
            LOGIN
          </div>

          <h2
            style={{
              fontFamily: "'Jua', sans-serif",
              fontSize: '38px',
              color: '#0A2342',
              marginBottom: '10px'
            }}
          >
            로그인
          </h2>

          <p
            style={{
              color: '#6B8794',
              fontSize: '15px',
              margin: 0
            }}
          >
            회친자들에 오신 것을 환영합니다.
          </p>
        </div>

        <div className="mb-3">
          <label
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
            autoFocus
            onKeyDown={e => enter_chk(e, 'password')}
            onChange={onChange}
            value={input.id}
            style={{
              height: '48px',
              borderRadius: '14px'
            }}
          />
        </div>

        <div
          className="mb-3 form-check"
          style={{
            marginLeft: '2px'
          }}
        >
          <input
            type="checkbox"
            id="storeId"
            className="form-check-input"
            onChange={setStoreIdChange}
            checked={storeId}
            style={{ marginTop: '2px' }}
          />

          <label
            className="form-check-label"
            htmlFor="storeId"
            style={{
              color: '#6B8794'
            }}
          >
            아이디 저장
          </label>
        </div>

        <div className="mb-3">
          <label
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
            onKeyDown={e => enter_chk(e, 'btnSend')}
            onChange={onChange}
            value={input.password}
            style={{
              height: '48px',
              borderRadius: '14px'
            }}
          />
        </div>

        <div
          className="mb-4 form-check"
          style={{
            marginLeft: '2px'
          }}
        >
          <input
            type="checkbox"
            id="storePassword"
            className="form-check-input"
            onChange={setStorePasswordChange}
            checked={storePassword}
            style={{ marginTop: '2px' }}
          />

          <label
            className="form-check-label"
            htmlFor="storePassword"
            style={{
              color: '#6B8794'
            }}
          >
            패스워드 저장
          </label>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px'
          }}
        >
          <button
            id="btnSend"
            type="submit"
            className="btn btn-primary"
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '14px'
            }}
          >
            로그인
          </button>

          <button
            id="btnTest"
            type="button"
            className="btn btn-secondary"
            onClick={test}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '14px'
            }}
          >
            테스트 계정
          </button>
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: '28px',
            color: '#6B8794',
            fontSize: '14px'
          }}
        >
          계정이 없으신가요?{' '}
          <Link
            to="/member/signup"
            style={{
              color: '#00A88F',
              fontWeight: 700
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

}

export default Member_Login_plain;