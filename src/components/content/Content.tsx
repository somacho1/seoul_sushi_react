import { useState, useEffect, type ChangeEvent } from 'react'
import { enter_chk, axiosInstance, getNowDate } from '../Tool'
import update_img from '../../assets/images/update.png';
import delete_img from '../../assets/images/delete.png';
import show_img from '../../assets/images/show.png';
import hide_img from '../../assets/images/hide.png';
import decrease_img from '../../assets/images/decrease.png';
import increase_img from '../../assets/images/increase.png';

const Content = () => {
    const [send_label, setSend_label] = useState<'등록' | '수정' | '삭제'>('등록');
    const [delete_panel, setDelete_panel] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [file, setFile] = useState<File | null>(null);

    const [input, setInput] = useState({
        contentno: '',
        district: '',
        name: '',
        best_menu: '',
        new_menu: '',
        badge: '',
        price: '',
        address: '',
        phone: '',
        business_hours: '',
        parking: 'N',
        reservation: 'Y',
        description: '',
        mapUrl: '',
        youtubeUrl: '',
        cnt: 0,
        seqno: 1,
        visible: 'Y',
        rdate: '',
    });

    const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;

        if (id === 'badge' && value === '') {
            setInput({
                ...input,
                badge: '',
                new_menu: '',
            });
            return;
        }

        setInput({
            ...input,
            [id]: value,
        });
    }

    const fileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    }

    const loadData = () => {
        axiosInstance.get(`/content/find_all`)
            .then(result => result.data)
            .then(data => {
                console.log('-> content data:', data);
                setData(data);
            })
            .catch(err => console.error(err));
    }

    useEffect(() => {
        loadData();
    }, []);

    const send = (e: React.SyntheticEvent) => {
        e.preventDefault();

        const newMenuValue = input.badge === '' ? '' : input.new_menu;

        if (send_label === '등록') {
            const formData = new FormData();

            formData.append('district', input.district);
            formData.append('name', input.name);
            formData.append('best_menu', input.best_menu);
            formData.append('new_menu', newMenuValue);
            formData.append('badge', input.badge);
            formData.append('price', input.price);
            formData.append('address', input.address);
            formData.append('phone', input.phone);
            formData.append('business_hours', input.business_hours);
            formData.append('parking', input.parking);
            formData.append('reservation', input.reservation);
            formData.append('description', input.description);
            formData.append('mapUrl', input.mapUrl);
            formData.append('youtubeUrl', input.youtubeUrl);
            formData.append('cnt', String(input.cnt));
            formData.append('seqno', String(input.seqno));
            formData.append('visible', input.visible);

            if (file) {
                formData.append('file', file);
            }

            axiosInstance.post('/content/save', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then(result => result.data)
                .then(data => {
                    console.log('-> save data:', data);
                    loadData();
                    cancel();
                    setFile(null);
                })
                .catch(err => console.error(err));
        }

        else if (send_label === '수정') {
            const formData = new FormData();

            formData.append('contentno', String(input.contentno));
            formData.append('district', input.district);
            formData.append('name', input.name);
            formData.append('best_menu', input.best_menu);
            formData.append('new_menu', newMenuValue);
            formData.append('badge', input.badge);
            formData.append('price', input.price);
            formData.append('address', input.address);
            formData.append('phone', input.phone);
            formData.append('business_hours', input.business_hours);
            formData.append('parking', input.parking);
            formData.append('reservation', input.reservation);
            formData.append('description', input.description);
            formData.append('mapUrl', input.mapUrl);
            formData.append('youtubeUrl', input.youtubeUrl);
            formData.append('cnt', String(input.cnt));
            formData.append('seqno', String(input.seqno));
            formData.append('visible', input.visible);
            formData.append('rdate', getNowDate());

            if (file) {
                formData.append('file', file);
            }

            axiosInstance.put('/content/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then(result => result.data)
                .then(data => {
                    console.log('-> update data:', data);
                    loadData();
                    cancel();
                    setFile(null);
                })
                .catch(err => console.error(err));
        }
    }

    const read_for_update = (contentno: number) => {
        axiosInstance.get(`/content/${contentno}`)
            .then(result => result.data)
            .then(data => {
                setInput({
                    contentno: data.contentno,
                    district: data.district,
                    name: data.name,
                    best_menu: data.best_menu,
                    new_menu: data.new_menu || '',
                    badge: data.badge || '',
                    price: data.price,
                    address: data.address,
                    phone: data.phone,
                    business_hours: data.business_hours,
                    parking: data.parking,
                    reservation: data.reservation,
                    description: data.description,
                    mapUrl: data.mapUrl || '',
                    youtubeUrl: data.youtubeUrl || '',
                    cnt: data.cnt,
                    seqno: data.seqno,
                    visible: data.visible,
                    rdate: data.rdate,
                });

                setSend_label('수정');
            })
            .catch(err => console.error(err));
    }

    const read_for_delete = (contentno: number) => {
        setDelete_panel(true);

        axiosInstance.get(`/content/${contentno}`)
            .then(result => result.data)
            .then(data => {
                setInput({
                    contentno: data.contentno,
                    district: data.district,
                    name: data.name,
                    best_menu: data.best_menu,
                    new_menu: data.new_menu || '',
                    badge: data.badge || '',
                    price: data.price,
                    address: data.address,
                    phone: data.phone,
                    business_hours: data.business_hours,
                    parking: data.parking,
                    reservation: data.reservation,
                    description: data.description,
                    mapUrl: data.mapUrl || '',
                    youtubeUrl: data.youtubeUrl || '',
                    cnt: data.cnt,
                    seqno: data.seqno,
                    visible: data.visible,
                    rdate: data.rdate,
                });

                setSend_label('삭제');
            })
            .catch(err => console.error(err));
    }

    const cancel = () => {
        setSend_label('등록');
        setDelete_panel(false);

        setInput({
            contentno: '',
            district: '',
            name: '',
            best_menu: '',
            new_menu: '',
            badge: '',
            price: '',
            address: '',
            phone: '',
            business_hours: '',
            parking: 'N',
            reservation: 'Y',
            description: '',
            mapUrl: '',
            youtubeUrl: '',
            cnt: 0,
            seqno: 1,
            visible: 'Y',
            rdate: '',
        });

        setFile(null);
    }

    const changeVisible = (contentno: number, visible: string) => {
        axiosInstance.put(`/content/update_visible/${contentno}/${visible}`)
            .then(result => result.data)
            .then(data => {
                console.log('-> visible data:', data);
                loadData();
            })
            .catch(err => console.error(err));
    }

    const increaseSeqno = (contentno: number) => {
        axiosInstance.put(`/content/seqno/increase/${contentno}`)
            .then(result => result.data)
            .then(data => {
                loadData();
            })
            .catch(err => console.error(err));
    }

    const decreaseSeqno = (contentno: number) => {
        axiosInstance.put(`/content/seqno/decrease/${contentno}`)
            .then(result => result.data)
            .then(data => {
                loadData();
            })
            .catch(err => console.error(err));
    }

    const getBadgeText = (badge: string) => {
        if (badge === 'NEW') return '🆕 NEW';
        if (badge === 'HOT') return '🔥 HOT';
        if (badge === 'BEST') return '⭐ BEST';
        if (badge === 'EVENT') return '🎉 EVENT';
        return '';
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
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: '28px',
                        gap: '20px',
                    }}
                >
                    <div>
                        <div
                            style={{
                                color: '#00A88F',
                                fontSize: '12px',
                                fontWeight: 900,
                                letterSpacing: '1.5px',
                                marginBottom: '8px',
                            }}
                        >
                            CONTENT
                        </div>

                        <h2
                            style={{
                                fontFamily: "'Jua', sans-serif",
                                fontSize: '38px',
                                color: '#0A2342',
                                marginBottom: '8px',
                            }}
                        >
                            맛집 관리
                        </h2>

                        <p
                            style={{
                                color: '#6B8794',
                                fontSize: '15px',
                                margin: 0,
                            }}
                        >
                            서울 숙성회 맛집 정보를 등록하고 관리합니다.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadData}
                        style={{
                            height: '44px',
                            padding: '0 22px',
                            border: '1px solid #DDEFF2',
                            borderRadius: '14px',
                            background: '#fff',
                            color: '#0A2342',
                            fontWeight: 800,
                            cursor: 'pointer',
                        }}
                    >
                        새로고침
                    </button>
                </div>

                <form
                    id="frm"
                    onSubmit={send}
                    style={{
                        background: '#fff',
                        border: '1px solid rgba(10,35,66,.08)',
                        borderRadius: '22px',
                        padding: '28px',
                        boxShadow: '0 14px 36px rgba(10,35,66,.08)',
                        marginBottom: '24px',
                    }}
                >
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(6, 1fr)',
                            gap: '12px',
                            marginBottom: '12px',
                        }}
                    >
                        <input type="text" className="form-control" id="district"
                            placeholder="지역구" onKeyDown={e => enter_chk(e, 'name')}
                            onChange={onChange} value={input.district} />

                        <input type="text" className="form-control" id="name"
                            placeholder="가게명" onKeyDown={e => enter_chk(e, 'best_menu')}
                            onChange={onChange} value={input.name} />

                        <input type="text" className="form-control" id="best_menu"
                            placeholder="대표 메뉴" onKeyDown={e => enter_chk(e, 'badge')}
                            onChange={onChange} value={input.best_menu} />

                        <select
                            className="form-control"
                            id="badge"
                            onChange={onChange}
                            value={input.badge}
                        >
                            <option value="">배지 없음</option>
                            <option value="NEW">🆕 NEW</option>
                            <option value="HOT">🔥 HOT</option>
                            <option value="BEST">⭐ BEST</option>
                            <option value="EVENT">🎉 EVENT</option>
                        </select>

                        <input
                            type="text"
                            className="form-control"
                            id="new_menu"
                            placeholder={input.badge ? '배지 문구 / 신메뉴' : '배지 선택 시 입력'}
                            disabled={input.badge === ''}
                            onKeyDown={e => enter_chk(e, 'price')}
                            onChange={onChange}
                            value={input.new_menu}
                            style={{
                                background: input.badge === '' ? '#F1F5F6' : '#fff',
                                color: input.badge === '' ? '#999' : '#333',
                            }}
                        />

                        <input type="text" className="form-control" id="price"
                            placeholder="가격" onKeyDown={e => enter_chk(e, 'address')}
                            onChange={onChange} value={input.price} />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 2fr auto auto',
                            gap: '12px',
                            marginBottom: '12px',
                        }}
                    >
                        <input type="text" className="form-control" id="address"
                            placeholder="주소" onKeyDown={e => enter_chk(e, 'phone')}
                            onChange={onChange} value={input.address} />

                        <input type="text" className="form-control" id="phone"
                            placeholder="전화번호" onKeyDown={e => enter_chk(e, 'business_hours')}
                            onChange={onChange} value={input.phone} />

                        <input type="text" className="form-control" id="business_hours"
                            placeholder="영업시간" onKeyDown={e => enter_chk(e, 'seqno')}
                            onChange={onChange} value={input.business_hours} />

                        <input type="number" min="0" step="1" className="form-control" id="seqno"
                            placeholder="출력 순서" onChange={onChange} value={input.seqno} />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '12px',
                            marginBottom: '12px',
                        }}
                    >
                        <select id="parking" className="form-control" onChange={onChange} value={input.parking}>
                            <option value="Y">주차 Y</option>
                            <option value="N">주차 N</option>
                        </select>

                        <select id="reservation" className="form-control" onChange={onChange} value={input.reservation}>
                            <option value="Y">예약 Y</option>
                            <option value="N">예약 N</option>
                        </select>

                        <select id="visible" className="form-control" onChange={onChange} value={input.visible}>
                            <option value="Y">출력 Y</option>
                            <option value="N">출력 N</option>
                        </select>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 2fr 2fr auto auto',
                            gap: '12px',
                            alignItems: 'center',
                        }}
                    >
                        <input
                            type="text"
                            className="form-control"
                            id="description"
                            placeholder="설명"
                            onChange={onChange}
                            value={input.description}
                        />

                        <input
                            type="text"
                            className="form-control"
                            id="mapUrl"
                            placeholder="네이버지도 또는 카카오맵 URL"
                            onChange={onChange}
                            value={input.mapUrl}
                        />

                        <input
                            type="text"
                            className="form-control"
                            id="youtubeUrl"
                            placeholder="유튜브 URL"
                            onChange={onChange}
                            value={input.youtubeUrl}
                        />

                        <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={fileChange}
                        />

                        <button id="btnSend" type="submit" style={saveBtnStyle}>
                            {send_label}
                        </button>

                        <button id="btnReset" type="button" onClick={cancel} style={cancelBtnStyle}>
                            취소
                        </button>
                    </div>
                </form>

                {delete_panel && (
                    <div
                        style={{
                            background: '#FFF1F1',
                            color: '#E63946',
                            border: '1px solid #FFD0D0',
                            borderRadius: '16px',
                            padding: '18px',
                            textAlign: 'center',
                            marginBottom: '22px',
                            fontWeight: 700,
                        }}
                    >
                        맛집 정보를 삭제하면 복구 할 수 없습니다.<br />
                        삭제하시겠습니까?
                    </div>
                )}

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
                            minWidth: '1150px',
                        }}
                    >
                        <thead>
                            <tr style={{ background: '#F0FAFA' }}>
                                <th style={{ padding: '15px', textAlign: 'center' }}>번호</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>지역구</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>가게명</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>대표 메뉴</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>배지</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>배지 문구</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>가격</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>주차</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>예약</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>등록일</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>관리</th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={11}
                                            style={{
                                                padding: '50px',
                                                textAlign: 'center',
                                                color: '#6B8794',
                                            }}
                                        >
                                            등록된 맛집이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item, index) =>
                                        <tr key={item.contentno}>
                                            <td style={tdStyle}>{index + 1}</td>
                                            <td style={tdStyle}>{item.district}</td>
                                            <td style={{ ...tdStyle, fontWeight: 800, color: '#0A2342' }}>{item.name}</td>
                                            <td style={tdStyle}>{item.best_menu}</td>
                                            <td style={tdStyle}>{getBadgeText(item.badge)}</td>
                                            <td style={tdStyle}>{item.new_menu}</td>
                                            <td style={tdStyle}>{item.price}</td>
                                            <td style={tdStyle}>{item.parking}</td>
                                            <td style={tdStyle}>{item.reservation}</td>
                                            <td style={tdStyle}>{item.rdate?.substring(0, 10)}</td>

                                            <td style={tdStyle}>
                                                <a href="#" onClick={(e) => { e.preventDefault(); decreaseSeqno(item.contentno); }}>
                                                    <img src={increase_img} className="icon" title="출력 순서 위로" />
                                                </a>

                                                <a href="#" onClick={(e) => { e.preventDefault(); increaseSeqno(item.contentno); }}>
                                                    <img src={decrease_img} className="icon" title="출력 순서 아래로" />
                                                </a>

                                                {
                                                    item.visible === 'Y' ? (
                                                        <a href="#" onClick={(e) => { e.preventDefault(); changeVisible(item.contentno, 'N'); }}>
                                                            <img src={show_img} className="icon" title="메뉴에 출력됨" />
                                                        </a>
                                                    ) : (
                                                        <a href="#" onClick={(e) => { e.preventDefault(); changeVisible(item.contentno, 'Y'); }}>
                                                            <img src={hide_img} className="icon" title="메뉴에 출력 안됨" />
                                                        </a>
                                                    )
                                                }

                                                <a href="#" onClick={(e) => { e.preventDefault(); read_for_update(item.contentno); }}>
                                                    <img src={update_img} className="icon" title="수정" />
                                                </a>

                                                <a href="#" onClick={(e) => { e.preventDefault(); read_for_delete(item.contentno); }}>
                                                    <img src={delete_img} className="icon" title="삭제" />
                                                </a>
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

const saveBtnStyle: React.CSSProperties = {
    height: '42px',
    padding: '0 20px',
    border: 'none',
    borderRadius: '12px',
    background: '#00C9A7',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
};

const cancelBtnStyle: React.CSSProperties = {
    height: '42px',
    padding: '0 20px',
    border: '1px solid #DDEFF2',
    borderRadius: '12px',
    background: '#fff',
    color: '#0A2342',
    fontWeight: 800,
    cursor: 'pointer',
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

export default Content