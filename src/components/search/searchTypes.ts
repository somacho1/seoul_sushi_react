export interface Content {
    contentno: number;
    district: string;
    name: string;
    best_menu: string;
    new_menu: string | null;
    badge: string | null;
    price: string | null;
    address: string;
    description: string | null;
}

export interface ContentImage {
    imgno: number;
    contentno: number;
    orgname: string;
    filename: string;
    filesize: number;
    seqno: number;
    main_yn: string;
    rdate: string;
}

export interface Post {
    postno: number;
    contentno: number;
    memberno: number;
    title: string;
    content: string;
    rating: number;
    recom: number;
    cnt: number;
    replycnt: number;
    rdate: string;
}

export type ContentImageMap = Record<
    number,
    ContentImage | null
>;

export type ImageLoadedMap = Record<
    number,
    boolean
>;

export type SearchTab =
    | "all"
    | "restaurant"
    | "review";