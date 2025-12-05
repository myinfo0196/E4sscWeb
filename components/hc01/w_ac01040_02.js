import React, { forwardRef } from 'react';
import { Title, Table, TableHeader, TableRow } from '../StylesPrint'; // Import common styles

const W_AC01040_02 = forwardRef(({ data, title = "계좌코드 목록" }, ref) => {
  const formattedData = data.map(item => ({
    f04010: item.F04010,
    f04030: item.F04030,
    f04020: item.F04020,
    f04100: item.F04100,
    f04110: item.F04110,
    f04120: item.F04120,
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
              <td>{item.f04010}</td>
              <td>{item.f04030}</td>
              <td>{item.f04020}</td>
              <td>{item.f04100}</td>
              <td>{item.f04110}</td>
              <td>{item.f04120}</td>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
});

export const getTableHeaders = () => {
  return ['코드', '관리명칭', '번호', '개설일자', '만기일자', '폐기일자'];
}

export const getFormattedData = (data) => {
  return data.map(item => [
    item.F04010,
    item.F04030,
    item.F04020,
    item.F04100,
    item.F04110,
    item.F04120,
  ]);
};

export const getWidthData = () => {
  return [40, 120, 100, 60, 60, 60];
}

export default W_AC01040_02;
