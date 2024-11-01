import axios from 'axios';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: 'https://www.my-info.co.kr/e4ssc-web/jsp/', // 기본 URL 설정
  timeout: 10000, // 요청 타임아웃 설정 (10초)
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded', // 기본 Content-Type 설정
  },
});

// 요청 인터셉터 (선택 사항)
axiosInstance.interceptors.request.use(
  (config) => {
    // 요청 전에 수행할 작업
    return config;
  },
  (error) => {
    // 요청 오류가 있는 경우
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (선택 사항)
axiosInstance.interceptors.response.use(
  (response) => {
    // 응답 데이터를 가공할 수 있음
    return response;
  },
  (error) => {
    // 응답 오류가 있는 경우
    return Promise.reject(error);
  }
);

export default axiosInstance;
