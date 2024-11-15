import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import W_HC01110_01 from './w_hc01110_01';
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

const Select = styled.select`
  padding: 5px;
  width: 200px;
`;

const GridContainer = styled.div`
  height: 400px;
  width: 100%;
  flex: 1;
`;

const ResultArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;


const columnDefs = [
  { field: 'HC11020', headerName: '거래처명', width: 300 },
  { field: 'HC11030', headerName: '사업자번호', width: 150 },
  { field: 'HC11040', headerName: '대표자', width: 100 },
  { field: 'HC11070', headerName: '담당자', width: 100 },
  { field: 'HC11210', headerName: '전화번호', width: 150 },
];

const Card2 = forwardRef(({ menuName, onPermissionsChange, cachedData, onDataChange }, ref) => {
  const gridRef = useRef(null);
  const [conditions, setConditions] = useState(() => {
    // localStorage에서 이전에 저장된 조건들을 불러옵니다.
    const savedConditions = localStorage.getItem('savedCard2Conditions');
    return savedConditions ? JSON.parse(savedConditions) : {
      keyword: '',
      customerType: '1',
      representative: '',
    };
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [allResults, setAllResults] = useState({});
  const [data, setData] = useState(cachedData || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [permissions, setPermissions] = useState({ view: false, add: false, update: false, delete: false });

  useEffect(() => {
    if (cachedData) {
      setData(cachedData);
    }
  }, [cachedData]); // cachedData2가 변경될 때만 실행

  useEffect(() => {
    if (cachedData) {
        setData(cachedData);
        setAllResults(cachedData); // Ensure allResults is updated with cachedData
        setResults(Object.values(cachedData)); // Update results with cachedData
    } else {
        // Load saved data from localStorage
        const savedResults = localStorage.getItem('card2Results');
        if (savedResults) {
            const parsedResults = JSON.parse(savedResults);
            setAllResults(parsedResults);
            setResults(Object.values(parsedResults));
            onDataChange(parsedResults);
        }
    }
  }, [cachedData]); // Add onDataChange to dependencies
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedConditions = { ...conditions, [name]: value };
    setConditions(updatedConditions);
    
    // 조건이 변경될 때마다 localStorage에 저장합니다.
    localStorage.setItem('savedCard2Conditions', JSON.stringify(updatedConditions));
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    // 검색 시 cachedData 삭제
    setData([]); // Reset cachedData to an empty array
    onDataChange(null);

    try {
      const params = {
        map: 'sale11010.sale11010_s',
        limit: 100,
        table: 'ssc_00_demo.dbo',
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
        const newResults = response.data.data.result;
        
        // Ensure newResults is an array of objects with keys matching columnDefs
        const updatedResults = {};
        newResults.forEach(item => {
          updatedResults[item.HC11010] = item; // Ensure HC11010 is unique
        });

        setAllResults(updatedResults);
        setResults(newResults); // Ensure newResults is in the correct format
        setData(newResults);
        onDataChange(updatedResults);

        localStorage.setItem('Card2Results', JSON.stringify(updatedResults));
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
    gridRef.current.api.forEachNode(node => {
      node.setSelected(node.data === event.data); // Keep the selected row highlighted
      // 원래 위치로 돌아가기
      //gridRef.current.api.ensureIndexVisible(node.rowIndex); // Ensure the selected row is visible
    });
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

  const fetchPermissions = useCallback(async () => {
    const response = await new Promise(resolve => 
        { const timer = setTimeout(() => resolve({ view: true, add: true, update: true, delete: true }), 1000);
          return () => clearTimeout(timer);
        }
      );
      setPermissions(response);
    if (onPermissionsChange) {
      onPermissionsChange(response);
    }
  }, [onPermissionsChange]);

  useEffect(() => {
    fetchPermissions();
  }, []);


  useImperativeHandle(ref, () => ({
    handleSearch,
    handleCreate: () => {
      setSelectedItem(null);
      setIsModalOpen(true);
      setModalMode('create');
      setModalTitle('거래처 정보 등록');
    },
    handleEdit: () => {
      if (selectedItem) {
        setIsModalOpen(true);
        setModalMode('edit');
        setModalTitle('거래처 정보 수정');
      } else {
        alert('수정할 항목을 선택해주세요.');
      }
    },
    handleDelete: () => {
      if (selectedItem) {
        const confirmDelete = window.confirm('선택한 거래처를 삭제하시겠습니까?');
        if (confirmDelete) {
          setResults(prevResults => prevResults.filter(item => item.HC11010 !== selectedItem.HC11010));
          setSelectedItem(null);
          if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.deselectAll(); // Deselect all after deletion
          }
        }
      } else {
        alert('삭제할 항목을 선택해주세요.');
      }
    },
    handleExcelDownload: async () => {
      if (gridRef.current && gridRef.current.api) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('검색결과');

        worksheet.addRow(columnDefs.map(col => col.headerName));

        gridRef.current.api.forEachNode(node => {
          worksheet.addRow(columnDefs.map(col => node.data[col.field]));
        });

        columnDefs.forEach((col, index) => {
          worksheet.getColumn(index + 1).width = col.width / 7;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), '검색결과.xlsx');
      }
    },
    handlePdfDownload: () => {
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
    },
    handleCsvDownload: () => {
      if (gridRef.current && gridRef.current.api) {
        const params = {
          fileName: '검색결과.csv',
        };
        gridRef.current.api.exportDataAsCsv(params);
      }
    },
  }));

  return (
    <CardContainer>
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
              rowSelection='single' // Ensure this is set correctly
              suppressRowClickSelection={false} // Allow row selection
              suppressMovableColumns={false}
              animateRows={true}
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
        <W_HC01110_01
          item={modalMode === 'create' ? {} : selectedItem}
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          onSave={handleSaveEdit}
          mode={modalMode}
          title={modalTitle}
        />
      )}
    </CardContainer>
  );
});

export default Card2;
