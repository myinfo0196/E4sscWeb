import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import axiosInstance from './axiosConfig'; // Axios 인스턴스 import
import W_AC01040_01 from './w_ac01040_01';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import PrintModal from './PrintModal';
import { CardContainer, ConditionArea, InputGroup, Label, Input, ResultArea, GridContainer } from './CommonStyles'; // Import common styles
import generatePdf from './pdfGenerator'; // Import the PDF generator

// ag-Grid 라이센스 설정 (만약 있다면)
// LicenseManager.setLicenseKey('YOUR_LICENSE_KEY');

// columnDefs를 컴포넌트 외부로 이동
const columnDefs = [
  { field: 'F04010', headerName: '코드', width: 100 },
  { field: 'F04030', headerName: '관리명칭', width: 300 },
  { field: 'F04020', headerName: '번호', width: 250 },
  { field: 'F04100', headerName: '개설일자', width: 100 },
  { field: 'F04110', headerName: '만기일자', width: 100 },
  { field: 'F04120', headerName: '폐기일자', width: 100 }
];

const w_ac01040 = forwardRef(({ menuName, onPermissionsChange, cachedData1, onDataChange }, ref) => {
  const gridRef = useRef(null);
  const [permissions, setPermissions] = useState({ view: false, add: false, update: false, delete: false, print: false });
  const [conditions, setConditions] = useState(() => {
    // localStorage에서 이전에 저장된 조건들을 불러옵니다.
    const savedConditions = localStorage.getItem('w_ac01040Conditions');
    return savedConditions ? JSON.parse(savedConditions) : {
      includeDiscarded: '',
    };
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [allResults, setAllResults] = useState({});
  const [data, setData] = useState(cachedData1 || []);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const fetchPermissions = useCallback(async () => {
    const response = await new Promise(resolve => {
      const timer = setTimeout(() => {
        resolve({ view: true, add: true, update: true, delete: true, print: true });
      }, 1000);
      return () => clearTimeout(timer);
    });
    setPermissions(response);
    if (onPermissionsChange) {
      onPermissionsChange(response);
    }
  }, [onPermissionsChange]);

  useEffect(() => {
    fetchPermissions();
  }, []); // Empty dependency array to run only once when mounted

  useEffect(() => {
    if (cachedData1) {
      setData(cachedData1);
      setResults(Object.values(cachedData1));
    }
  }, [cachedData1]);

  useEffect(() => {
    if (cachedData1) {
      setAllResults(cachedData1);
      setResults(Object.values(cachedData1));
    } else {
      // Load saved data from localStorage
      const savedResults = localStorage.getItem('w_ac01040Results');
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults);
        setAllResults(parsedResults);
        setResults(Object.values(parsedResults));
        onDataChange(parsedResults); // Ensure this does not cause a re-render loop
      }
    }
  }, [cachedData1]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    const updatedConditions = { ...conditions, includeDiscarded: e.target.checked };
    setConditions(updatedConditions);
    
    // 조건이 변경될 때마다 localStorage에 저장합니다.
    localStorage.setItem('w_ac01040Conditions', JSON.stringify(updatedConditions));
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    // 검색 시 cachedData 삭제
    setData([]); // Reset cachedData to an empty array
    onDataChange(null);

    try {
      const params = {
        map: 'cd01.ac01040_s',
        table: JSON.parse(localStorage.getItem('LoginResults')).dboTable,
      };

      if (!conditions.includeDiscarded) {
        params.F04120 = ' ';
      }

      const response = await axiosInstance.get('comm.jsp', {
        params,  
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        }
      });

      console.log('API response:', response.data); // 응답 로깅

      if (response.data && response.data.data && response.data.data.result) {
        const newResults = response.data.data.result;
        
        const updatedResults = { ...allResults };
        newResults.forEach(item => {
          updatedResults[item.F04010] = item;
        });

        setAllResults(updatedResults);
        setResults(newResults);
        setData(newResults);
        onDataChange(updatedResults);

        localStorage.setItem('w_ac01040Results', JSON.stringify(newResults));
      } else {
        setError('데이터 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      setError('데이터를 불러오는 중 오류 발생: ' + (error.response?.data?.message || error.message));
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
        item.F04010 === editedItem.F04010 ? editedItem : item
      )
    );
    handleCloseModal();
  }, []);

  const handleShowAllResults = () => {
    setResults(Object.values(allResults));
  };

  useImperativeHandle(ref, () => ({
    handleSearch,
    handleCreate: () => {
      setSelectedItem(null);
      setModalMode('create');
      setModalTitle('계좌코드 정보 등록');
    },
    handleEdit: () => {
      if (selectedItem) {
        setModalMode('edit');
        setModalTitle('계좌코드 정보 수정');
      } else {
        alert('수정할 항목을 선택해주세요.');
      }
    },
    handleDelete: async () => {
      if (selectedItem) {
        const confirmDelete = window.confirm('선택한 계좌코드를 삭제하시겠습니까?');
        if (confirmDelete) {
          try {
            const params = { 
              map: 'cd01.ac01040_d', 
              table: JSON.parse(localStorage.getItem('LoginResults')).dboTable, 
              F04010: selectedItem.F04010 
            };

            const response = await axiosInstance.post('comm_delete.jsp', params);
            if (parseInt(response.data.data.result) > 0) {
              const newResults = { ...allResults };
              delete newResults[selectedItem.F04010];
              setAllResults(newResults);
              setResults(prevResults => prevResults.filter(item => item.F04010 !== selectedItem.F04010));
              setSelectedItem(null);
              if (gridRef.current && gridRef.current.api) {
                gridRef.current.api.deselectAll();
              }
              if (typeof onDataChange === 'function') {
                onDataChange(newResults);
              }
            } else {
              alert('삭제 실패: ' + response.data.data.err);
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
        const worksheet = workbook.addWorksheet('w_ac01040');

        worksheet.addRow(columnDefs.map(col => col.headerName));

        gridRef.current.api.forEachNode(node => {
          worksheet.addRow(columnDefs.map(col => node.data[col.field]));
        });

        columnDefs.forEach((col, index) => {
          worksheet.getColumn(index + 1).width = col.width / 7;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'w_ac01040.xlsx');
      }
    },
    handlePdfDownload: () => {
      const gridElement = document.querySelector('.ag-theme-alpine');
      if (gridElement) {
        const header = ['코드','관리명칭','번호','개설일자','만기일자','폐기일자'];

        const rows = [];
        gridRef.current.api.forEachNode(node => {
          rows.push(node.data); // Collect data from the grid
        });

        // Define the item mapping function
        const itemMapper = (item) => [
          item.F04010,
          item.F04030,
          item.F04020,
          item.F04100,
          item.F04110,
          item.F04120,
        ];

        generatePdf(header, rows, itemMapper, 'w_ac01040'); // Call the PDF generator with header, data, and itemMapper
      }
    },
    handleCsvDownload: () => {
      if (gridRef.current && gridRef.current.api) {
        const params = {
          fileName: 'w_ac01040.csv',
        };
        gridRef.current.api.exportDataAsCsv(params);
      }
    },
    handlePrint: () => {
      setIsPrintModalOpen(true);
    },
    //handleShowAllResults,
    //refetchPermissions: fetchPermissions, // 권한을 다시 가져오는 메서드 추가
  }));

  return (
    <CardContainer>
      <ConditionArea>
        <InputGroup>
          <Label>
            폐기건 포함:
            <Input
              type="checkbox"
              name="includeDiscarded"
              checked={JSON.parse(localStorage.getItem('w_ac01040Conditions')).includeDiscarded || false}
              onChange={handleInputChange}
            />
          </Label>
        </InputGroup>
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
        <W_AC01040_01
          item={modalMode === 'create' ? {} : selectedItem}
          onClose={handleCloseModal}
          onSave={handleSaveEdit}
          mode={modalMode}
          title={modalTitle}
        />
      )}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={results}
        title="계좌코드 목록"
        printComponentPath="w_ac01040_02"
      />
    </CardContainer>
  );
});

export default w_ac01040;

