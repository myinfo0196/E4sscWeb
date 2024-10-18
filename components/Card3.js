import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 5px;
  margin: 1px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ConditionArea = styled.div`
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Label = styled.label`
  width: 100px;
  margin-right: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 5px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const ResultArea = styled.div`
  margin-top: 20px;
`;

const ResultList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const ResultItem = styled.li`
  padding: 10px;
  border-bottom: 1px solid #eee;
  &:last-child {
    border-bottom: none;
  }
`;

const CalledFrom = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
`;

const MenuName = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
`;

const Card1 = ({ menuName }) => {
  const [conditions, setConditions] = useState({
    startDate: '',
    endDate: '',
    keyword: '',
  });
  const [results, setResults] = useState([]);
  const [calledFrom, setCalledFrom] = useState('');

  useEffect(() => {
    // 컴포넌트가 마운트될 때 호출 스택을 확인합니다.
    const error = new Error();
    const stack = error.stack || '';
    const caller = stack.split('\n')[2] || '';
    const match = caller.match(/at\s+(.*)\s+\(/);
    const callerName = match ? match[1] : 'unknown';
    setCalledFrom(callerName);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConditions(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    // 여기에서 실제 검색 로직을 구현합니다.
    // 예시로 더미 데이터를 사용합니다.
    const dummyResults = [
      { id: 1, title: '결과 1', date: '2023-04-01' },
      { id: 2, title: '결과 2', date: '2023-04-02' },
      { id: 3, title: '결과 3', date: '2023-04-03' },
    ];
    setResults(dummyResults);
  };

  return (
    <CardContainer>
      <MenuName>{menuName}</MenuName>
      <ConditionArea>
        <InputGroup>
          <Label>시작일:</Label>
          <Input
            type="date"
            name="startDate"
            value={conditions.startDate}
            onChange={handleInputChange}
          />
        </InputGroup>
        <InputGroup>
          <Label>종료일:</Label>
          <Input
            type="date"
            name="endDate"
            value={conditions.endDate}
            onChange={handleInputChange}
          />
        </InputGroup>
        <InputGroup>
          <Label>키워드:</Label>
          <Input
            type="text"
            name="keyword"
            value={conditions.keyword}
            onChange={handleInputChange}
          />
        </InputGroup>
        <Button onClick={handleSearch}>검색</Button>
      </ConditionArea>
      <ResultArea>
        <h3>검색 결과</h3>
        {results.length > 0 ? (
          <ResultList>
            {results.map(item => (
              <ResultItem key={item.id}>{item.date} - {item.title}</ResultItem>
            ))}
          </ResultList>
        ) : (
          <p>검색 결과가 없습니다.</p>
        )}
      </ResultArea>
    </CardContainer>
  );
};

export default Card1;
