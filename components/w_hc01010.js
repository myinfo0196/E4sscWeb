import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import styled from 'styled-components';
import axiosInstance from './axiosConfig'; // Axios 인스턴스 import
import W_HC01010_01 from './w_hc01010_01';
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
  { field: 'HC01010', headerName: '코드', width: 80 },
  { field: 'HC01030', headerName: '사업자등록번호', width: 150 },
  { field: 'HC01020', headerName: '상호', width: 200 },
  { field: 'HC01040', headerName: '대표자', width: 100 },
  { field: 'HC01100', headerName: '업태', width: 300 },
  { field: 'HC01090', headerName: '업종', width: 300 }
];

const w_hc01010 = forwardRef(({ menuName, onPermissionsChange, cachedData1, onDataChange }, ref) => {
  const gridRef = useRef(null);
  const [permissions, setPermissions] = useState({ view: false, add: false, update: false, delete: false });
  const [conditions, setConditions] = useState(() => {
    // localStorage에서 이전에 저장된 조건들을 불러옵니다.
    const savedConditions = localStorage.getItem('savedConditions');
    return savedConditions ? JSON.parse(savedConditions) : {
      businessPlace: '',
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
    // 실제 API 호출을 모방한 Promise
    const response = await new Promise(resolve => {
      const timer =setTimeout(() => resolve({ view: true, add: true, update: true, delete: false }), 1000); 
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
      const savedResults = localStorage.getItem('w_hc01010Results');
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults);
        setAllResults(parsedResults);
        setResults(Object.values(parsedResults));
        if (typeof onDataChange === 'function') {
          onDataChange(parsedResults);
        }
      }
    }
  }, [cachedData1]);

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
    onDataChange(null);

    try {
      const params = {
        map: 'cd01.cd01010_s',
        table: 'ssc_00_demo.dbo',
        sale11020_hc01010: conditions?.businessPlace || '',
      };

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
          updatedResults[item.HC01010] = item;
        });

        setAllResults(updatedResults);
        setResults(newResults);
        setData(newResults);
        if (typeof onDataChange === 'function') {
          onDataChange(updatedResults);
        }

        localStorage.setItem('w_hc01010Results', JSON.stringify(updatedResults));
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
        item.HC11010 === editedItem.HC11010 ? editedItem : item
      )
    );
    handleCloseModal();
  }, []);

  const handleShowAllResults = () => {
    setResults(Object.values(allResults));
  };

  useImperativeHandle(ref, () => ({
    handleSearch: () => {
      if (permissions.view) {
        handleSearch();
      } else {
        alert('조회 권한이 없습니다.');
      }
    },
    handleCreate: () => {
      if (permissions.add) {
        setSelectedItem(null);
        setModalMode('create');
        setModalTitle('사업장 정보 등록');
      } else {
        alert('등록 권한이 없습니다.');
      }
    },
    handleEdit: () => {
      if (permissions.update) {
        if (selectedItem) {
          setModalMode('edit');
          setModalTitle('사업장 정보 수정');
        } else {
          alert('수정할 항목을 선택해주세요.');
        }
      } else {
        alert('수정 권한이 없습니다.');
      }
    },
    handleDelete: () => {
      if (permissions.delete) {
        if (selectedItem) {
          const confirmDelete = window.confirm('선택한 사업장을 삭제하시겠습니까?');
          if (confirmDelete) {
            setAllResults(prevAllResults => {
              const updatedResults = { ...prevAllResults };
              delete updatedResults[selectedItem.HC01010];
              return updatedResults;
            });
            setResults(prevResults => prevResults.filter(item => item.HC01010 !== selectedItem.HC01010));
            setSelectedItem(null);
            if (gridRef.current && gridRef.current.api) {
              gridRef.current.api.deselectAll();
            }
            if (typeof onDataChange === 'function') {
              onDataChange(updatedResults);
            }
          }
        } else {
          alert('삭제할 항목을 선택해주세요.');
        }
      } else {
        alert('삭제 권한이 없습니다.');
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
    handleShowAllResults,
    refetchPermissions: fetchPermissions, // 권한을 다시 가져오는 메서드 추가
  }));

  return (
    <CardContainer>
      <ConditionArea>
        <InputGroup>
          <Label>
            사업장:
            <Input
              type="text"
              name="businessPlace"
              value={conditions?.businessPlace || ''}
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
        <W_HC01010_01
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

export default w_hc01010;
