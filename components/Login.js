import React, { useState } from 'react';
import axiosInstance from './axiosConfig'; // Ensure this points to your axios instance

const Login = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState('');
  const [passwd, setPasswd] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axiosInstance.post('comm.jsp', {
        map: 'comm.login_s',
        table: 'ssc_00_demo.dbo', 
        userId,
        passwd,
      });

      if (response.data && !response.data.data.err) {
        // Call the onLoginSuccess prop to navigate to MainMenu
        onLoginSuccess();
      } else {
        setError('로그인 실패: ' + (response.data.data.err || '잘못된 자격 증명'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('로그인 중 오류 발생: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>사용자 이름:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>비밀번호:</label>
          <input
            type="password"
            value={passwd}
            onChange={(e) => setPasswd(e.target.value)}
            required
          />
        </div>
        <button type="submit">로그인</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;
