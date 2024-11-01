import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import styled from 'styled-components';
import axiosInstance from './axiosConfig'; // Axios 인스턴스 import
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

const w_hc01110 = forwardRef(({ menuName, onPermissionsChange, cachedData2, onDataChange }, ref) => {
  const gridRef = useRef(null);
  const [conditions, setConditions] = useState(() => {
    // localStorage에서 이전에 저장된 조건들을 불러옵니다.
    const savedConditions = localStorage.getItem('savedConditions');
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
  const [data, setData] = useState(cachedData2 || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [permissions, setPermissions] = useState({ view: false, add: false, update: false, delete: false });

  useEffect(() => {
    if (cachedData2) {
      setData(cachedData2);
    }
  }, [cachedData2]); // cachedData2가 변경될 때만 실행

  useEffect(() => {
    if (cachedData2) {
      setAllResults(cachedData2);
      setResults(Object.values(cachedData2));
    } else {
      // Load saved data from localStorage
      const savedResults = localStorage.getItem('w_hc01110Results');
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults);
        setAllResults(parsedResults);
        setResults(Object.values(parsedResults));
        onDataChange(parsedResults); // Ensure this does not cause a re-render loop
      }
    }
  }, [cachedData2]); // onDataChange를 의존성 배열에서 제거

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    const updatedConditions = { ...conditions, [name]: value };
    setConditions(updatedConditions);
    
    // 조건이 변경될 때마다 localStorage에 저장합니다.
    localStorage.setItem('savedConditions', JSON.stringify(updatedConditions));
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    // 검색 시 cachedData 삭제
    setData([]); // Reset cachedData to an empty array
    onDataChange(null); // Ensure this does not cause a re-render loop
    
    try {
      const params = {
        map: 'cd01.cd01110_s',
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

      console.log('Search params:', params);

      const response = await axiosInstance.get('comm.jsp', { 
        params,
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        }
      });
      
      console.log('API response:', response.data);

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

        localStorage.setItem('w_hc01110Results', JSON.stringify(updatedResults));
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
    setSelectedItem(event.data); // Set the selected item when the row is clicked
  }, []);

  const handleRowSelected = useCallback((event) => {
    if (event.node.isSelected()) {
      setSelectedItem(event.data); // Set the selected item when the row is selected
    } else {
      setSelectedItem(null); // Clear the selected item if the row is deselected
    }
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

  //const handleShowAllResults = () => {
  //  setResults(Object.values(allResults));
  //};

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
      alert("등록");
      setSelectedItem(null); // Clear selected item for new entry
      setIsModalOpen(true);
      setModalMode('create'); // Set modal mode to create
      setModalTitle('거래처 정보 등록'); // Set modal title for create
    },
    handleEdit: () => {
      if (selectedItem) {
        setIsModalOpen(true);
        setModalMode('edit'); // Set modal mode to edit
        setModalTitle('거래처 정보 수정'); // Set modal title for edit
      } else {
        alert('수정할 항목을 선택해주세요.'); // Alert if no item is selected
      }
    },
    handleDelete: () => {
      if (selectedItem) {
        const confirmDelete = window.confirm('선택한 거래처를 삭제하시겠습니까?');
        if (confirmDelete) {
          //setAllResults(prevAllResults => {
          //  const updatedResults = { ...prevAllResults };
          //  delete updatedResults[selectedItem.HC11010];
          //  return updatedResults;
          //});
          setResults(prevResults => prevResults.filter(item => item.HC11010 !== selectedItem.HC11010));
          setSelectedItem(null);
          if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.deselectAll();
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
    //handleShowAllResults,
    //refetchPermissions: fetchPermissions,
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
              rowSelection='single' // Updated to use object format
              suppressRowClickSelection={false} // 체크박스 제거
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

export default w_hc01110;
