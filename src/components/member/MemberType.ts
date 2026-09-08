
// MEMBERNO     NUMBER(5)     NOT NULL, -- [변경] EMPLOYEENO -> MEMBERNO
// ID           VARCHAR2(20)  NOT NULL UNIQUE, -- 회원 아이디 (중복 불가)
// PASSWORD     VARCHAR2(100) NOT NULL,        -- 비밀번호 (암호화 고려 길이 설정)
// MNAME        VARCHAR2(30)  NOT NULL,        -- 성명 (한글 10자 보장, UTF-8 기준 30바이트)
// JOINDATE     VARCHAR2(19)  NOT NULL,        -- 가입일 (예: 2026-06-24 10:12:45)
// BIRTHDATE    VARCHAR2(10),                  -- 생년월일 (선택 입력 가능, 예: 1995-12-25)
// EMAIL        VARCHAR2(50),                  -- 이메일 (선택 입력 가능)
// PHONE        VARCHAR2(15),                  -- 휴대폰 번호 (선택 입력 가능, 예: 010-1234-5678)
// GRADE        NUMBER(2)     DEFAULT 1 NOT NULL, -- 등급 (1~10: 일반/관리자, 20: 정지, 99: 탈퇴 등)
// STATUS       VARCHAR2(10)  DEFAULT '정상' NOT NULL, -- 계정 상태 (정상, 차단, 탈퇴 등)

export interface Member {
  memberno: number,
  id: string,
  password: string,
  mname: string,
  joindate: string,
  birth: string,
  email: string,
  phone: string,
  grade: number,
  status: string
}

