import {
    Link
} from "react-router-dom";

import type {
    Post
} from "./searchTypes";

import {
    getSafeRating,
    highlightText
} from "./searchUtils";

interface ReviewSearchCardProps {
    post: Post;
    keyword: string;
}

function ReviewSearchCard({
    post,
    keyword
}: ReviewSearchCardProps) {
    const rating =
        getSafeRating(
            post.rating
        );

    return (
        <Link
            to={`/post/read/${post.postno}`}
            className="search-link"
        >
            <article className="review-search-card">
                <div className="review-card-top">
                    <div className="review-rating">
                        <span
                            className="stars"
                            aria-label={
                                `별점 ${rating.toFixed(
                                    1
                                )}점`
                            }
                        >
                            {[1, 2, 3, 4, 5]
                                .map(star => (
                                    <span
                                        key={star}
                                        className={
                                            star
                                            <= rating
                                                ? "star active"
                                                : "star"
                                        }
                                    >
                                        ★
                                    </span>
                                ))}
                        </span>

                        <strong>
                            {rating.toFixed(1)}
                        </strong>
                    </div>

                    <span className="review-date">
                        {post.rdate
                            ?.substring(
                                0,
                                10
                            )}
                    </span>
                </div>

                <h3 className="review-title">
                    {highlightText(
                        post.title,
                        keyword
                    )}
                </h3>

                <p className="review-content">
                    {highlightText(
                        post.content,
                        keyword
                    )}
                </p>

                <div className="review-bottom">
                    <span>
                        👍 {post.recom}
                    </span>

                    <span>
                        👁 {post.cnt}
                    </span>

                    <span>
                        💬 {post.replycnt}
                    </span>

                    <span className="review-more">
                        리뷰 보기 →
                    </span>
                </div>
            </article>
        </Link>
    );
}

export default ReviewSearchCard;