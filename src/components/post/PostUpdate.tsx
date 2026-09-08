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

const MAX_IMAGE_COUNT = 5;
const MAX_FILE_SIZE =
    10 * 1024 * 1024;

interface PostImage {
    imageno: number;
    postno: number;
    filename: string;
    orgname: string;
    filesize: number;
    rdate: string;
}

interface NewImage {
    id: string;
    file: File;
    previewUrl: string;
}

function PostUpdate() {
    const { postno } = useParams();
    const navigate = useNavigate();

    const [contentno, setContentno] =
        useState<number>(0);

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

    const [currentImages, setCurrentImages] =
        useState<PostImage[]>([]);

    const [newImages, setNewImages] =
        useState<NewImage[]>([]);

    const [submitting, setSubmitting] =
        useState(false);

    useEffect(() => {
        loadPost();
        loadImages();
    }, [postno]);

    useEffect(() => {
        return () => {
            newImages.forEach(image => {
                URL.revokeObjectURL(
                    image.previewUrl
                );
            });
        };
    }, [newImages]);

    const totalImageCount =
        currentImages.length
        + newImages.length;

    const remainingCount =
        MAX_IMAGE_COUNT
        - totalImageCount;

    const totalNewImageSize =
        useMemo(
            () =>
                newImages.reduce(
                    (sum, image) =>
                        sum
                        + image.file.size,
                    0
                ),
            [newImages]
        );

    const loadPost = () => {
        if (!postno) {
            return;
        }

        axiosInstance
            .get(`/post/${postno}`)
            .then(result => result.data)
            .then(data => {
                setContentno(
                    data.contentno
                );

                setTitle(
                    data.title ?? ''
                );

                setContent(
                    data.content ?? ''
                );

                setRating(
                    typeof data.rating ===
                        'number'
                        ? data.rating
                        : 5
                );

                setWord(
                    data.word ?? ''
                );

                setVisible(
                    data.visible ?? 'Y'
                );
            })
            .catch(err => {
                console.error(
                    '게시글 조회 실패:',
                    err
                );

                alert(
                    '게시글 정보를 불러오지 못했습니다.'
                );
            });
    };

    const loadImages = () => {
        if (!postno) {
            return;
        }

        axiosInstance
            .get(
                `/post/image/list/${postno}`
            )
            .then(result => result.data)
            .then(
                (
                    images: PostImage[]
                ) => {
                    setCurrentImages(
                        images ?? []
                    );
                }
            )
            .catch(err => {
                console.error(
                    '이미지 목록 조회 실패:',
                    err
                );

                setCurrentImages([]);
            });
    };

    const formatFileSize = (
        size: number
    ) => {
        if (size < 1024) {
            return `${size} B`;
        }

        if (
            size
            < 1024 * 1024
        ) {
            return `${(
                size / 1024
            ).toFixed(1)} KB`;
        }

        return `${(
            size /
            (1024 * 1024)
        ).toFixed(1)} MB`;
    };

    const addNewImages = (
        fileList: FileList | null
    ) => {
        if (!fileList) {
            return;
        }

        const files =
            Array.from(fileList);

        if (
            totalImageCount
            + files.length
            > MAX_IMAGE_COUNT
        ) {
            alert(
                `이미지는 최대 ${MAX_IMAGE_COUNT}장까지 등록할 수 있습니다.`
            );

            return;
        }

        for (
            const file of files
        ) {
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

        const addedImages:
            NewImage[] =
            files.map(file => ({
                id: `${Date.now()}-${Math.random()}`,
                file,
                previewUrl:
                    URL.createObjectURL(
                        file
                    )
            }));

        setNewImages(prev => [
            ...prev,
            ...addedImages
        ]);
    };

    const removeNewImage = (
        id: string
    ) => {
        setNewImages(prev => {
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

    const deleteCurrentImage = async (
        imageno: number
    ) => {
        const confirmed =
            window.confirm(
                '이 이미지를 삭제할까요?'
            );

        if (!confirmed) {
            return;
        }

        try {
            await axiosInstance.delete(
                `/post/image/delete/${imageno}`
            );

            setCurrentImages(
                prev =>
                    prev.filter(
                        image =>
                            image.imageno
                            !== imageno
                    )
            );

        } catch (err) {
            console.error(
                '기존 이미지 삭제 실패:',
                err
            );

            alert(
                '이미지 삭제에 실패했습니다.'
            );
        }
    };

    const uploadNewImages = async () => {
        if (
            newImages.length === 0
        ) {
            return;
        }

        const formData =
            new FormData();

        formData.append(
            'postno',
            String(postno)
        );

        newImages.forEach(image => {
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
    };

    const update = async () => {
        if (submitting) {
            return;
        }

        if (!postno) {
            alert(
                '게시글 번호가 올바르지 않습니다.'
            );

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
                postno:
                    Number(postno),
                contentno,
                title:
                    title.trim(),
                content:
                    content.trim(),
                rating,
                word:
                    word.trim(),
                visible
            };

            await axiosInstance.put(
                '/post/update',
                params
            );

            await uploadNewImages();

            alert(
                '게시글이 수정되었습니다.'
            );

            navigate(
                `/post/read/${postno}`
            );

        } catch (err) {
            console.error(
                '게시글 수정 실패:',
                err
            );

            alert(
                '수정 중 오류가 발생했습니다.'
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
                게시글 수정
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
                                    addNewImages(
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
                                기존{' '}
                                {
                                    currentImages.length
                                }
                                장 · 새 이미지{' '}
                                {
                                    newImages.length
                                }
                                장 · 추가 가능{' '}
                                {
                                    remainingCount
                                }
                                장
                                <br />
                                최대 5장, 이미지 한
                                장당 10MB 이하 · 새
                                이미지 용량{' '}
                                {formatFileSize(
                                    totalNewImageSize
                                )}
                            </div>

                            {(currentImages.length >
                                0
                                || newImages.length >
                                0) && (
                                    <div
                                        style={{
                                            display:
                                                'grid',
                                            gridTemplateColumns:
                                                'repeat(auto-fill, minmax(150px, 1fr))',
                                            gap:
                                                '12px',
                                            marginTop:
                                                '16px'
                                        }}
                                    >
                                        {currentImages.map(
                                            image => (
                                                <div
                                                    key={`current-${image.imageno}`}
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
                                                        src={`${axiosInstance.defaults.baseURL}/post/image/${image.filename}`}
                                                        alt={
                                                            image.orgname
                                                        }
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
                                                        aria-label="기존 이미지 삭제"
                                                        onClick={() =>
                                                            deleteCurrentImage(
                                                                image.imageno
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
                                                                'rgba(230,57,70,.9)',
                                                            color:
                                                                '#fff',
                                                            fontSize:
                                                                '18px',
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
                                                                image.orgname
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
                                                            기존 ·{' '}
                                                            {
                                                                image.orgname
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
                                                                image.filesize
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}

                                        {newImages.map(
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
                                                            '1px solid #00C9A7',
                                                        borderRadius:
                                                            '14px',
                                                        background:
                                                            '#F3FFFC'
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            image.previewUrl
                                                        }
                                                        alt={`${index + 1}번째 새 이미지`}
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
                                                        aria-label="새 이미지 선택 취소"
                                                        onClick={() =>
                                                            removeNewImage(
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
                                                                'rgba(0,0,0,.65)',
                                                            color:
                                                                '#fff',
                                                            fontSize:
                                                                '18px',
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
                                                                    '#00A88F',
                                                                fontSize:
                                                                    '12px',
                                                                fontWeight:
                                                                    800,
                                                                textOverflow:
                                                                    'ellipsis',
                                                                whiteSpace:
                                                                    'nowrap'
                                                            }}
                                                        >
                                                            새 이미지 ·{' '}
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

                    <tr>
                        <td
                            colSpan={2}
                            style={{
                                textAlign:
                                    'center',
                                padding:
                                    '25px 0'
                            }}
                        >
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={
                                    submitting
                                }
                                onClick={
                                    update
                                }
                            >
                                {submitting
                                    ? '수정 중...'
                                    : '수정'}
                            </button>

                            &nbsp;&nbsp;

                            <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={
                                    submitting
                                }
                                onClick={() =>
                                    navigate(
                                        `/post/read/${postno}`
                                    )
                                }
                            >
                                취소
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            </div>
        </div>
    );
}

export default PostUpdate;