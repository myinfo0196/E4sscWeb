import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import axiosInstance from './axiosConfig'; // Axios 인스턴스 import
import W_HC01110_01 from './w_hc01110_01';
import PrintModal from './PrintModal';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { CardContainer, ConditionArea, InputGroup, InputsWrapper, Label, Input, Select, ResultArea, GridContainer } from './StylesCommon'; // Import common styles
import generatePdf from './pdfGenerator'; // Import the PDF generator
import SearchDeal from './SearchDeal.js'; // Import the new modal component

const getInitialColumnDefs = () => {
  if (typeof window !== 'undefined') { // Check if running in the browser
    return JSON.parse(localStorage.getItem('w_hc01110Columns')) || [
      { field: 'HC11010', headerName: '코드', width: 100 },
      { field: 'HC11020', headerName: '거래처명', width: 300 },
      { field: 'HC11030', headerName: '사업자번호', width: 150 },
      { field: 'HC11040', headerName: '대표자', width: 100 },
      { field: 'HC11070', headerName: '담당자', width: 100 },
      { field: 'HC11210', headerName: '전화번호', width: 150 },
    ];
  }
  return []; // Return an empty array if not in the browser
};

const w_hc01110 = forwardRef(({ menuName, onPermissionsChange, cachedData2, onDataChange }, ref) => {
  const gridRef = useRef(null);
  const [permissions, setPermissions] = useState({ view: false, add: false, update: false, delete: false, print: false });
  const [conditions, setConditions] = useState(() => {
    // localStorage에서 이전에 저장된 조건들을 불러옵니다.
    const savedConditions = localStorage.getItem('w_hc01110Conditions');
    return savedConditions ? JSON.parse(savedConditions) : {
      dealName: '',
      customerType: '1',
      representative: '',
    };
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [allResults, setAllResults] = useState({});
  const [data, setData] = useState(cachedData2 || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [columnDefs, setColumnDefs] = useState(getInitialColumnDefs());
  const [isSearchDealOpen, setIsSearchDealOpen] = useState(false); // State to control the search modal

  const fetchPermissions = useCallback(async () => {
    const response = await new Promise(resolve => 
      { const timer = setTimeout(() => resolve({ view: true, add: true, update: true, delete: true, print: true }), 1000);
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

    // localStorage에서 w_hc01110Columns 값을 가져와서 설정
    const storedColumnDefs = JSON.parse(localStorage.getItem('w_hc01110Columns'));
    if (storedColumnDefs) {
      setColumnDefs(storedColumnDefs);
    } else {
      const initialColumnDefs = getInitialColumnDefs(); // 기본 열 정의 설정
      setColumnDefs(initialColumnDefs);
      localStorage.setItem('w_hc01110Columns', JSON.stringify(initialColumnDefs)); // localStorage에 저장
    }
  }, []);

  useEffect(() => {
    if (cachedData2) {
      setData(cachedData2);
      setResults(Object.values(cachedData2));
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
        if (typeof onDataChange === 'function') {
          onDataChange(parsedResults);
        }
      }
    }
  }, [cachedData2]); // onDataChange를 의존성 배열에서 제거

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    const updatedConditions = { ...conditions, [name]: value };
    setConditions(updatedConditions);
    
    // 조건이 변경될 때마다 localStorage에 저장합니다.
    localStorage.setItem('w_hc01110Conditions', JSON.stringify(updatedConditions));
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
        table: JSON.parse(localStorage.getItem('LoginResults')).dboTable,
        HC11011: conditions.customerType,
      };

      if (conditions.dealName.trim()) {
        params.HC11020 = conditions.dealName.trim();
      }

      if (conditions.representative.trim()) {
        params.HC11040 = conditions.representative.trim();
      }

      console.log('Search params:', params);

      const response = await axiosInstance.get('comm.jsp', { 
        params,
        paramsSerializer: params => {
          return Object.entries(params)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&');
        }
      });
      
      console.log('API response:', response.data);

      if (response.data && response.data.data && response.data.data.result) {
        const newResults = response.data.data.result;
        
        // Ensure newResults is an array of objects with keys matching columnDefs
        const updatedResults = { ...allResults };
        newResults.forEach(item => {
          updatedResults[item.HC11010] = item; // Ensure HC11010 is unique
        });

        setAllResults(updatedResults);
        setResults(newResults); // Ensure newResults is in the correct format
        setData(newResults);
        if (typeof onDataChange === 'function') {
          onDataChange(updatedResults);
        }

        localStorage.setItem('w_hc01110Results', JSON.stringify(newResults));
      } else {
        setError('데이터 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('검색 중 오류 발생:', error);
      setError('데이터를 불러오는 중 오류 발생: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = useCallback((event) => {
    setSelectedItem(event.data); // Set the selected item when the row is clicked
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
    setModalMode(null);
    setModalTitle('');
  }, []);

  const handleSaveEdit = useCallback((editedItem) => {
    console.log('Edited item:', editedItem);

    if (editedItem.isNew) {
      // 새로운 항목 추가
      setResults(prevResults => [...prevResults, editedItem]);
      
      // allResults 업데이트
      setAllResults(prev => ({
        ...prev,
        [editedItem.HC11010]: editedItem
      }));

      // 캐시된 데이터 업데이트
      if (typeof onDataChange === 'function') {
        onDataChange({
          ...allResults,
          [editedItem.HC11010]: editedItem
        });
      }
    } else {
      // 기존 항목 수정
      setResults(prevResults => 
        prevResults.map(item => 
          item.HC11010 === editedItem.HC11010 ? editedItem : item
        )
      );
      
      // allResults 업데이트
      setAllResults(prev => ({
        ...prev,
        [editedItem.HC11010]: editedItem
      }));

      // 캐시된 데이터 업데이트
      if (typeof onDataChange === 'function') {
        onDataChange({
          ...allResults,
          [editedItem.HC11010]: editedItem
        });
      }
    }
    
    handleCloseModal();
  }, [allResults, onDataChange]);
    
  // AgGridReact에서 컬럼 변경 시 localStorage에 저장
  const updateColumnDefs = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      const columnState = gridRef.current.api.getColumnState();
      const currentColumnOrder = columnState.map((col) => col.colId);
      const newColumnDefs = currentColumnOrder.map((colId) => {
        const col = gridRef.current.api.getColumns().find(col => col.getColId() === colId);
        return {
          field: col.getColId(),
          headerName: col.getColDef().headerName,
          width: col.getActualWidth(), // Use getActualWidth to get the current width of the column
        };
      });
      setColumnDefs(newColumnDefs);
      localStorage.setItem('w_hc01110Columns', JSON.stringify(newColumnDefs)); // Save new column definitions to localStorage
    }
  }, []);

  const handleDealSelect = (selectedDeal) => {
    setConditions(prevConditions => ({
      ...prevConditions,
      dealName: selectedDeal, // Update the business place in conditions
    }));
    setIsSearchDealOpen(false); // Close the modal after selection
  };

  useImperativeHandle(ref, () => ({
    handleSearch,
    handleCreate: () => {
      setSelectedItem(null); // Clear selected item for new entry
      setModalMode('create'); // Set modal mode to create
      setModalTitle('거래처 정보 등록'); // Set modal title for create
    },
    handleEdit: () => {
      if (selectedItem) {
        setModalMode('edit'); // Set modal mode to edit
        setModalTitle('거래처 정보 수정'); // Set modal title for edit
      } else {
        alert('수정할 항목을 선택해주세요.'); // Alert if no item is selected
      }
    },
    handleDelete: async () => {
      if (selectedItem) {
        const confirmDelete = window.confirm('선택한 거래처를 삭제하시겠습니까?');
        if (confirmDelete) {
          try {
            const params = { 
              map: 'cd01.cd01110_d', 
              table: JSON.parse(localStorage.getItem('LoginResults')).dboTable, 
              HC11010: selectedItem.HC11010 
            };

            const response = await axiosInstance.post('comm_delete.jsp', params);
            if (parseInt(response.data.data.result) > 0) {
              const newResults = { ...allResults };
              delete newResults[selectedItem.HC11010];
              setAllResults(newResults);
              setResults(prevResults => prevResults.filter(item => item.HC11010 !== selectedItem.HC11010));
              setSelectedItem(null);
              if (gridRef.current && gridRef.current.api) {
                gridRef.current.api.deselectAll();
              }
              if (typeof onDataChange === 'function') {
                onDataChange(newResults);
              }
            } else {
              alert('삭제 실패: ' + response.data.message);
            }
          } catch (error) {
            console.error('삭제 중 오류 발생:', error);
            alert('삭제 중 오류 발생: ' + (error.response?.data?.message || error.message));
          }
        }
      } else {
        alert('삭제할 항목을 선택해주세요.');
      }
    },
    handleExcelDownload: async () => {
      if (gridRef.current && gridRef.current.api) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('w_hc01110');

        worksheet.addRow(columnDefs.map(col => col.headerName));

        gridRef.current.api.forEachNode(node => {
          worksheet.addRow(columnDefs.map(col => node.data[col.field]));
        });

        columnDefs.forEach((col, index) => {
          worksheet.getColumn(index + 1).width = col.width / 7;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'w_hc01110.xlsx');
      }
    },
    handlePdfDownload: () => {
      const gridElement = document.querySelector('.ag-theme-alpine');
      if (gridElement) {
        const header = ['코드','거래처명','사업자번호','대표자','담당자','전화번호'];
      
        const rows = [];
        gridRef.current.api.forEachNode(node => {
          rows.push(node.data); // Collect data from the grid
        });

        // Define the item mapping function
        const itemMapper = (item) => [
          item.HC11010,
          item.HC11020,
          item.HC11030,
          item.HC11040,
          item.HC11070,
          item.HC11210,
        ];

        generatePdf(header, rows, itemMapper, 'w_hc01110'); // Call the PDF generator with header, data, and itemMapper
      }
    },
    handleCsvDownload: () => {
      if (gridRef.current && gridRef.current.api) {
        const params = {
          fileName: 'w_hc01110.csv',
        };
        gridRef.current.api.exportDataAsCsv(params);
      }
    },
    handlePrint: () => {
      setIsPrintModalOpen(true);
    },
    handleInint: () => {
      localStorage.removeItem('w_hc01110Results');
      localStorage.removeItem('w_hc01110Columns');
      setColumnDefs(getInitialColumnDefs());
    },
    //handleShowAllResults,
    //refetchPermissions: fetchPermissions,
  }));

  return (
    <CardContainer>
      <ConditionArea>
        <InputsWrapper>
          <InputGroup>
            <Label>거래처명:
            <Input
              type="text"
              name="dealName"
              value={conditions.dealName}
              onChange={handleInputChange}
              style={{ width: '120px' }}
            />
            <button onClick={() => setIsSearchDealOpen(true)}>검색</button> {/* Button to open search modal */}
            </Label>
          </InputGroup>
          <InputGroup>
            <Label>거래처구분:</Label>
            <Select
              name="customerType"
              value={conditions.customerType}
              onChange={handleInputChange}
            >
              {JSON.parse(localStorage.getItem('CommData')).filter(data => data.hz05020 === '011').map(data => (
                <option key={data.hz05030} value={data.hz05030}>{data.hz05040}</option>
              ))}
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
              onColumnMoved={updateColumnDefs} // Add this line
              onColumnResized={updateColumnDefs}
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
        <W_HC01110_01
          item={modalMode === 'create' ? {} : selectedItem}
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          onSave={handleSaveEdit}
          mode={modalMode}
          title={modalTitle}
        />
      )}
      <SearchDeal
        isOpen={isSearchDealOpen} 
        onClose={() => setIsSearchDealOpen(false)} 
        onSelect={handleDealSelect} // Pass the selection handler
      />
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={results}
        title="거래처코드 관리"
        printComponentPath="w_hc01110_02"
      />
    </CardContainer>
  );
});

export default w_hc01110;