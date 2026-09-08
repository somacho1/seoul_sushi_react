import './PostEditor.css';
import { useEffect, useState } from 'react';
import { axiosInstance } from '../Tool';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalStore } from '../../store/store';
import Reply from '../reply/Reply';

interface Post {
    postno: number;
    contentno: number;
    memberno: number;
    title: string;
    content: string;
    recom: number;
    cnt: number;
    replycnt: number;
    word: string;
    visible: string;
    rdate: string;
}

interface PostImage {
    imageno: number;
    postno: number;
    filename: string;
    orgname: string;
    filesize: number;
    rdate: string;
}

function PostRead() {
    const { login, grade, memberno } = useGlobalStore();
    const { postno } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState<Post | null>(null);
    const [images, setImages] = useState<PostImage[]>([]);

    useEffect(() => {
        increaseCnt();
        readPost();
        readImages();
    }, [postno]);

    const increaseCnt = () => {
        axiosInstance.put(`/post/cnt/${postno}`)
            .then(result => result.data)
            .then(data => {
                console.log('조회수 증가:', data);
            })
            .catch(err => console.error(err));
    }

    const readPost = () => {
        axiosInstance.get(`/post/${postno}`)
            .then(result => result.data)
            .then(data => {
                console.log('게시글 조회:', data);
                setPost(data);
            })
            .catch(err => console.error(err));
    }

    const readImages = () => {
        axiosInstance.get(`/post/image/list/${postno}`)
            .then(result => result.data)
            .then(data => {
                console.log('이미지 목록:', data);
                setImages(data);
            })
            .catch(err => console.error(err));
    }

    const increaseRecom = () => {
        axiosInstance.put(`/post/recom/${postno}`)
            .then(result => result.data)
            .then(data => {
                console.log(data);
                readPost();
            })
            .catch(err => console.error(err));
    }

    if (post === null) {
        return (
            <div style={{
                width: '100%',
                minHeight: 'calc(100vh - 72px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B8794',
                background: 'linear-gradient(180deg, #F8FEFF 0%, #F1F9FA 100%)',
            }}>
                게시글을 불러오는 중입니다.
            </div>
        );
    }

    const canEdit =
        login &&
        (Number(grade) <= 5 || Number(post.memberno) === Number(memberno));

    return (
        <div className="post-page">
            <div className="post-shell">
                <div style={{ marginBottom: '24px' }}>
                    <div style={{
                        color: '#00A88F',
                        fontSize: '12px',
                        fontWeight: 900,
                        letterSpacing: '1.5px',
                        marginBottom: '8px',
                    }}>
                        REVIEW
                    </div>

                    <h2 style={{
                        fontFamily: "'Jua', sans-serif",
                        fontSize: '38px',
                        color: '#0A2342',
                        marginBottom: '8px',
                    }}>
                        게시글 조회
                    </h2>

                    <p style={{ color: '#6B8794', fontSize: '15px', margin: 0 }}>
                        숙성회 맛집 리뷰를 확인해보세요.
                    </p>
                </div>

                <div style={{
                    background: '#fff',
                    border: '1px solid rgba(10,35,66,.08)',
                    borderRadius: '22px',
                    padding: '34px',
                    textAlign: 'left',
                    boxShadow: '0 18px 45px rgba(10,35,66,.08)',
                }}>
                    <div style={{
                        fontFamily: "'Jua', sans-serif",
                        fontSize: '34px',
                        color: '#0A2342',
                        marginBottom: '18px',
                        lineHeight: 1.3,
                    }}>
                        {post.title}
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        flexWrap: 'wrap',
                        color: '#6B8794',
                        fontSize: '14px',
                        borderBottom: '1px solid #EAF3F5',
                        paddingBottom: '18px',
                        marginBottom: '26px',
                    }}>
                        <span>등록일 {post.rdate}</span>
                        <span>조회수 {post.cnt}</span>
                        <span>추천수 {post.recom}</span>
                        <span>댓글 {post.replycnt}</span>
                        <span>공개 {post.visible}</span>
                    </div>

                    {images.length > 0 && (
                        <div style={{ marginBottom: '26px' }}>
                            {images.map((image) => (
                                <img
                                    key={image.imageno}
                                    src={`${axiosInstance.defaults.baseURL}/post/image/${image.filename}`}
                                    alt={image.orgname}
                                    style={{
                                        width: '100%',
                                        maxHeight: '520px',
                                        objectFit: 'cover',
                                        borderRadius: '18px',
                                        marginBottom: '14px',
                                        border: '1px solid #EAF3F5',
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <div style={{
                        minHeight: '180px',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '2',
                        fontSize: '17px',
                        color: '#334155',
                        marginBottom: '26px',
                    }}>
                        {post.content}
                    </div>

                    {post.word && (
                        <div style={{
                            background: '#F8FEFF',
                            border: '1px solid #DDEFF2',
                            borderRadius: '14px',
                            padding: '12px 16px',
                            color: '#0A2342',
                            marginBottom: '26px',
                            fontSize: '14px',
                            fontWeight: 700,
                        }}>
                            검색어: {post.word}
                        </div>
                    )}

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                        marginTop: '10px',
                    }}>
                        {login && (
                            <button
                                className='btn btn-primary'
                                onClick={increaseRecom}
                                style={buttonStyle}
                            >
                                추천
                            </button>
                        )}

                        {canEdit && (
                            <>
                                <button
                                    className='btn btn-secondary'
                                    onClick={() => navigate(`/post/update/${post.postno}`)}
                                    style={buttonStyle}
                                >
                                    수정
                                </button>

                                <button
                                    className='btn btn-outline-danger'
                                    onClick={() => navigate(`/post/delete/${post.postno}`)}
                                    style={buttonStyle}
                                >
                                    삭제
                                </button>
                            </>
                        )}

                        <button
                            className='btn btn-secondary'
                            onClick={() => navigate(`/post/list/${post.contentno}`)}
                            style={buttonStyle}
                        >
                            목록
                        </button>
                    </div>
                </div>

                <div style={{
                    marginTop: '28px',
                    background: '#fff',
                    border: '1px solid rgba(10,35,66,.08)',
                    borderRadius: '22px',
                    padding: '28px 32px',
                    textAlign: 'left',
                    boxShadow: '0 18px 45px rgba(10,35,66,.08)',
                }}>
                    <Reply postno={post.postno} />
                </div>
            </div>
        </div>
    );
}

const buttonStyle: React.CSSProperties = {
    minWidth: '86px',
    height: '42px',
    borderRadius: '12px',
    fontWeight: 800,
};

export default PostRead;