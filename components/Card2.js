import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Modal from './Modal';

const CardContainer = styled.div`
  padding: 5px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MenuName = styled.h2`
  font-size: 18px;
  margin-bottom: 15px;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
`;

const ConditionArea = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 5px;
`;

const InputsWrapper = styled.div`
  display: flex;
  flex-grow: 1;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
`;

const Label = styled.label`
  margin-right: 5px;
  white-space: nowrap;
`;

const Input = styled.input`
  padding: 5px;
  width: 200px;
`;

const Button = styled.button`
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  height: 30px;
  &:hover {
    background-color: #0056b3;
  }
`;

const ResultArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ResultTitle = styled.h3`
  background-color: #f0f0f0;
  padding: 10px;
  margin: 0;
  border-radius: 5px 5px 0 0;
`;

const TableContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 0 0 5px 5px;
`;

const TableHeader = styled.div`
  background-color: #e0e0e0;
  font-weight: bold;
  padding: 10px;
  display: flex;
  border-bottom: 1px solid #ddd;
`;

const TableBody = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const TableRow = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  &:last-child {
    border-bottom: none;
  }
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const TableCell = styled.div`
  flex: 1;
  padding: 10px;
  text-align: left;
`;

const Select = styled.select`
  padding: 5px;
  width: 200px;
`;

const Card2 = ({ menuName }) => {
  const [conditions, setConditions] = useState({
    keyword: '',
    customerType: '1',
    representative: '',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConditions(prev => ({ ...prev, [name]: value }));
  };

  const encodeKorean = (str) => {
    return encodeURIComponent(str).replace(/%/g, '%25');
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        map: 'sale11010.sale11010_s',
        limit: 100,
        table: 'ssc_88_DK.dbo',
        start: 1,
        sale11010_hc11011: conditions.customerType,
      };

      if (conditions.keyword.trim()) {
        params.sale11010_hc11020 = conditions.keyword.trim();
      }

      if (conditions.representative.trim()) {
        params.sale11010_hc11040 = conditions.representative.trim();
      }

      const response = await axios.get('https://www.my-info.co.kr/e4ssc-web/jsp/comm.jsp', { 
        params,
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        }
      });
      
      if (response.data && response.data.data && response.data.data.result) {
        setResults(response.data.data.result);
      } else {
        setError('데이터 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = (editedData) => {
    console.log('Saving edited data:', editedData);
    setResults(prevResults => 
      prevResults.map(item => 
        item.HC11010 === editedData.HC11010 ? editedData : item
      )
    );
  };

  return (
    <CardContainer>
      <MenuName>{menuName}</MenuName>
      <ConditionArea>
        <InputsWrapper>
          <InputGroup>
            <Label>거래처명:</Label>
            <Input
              type="text"
              name="keyword"
              value={conditions.keyword}
              onChange={handleInputChange}
            />
          </InputGroup>
          <InputGroup>
            <Label>거래처구분:</Label>
            <Select
              name="customerType"
              value={conditions.customerType}
              onChange={handleInputChange}
            >
              <option value="1">영업</option>
              <option value="2">일반</option>
            </Select>
          </InputGroup>
          <InputGroup>
            <Label>대표자명:</Label>
            <Input
              type="text"
              name="representative"
              value={conditions.representative}
              onChange={handleInputChange}
            />
          </InputGroup>
        </InputsWrapper>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? '검색 중...' : '검색'}
        </Button>
      </ConditionArea>
      <ResultArea>
        {loading && <p>데이터를 불러오는 중...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && results.length > 0 ? (
          <TableContainer>
            <TableHeader>
              <TableCell>거래처명</TableCell>
              <TableCell>사업자번호</TableCell>
              <TableCell>대표자</TableCell>
              <TableCell>담당자</TableCell>
              <TableCell>전화번호</TableCell>
            </TableHeader>
            <TableBody>
              {results.map((item, index) => (
                <TableRow key={index} onClick={() => handleRowClick(item)}>
                  <TableCell>{item.HC11020}</TableCell>
                  <TableCell>{item.HC11030}</TableCell>
                  <TableCell>{item.HC11040}</TableCell>
                  <TableCell>{item.HC11070}</TableCell>
                  <TableCell>{item.HC11210}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableContainer>
        ) : (
          <p>검색 결과가 없습니다.</p>
        )}
      </ResultArea>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={selectedItem} 
        onSave={handleSave}
      />
    </CardContainer>
  );
};

export default Card2;
