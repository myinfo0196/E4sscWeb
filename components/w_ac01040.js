import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import styled from 'styled-components';
import axiosInstance from './axiosConfig'; // Axios 인스턴스 import
import W_AC01040_01 from './w_ac01040_01';
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
  width: 120px;
`;

const ResultArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const GridContainer = styled.div`
  height: 400px;
  width: 100%;
  flex: 1;
`;

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
  const [permissions, setPermissions] = useState({ view: false, add: false, update: false, delete: false });
  const [conditions, setConditions] = useState(() => {
    // localStorage에서 이전에 저장된 조건들을 불러옵니다.
    const savedConditions = localStorage.getItem('savedConditions');
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

  const fetchPermissions = useCallback(async () => {
    const response = await new Promise(resolve => {
      const timer = setTimeout(() => {
        resolve({ view: true, add: true, update: true, delete: true });
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
    localStorage.setItem('savedConditions', JSON.stringify(updatedConditions));
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
        table: 'ssc_00_demo.dbo',
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

        localStorage.setItem('w_ac01040Results', JSON.stringify(updatedResults));
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
    
    if (editedItem.isNew) {
      // 새로운 항목 추가
      setResults(prevResults => [...prevResults, editedItem]);
      
      // allResults 업데이트
      setAllResults(prev => ({
        ...prev,
        [editedItem.F04010]: editedItem
      }));

      // 캐시된 데이터 업데이트
      if (typeof onDataChange === 'function') {
        onDataChange({
          ...allResults,
          [editedItem.F04010]: editedItem
        });
      }
    } else {
      // 기존 항목 수정
      setResults(prevResults => 
        prevResults.map(item => 
          item.F04010 === editedItem.F04010 ? editedItem : item
        )
      );
      
      // allResults 업데이트
      setAllResults(prev => ({
        ...prev,
        [editedItem.F04010]: editedItem
      }));

      // 캐시된 데이터 업데이트
      if (typeof onDataChange === 'function') {
        onDataChange({
          ...allResults,
          [editedItem.F04010]: editedItem
        });
      }
    }
    
    handleCloseModal();
  }, [allResults, onDataChange]);

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
              map: 'cd01.ac01040_del', 
              table: 'ssc_00_demo.dbo', 
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
              checked={conditions.includeDiscarded || false}
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
    </CardContainer>
  );
});

export default w_ac01040;

