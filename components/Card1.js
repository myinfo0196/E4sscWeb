import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
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
  { field: 'HC01010', headerName: '코드', width: 80 },
  { field: 'HC01030', headerName: '사업자등록번호', width: 150 },
  { field: 'HC01020', headerName: '상호', width: 200 },
  { field: 'HC01040', headerName: '대표자', width: 100 },
  { field: 'HC01100', headerName: '업태', width: 300 },
  { field: 'HC01090', headerName: '업종', width: 300 }
];

const Card1 = forwardRef(({ menuName, onPermissionsChange }, ref) => {
  const gridRef = useRef(null);
  const [conditions, setConditions] = useState({
    businessPlace: '',
  });
  const [results, setResults] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [permissions, setPermissions] = useState({ view: false, add: false, update: false, delete: false });

  useEffect(() => {
    // 여기서 실제로는 서버에서 권한 정보를 가져와야 합니다.
    // 이 예제에서는 임시로 권한을 설정합니다.
    const fetchPermissions = async () => {
      // 실제 API 호출로 대체해야 합니다.
      const response = await new Promise(resolve => setTimeout(() => resolve({ view: true, add: false, update: false, delete: true }), 1000));
      setPermissions(response);
      onPermissionsChange(response);
    };

    fetchPermissions();
  }, []);

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

  const handleCloseModal = useCallback(() => {
    setModalMode(null);
    setSelectedRow(null);
    setModalTitle('');
  }, []);

  const handleSaveEdit = useCallback((editedItem) => {
    console.log('Saving edited item:', editedItem);
    setModalMode(null);
    setSelectedRow(null);
  }, []);

  useImperativeHandle(ref, () => ({
    handleSearch: () => {
      if (permissions.view) {
        handleSearch();
      } else {
        alert('조회 권한이 없습니다.');
      }
    },
    handleCreate: () => {
      alert('등록 권한이 없습니다.');
    },
    handleEdit: () => {
      alert('수정 권한이 없습니다.');
    },
    handleDelete: () => {
      if (permissions.delete) {
        if (selectedRow) {
          console.log('Deleting item:', selectedRow);
          setResults(prevResults => prevResults.filter(item => item.HC01010 !== selectedRow.HC01010));
          setSelectedRow(null);
        } else {
          alert('삭제할 항목을 선택해주세요.');
        }
      } else {
        alert('삭제 권한이 없습니다.');
      }
    },
    handleCsvDownload: () => {
      if (permissions.view) {
        if (gridRef.current && gridRef.current.api) {
          const params = {
            fileName: '검색결과.csv',
          };
          gridRef.current.api.exportDataAsCsv(params);
        }
      } else {
        alert('조회 권한이 없습니다.');
      }
    },
    handleExcelDownload: () => {
      if (permissions.view) {
        if (gridRef.current && gridRef.current.api) {
          const rowData = [];
          gridRef.current.api.forEachNode((node) => {
            rowData.push(node.data);
          });

          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('검색결과');

          worksheet.addRow(columnDefs.map(col => col.headerName));

          rowData.forEach(row => {
            worksheet.addRow(columnDefs.map(col => row[col.field]));
          });

          columnDefs.forEach((col, index) => {
            worksheet.getColumn(index + 1).width = col.width / 7;
          });

          const buffer = workbook.xlsx.writeBuffer();
          saveAs(new Blob([buffer]), '검색결과.xlsx');
        }
      } else {
        alert('조회 권한이 없습니다.');
      }
    },
    handlePdfDownload: () => {
      if (permissions.view) {
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
      } else {
        alert('조회 권한이 없습니다.');
      }
    },
  }));

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
    </CardContainer>
  );
});

export default Card1;