import React, { useState, useRef } from 'react';
import axiosInstance from './axiosConfig'; // Import your axios instance
import { ModalContainer, ModalContent, ModalHeader, ModalInput, ModalButton, InputGroup } from './StylesModal'; // Import styles
import { AgGridReact } from 'ag-grid-react'; // Import AgGridReact
import 'ag-grid-community/styles/ag-grid.css'; // Import AgGrid styles
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Import AgGrid theme
import styled from 'styled-components';
import Draggable from 'react-draggable'; // Import Draggable

const ButtonGroup = styled.div`
  display: flex;
  border-top: 1px solid #dee2e6;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  cursor: pointer;
  font-size: 16px;
`;

const SaveButton = styled(Button)`
  background-color: #007bff;
  color: white;
`;

const CancelButton = styled(Button)`
  background-color: #6c757d;
  color: white;
`;

const SearchDeal = ({ isOpen, onClose, onSelect }) => {
  const [dealCode, setDealCode] = useState('');
  const [dealName, setDealName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const gridApiRef = useRef(null); // Create a ref for the grid API

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        map: 'comm.hct11_s',
        table: JSON.parse(localStorage.getItem('LoginResults')).dboTable,
        HC11010: dealCode,
        dealName: dealName,
      };

      const response = await axiosInstance.get('comm.jsp', { 
        params,
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        }
      });

      if (response.data && response.data.data && response.data.data.result) {
        setResults(response.data.data.result);
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

  const handleConfirm = () => {
    const selectedRow = results.find(row => row.selected); // Assuming you have a way to mark selected rows
    if (selectedRow) {
      onSelect(selectedRow.HC11020); // Pass the selected code back to the parent
    }
    onClose(); // Close the modal
  };

  const columnDefs = [ // Define columns for AgGrid
    { headerName: "코드", field: "HC11010", minWidth: 85 },
    { headerName: "상호", field: "HC11020", minWidth: 200 },
    { headerName: "사업자번호", field: "HC11030", minWidth: 115 },
    { headerName: "대표자", field: "HC11040", minWidth: 100 },
    { headerName: "담당자", field: "HC11070", minWidth: 100 },
    { headerName: "관리구분", field: "HC11270", minWidth: 90 },
    { headerName: "주소", field: "HC11150", minwidth: 600 }
  ];

  const onGridReady = (params) => {
    gridApiRef.current = params.api; // Store the grid API in the ref
    params.api.sizeColumnsToFit(); // Adjust column sizes
  };

  const onSelectionChanged = () => {
    const selectedRows = gridApiRef.current.getSelectedRows(); // Use the ref to get selected rows
    if (selectedRows.length > 0) {
      selectedRows.forEach(row => row.selected = true); // Mark selected rows
    }
  };

  return (
    isOpen && (
      <ModalContainer>
        <Draggable>
          <ModalContent onMouseDown={e => e.stopPropagation()} style={{ width: '600px' }}>
          <ModalHeader className="modal-header">거래처 검색</ModalHeader>
          <InputGroup>
            <ModalInput
              type="text"
              placeholder="코드"
              value={dealCode}
              onChange={(e) => setDealCode(e.target.value)}
              style={{ flex: 0, width: '60px', marginRight: '10px' }}
            />
            <ModalInput
              type="text"
              placeholder="상호"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              style={{ flex: 0, width: '200px' }}
            />
            <ModalButton onClick={handleSearch} style={{ flex: 1, marginLeft: '200px', marginBottom: '10px' }}>검색</ModalButton>
          </InputGroup>
          
          {loading && <p>데이터를 불러오는 중...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          <div className="ag-theme-alpine" style={{ height: 400, width: "100%", overflow: 'auto' }}> {/* AgGrid container with scroll */}
            <AgGridReact
              rowData={results}
              columnDefs={columnDefs}
              onGridReady={onGridReady}
              onSelectionChanged={onSelectionChanged} // Use the new selection handler
              onRowDoubleClicked={handleConfirm} // Add double-click handler
              rowSelection="single"
              suppressRowDeselection={true}
            />
          </div>
          
          <ButtonGroup>
            <SaveButton onClick={handleConfirm}>확인</SaveButton>
            <CancelButton onClick={onClose}>취소</CancelButton>
          </ButtonGroup>

          </ModalContent>
        </Draggable>
      </ModalContainer>
    )
  );
};

export default SearchDeal;
