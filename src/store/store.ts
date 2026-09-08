import { create } from 'zustand';
import {
  persist,
  createJSONStorage
} from 'zustand/middleware';

/**
 * 쿠키 저장소
 *
 * Zustand persist가 쿠키를
 * 저장소처럼 사용할 수 있도록 구성한다.
 */
const cookieStorage = {
  /**
   * 쿠키에서 값 가져오기
   */
  getItem: (
    name: string
  ) => {
    const match =
      document.cookie.match(
        new RegExp(
          `(^| )${name}=([^;]+)`
        )
      );

    if (!match) {
      return null;
    }

    try {
      return JSON.parse(
        decodeURIComponent(
          match[2]
        )
      );
    } catch (error) {
      console.error(
        '쿠키 읽기 실패:',
        error
      );

      return null;
    }
  },

  /**
   * 쿠키에 값 저장하기
   *
   * max-age:
   * 60초 × 60분 × 24시간 × 7일
   */
  setItem: (
    name: string,
    value: string
  ) => {
    const maxAge =
      60 * 60 * 24 * 7;

    document.cookie =
      `${name}=${encodeURIComponent(value)}; `
      + `path=/; `
      + `max-age=${maxAge}; `
      + `SameSite=Lax`;
  },

  /**
   * 쿠키 삭제
   */
  removeItem: (
    name: string
  ) => {
    document.cookie =
      `${name}=; `
      + 'Max-Age=0; '
      + 'path=/; '
      + 'SameSite=Lax';
  }
};

/**
 * 전역 Store 타입
 */
interface GlobalStore {
  /**
   * 로그인 여부
   */
  login: boolean;

  setLogin: (
    value: boolean
  ) => void;

  /**
   * 로그인 회원번호
   */
  memberno: number;

  setMemberno: (
    value: number
  ) => void;

  /**
   * 로그인 아이디
   */
  id: string;

  setId: (
    value: string
  ) => void;

  /**
   * 아이디 저장 여부
   */
  storeId: boolean;

  setStoreId: (
    value: boolean
  ) => void;

  /**
   * 저장된 비밀번호
   */
  password: string;

  setPassword: (
    value: string
  ) => void;

  /**
   * 비밀번호 저장 여부
   */
  storePassword: boolean;

  setStorePassword: (
    value: boolean
  ) => void;

  /**
   * 회원 등급
   */
  grade: number;

  setGrade: (
    value: number
  ) => void;

  /**
   * 로그인 회원정보 전체 초기화
   *
   * 로그아웃 또는 회원탈퇴 성공 시 사용한다.
   */
  resetUser: () => void;
}

/**
 * 전역 로그인 Store
 */
export const useGlobalStore =
  create<GlobalStore>()(
    persist(
      set => ({
        login: false,

        setLogin: value =>
          set({
            login: value
          }),

        memberno: 0,

        setMemberno: value =>
          set({
            memberno: value
          }),

        id: '',

        setId: value =>
          set({
            id: value
          }),

        storeId: false,

        setStoreId: value =>
          set({
            storeId: value
          }),

        password: '',

        setPassword: value =>
          set({
            password: value
          }),

        storePassword: false,

        setStorePassword: value =>
          set({
            storePassword: value
          }),

        grade: 99,

        setGrade: value =>
          set({
            grade: value
          }),

        /**
         * 로그인 상태 초기화
         */
        resetUser: () =>
          set({
            login: false,
            memberno: 0,
            id: '',
            grade: 99,
            password: '',
            storePassword: false

            /**
             * 아이디 저장 여부는 유지한다.
             *
             * 로그아웃 후에도 아이디 저장 기능을
             * 유지하려면 storeId는 초기화하지 않는다.
             */
          })
      }),
      {
        /**
         * 쿠키에 저장될 키 이름
         */
        name: 'global-store',

        storage:
          createJSONStorage(
            () => cookieStorage
          )
      }
    )
  );