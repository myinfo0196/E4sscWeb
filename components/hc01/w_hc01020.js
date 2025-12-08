import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import axiosInstance from '../axiosConfig'; // Axios 인스턴스 import
import W_HC01020_01 from './w_hc01020_01';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import PrintModal from '../PrintModal';
import { CardContainer, ConditionArea, InputGroup, Label, Input, ResultArea, GridContainer } from '../StylesCommon'; // Import common styles
import generatePdf from '../pdfGenerator'; // Import the PDF generator
import SearchBusiness from '../SearchBusiness.js'; // Import the new modal component

// ag-Grid 라이센스 설정 (만약 있다면)
// LicenseManager.setLicenseKey('YOUR_LICENSE_KEY');

// columnDefs를 컴포넌트 외부로 이동
const getInitialColumnDefs = () => {
    return JSON.parse(localStorage.getItem('w_hc01020Columns')) || [
        { field: 'HC02010', headerName: '코드', width: 80 },
        { field: 'HC02020', headerName: '명칭', width: 200 },
        { field: 'HC02030', headerName: '사업자번호', width: 150 },
        { field: 'HC02040', headerName: '대표자', width: 100 },
        { field: 'HC02120', headerName: '전화번호', width: 150 },
        { field: 'HC02140', headerName: 'FAX번호', width: 150 },
        { field: 'HC02080', headerName: '주소', width: 400 }
    ];
}

const w_hc01020 = forwardRef(({ menuName, onPermissionsChange, cachedData1, onDataChange }, ref) => {
    const gridRef = useRef(null);
    const [permissions, setPermissions] = useState({ view: false, add: false, update: false, delete: false, print: false });
    const [conditions, setConditions] = useState(() => {
        // localStorage에서 이전에 저장된 조건들을 불러옵니다.
        const savedConditions = localStorage.getItem('w_hc01020Conditions');
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
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [columnDefs, setColumnDefs] = useState(getInitialColumnDefs());
    const [isSearchBusinessOpen, setIsSearchBusinessOpen] = useState(false); // State to control the search modal

    const fetchPermissions = useCallback(async () => {
        // 실제 API 호출을 모방한 Promise
        const response = await new Promise(resolve => {
            const timer = setTimeout(() => {
                resolve({ view: true, add: true, update: true, delete: false, print: true });
            }, 1000);
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

        // localStorage에서 w_hc01020Columns 값을 가져와서 설정
        const storedColumnDefs = JSON.parse(localStorage.getItem('w_hc01020Columns'));
        if (storedColumnDefs) {
            setColumnDefs(storedColumnDefs);
        } else {
            const initialColumnDefs = getInitialColumnDefs(); // 기본 열 정의 설정
            setColumnDefs(initialColumnDefs);
            localStorage.setItem('w_hc01020Columns', JSON.stringify(initialColumnDefs)); // localStorage에 저장
        }
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
            const savedResults = localStorage.getItem('w_hc01020Results');
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
        localStorage.setItem('w_hc01020Conditions', JSON.stringify(updatedConditions));
    };

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        // 검색 시 cachedData 삭제
        onDataChange(null);

        try {
            const params = {
                map: 'cd01.cd01020_s',
                table: JSON.parse(localStorage.getItem('LoginResults')).dboTable,
                HC02010: conditions?.businessPlace || '',
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
                    updatedResults[item.HC02010] = item;
                });

                setAllResults(updatedResults);
                setResults(newResults);
                setData(newResults);
                if (typeof onDataChange === 'function') {
                    onDataChange(updatedResults);
                }

                localStorage.setItem('w_hc01020Results', JSON.stringify(newResults));
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

    const handleRowDoubleClick = useCallback((event) => {
        setSelectedItem(event.data);
        setModalMode('edit');
        setModalTitle('하치장 정보 수정');
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
                item.HC02010 === editedItem.HC02010 ? editedItem : item
            )
        );
        handleCloseModal();
    }, []);

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
            localStorage.setItem('w_hc01020Columns', JSON.stringify(newColumnDefs)); // Save new column definitions to localStorage
        }
    }, []);

    const handleBusinessSelect = (selectedBusinessPlace) => {
        setConditions(prevConditions => ({
            ...prevConditions,
            businessPlace: selectedBusinessPlace, // Update the business place in conditions
        }));
        setIsSearchBusinessOpen(false); // Close the modal after selection
    };

    useImperativeHandle(ref, () => ({
        handleSearch,
        handleCreate: () => {
            setSelectedItem(null);
            setModalMode('create');
            setModalTitle('하치장 정보 등록');
        },
        handleEdit: () => {
            if (selectedItem) {
                setModalMode('edit');
                setModalTitle('하치장 정보 수정');
            } else {
                alert('수정할 항목을 선택해주세요.');
            }
        },
        handleDelete: async () => {
            if (selectedItem) {
                const confirmDelete = window.confirm('선택한 하치장을 삭제하시겠습니까?');
                if (confirmDelete) {
                    try {
                        const params = {
                            map: 'cd01.cd01020_d',
                            table: JSON.parse(localStorage.getItem('LoginResults')).dboTable,
                            HC02010: selectedItem.HC02010
                        };

                        const response = await axiosInstance.post('comm_delete.jsp', params);
                        if (parseInt(response.data.data.result) > 0) {
                            const newResults = { ...allResults };
                            delete newResults[selectedItem.HC02010];
                            setAllResults(newResults);
                            setResults(prevResults => prevResults.filter(item => item.HC02010 !== selectedItem.HC02010));
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
                const worksheet = workbook.addWorksheet('w_hc01020');

                worksheet.addRow(columnDefs.map(col => col.headerName));

                gridRef.current.api.forEachNode(node => {
                    worksheet.addRow(columnDefs.map(col => node.data[col.field]));
                });

                columnDefs.forEach((col, index) => {
                    worksheet.getColumn(index + 1).width = col.width / 7;
                });

                const buffer = await workbook.xlsx.writeBuffer();
                saveAs(new Blob([buffer]), 'w_hc01020.xlsx');
            }
        },
        handlePdfDownload: () => {
            const gridElement = document.querySelector('.ag-theme-alpine');
            if (gridElement) {
                const header = ['코드', '명칭', '사업자번호', '대표자', '전화번호', 'FAX번호', '주소'];

                const rows = [];
                gridRef.current.api.forEachNode(node => {
                    rows.push(node.data); // Collect data from the grid
                });

                // Define the item mapping function
                const itemMapper = (item) => [
                    item.HC02010,
                    item.HC02020,
                    item.HC02030,
                    item.HC02040,
                    item.HC02120,
                    item.HC02140,
                    item.HC02080,
                ];

                generatePdf(header, rows, itemMapper, 'w_hc01020'); // Call the PDF generator with header, data, and itemMapper
            }
        },
        handleCsvDownload: () => {
            if (gridRef.current && gridRef.current.api) {
                const params = {
                    fileName: 'w_hc01020.csv',
                };
                gridRef.current.api.exportDataAsCsv(params);
            }
        },
        handlePrint: () => {
            setIsPrintModalOpen(true);
        },
        handleInint: () => {
            localStorage.removeItem('w_hc01020Results');
            localStorage.removeItem('w_hc01020Columns');
            setColumnDefs(getInitialColumnDefs());
        },
        //handleShowAllResults,
        //refetchPermissions: fetchPermissions, // 권한을 다시 가져오는 메서드 추가
    }));

    return (
        <CardContainer>
            <ConditionArea>
                <InputGroup>
                    <Label>
                        하치장:
                        <Input
                            type="text"
                            name="businessPlace"
                            value={conditions?.businessPlace || ''}
                            onChange={handleInputChange}
                            style={{ width: '120px' }}
                        />
                        <button onClick={() => setIsSearchBusinessOpen(true)}>검색</button> {/* Button to open search modal */}
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
                            onRowDoubleClicked={handleRowDoubleClick}
                            onColumnMoved={updateColumnDefs}
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
                <W_HC01020_01
                    item={modalMode === 'create' ? {} : selectedItem}
                    onClose={handleCloseModal}
                    onSave={handleSaveEdit}
                    mode={modalMode}
                    title={modalTitle}
                />
            )}
            <SearchBusiness
                isOpen={isSearchBusinessOpen}
                onClose={() => setIsSearchBusinessOpen(false)}
                onSelect={handleBusinessSelect} // Pass the selection handler
            />
            <PrintModal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                data={results}
                title="하치장 코드관리"
                printComponentPath="w_hc01020_02"
            />
        </CardContainer>
    );
});

export default w_hc01020;

