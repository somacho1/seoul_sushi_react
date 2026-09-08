// /src/components/member/Signup.tsx
import React, { useState, type ChangeEvent } from 'react'
import { enter_chk, getIP, axiosInstance } from '../Tool'
import { Link, useNavigate } from 'react-router-dom'

const Signup = () => {
    const [input, setInput] = useState({
        mname: '투투투',
        id: 'user',
        password: '1234',
        password2: '1234',
        birth: '1998-08-20',
        email: 'naver@gmail.com',
        phone: '010-1234-1234',
    });

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        console.log(`-> ${id}: ${value}`);

        setInput({
            ...input,
            [id]: value,
        });
    }

    const test = () => {
        setInput({
            mname: '가나다',
            id: 'user10',
            password: '1234',
            password2: '1234',
            birth: '2000-07-22',
            email: 'google4@gmail.com',
            phone: '010-1234-5678',
        });
    }

    const [id_msg, setId_msg] = useState('');
    const [password_msg, setPassword_msg] = useState('');

    const [checkId_sw, setCheckId_sw] = useState(false);
    const [checkId_cnt, setCheckId_cnt] = useState(1);

    const checkId = () => {
        setCheckId_sw(true);

        console.log(`-> http://${getIP()}:9101/member/check_id?id=${input.id}`);

        axiosInstance.get(`/member/check_id?id=${input.id}`)
            .then(result => result.data)
            .then(data => {
                console.log('-> data:', data);

                if (data == 0) {
                    setId_msg('사용 가능한 아이디 입니다.');
                    setCheckId_cnt(0);
                } else {
                    setCheckId_cnt(1);
                    setId_msg('사용 불가능한 아이디 입니다.');
                }
            })
            .catch(err => console.error(err))
    }

    const navigate = useNavigate();

    const send = (e: React.SyntheticEvent) => {
        e.preventDefault();
        console.log(input);

        if (input.password !== input.password2) {
            setPassword_msg('입력된 패스워드가 일치하지 않습니다.');
        } else {
            if (checkId_sw == false) {
                setId_msg('중복 아이디를 체크해주세요.');
            } else if (checkId_cnt == 1) {
                setId_msg('아이디가 중복됩니다. 아이디를 다시 체크해주세요.');
            } else {
                axiosInstance.post(`/member/save`, {
                    mname: input.mname,
                    id: input.id,
                    password: input.password,
                    birth: input.birth,
                    email: input.email,
                    phone: input.phone
                })
                    .then(result => result.data)
                    .then(joindate => {
                        console.log('-> joindate:', joindate);
                        alert('회원가입에 성공하였습니다.');
                        navigate('/');
                    })
                    .catch(err => console.error(err))
            }
        }
    }

    return (
        <div
            style={{
                width: '100%',
                minHeight: 'calc(100vh - 72px)',
                background: 'linear-gradient(180deg, #F8FEFF 0%, #F1F9FA 100%)',
                padding: '60px 20px 100px',
            }}
        >
            <form
                onSubmit={send}
                style={{
                    maxWidth: '620px',
                    margin: '0 auto',
                    padding: '42px',
                    background: '#fff',
                    borderRadius: '24px',
                    boxShadow: '0 18px 45px rgba(10, 35, 66, 0.10)',
                    border: '1px solid rgba(10, 35, 66, 0.08)',
                    textAlign: 'left',
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '34px' }}>
                    <div
                        style={{
                            color: '#00A88F',
                            fontSize: '12px',
                            fontWeight: 900,
                            letterSpacing: '1.5px',
                            marginBottom: '10px',
                        }}
                    >
                        JOIN
                    </div>

                    <h2
                        style={{
                            fontFamily: "'Jua', sans-serif",
                            fontSize: '38px',
                            color: '#0A2342',
                            marginBottom: '10px',
                        }}
                    >
                        회원가입
                    </h2>

                    <p
                        style={{
                            fontSize: '15px',
                            color: '#6B8794',
                            lineHeight: 1.7,
                            margin: 0,
                        }}
                    >
                        서울 숙성회 맛집 커뮤니티에 가입해보세요.
                    </p>
                </div>

                <div className="mb-3">
                    <label className="form-label" style={labelStyle}>성명</label>
                    <input
                        type="text"
                        className="form-control"
                        id="mname"
                        placeholder="성명"
                        onKeyDown={e => enter_chk(e, 'id')}
                        onChange={onChange}
                        value={input.mname}
                        style={inputStyle}
                        autoFocus
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" style={labelStyle}>아이디</label>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            className="form-control"
                            id="id"
                            placeholder="아이디"
                            onKeyDown={e => enter_chk(e, 'btnCheckId')}
                            onChange={onChange}
                            value={input.id}
                            style={{ ...inputStyle, flex: 1 }}
                        />

                        <button
                            type="button"
                            id="btnCheckId"
                            onClick={checkId}
                            style={checkButtonStyle}
                        >
                            중복 확인
                        </button>
                    </div>

                    <span
                        style={{
                            display: 'block',
                            marginTop: '8px',
                            color: checkId_cnt === 0 ? '#00A88F' : '#E63946',
                            fontSize: '13px',
                            fontWeight: 700,
                        }}
                    >
                        {id_msg}
                    </span>
                </div>

                <div className="mb-3">
                    <label className="form-label" style={labelStyle}>패스워드</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="패스워드"
                        onKeyDown={e => enter_chk(e, 'password2')}
                        onChange={onChange}
                        value={input.password}
                        style={inputStyle}
                    />

                    <span
                        style={{
                            display: 'block',
                            marginTop: '8px',
                            color: '#E63946',
                            fontSize: '13px',
                            fontWeight: 700,
                        }}
                    >
                        {password_msg}
                    </span>
                </div>

                <div className="mb-3">
                    <label className="form-label" style={labelStyle}>패스워드 확인</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password2"
                        placeholder="패스워드 확인"
                        onKeyDown={e => enter_chk(e, 'birth')}
                        onChange={onChange}
                        value={input.password2}
                        style={inputStyle}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" style={labelStyle}>생년월일</label>
                    <input
                        type="text"
                        className="form-control"
                        id="birth"
                        placeholder="YYYY-MM-DD"
                        onKeyDown={e => enter_chk(e, 'email')}
                        onChange={onChange}
                        value={input.birth}
                        style={inputStyle}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" style={labelStyle}>이메일</label>
                    <input
                        type="text"
                        className="form-control"
                        id="email"
                        placeholder="이메일"
                        onKeyDown={e => enter_chk(e, 'phone')}
                        onChange={onChange}
                        value={input.email}
                        style={inputStyle}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" style={labelStyle}>전화번호</label>
                    <input
                        type="text"
                        className="form-control"
                        id="phone"
                        placeholder="전화번호"
                        onKeyDown={e => enter_chk(e, 'btnSend')}
                        onChange={onChange}
                        value={input.phone}
                        style={inputStyle}
                    />
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        marginTop: '32px',
                    }}
                >
                    <button
                        id="btnSend"
                        type="submit"
                        style={submitButtonStyle}
                    >
                        회원가입
                    </button>

                    <button
                        id="btnTest"
                        type="button"
                        onClick={test}
                        style={testButtonStyle}
                    >
                        테스트 계정
                    </button>
                </div>

                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '28px',
                        color: '#6B8794',
                        fontSize: '14px',
                    }}
                >
                    이미 계정이 있으신가요?{' '}
                    <Link
                        to="/member/login"
                        style={{
                            color: '#00A88F',
                            fontWeight: 800,
                        }}
                    >
                        로그인
                    </Link>
                </div>
            </form>
        </div>
    )
}

const labelStyle: React.CSSProperties = {
    color: '#0A2342',
    fontSize: '14px',
    fontWeight: 800,
    marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '48px',
    borderRadius: '14px',
    border: '1px solid #DDEFF2',
    padding: '0 15px',
    fontSize: '15px',
    color: '#0A2342',
    boxShadow: 'none',
}

const checkButtonStyle: React.CSSProperties = {
    width: '110px',
    height: '48px',
    border: 'none',
    borderRadius: '14px',
    background: '#0A2342',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 800,
    cursor: 'pointer',
}

const submitButtonStyle: React.CSSProperties = {
    flex: 1,
    height: '50px',
    border: 'none',
    borderRadius: '15px',
    background: '#00C9A7',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(0, 201, 167, 0.28)',
}

const testButtonStyle: React.CSSProperties = {
    flex: 1,
    height: '50px',
    border: '1px solid #DDEFF2',
    borderRadius: '15px',
    background: '#fff',
    color: '#0A2342',
    fontSize: '15px',
    fontWeight: 900,
    cursor: 'pointer',
}

export default Signup