import React, { forwardRef } from 'react';
import { Title, Table, TableHeader, TableRow } from './PrintStyles'; // Import common styles

const W_HC01110_02 = forwardRef(({ data, title = "거래처 코드관리" }, ref) => {
  const formattedData = data.map(item => ({
    hc11010: item.HC11010,
    hc11020: item.HC11020,
    hc11030: item.HC11030,
    hc11040: item.HC11040,
    hc11070: item.HC11070,
    hc11210: item.HC11210,
  }));

  return (
    <div>
      <Title>{title}</Title>
      <Table>
        <thead>
          <TableRow>
            {getTableHeaders().map((header, index) => (
              <TableHeader key={index}>{header}</TableHeader>
            ))}
          </TableRow>
        </thead>
        <tbody>
          {formattedData.map((item, index) => (
            <TableRow key={index}>
              <td>{item.hc11010}</td>
              <td>{item.hc11020}</td>
              <td>{item.hc11030}</td>
              <td>{item.hc11040}</td>
              <td>{item.hc11070}</td>
              <td>{item.hc11210}</td>
              </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
});

export const getTableHeaders = () => {
  return ['코드', '거래처명', '사업자등록번호', '대표자', '담당자', '전화번호'];
}

export const getFormattedData = (data) => {
  return data.map(item => [
    item.HC11010,
    item.HC11020,
    item.HC11030,
    item.HC11040,
    item.HC11070,
    item.HC11210,
  ]);
};

export const getWidthData = () => {
  return [40, 120, 100, 60, 60, 70];
}


export default W_HC01110_02;
