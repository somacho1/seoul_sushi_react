import axios from 'axios';

/**
 * Spring Boot 백엔드 API 주소
 *
 * .env 파일의 VITE_API_BASE_URL을 사용한다.
 * 설정값이 없으면 로컬 백엔드 주소를 사용한다.
 */
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:9101';

/**
 * 백엔드 서버 IP 또는 도메인 반환
 */
const getIP = () => {
    try {
        return new URL(API_BASE_URL).hostname;
    } catch {
        return 'localhost';
    }
};

/**
 * 저작권 문구
 */
const getCopyright = () => {
    return '© 2026 회친자들. All Rights Reserved.';
};

/**
 * 현재 날짜와 시간을
 * YYYY-MM-DD HH:mm:ss 형식으로 반환
 */
const getNowDate = () => {
    const now = new Date();

    const rdate = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    })
        .replace(/\./g, '-')
        .replace(/- /g, '-')
        .trim()
        .slice(0, -1);

    return rdate.replace(/-([0-9]{2}:)/, ' $1');
};

/**
 * Enter 입력 시 지정한 요소로 포커스 이동
 */
function enter_chk(
    e: React.KeyboardEvent<HTMLInputElement> | KeyboardEvent,
    nextTag: string
) {
    if (e.key === 'Enter') {
        e.preventDefault();

        const nextElement = document.getElementById(nextTag);

        if (nextElement) {
            nextElement.focus();
        }
    }
}

/**
 * 모든 백엔드 API 요청에 사용하는
 * 공통 Axios 객체
 */
const axiosInstance = axios.create({
    baseURL: API_BASE_URL
});

export {
    getIP,
    getCopyright,
    getNowDate,
    enter_chk,
    axiosInstance
};