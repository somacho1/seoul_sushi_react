import { create } from 'zustand';
import {
  persist,
  createJSONStorage,
  type StateStorage
} from 'zustand/middleware';

/**
 * Zustand 로그인 상태를 보관하는 쿠키 저장소
 *
 * 비밀번호는 저장하지 않고
 * 로그인 여부와 회원 식별정보만 저장한다.
 */
const cookieStorage: StateStorage = {
  /** 쿠키에서 문자열 가져오기 */
  getItem: (name: string) => {
    const match = document.cookie.match(
      new RegExp(`(^| )${name}=([^;]+)`)
    );

    return match
      ? decodeURIComponent(match[2])
      : null;
  },

  /** 쿠키에 문자열 저장하기 */
  setItem: (name: string, value: string) => {
    const maxAge = 60 * 60 * 24 * 7;

    document.cookie =
      `${name}=${encodeURIComponent(value)}; `
      + `path=/; `
      + `max-age=${maxAge}; `
      + `SameSite=Lax`;
  },

  /** 쿠키 삭제 */
  removeItem: (name: string) => {
    document.cookie =
      `${name}=; `
      + 'Max-Age=0; '
      + 'path=/; '
      + 'SameSite=Lax';
  }
};

/** 전역 로그인 상태 타입 */
interface GlobalStore {
  /** 로그인 여부 */
  login: boolean;
  setLogin: (value: boolean) => void;

  /** 로그인한 회원번호 */
  memberno: number;
  setMemberno: (value: number) => void;

  /** 로그인한 회원 아이디 */
  id: string;
  setId: (value: string) => void;

  /** 회원 등급 */
  grade: number;
  setGrade: (value: number) => void;

  /** 로그아웃 또는 회원탈퇴 시 로그인 정보 초기화 */
  resetUser: () => void;
}

/** 전역 로그인 Store */
export const useGlobalStore = create<GlobalStore>()(
  persist(
    set => ({
      login: false,
      memberno: 0,
      id: '',
      grade: 99,

      setLogin: value => {
        set({ login: value });
      },

      setMemberno: value => {
        set({ memberno: value });
      },

      setId: value => {
        set({ id: value });
      },

      setGrade: value => {
        set({ grade: value });
      },

      /** 로그인 회원정보 초기화 */
      resetUser: () => {
        set({
          login: false,
          memberno: 0,
          id: '',
          grade: 99
        });
      }
    }),
    {
      /** 브라우저에 저장되는 쿠키 이름 */
      name: 'global-store',

      storage: createJSONStorage(
        () => cookieStorage
      ),

      /**
       * 쿠키에 저장할 값 제한
       *
       * 함수나 비밀번호는 저장하지 않고
       * 화면 유지에 필요한 회원 상태만 저장한다.
       */
      partialize: state => ({
        login: state.login,
        memberno: state.memberno,
        id: state.id,
        grade: state.grade
      })
    }
  )
);