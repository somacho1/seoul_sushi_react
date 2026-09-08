import {
  useState,
  type ChangeEvent,
  type FormEvent
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

import {
  axiosInstance,
  enter_chk
} from '../Tool';

/**
 * 로그인한 회원 정보를 가져오기 위한 전역 Store
 *
 * 현재 파일 위치:
 * src/components/member/Member_Update_password.tsx
 *
 * Store 위치:
 * src/store/store.ts
 *
 * 따라서 ../../store/store 경로를 사용한다.
 */
import {
  useGlobalStore
} from '../../store/store';

/**
 * 비밀번호 입력 상태 타입
 */
interface PasswordInput {
  /**
   * 현재 비밀번호
   */
  password: string;

  /**
   * 새 비밀번호
   */
  new_password1: string;

  /**
   * 새 비밀번호 확인
   */
  new_password2: string;
}

/**
 * 회원 비밀번호 변경 페이지
 */
const Member_Update_password = () => {
  const navigate = useNavigate();

  /**
   * 로그인한 회원 정보
   *
   * 기존에는 id: 'user1'로 고정되어 있었지만,
   * 이제 전역 Store에 저장된 실제 로그인 아이디를 사용한다.
   */
  const {
    login,
    id
  } = useGlobalStore();

  /**
   * 비밀번호 입력값
   *
   * 테스트용 비밀번호를 기본값으로 넣으면
   * 보안상 좋지 않으므로 전부 빈 문자열로 시작한다.
   */
  const [
    input,
    setInput
  ] = useState<PasswordInput>({
    password: '',
    new_password1: '',
    new_password2: ''
  });

  /**
   * 사용자에게 보여줄 결과 메시지
   */
  const [
    password_msg,
    setPassword_msg
  ] = useState('');

  /**
   * API 요청 처리 중 여부
   *
   * 변경 버튼을 여러 번 누르는 것을 방지한다.
   */
  const [
    submitting,
    setSubmitting
  ] = useState(false);

  /**
   * 비밀번호 입력값 변경 처리
   */
  const onChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const {
      id: inputId,
      value
    } = e.target;

    setInput(previous => ({
      ...previous,
      [inputId]: value
    }));

    /**
     * 사용자가 다시 입력하기 시작하면
     * 기존 오류 메시지를 제거한다.
     */
    setPassword_msg('');
  };

  /**
   * 비밀번호 변경 요청
   *
   * API:
   * POST /member/update_password
   *
   * 요청 JSON:
   * {
   *   "id": "로그인한 회원 아이디",
   *   "password": "현재 비밀번호",
   *   "new_password": "새 비밀번호"
   * }
   */
  const send = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    /**
     * 로그인 여부 검사
     */
    if (
      !login
      || !id
    ) {
      setPassword_msg(
        '로그인 정보가 없습니다. 다시 로그인해주세요.'
      );

      return;
    }

    /**
     * 현재 비밀번호 입력 검사
     */
    if (
      input.password.trim() === ''
    ) {
      setPassword_msg(
        '현재 비밀번호를 입력해주세요.'
      );

      return;
    }

    /**
     * 새 비밀번호 입력 검사
     */
    if (
      input.new_password1.trim() === ''
    ) {
      setPassword_msg(
        '새 비밀번호를 입력해주세요.'
      );

      return;
    }

    /**
     * 새 비밀번호 확인 입력 검사
     */
    if (
      input.new_password2.trim() === ''
    ) {
      setPassword_msg(
        '새 비밀번호 확인을 입력해주세요.'
      );

      return;
    }

    /**
     * 새 비밀번호 일치 여부 검사
     */
    if (
      input.new_password1
      !== input.new_password2
    ) {
      setPassword_msg(
        '새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.'
      );

      return;
    }

    /**
     * 현재 비밀번호와 새 비밀번호가 같은지 검사
     */
    if (
      input.password
      === input.new_password1
    ) {
      setPassword_msg(
        '새 비밀번호는 현재 비밀번호와 다르게 입력해주세요.'
      );

      return;
    }

    /**
     * 최소 길이 검사
     *
     * 프로젝트 정책에 따라 숫자를 변경해도 된다.
     */
    if (
      input.new_password1.length < 4
    ) {
      setPassword_msg(
        '새 비밀번호는 4자 이상 입력해주세요.'
      );

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
      setPassword_msg('');

      const response =
        await axiosInstance.post<number>(
          '/member/update_password',
          {
            /**
             * 핵심 수정 부분
             *
             * 기존:
             * id: 'user1'
             *
             * 수정:
             * id: 전역 Store의 로그인 아이디
             */
            id: id,

            /**
             * 사용자가 입력한 현재 비밀번호
             */
            password: input.password,

            /**
             * 사용자가 입력한 새 비밀번호
             */
            new_password:
              input.new_password1
          }
        );

      const result =
        Number(response.data);

      /**
       * 백엔드 응답값
       *
       * 0: 비밀번호 변경 실패
       * 1: 비밀번호 변경 성공
       * 2: 현재 비밀번호 불일치
       */
      if (result === 1) {
        alert(
          '비밀번호를 변경했습니다.'
        );

        /**
         * 입력값 초기화
         */
        setInput({
          password: '',
          new_password1: '',
          new_password2: ''
        });

        /**
         * 비밀번호 변경 후 마이페이지로 이동
         */
        navigate(
          '/member/mypage'
        );

        return;
      }

      if (result === 2) {
        setPassword_msg(
          '현재 비밀번호가 일치하지 않습니다.'
        );

        return;
      }

      setPassword_msg(
        '비밀번호 변경에 실패했습니다. 다시 시도해주세요.'
      );
    } catch (error) {
      console.error(
        '비밀번호 변경 오류:',
        error
      );

      setPassword_msg(
        '서버 통신 중 오류가 발생했습니다.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 로그인하지 않은 상태에서 주소로 직접 들어온 경우
   */
  if (
    !login
    || !id
  ) {
    return (
      <div>
        <div className="title_line">
          패스워드 변경
        </div>

        <div
          style={{
            width: '50%',
            margin: '40px auto',
            textAlign: 'center'
          }}
        >
          <p>
            로그인한 회원만 비밀번호를
            변경할 수 있습니다.
          </p>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              navigate(
                '/member/login'
              );
            }}
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="title_line">
        패스워드 변경
      </div>

      <form
        onSubmit={send}
        style={{
          margin: '10px auto',
          width: '50%',
          textAlign: 'left'
        }}
      >
        {/* 로그인 아이디 표시 */}
        <div className="mb-3">
          <label
            className="form-label"
            style={{
              marginTop: '15px'
            }}
          >
            아이디
          </label>

          <input
            type="text"
            className="form-control form-control-sm"
            value={id}
            readOnly
            style={{
              width: '100%',
              backgroundColor: '#f5f5f5'
            }}
          />
        </div>

        {/* 현재 비밀번호 */}
        <div className="mb-3">
          <label
            className="form-label"
            style={{
              marginTop: '15px'
            }}
          >
            현재 패스워드
          </label>

          <input
            type="password"
            className="form-control form-control-sm"
            id="password"
            placeholder="현재 패스워드를 입력해주세요."
            onKeyDown={e =>
              enter_chk(
                e,
                'new_password1'
              )
            }
            onChange={onChange}
            value={input.password}
            style={{
              width: '100%'
            }}
            autoComplete="current-password"
            autoFocus
          />
        </div>

        {/* 새 비밀번호 */}
        <div className="mb-3">
          <label
            className="form-label"
            style={{
              marginTop: '15px'
            }}
          >
            새로운 패스워드
          </label>

          <input
            type="password"
            className="form-control form-control-sm"
            id="new_password1"
            placeholder="새 패스워드를 입력해주세요."
            onKeyDown={e =>
              enter_chk(
                e,
                'new_password2'
              )
            }
            onChange={onChange}
            value={input.new_password1}
            style={{
              width: '100%'
            }}
            autoComplete="new-password"
          />
        </div>

        {/* 새 비밀번호 확인 */}
        <div className="mb-3">
          <label className="form-label">
            새로운 패스워드 확인
          </label>

          <input
            type="password"
            className="form-control form-control-sm"
            id="new_password2"
            placeholder="새 패스워드를 한 번 더 입력해주세요."
            onKeyDown={e =>
              enter_chk(
                e,
                'btnSend'
              )
            }
            onChange={onChange}
            value={input.new_password2}
            style={{
              width: '100%'
            }}
            autoComplete="new-password"
          />
        </div>

        {/* 처리 결과 메시지 */}
        {password_msg !== '' && (
          <div className="mb-3">
            <div
              style={{
                color: '#d93025',
                whiteSpace: 'pre-line'
              }}
            >
              {password_msg}
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div
          style={{
            textAlign: 'center'
          }}
        >
          <button
            id="btnSend"
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={submitting}
            style={{
              marginRight: '10px'
            }}
          >
            {submitting
              ? '변경 중...'
              : '패스워드 변경'}
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => {
              navigate(
                '/member/mypage'
              );
            }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default Member_Update_password;