import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios'; // axios 추가
import Modal1 from './Modal1';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// ag-Grid 라이센스 설정 (만약 있다면)
// LicenseManager.setLicenseKey('YOUR_LICENSE_KEY');

const CardContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 5px;
  margin: 1px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ConditionArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;
`;

const Label = styled.label`
  margin-right: 5px;
`;

const Input = styled.input`
  padding: 5px;
  width: 120px;
`;

const Button = styled.button`
  padding: 8px 16px;
  margin-left: 10px;
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

const MenuName = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
`;

const CardTitle = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
`;

const SearchArea = styled.div`
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ResultTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  background-color: #f1f3f5;
  padding: 10px;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #dee2e6;
`;

const ButtonGroup = styled.div`
  display: flex;
`;

const GridContainer = styled.div`
  height: 400px;
  width: 100%;
`;

const SelectedRow = styled.div`
  background-color: #e0e0e0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 8px;
`;

// columnDefs를 컴포넌트 외부로 이동
const columnDefs = [
  { field: 'HC01010', headerName: '코드', width: 100 },
  { field: 'HC01030', headerName: '사업자등록번호', width: 150 },
  { field: 'HC01020', headerName: '상호', width: 200 },
  { field: 'HC01040', headerName: '대표자', width: 100 },
  { field: 'HC01100', headerName: '업태', width: 100 },
  { field: 'HC01090', headerName: '업종', width: 100 }
];

const Card1 = ({ menuName }) => {
  const gridRef = useRef(null);
  const [conditions, setConditions] = useState({
    businessPlace: '',
  });
  const [results, setResults] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConditions(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get('https://www.my-info.co.kr/e4ssc-web/jsp/comm.jsp', {
        params: {
          map: 'sale11010.sale11020_s',
          table: 'ssc_88_DK.dbo',
          sale11020_hc01010: '',
          businessPlace: conditions.businessPlace
        }
      });
      setResults(response.data.data.result || []);
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      setResults([]);
    }
  };

  const handleRowClick = useCallback((event) => {
    setSelectedRow(event.data);
  }, []);

  const getSelectedItem = useCallback(() => {
    return selectedRow;
  }, [selectedRow]);

  const handleCloseModal = useCallback(() => {
    setModalMode(null);
    setSelectedRow(null);
    setModalTitle('');
  }, []);

  const handleSaveEdit = useCallback((editedItem) => {
    // 여기에 저장 로직 구현
    console.log('Saving edited item:', editedItem);
    setModalMode(null);
    setSelectedRow(null);  // 저장 후 선택된 행을 초기화
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedRow(null);
    setModalMode('create');
    setModalTitle('사업장 등록');
  }, []);

  const handleEdit = useCallback(() => {
    if (selectedRow) {
      setModalMode('edit');
      setModalTitle('사업장 수정');
    } else {
      alert('수정할 항목을 선택해주세요.');
    }
  }, [selectedRow]);

  const handleDelete = useCallback(() => {
    if (selectedRow) {
      console.log('Deleting item:', selectedRow);
      setResults(prevResults => prevResults.filter(item => item.HC01010 !== selectedRow.HC01010));
      setSelectedRow(null);
    } else {
      alert('삭제할 항목을 선택해주세요.');
    }
  }, [selectedRow]);

  const handleCsvDownload = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      const params = {
        fileName: '검색결과.csv',
      };
      gridRef.current.api.exportDataAsCsv(params);
    }
  }, []);

  const handleExcelDownload = useCallback(async () => {
    if (gridRef.current && gridRef.current.api) {
      // 그리드 데이터 가져오기
      const rowData = [];
      gridRef.current.api.forEachNode((node) => {
        rowData.push(node.data);
      });

      // 워크북 생성
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('검색결과');

      // 헤더 추가
      worksheet.addRow(columnDefs.map(col => col.headerName));

      // 데이터 추가
      rowData.forEach(row => {
        worksheet.addRow(columnDefs.map(col => row[col.field]));
      });

      // 열 너비 설정
      columnDefs.forEach((col, index) => {
        worksheet.getColumn(index + 1).width = col.width / 7;
      });

      // 엑셀 파일 생성 및 다운로드
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), '검색결과.xlsx');
    }
  }, [columnDefs]);

  const handlePdfDownload = useCallback(() => {
    const gridElement = document.querySelector('.ag-theme-alpine');
    if (gridElement) {
      html2canvas(gridElement).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('검색결과.pdf');
      });
    }
  }, []);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  return (
    <CardContainer>
      <CardTitle>{menuName}</CardTitle>
      <SearchArea>
        <ConditionArea>
          <InputGroup>
            <Label>사업장:</Label>
            <Input
              type="text"
              name="businessPlace"
              value={conditions.businessPlace}
              onChange={handleInputChange}
            />
          </InputGroup>
          <ButtonGroup>
            <Button onClick={handleSearch}>조회</Button>
            <Button onClick={handleCreate}>등록</Button>
            <Button onClick={handleEdit}>수정</Button>
            <Button onClick={handleDelete}>삭제</Button>
            <Button onClick={handleCsvDownload}>CSV</Button>
            <Button onClick={handlePdfDownload}>PDF</Button>
            <Button onClick={handleExcelDownload}>엑셀</Button>
          </ButtonGroup>
        </ConditionArea>
      </SearchArea>
      <GridContainer className="ag-theme-alpine">
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          rowData={results}
          defaultColDef={defaultColDef}
          onRowClicked={handleRowClick}
          rowSelection="single"
          suppressRowDeselection={true}
        />
      </GridContainer>
      {modalMode && (
        <Modal1
          item={modalMode === 'create' ? {} : getSelectedItem()}
          onClose={handleCloseModal}
          onSave={handleSaveEdit}
          mode={modalMode}
          title={modalTitle}
        />
      )}
    </CardContainer>
  );
};

export default Card1;
