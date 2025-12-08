import React, { forwardRef } from 'react';
import { Title, Table, TableHeader, TableRow } from '../StylesPrint'; // Import common styles

const W_HC01020_02 = forwardRef(({ data, title = "하치장 코드관리" }, ref) => {
    const formattedData = data.map(item => ({
        hc02010: item.HC02010,
        hc02020: item.HC02020,
        hc02030: item.HC02030,
        hc02040: item.HC02040,
        hc02090: item.HC02090,
        hc02100: item.HC02100,
        hc02080: item.HC02080,
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
                            <td>{item.hc02010}</td>
                            <td>{item.hc02020}</td>
                            <td>{item.hc02030}</td>
                            <td>{item.hc02040}</td>
                            <td>{item.hc02090}</td>
                            <td>{item.hc02100}</td>
                            <td>{item.hc02080}</td>
                        </TableRow>
                    ))}
                </tbody>
            </Table>
        </div>
    );
});

export const getTableHeaders = () => {
    return ['코드', '명칭', '사업자번호', '대표자', '전화번호', 'FAX번호', '주소'];
}

export const getFormattedData = (data) => {
    return data.map(item => [
        item.HC02010,
        item.HC02020,
        item.HC02030,
        item.HC02040,
        item.HC02090,
        item.HC02100,
        item.HC02080,
    ]);
};

export const getWidthData = () => {
    return [25, 110, 80, 50, 100, 100, 100];
}

export default W_HC01020_02;
