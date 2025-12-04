import React, { forwardRef } from 'react';
import { Title, Table, TableHeader, TableRow } from './StylesPrint'; // Import common styles

const W_HC01010_02 = forwardRef(({ data, title = "사업장 코드관리" }, ref) => {
  const formattedData = data.map(item => ({
    hc01010:item.HC01010,
    hc01030:item.HC01030,
    hc01020:item.HC01020,
    hc01040:item.HC01040,
    hc01100:item.HC01100,
    hc01090:item.HC01090,
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
              <td>{item.hc01010}</td>
              <td>{item.hc01030}</td>
              <td>{item.hc01020}</td>
              <td>{item.hc01040}</td>
              <td>{item.hc01100}</td>
              <td>{item.hc01090}</td>
              </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
});

export const getTableHeaders = () => {
  return ['코드', '사업자등록번호', '상호', '대표자', '업태', '업종'];
}

export const getFormattedData = (data) => {
  return data.map(item => [
    item.HC01010,
    item.HC01030,
    item.HC01020,
    item.HC01040,
    item.HC01100,
    item.HC01090,
  ]);
};

export const getWidthData = () => {
  return [25, 80, 110, 50, 100, 100];
}

export default W_HC01010_02;
