import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../Tool";

interface ContentImage {
    imgno: number;
    filename: string;
    orgname: string;
    main_yn: string;
}

function ContentImage() {

    const { contentno } = useParams();

    const [images, setImages] = useState<ContentImage[]>([]);
    const [files, setFiles] = useState<FileList | null>(null);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = () => {
        axiosInstance
            .get(`/content_image/list/${contentno}`)
            .then(res => res.data)
            .then(data => {
                console.log(data);
                setImages(data);
            })
            .catch(console.error);
    };

    const upload = () => {

        if (!files) {
            alert("사진을 선택하세요.");
            return;
        }

        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        axiosInstance.post(
            `/content_image/upload/${contentno}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        )
            .then(() => {
                alert("업로드 완료");
                loadImages();
            })
            .catch(console.error);

    };

    const remove = (imgno: number) => {

        if (!window.confirm("삭제하시겠습니까?")) return;

        axiosInstance
            .delete(`/content_image/${imgno}`)
            .then(() => loadImages())
            .catch(console.error);

    };

    return (
        <div
            style={{
                maxWidth: "1200px",
                margin: "40px auto",
                padding: 20
            }}
        >

            <h2>사진 관리</h2>

            <div
                style={{
                    marginBottom: 20
                }}
            >

                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFiles(e.target.files)}
                />

                <button
                    onClick={upload}
                    style={{
                        marginLeft: 10
                    }}
                >
                    업로드
                </button>

            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,200px)",
                    gap: 20
                }}
            >

                {images.map(img => (

                    <div
                        key={img.imgno}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: 10,
                            padding: 10
                        }}
                    >

                        <img
                            src={`${axiosInstance.defaults.baseURL}/content_image/image/${img.filename}`}
                            style={{
                                width: "100%",
                                height: 160,
                                objectFit: "cover"
                            }}
                        />

                        <button
                            style={{
                                marginTop: 10,
                                width: "100%"
                            }}
                            onClick={() => remove(img.imgno)}
                        >
                            삭제
                        </button>

                    </div>

                ))}

            </div>

        </div>
    );

}

export default ContentImage;