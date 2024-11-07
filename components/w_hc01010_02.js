import React, { forwardRef } from 'react';
import styled from 'styled-components';

const PrintContainer = styled.div`
  padding: 20px;
  
  @media print {
    padding: 0;
  }
`;

const PrintHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;
  page-break-inside: avoid;
  
  h1 {
    font-size: 24px;
    margin-bottom: 10px;
  }
  
  .print-date {
    font-size: 12px;
    color: #666;
  }
`;

const PrintTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    font-size: 12px;
  }
  
  th {
    background-color: #f8f8f8;
    font-weight: bold;
    white-space: nowrap;
  }

  td {
    white-space: normal;
    word-break: break-all;
  }
  
  @media print {
    th {
      background-color: #f8f8f8 !important;
      -webkit-print-color-adjust: exact;
    }
    
    thead {
      display: table-header-group;
    }
    
    tr {
      page-break-inside: avoid;
    }
  }
`;

const PrintFooter = styled.div`
  text-align: right;
  font-size: 12px;
  color: #666;
  margin-top: 20px;
  page-break-inside: avoid;
`;

const W_HC01010_02 = forwardRef(({ data, title = "사업장 코드관리" }, ref) => {
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (!data || data.length === 0) {
    return (
      <PrintContainer ref={ref}>
        <PrintHeader>
          <h1>{title}</h1>
          <div className="print-date">출력일시: {currentDate}</div>
        </PrintHeader>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          데이터가 없습니다.
        </div>
      </PrintContainer>
    );
  }

  return (
    <PrintContainer ref={ref}>
      <PrintHeader>
        <h1>{title}</h1>
        <div className="print-date">출력일시: {currentDate}</div>
      </PrintHeader>

      <PrintTable>
        <thead>
          <tr>
            <th>코드</th>
            <th>사업자등록번호</th>
            <th>상호</th>
            <th>대표자</th>
            <th>업태</th>
            <th>업종</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.HC01010}</td>
              <td>{item.HC01030}</td>
              <td>{item.HC01020}</td>
              <td>{item.HC01040}</td>
              <td>{item.HC01100}</td>
              <td>{item.HC01090}</td>
            </tr>
          ))}
        </tbody>
      </PrintTable>

      <PrintFooter>
        <div>총 {data.length}건</div>
      </PrintFooter>
    </PrintContainer>
  );
});

export default W_HC01010_02;
