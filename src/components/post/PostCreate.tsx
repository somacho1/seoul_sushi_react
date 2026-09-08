import './PostEditor.css';
import {
    useEffect,
    useMemo,
    useState
} from 'react';
import {
    useNavigate,
    useParams
} from 'react-router-dom';
import { axiosInstance } from '../Tool';
import { useGlobalStore } from '../../store/store';

const MAX_IMAGE_COUNT = 5;
const MAX_FILE_SIZE =
    10 * 1024 * 1024;

interface PreviewImage {
    id: string;
    file: File;
    previewUrl: string;
}

function PostCreate() {
    const { contentno } = useParams();
    const navigate = useNavigate();
    const { memberno } = useGlobalStore();

    const [title, setTitle] =
        useState('');

    const [content, setContent] =
        useState('');

    const [rating, setRating] =
        useState(5);

    const [word, setWord] =
        useState('');

    const [visible, setVisible] =
        useState('Y');

    const [images, setImages] =
        useState<PreviewImage[]>([]);

    const [submitting, setSubmitting] =
        useState(false);

    useEffect(() => {
        return () => {
            images.forEach(image => {
                URL.revokeObjectURL(
                    image.previewUrl
                );
            });
        };
    }, [images]);

    const remainingCount =
        MAX_IMAGE_COUNT - images.length;

    const totalImageSize = useMemo(
        () =>
            images.reduce(
                (sum, image) =>
                    sum + image.file.size,
                0
            ),
        [images]
    );

    const formatFileSize = (
        size: number
    ) => {
        if (size < 1024) {
            return `${size} B`;
        }

        if (size < 1024 * 1024) {
            return `${(
                size / 1024
            ).toFixed(1)} KB`;
        }

        return `${(
            size /
            (1024 * 1024)
        ).toFixed(1)} MB`;
    };

    const addImages = (
        fileList: FileList | null
    ) => {
        if (!fileList) {
            return;
        }

        const selectedFiles =
            Array.from(fileList);

        if (
            images.length
            + selectedFiles.length
            > MAX_IMAGE_COUNT
        ) {
            alert(
                `이미지는 최대 ${MAX_IMAGE_COUNT}장까지 등록할 수 있습니다.`
            );

            return;
        }

        for (const file of selectedFiles) {
            if (
                !file.type.startsWith(
                    'image/'
                )
            ) {
                alert(
                    `${file.name}은 이미지 파일이 아닙니다.`
                );

                return;
            }

            if (
                file.size
                > MAX_FILE_SIZE
            ) {
                alert(
                    `${file.name}은 10MB를 초과합니다.`
                );

                return;
            }
        }

        const newImages:
            PreviewImage[] =
            selectedFiles.map(file => ({
                id: `${Date.now()}-${Math.random()}`,
                file,
                previewUrl:
                    URL.createObjectURL(
                        file
                    )
            }));

        setImages(prev => [
            ...prev,
            ...newImages
        ]);
    };

    const removeImage = (
        id: string
    ) => {
        setImages(prev => {
            const target =
                prev.find(
                    image =>
                        image.id === id
                );

            if (target) {
                URL.revokeObjectURL(
                    target.previewUrl
                );
            }

            return prev.filter(
                image =>
                    image.id !== id
            );
        });
    };

    const create = async () => {
        if (submitting) {
            return;
        }

        if (!contentno) {
            alert(
                '맛집 정보가 올바르지 않습니다.'
            );

            return;
        }

        if (
            memberno == null
            || Number(memberno) <= 0
        ) {
            alert(
                '로그인 후 이용할 수 있습니다.'
            );

            navigate('/member/login');

            return;
        }

        if (
            title.trim() === ''
        ) {
            alert(
                '제목을 입력하세요.'
            );

            return;
        }

        if (
            content.trim() === ''
        ) {
            alert(
                '내용을 입력하세요.'
            );

            return;
        }

        try {
            setSubmitting(true);

            const params = {
                contentno:
                    Number(contentno),
                memberno:
                    Number(memberno),
                title:
                    title.trim(),
                content:
                    content.trim(),
                rating,
                word:
                    word.trim(),
                visible
            };

            const saveResponse =
                await axiosInstance.post(
                    '/post/save',
                    params
                );

            const savedPost =
                saveResponse.data;

            if (
                !savedPost
                || !savedPost.postno
            ) {
                throw new Error(
                    '게시글 번호를 확인할 수 없습니다.'
                );
            }

            if (
                images.length > 0
            ) {
                const formData =
                    new FormData();

                formData.append(
                    'postno',
                    String(
                        savedPost.postno
                    )
                );

                images.forEach(image => {
                    formData.append(
                        'files',
                        image.file
                    );
                });

                await axiosInstance.post(
                    '/post/image/upload',
                    formData,
                    {
                        headers: {
                            'Content-Type':
                                'multipart/form-data'
                        }
                    }
                );
            }

            alert(
                '게시글이 등록되었습니다.'
            );

            navigate(
                `/post/list/${contentno}`
            );

        } catch (err) {
            console.error(
                '게시글 등록 실패:',
                err
            );

            alert(
                '등록 중 오류가 발생했습니다.'
            );

        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="post-page"
            style={{
                paddingBottom:
                    '140px'
            }}
        >
            <div className="post-shell">
                <div className="title_line">
                    게시글 등록
                </div>

                <table className="table_center table">
                    <tbody>
                        <tr>
                            <td
                                className="table_underline"
                                style={{
                                    width: '20%',
                                    textAlign:
                                        'center'
                                }}
                            >
                                제목
                            </td>

                            <td className="table_underline">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={title}
                                    maxLength={100}
                                    placeholder="리뷰 제목을 입력하세요."
                                    onChange={e =>
                                        setTitle(
                                            e.target.value
                                        )
                                    }
                                />

                                <div
                                    style={{
                                        marginTop:
                                            '6px',
                                        textAlign:
                                            'right',
                                        color:
                                            '#7B97A5',
                                        fontSize:
                                            '12px'
                                    }}
                                >
                                    {title.length}
                                    /100
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td
                                className="table_underline"
                                style={{
                                    textAlign:
                                        'center'
                                }}
                            >
                                내용
                            </td>

                            <td className="table_underline">
                                <textarea
                                    className="form-control"
                                    rows={10}
                                    value={content}
                                    placeholder="맛, 가격, 분위기 등 방문 경험을 자세히 작성해주세요."
                                    onChange={e =>
                                        setContent(
                                            e.target.value
                                        )
                                    }
                                />
                            </td>
                        </tr>

                        <tr>
                            <td
                                className="table_underline"
                                style={{
                                    textAlign:
                                        'center',
                                    verticalAlign:
                                        'top',
                                    paddingTop:
                                        '20px'
                                }}
                            >
                                이미지
                            </td>

                            <td className="table_underline">
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    multiple
                                    disabled={
                                        remainingCount <=
                                        0
                                    }
                                    onChange={e => {
                                        addImages(
                                            e.target.files
                                        );

                                        e.target.value =
                                            '';
                                    }}
                                />

                                <div
                                    style={{
                                        marginTop:
                                            '8px',
                                        color:
                                            '#6B8794',
                                        fontSize:
                                            '13px',
                                        lineHeight:
                                            '1.6'
                                    }}
                                >
                                    최대{' '}
                                    {
                                        MAX_IMAGE_COUNT
                                    }
                                    장, 이미지 한 장당
                                    10MB 이하
                                    <br />
                                    현재{' '}
                                    {
                                        images.length
                                    }
                                    장 선택 · 추가 가능{' '}
                                    {
                                        remainingCount
                                    }
                                    장 · 총 용량{' '}
                                    {formatFileSize(
                                        totalImageSize
                                    )}
                                </div>

                                {images.length >
                                    0 && (
                                        <div
                                            style={{
                                                display:
                                                    'grid',
                                                gridTemplateColumns:
                                                    'repeat(auto-fill, minmax(140px, 1fr))',
                                                gap:
                                                    '12px',
                                                marginTop:
                                                    '16px'
                                            }}
                                        >
                                            {images.map(
                                                (
                                                    image,
                                                    index
                                                ) => (
                                                    <div
                                                        key={
                                                            image.id
                                                        }
                                                        style={{
                                                            position:
                                                                'relative',
                                                            overflow:
                                                                'hidden',
                                                            border:
                                                                '1px solid #DDEFF2',
                                                            borderRadius:
                                                                '14px',
                                                            background:
                                                                '#F8FCFD'
                                                        }}
                                                    >
                                                        <img
                                                            src={
                                                                image.previewUrl
                                                            }
                                                            alt={`${index + 1}번째 선택 이미지`}
                                                            style={{
                                                                display:
                                                                    'block',
                                                                width:
                                                                    '100%',
                                                                height:
                                                                    '120px',
                                                                objectFit:
                                                                    'cover'
                                                            }}
                                                        />

                                                        <button
                                                            type="button"
                                                            aria-label="이미지 삭제"
                                                            onClick={() =>
                                                                removeImage(
                                                                    image.id
                                                                )
                                                            }
                                                            style={{
                                                                position:
                                                                    'absolute',
                                                                top:
                                                                    '7px',
                                                                right:
                                                                    '7px',
                                                                width:
                                                                    '28px',
                                                                height:
                                                                    '28px',
                                                                padding:
                                                                    0,
                                                                border:
                                                                    'none',
                                                                borderRadius:
                                                                    '50%',
                                                                background:
                                                                    'rgba(0,0,0,.62)',
                                                                color:
                                                                    '#fff',
                                                                fontSize:
                                                                    '18px',
                                                                lineHeight:
                                                                    '28px',
                                                                cursor:
                                                                    'pointer'
                                                            }}
                                                        >
                                                            ×
                                                        </button>

                                                        <div
                                                            style={{
                                                                padding:
                                                                    '9px 10px'
                                                            }}
                                                        >
                                                            <div
                                                                title={
                                                                    image
                                                                        .file
                                                                        .name
                                                                }
                                                                style={{
                                                                    overflow:
                                                                        'hidden',
                                                                    color:
                                                                        '#0A2342',
                                                                    fontSize:
                                                                        '12px',
                                                                    fontWeight:
                                                                        700,
                                                                    textOverflow:
                                                                        'ellipsis',
                                                                    whiteSpace:
                                                                        'nowrap'
                                                                }}
                                                            >
                                                                {index +
                                                                    1}
                                                                .{' '}
                                                                {
                                                                    image
                                                                        .file
                                                                        .name
                                                                }
                                                            </div>

                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        '3px',
                                                                    color:
                                                                        '#7B97A5',
                                                                    fontSize:
                                                                        '11px'
                                                                }}
                                                            >
                                                                {formatFileSize(
                                                                    image
                                                                        .file
                                                                        .size
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                            </td>
                        </tr>

                        <tr>
                            <td
                                className="table_underline"
                                style={{
                                    textAlign:
                                        'center'
                                }}
                            >
                                별점
                            </td>

                            <td className="table_underline">
                                {[
                                    1,
                                    2,
                                    3,
                                    4,
                                    5
                                ].map(star => (
                                    <span
                                        key={star}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() =>
                                            setRating(
                                                star
                                            )
                                        }
                                        onKeyDown={e => {
                                            if (
                                                e.key ===
                                                'Enter'
                                                || e.key ===
                                                ' '
                                            ) {
                                                setRating(
                                                    star
                                                );
                                            }
                                        }}
                                        style={{
                                            marginRight:
                                                '6px',
                                            color:
                                                star <=
                                                    rating
                                                    ? '#FFD700'
                                                    : '#D9D9D9',
                                            fontSize:
                                                '32px',
                                            cursor:
                                                'pointer'
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}

                                <span
                                    style={{
                                        marginLeft:
                                            '15px',
                                        color:
                                            '#555',
                                        fontWeight:
                                            'bold'
                                    }}
                                >
                                    {rating.toFixed(
                                        1
                                    )}
                                    점
                                </span>
                            </td>
                        </tr>

                        <tr>
                            <td
                                className="table_underline"
                                style={{
                                    textAlign:
                                        'center'
                                }}
                            >
                                검색어
                            </td>

                            <td className="table_underline">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={word}
                                    maxLength={200}
                                    placeholder="예: 시마아지, 숙성회, 가성비"
                                    onChange={e =>
                                        setWord(
                                            e.target.value
                                        )
                                    }
                                />
                            </td>
                        </tr>

                        <tr>
                            <td
                                className="table_underline"
                                style={{
                                    textAlign:
                                        'center'
                                }}
                            >
                                공개 여부
                            </td>

                            <td className="table_underline">
                                <select
                                    className="form-control"
                                    value={visible}
                                    onChange={e =>
                                        setVisible(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="Y">
                                        공개
                                    </option>

                                    <option value="N">
                                        비공개
                                    </option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div
                    style={{
                        marginTop:
                            '20px',
                        textAlign:
                            'center'
                    }}
                >
                    <button
                        type="button"
                        className="btn btn-primary"
                        disabled={submitting}
                        onClick={create}
                    >
                        {submitting
                            ? '등록 중...'
                            : '등록'}
                    </button>

                    &nbsp;

                    <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={submitting}
                        onClick={() =>
                            navigate(
                                `/post/list/${contentno}`
                            )
                        }
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PostCreate;