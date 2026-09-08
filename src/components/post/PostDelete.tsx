import './PostEditor.css';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../Tool';

interface Post {
    postno: number;
    contentno: number;
    memberno: number;
    title: string;
    content: string;
    recom: number;
    cnt: number;
    replycnt: number;
    rating: number;
    word: string;
    visible: string;
    rdate: string;
}

function PostDelete() {
    const { postno } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadPost();
    }, [postno]);

    const loadPost = () => {
        if (!postno) {
            alert('게시글 번호가 올바르지 않습니다.');
            navigate(-1);
            return;
        }

        setLoading(true);

        axiosInstance
            .get<Post>(`/post/${postno}`)
            .then(result => result.data)
            .then(data => {
                setPost(data);
            })
            .catch(err => {
                console.error('게시글 조회 실패:', err);
                alert('게시글 정보를 불러오지 못했습니다.');
                navigate(-1);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const deletePost = async () => {
        if (!post || deleting) {
            return;
        }

        const confirmed = window.confirm(
            '게시글과 등록된 이미지, 댓글이 모두 삭제될 수 있습니다.\n정말 삭제하시겠습니까?'
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);

            await axiosInstance.delete(
                `/post/${post.postno}`
            );

            alert('게시글이 삭제되었습니다.');

            navigate(
                `/post/list/${post.contentno}`,
                { replace: true }
            );

        } catch (err) {
            console.error('게시글 삭제 실패:', err);
            alert('게시글 삭제 중 오류가 발생했습니다.');

        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div
                className="post-page"
                style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: '#6B8794'
                }}
            >
                게시글 정보를 불러오는 중입니다.
            </div>
        );
    }

    if (!post) {
        return (
            <div
                className="post-page"
                style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: '#6B8794'
                }}
            >
                게시글을 찾을 수 없습니다.
            </div>
        );
    }

    return (
        <div className="post-page">
            <div className="post-shell">
                <div className="title_line">
                    게시글 삭제
                </div>

                <div
                    style={{
                        maxWidth: '720px',
                        margin: '24px auto',
                        padding: '28px',
                        border: '1px solid #FFD6D9',
                        borderRadius: '18px',
                        background: '#FFF7F7',
                        boxShadow: '0 14px 35px rgba(10, 35, 66, 0.08)'
                    }}
                >
                    <div
                        style={{
                            marginBottom: '24px',
                            color: '#E63946',
                            fontSize: '16px',
                            fontWeight: 800,
                            lineHeight: 1.7,
                            textAlign: 'center'
                        }}
                    >
                        게시글을 삭제하면 복구할 수 없습니다.
                        <br />
                        등록된 이미지도 함께 삭제됩니다.
                    </div>

                    <table className="table_center table">
                        <tbody>
                            <tr>
                                <td
                                    className="table_underline"
                                    style={{
                                        width: '20%',
                                        textAlign: 'center',
                                        fontWeight: 800
                                    }}
                                >
                                    제목
                                </td>

                                <td
                                    className="table_underline"
                                    style={{
                                        textAlign: 'left'
                                    }}
                                >
                                    {post.title}
                                </td>
                            </tr>

                            <tr>
                                <td
                                    className="table_underline"
                                    style={{
                                        textAlign: 'center',
                                        fontWeight: 800
                                    }}
                                >
                                    별점
                                </td>

                                <td
                                    className="table_underline"
                                    style={{
                                        textAlign: 'left'
                                    }}
                                >
                                    {Number(post.rating ?? 0).toFixed(1)}점
                                </td>
                            </tr>

                            <tr>
                                <td
                                    className="table_underline"
                                    style={{
                                        textAlign: 'center',
                                        fontWeight: 800
                                    }}
                                >
                                    등록일
                                </td>

                                <td
                                    className="table_underline"
                                    style={{
                                        textAlign: 'left'
                                    }}
                                >
                                    {post.rdate}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div
                        style={{
                            marginTop: '26px',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <button
                            type="button"
                            className="btn btn-danger"
                            disabled={deleting}
                            onClick={deletePost}
                        >
                            {deleting
                                ? '삭제 중...'
                                : '삭제'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={deleting}
                            onClick={() =>
                                navigate(
                                    `/post/read/${post.postno}`
                                )
                            }
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostDelete;