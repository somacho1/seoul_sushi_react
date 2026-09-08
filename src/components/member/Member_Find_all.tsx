import { useEffect, useState } from 'react'
import { axiosInstance } from '../Tool';
import { Link } from 'react-router-dom'
import { type Member } from './MemberType';
import { useGlobalStore } from '../../store/store';
import { useNavigate } from 'react-router-dom';

const Member_Find_all = () => {
  console.log('-> Member_Find_all 렌더링');

  const [data, setData] = useState<Member[]>([]);
  const { grade } = useGlobalStore();
  const navigate = useNavigate();

  useEffect(
    () => {
      axiosInstance.get(`/member/find_all`)
        .then(result => result.data)
        .then(data => {
          console.log('-> data:', data);
          setData(data);
          console.log('-> setData(data)');
        })
        .catch(err => console.error(err));
    }, []);

  return (
    <div
      style={{
        width: '100%',
        minHeight: 'calc(100vh - 72px)',
        background: 'linear-gradient(180deg, #F8FEFF 0%, #F1F9FA 100%)',
        padding: '60px 20px 100px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              color: '#00A88F',
              fontSize: '12px',
              fontWeight: 900,
              letterSpacing: '1.5px',
              marginBottom: '8px',
            }}
          >
            MEMBER
          </div>

          <h2
            style={{
              fontFamily: "'Jua', sans-serif",
              fontSize: '38px',
              color: '#0A2342',
              marginBottom: '8px',
            }}
          >
            회원 목록
          </h2>

          <p
            style={{
              color: '#6B8794',
              fontSize: '15px',
              margin: 0,
            }}
          >
            가입된 회원 정보를 확인하고 관리합니다.
          </p>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: '22px',
            boxShadow: '0 14px 36px rgba(10,35,66,.08)',
            border: '1px solid rgba(10,35,66,.08)',
            overflowX: 'auto',
          }}
        >
          <table
            className="table table-hover"
            style={{
              width: '100%',
              margin: 0,
              minWidth: '900px',
            }}
          >
            <thead>
              <tr style={{ background: '#F0FAFA' }}>
                <th style={thStyle}>번호</th>
                <th style={thStyle}>아이디</th>
                <th style={thStyle}>성명</th>
                <th style={thStyle}>이메일</th>
                <th style={thStyle}>전화번호</th>
                <th style={thStyle}>가입일</th>
                <th style={thStyle}>관리</th>
              </tr>
            </thead>

            <tbody>
              {
                data.length == 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: '50px',
                        textAlign: 'center',
                        color: '#6B8794',
                      }}
                    >
                      등록된 관리자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  data && data.map((item, index) =>
                    <tr key={item.memberno}>
                      <td style={tdStyle}>{index + 1}</td>

                      <td style={tdStyle}>
                        <Link to={`/member/read/${item.memberno}`} style={linkStyle}>
                          {item.id}
                        </Link>
                      </td>

                      <td style={tdStyle}>
                        <Link to={`/member/read/${item.memberno}`} style={linkStyle}>
                          {item.mname}
                        </Link>
                      </td>

                      <td style={tdStyle}>
                        <Link to={`/member/read/${item.memberno}`} style={linkStyle}>
                          {item.email}
                        </Link>
                      </td>

                      <td style={tdStyle}>
                        <Link to={`/member/read/${item.memberno}`} style={linkStyle}>
                          {item.phone}
                        </Link>
                      </td>

                      <td style={tdStyle}>
                        {item.joindate?.substring(0, 10)}
                      </td>

                      <td style={tdStyle}>
                        <Link
                          to={`/member/update/${item.memberno}`}
                          style={{
                            ...actionLinkStyle,
                            color: '#00A88F',
                          }}
                        >
                          수정
                        </Link>

                        <span style={{ color: '#CCDDE2', margin: '0 8px' }}>|</span>

                        <Link
                          to={`/member/delete/${item.memberno}`}
                          style={{
                            ...actionLinkStyle,
                            color: '#E63946',
                          }}
                        >
                          삭제
                        </Link>
                      </td>
                    </tr>
                  )
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '15px',
  textAlign: 'center',
  color: '#0A2342',
  fontSize: '14px',
  fontWeight: 800,
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '15px',
  textAlign: 'center',
  color: '#5A7A8A',
  fontSize: '14px',
  borderBottom: '1px solid #EAF3F5',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

const linkStyle: React.CSSProperties = {
  color: '#0A2342',
  fontWeight: 700,
  textDecoration: 'none',
};

const actionLinkStyle: React.CSSProperties = {
  fontWeight: 800,
  textDecoration: 'none',
};

export default Member_Find_all