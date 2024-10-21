import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Modal2 from './Modal2';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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

const GridContainer = styled.div`
  height: 400px;
  width: 100%;
  flex: 1;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-left: 20px;
`;

const columnDefs = [
  { field: 'HC11020', headerName: '거래처명', width: 150 },
  { field: 'HC11030', headerName: '사업자번호', width: 120 },
  { field: 'HC11040', headerName: '대표자', width: 100 },
  { field: 'HC11070', headerName: '담당자', width: 100 },
  { field: 'HC11210', headerName: '전화번호', width: 120 },
];

const Card2 = ({ menuName }) => {
  const gridRef = useRef(null);
  const [conditions, setConditions] = useState({
    keyword: '',
    customerType: '1',
    representative: '',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

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

  const handleRowClick = useCallback((event) => {
    setSelectedItem(event.data);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
    setModalMode(null);
    setModalTitle('');
  }, []);

  const handleSaveEdit = useCallback((editedItem) => {
    console.log('Edited item:', editedItem);
    setResults(prevResults => 
      prevResults.map(item => 
        item.HC11010 === editedItem.HC11010 ? editedItem : item
      )
    );
    handleCloseModal();
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedItem(null);
    setModalMode('create');
    setModalTitle('거래처 정보 등록');
  }, []);

  const handleEdit = useCallback(() => {
    if (selectedItem) {
      setModalMode('edit');
      setModalTitle('거래처 정보 수정');
    } else {
      alert('수정할 항목을 선택해주세요.');
    }
  }, [selectedItem]);

  const handleDelete = useCallback(() => {
    if (selectedItem) {
      const confirmDelete = window.confirm('선택한 거래처를 삭제하시겠습니까?');
      if (confirmDelete) {
        setResults(prevResults => prevResults.filter(item => item.HC11010 !== selectedItem.HC11010));
        setSelectedItem(null);
        if (gridRef.current && gridRef.current.api) {
          gridRef.current.api.deselectAll();
        }
      }
    } else {
      alert('삭제할 항목을 선택해주세요.');
    }
  }, [selectedItem]);

  const handleExcelDownload = useCallback(async () => {
    if (gridRef.current && gridRef.current.api) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('검색결과');

      // 헤더 추가
      worksheet.addRow(columnDefs.map(col => col.headerName));

      // 데이터 추가
      gridRef.current.api.forEachNode(node => {
        worksheet.addRow(columnDefs.map(col => node.data[col.field]));
      });

      // 열 너비 설정
      columnDefs.forEach((col, index) => {
        worksheet.getColumn(index + 1).width = col.width / 7;
      });

      // 엑셀 파일 생성 및 다운로드
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), '검색결과.xlsx');
    }
  }, []);

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
        <ButtonGroup>
          <Button onClick={handleSearch}>조회</Button>
          <Button onClick={handleCreate}>등록</Button>
          <Button onClick={handleEdit}>수정</Button>
          <Button onClick={handleDelete}>삭제</Button>
          <Button onClick={handleExcelDownload}>엑셀</Button>
          <Button onClick={handlePdfDownload}>PDF</Button>
        </ButtonGroup>
      </ConditionArea>
      <ResultArea>
        {loading && <p>데이터를 불러오는 중...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <GridContainer className="ag-theme-alpine">
            <AgGridReact
              ref={gridRef}
              columnDefs={columnDefs}
              rowData={results}
              onRowClicked={handleRowClick}
              rowSelection="single"
              suppressRowDeselection={true}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
              }}
            />
          </GridContainer>
        )}
      </ResultArea>
      {modalMode && (
        <Modal2
          item={modalMode === 'create' ? {} : selectedItem}
          onClose={handleCloseModal}
          onSave={handleSaveEdit}
          mode={modalMode}
          title={modalTitle}
        />
      )}
    </CardContainer>
  );
};

export default Card2;
