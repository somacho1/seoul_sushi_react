import { useEffect, useState } from 'react';
import { axiosInstance } from '../Tool';
import { useGlobalStore } from '../../store/store';

interface Props {
    postno: number;
}

interface ReplyItem {
    replyno: number;
    postno: number;
    memberno: number;
    content: string;
    visible: string;
    rdate: string;
}

function Reply({ postno }: Props) {
    const { login, grade, memberno } = useGlobalStore();

    console.log('store memberno:', memberno);
    console.log('grade:', grade);
    console.log('login:', login);

    const [replyList, setReplyList] = useState<ReplyItem[]>([]);
    const [content, setContent] = useState('');

    const [updateReplyno, setUpdateReplyno] = useState<number>(0);
    const [updateContent, setUpdateContent] = useState('');

    useEffect(() => {
        loadReply();
    }, [postno]);

    const loadReply = () => {
        axiosInstance.get(`/reply/list_by_postno/${postno}`)
            .then(result => result.data)
            .then(data => {
                console.log('reply list:', data);
                setReplyList(data);
            })
            .catch(err => console.error(err));
    };

    const createReply = () => {
        if (content.trim() === '') {
            alert('댓글을 입력하세요.');
            return;
        }

        const params = {
            postno: postno,
            memberno: memberno,
            content: content,
            visible: 'Y'
        };

        console.log('댓글 등록 params:', params);

        axiosInstance.post('/reply/save', params)
            .then(result => result.data)
            .then(data => {
                console.log('댓글 등록 결과:', data);
                setContent('');
                loadReply();
            })
            .catch(err => console.error(err));
    };

    const updateReply = (replyno: number) => {
        if (updateContent.trim() === '') {
            alert('댓글 내용을 입력하세요.');
            return;
        }

        const params = {
            replyno: replyno,
            postno: postno,
            memberno: memberno,
            content: updateContent,
            visible: 'Y'
        };

        axiosInstance.put('/reply/update', params)
            .then(result => result.data)
            .then(data => {
                console.log('댓글 수정 결과:', data);
                alert('댓글이 수정되었습니다.');
                setUpdateReplyno(0);
                setUpdateContent('');
                loadReply();
            })
            .catch(err => console.error(err));
    };

    const deleteReply = (replyno: number) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) {
            return;
        }

        axiosInstance.delete(`/reply/${replyno}`)
            .then(result => result.data)
            .then(data => {
                console.log('댓글 삭제 결과:', data);
                alert('댓글이 삭제되었습니다.');
                loadReply();
            })
            .catch(err => console.error(err));
    };

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <div style={{ color: '#00A88F', fontSize: '12px', fontWeight: 900, letterSpacing: '1.5px', marginBottom: '8px' }}>
                    COMMENT
                </div>

                <h4 style={{ fontFamily: "'Jua', sans-serif", fontSize: '28px', color: '#0A2342', margin: 0 }}>
                    댓글
                </h4>
            </div>

            {login && (
                <div style={{ marginBottom: '28px', padding: '20px', background: '#F8FEFF', border: '1px solid #DDEFF2', borderRadius: '18px' }}>
                    <textarea
                        className="form-control"
                        rows={3}
                        placeholder="댓글을 입력하세요."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{ borderRadius: '14px', resize: 'none', fontSize: '15px', lineHeight: 1.7 }}
                    />

                    <div style={{ textAlign: 'right', marginTop: '12px' }}>
                        <button
                            className="btn btn-primary"
                            onClick={createReply}
                            style={{ height: '42px', borderRadius: '12px', fontWeight: 800, padding: '0 22px' }}
                        >
                            댓글 등록
                        </button>
                    </div>
                </div>
            )}

            {
                replyList.length === 0 ? (
                    <div style={{ padding: '28px', textAlign: 'center', color: '#6B8794', background: '#F8FEFF', border: '1px solid #DDEFF2', borderRadius: '18px', fontSize: '15px' }}>
                        등록된 댓글이 없습니다.
                    </div>
                ) : (
                    replyList.map(reply => {
                        console.log(
                            'replyno:', reply.replyno,
                            'reply.memberno:', reply.memberno,
                            'store memberno:', memberno,
                            'grade:', grade,
                            'same:', Number(reply.memberno) === Number(memberno)
                        );

                        return (
                            <div
                                key={reply.replyno}
                                style={{
                                    border: '1px solid #EAF3F5',
                                    borderRadius: '18px',
                                    padding: '20px',
                                    marginBottom: '14px',
                                    background: '#fff'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '13px', color: '#8AA0AA', fontWeight: 700 }}>
                                        {reply.rdate}
                                    </div>

                                    {login && (Number(grade) <= 5 || Number(reply.memberno) === Number(memberno)) && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-warning"
                                                onClick={() => {
                                                    setUpdateReplyno(reply.replyno);
                                                    setUpdateContent(reply.content);
                                                }}
                                                style={{ borderRadius: '10px', fontWeight: 800 }}
                                            >
                                                수정
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => deleteReply(reply.replyno)}
                                                style={{ borderRadius: '10px', fontWeight: 800 }}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {
                                    updateReplyno === reply.replyno ? (
                                        <div>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                value={updateContent}
                                                onChange={(e) => setUpdateContent(e.target.value)}
                                                style={{
                                                    borderRadius: '14px',
                                                    resize: 'none',
                                                    fontSize: '15px',
                                                    lineHeight: 1.7,
                                                    marginBottom: '10px'
                                                }}
                                            />

                                            <div style={{ textAlign: 'right' }}>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => updateReply(reply.replyno)}
                                                >
                                                    저장
                                                </button>

                                                &nbsp;

                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => {
                                                        setUpdateReplyno(0);
                                                        setUpdateContent('');
                                                    }}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ whiteSpace: 'pre-wrap', fontSize: '15px', lineHeight: 1.8, color: '#334155' }}>
                                            {reply.content}
                                        </div>
                                    )
                                }
                            </div>
                        );
                    })
                )
            }
        </div>
    );
}

export default Reply;