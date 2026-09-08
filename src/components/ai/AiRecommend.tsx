import {
  FormEvent,
  useState
} from 'react';

import {
  axiosInstance
} from '../Tool';

import './AiRecommend.css';

/**
 * 백엔드 AI 추천 API 응답 구조.
 *
 * Spring Boot의 AiRecommendDTO와
 * 같은 구조로 맞춘다.
 */
interface AiRecommendResponse {
  question: string;
  answer: string;
}

/**
 * AI 맛집 추천 페이지.
 *
 * 사용자가 원하는 맛집 조건을 입력하면
 * Spring Boot의 /ai/recommend API를 호출하고,
 * OpenAI가 생성한 추천 결과를 화면에 출력한다.
 */
function AiRecommend() {

  /**
   * 사용자가 입력한 질문.
   *
   * 예)
   * "강남에서 숙성회 맛있는 곳 추천해줘"
   */
  const [
    question,
    setQuestion
  ] = useState('');

  /**
   * AI가 반환한 추천 결과.
   */
  const [
    answer,
    setAnswer
  ] = useState('');

  /**
   * AI 요청 처리 중인지 확인하는 상태.
   *
   * true:
   * OpenAI 응답을 기다리는 중
   *
   * false:
   * 요청이 끝난 상태
   */
  const [
    loading,
    setLoading
  ] = useState(false);

  /**
   * 오류 메시지.
   */
  const [
    error,
    setError
  ] = useState('');

  /**
   * AI 추천 요청 처리.
   *
   * 사용자가 폼을 제출하면
   * POST /ai/recommend API를 호출한다.
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    /**
     * form의 기본 새로고침 동작을 막는다.
     */
    event.preventDefault();

    /**
     * 입력한 질문에서
     * 앞뒤 공백을 제거한다.
     */
    const trimmedQuestion =
      question.trim();

    /**
     * 아무것도 입력하지 않았다면
     * API를 호출하지 않는다.
     */
    if (!trimmedQuestion) {

      setError(
        '추천받고 싶은 조건을 입력해주세요.'
      );

      return;
    }

    /**
     * 새로운 요청을 시작하기 전에
     * 이전 오류와 답변을 초기화한다.
     */
    setError('');
    setAnswer('');

    /**
     * 요청 시작.
     */
    setLoading(true);

    try {

      /**
       * Spring Boot AI 추천 API 호출.
       *
       * 요청 JSON:
       *
       * {
       *   "question":
       *   "숙성회 맛있는 곳 추천해줘"
       * }
       */
      const response =
        await axiosInstance.post<
          AiRecommendResponse
        >(
          '/ai/recommend',
          {
            question:
              trimmedQuestion
          }
        );

      /**
       * 백엔드에서 반환받은
       * AI 추천 결과 저장.
       */
      setAnswer(
        response.data.answer
        || '추천 결과가 없습니다.'
      );

    } catch (requestError) {

      /**
       * API 호출 실패 시
       * 개발자가 확인할 수 있도록
       * 브라우저 Console에도 출력한다.
       */
      console.error(
        'AI 추천 요청 실패:',
        requestError
      );

      /**
       * 사용자에게 보여줄 오류 메시지.
       */
      setError(
        'AI 추천을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
      );

    } finally {

      /**
       * 성공/실패와 관계없이
       * 요청이 끝났으므로 loading 종료.
       */
      setLoading(false);
    }
  };

  /**
   * 예시 질문을 클릭했을 때
   * 입력창에 바로 넣어주는 함수.
   */
  const selectExample = (
    example: string
  ) => {

    setQuestion(example);

    /**
     * 기존 결과와 오류는 초기화한다.
     */
    setAnswer('');
    setError('');
  };

  return (
    <main className="ai-recommend-page">

      <section className="ai-recommend-container">

        {/* 페이지 상단 제목 */}
        <div className="ai-recommend-header">

          <span className="ai-recommend-label">
            AI RECOMMEND
          </span>

          <h1>
            AI 맛집 추천
          </h1>

          <p>
            원하는 지역, 메뉴, 가격,
            예약 여부 등을 자연스럽게
            입력해보세요.
          </p>

        </div>

        {/* AI 질문 입력 영역 */}
        <form
          className="ai-recommend-form"
          onSubmit={handleSubmit}
        >

          <label
            htmlFor="ai-question"
            className="ai-recommend-form-label"
          >
            어떤 횟집을 찾고 계신가요?
          </label>

          <textarea
            id="ai-question"
            className="ai-recommend-input"
            value={question}
            placeholder={
              '예) 강남에서 가성비 좋고 숙성회 맛있는 곳 추천해줘'
            }
            maxLength={300}
            disabled={loading}
            onChange={event => {

              setQuestion(
                event.target.value
              );

              /**
               * 사용자가 다시 입력하면
               * 기존 오류 메시지는 제거한다.
               */
              if (error) {
                setError('');
              }
            }}
          />

          <div className="ai-recommend-form-bottom">

            <span className="ai-recommend-count">
              {question.length} / 300
            </span>

            <button
              type="submit"
              className="ai-recommend-submit"
              disabled={loading}
            >
              {
                loading
                  ? '추천 중...'
                  : 'AI 추천받기'
              }
            </button>

          </div>

        </form>

        {/* 예시 질문 */}
        <div className="ai-recommend-examples">

          <span className="ai-recommend-examples-title">
            이렇게 물어보세요
          </span>

          <div className="ai-recommend-example-list">

            <button
              type="button"
              onClick={() =>
                selectExample(
                  '숙성회 맛있는 곳 추천해줘'
                )
              }
            >
              숙성회 맛집
            </button>

            <button
              type="button"
              onClick={() =>
                selectExample(
                  '강남에서 가성비 좋은 곳 추천해줘'
                )
              }
            >
              강남 · 가성비
            </button>

            <button
              type="button"
              onClick={() =>
                selectExample(
                  '예약 가능한 횟집 추천해줘'
                )
              }
            >
              예약 가능한 곳
            </button>

            <button
              type="button"
              onClick={() =>
                selectExample(
                  '주차 가능한 횟집 추천해줘'
                )
              }
            >
              주차 가능한 곳
            </button>

          </div>

        </div>

        {/* 오류 메시지 */}
        {
          error && (
            <div
              className="ai-recommend-error"
              role="alert"
            >
              {error}
            </div>
          )
        }

        {/* AI 로딩 영역 */}
        {
          loading && (
            <section className="ai-recommend-loading">

              <div className="ai-recommend-spinner" />

              <strong>
                맛집 데이터를 분석하고 있습니다.
              </strong>

              <p>
                잠시만 기다려주세요.
              </p>

            </section>
          )
        }

        {/* AI 추천 결과 */}
        {
          answer
          && !loading
          && (
            <section className="ai-recommend-result">

              <div className="ai-recommend-result-header">

                <span>
                  AI 추천 결과
                </span>

                <small>
                  회친자들에 등록된
                  맛집 데이터를 기준으로 추천합니다.
                </small>

              </div>

              <div className="ai-recommend-answer">
                {answer}
              </div>

            </section>
          )
        }

      </section>

    </main>
  );
}

export default AiRecommend;