import React, { useState } from 'react';
import axiosInstance from './axiosConfig'; // Ensure this points to your axios instance
import styled from 'styled-components';

// CSS 스타일 정의
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  font-size: 30px;
  color: blue;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 300px;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    background-color: #0056b3;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
  margin-top: 10px;
`;

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
        // Save userId to localStorage
        localStorage.setItem('LoginResults', JSON.stringify({
          userId,
          userName: response.data.data.HZ01030,
          dboTable: 'ssc_00_demo.dbo',
        }));
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
    <Container>
      <Title>철강ERP시스템 (E4SSC)</Title>
      <Form onSubmit={handleLogin}>
        <InputGroup>
          <Label>사용자 이름:</Label>
          <Input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value.toUpperCase())}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>비밀번호:</Label>
          <Input
            type="password"
            value={passwd}
            onChange={(e) => setPasswd(e.target.value.toUpperCase())}
            required
          />
        </InputGroup>
        <Button type="submit">로그인</Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </Container>
  );
};

export default Login;
