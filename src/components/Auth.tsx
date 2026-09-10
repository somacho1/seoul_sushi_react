import { Link } from 'react-router-dom';

const Auth = () => {
  return (
    <>
      <br />
      <h5>접근할 수 없는 페이지입니다.</h5>
      <h5>
        로그인해주세요.
        <Link
          to="/member/login"
          style={{
            marginLeft: '10px',
            fontSize: '1em',
            fontWeight: 'bold'
          }}
        >
          로그인
        </Link>
      </h5>
      <br />
      <img
        src="/images/auth.png"
        alt="접근 권한 안내"
      />
    </>
  );
};

export default Auth;