import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axiosInstance from './axiosConfig'; // Axios 인스턴스 import
import PostalSearch from './PostalSearch'; // Import the new PostalSearch component
import { ModalBackground, ModalContent, ModalHeader, ContentArea, InputGroup, Label, Input, Select } from './PopupStyles'; // Import common styles
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

const w_hc01010_01 = ({ item = {}, onClose, onSave, mode, title }) => {
  const [editedItem, setEditedItem] = useState(item);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup 상태 추가

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = { 
          map: 'cd01.cd01010_s1', 
          table: JSON.parse(localStorage.getItem('LoginResults')).dboTable, 
          HC01010: item.HC01010 
        };
        const response = await axiosInstance.get('comm.jsp', { // 기본 URL 사용
          params,
          paramsSerializer: params => {
            return Object.entries(params)
              .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
              .join('&');
          }
        });
        setEditedItem(response.data.data.result[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (item.HC01010) {
      fetchData();
    }
  }, [item.HC01010]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      let params = {
        table: JSON.parse(localStorage.getItem('LoginResults')).dboTable
      };

      if (mode === 'edit') {
        // 수정 시에는 Key(HC01010)와 변경된 필드만 전송
        params.map = 'cd01.cd01010_u';
        params.HC01010 = item.HC01010; // Key는 필수
        
        // 원본 item과 비교하여 변경된 필드만 params에 추가
        Object.keys(editedItem).forEach(key => {
          if (item[key] !== editedItem[key]) {
            params[key] = editedItem[key];
          }
        });

        let jsp = 'comm_update.jsp';
        const response = await axiosInstance.post(jsp, params);
        
        if (response.data && response.data.data && response.data.data.result > 0) {
          // 수정된 데이터를 parent에 반영
          onSave({
            ...item,
            ...editedItem
          });
          onClose();
        } else {
          throw new Error('데이터 수정에 실패했습니다');
        }
      } else {
        // 등록 시에는 모든 필드 전송
        params.map = 'cd01.cd01010_i';
        params = {
          ...params,
          HC01010: editedItem.HC01010 || '',
          HC01020: editedItem.HC01020 || '',
          HC01030: editedItem.HC01030 || '',
          HC01040: editedItem.HC01040 || '',
          HC01060: editedItem.HC01060 || '',
          HC01080: editedItem.HC01080 || '',
          HC01090: editedItem.HC01090 || '',
          HC01100: editedItem.HC01100 || '',
          HC01120: editedItem.HC01120 || '',
          HC01140: editedItem.HC01140 || ''
        };

        let jsp = 'comm_insert.jsp';
        const response = await axiosInstance.post(jsp, params);

        if (response.data && response.data.data && response.data.data.result > 0) {
          // 새로 등록된 데이터를 parent에 추가
          onSave({
            ...editedItem,
            HC01010: editedItem.HC01010,
            isNew: true
          });
          onClose();
        } else {
          throw new Error('데이터 등록에 실패했습니다');
        }
      }

    } catch (error) {
      console.error("Error saving data:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        alert(error.response.data.message || '저장 중 오류가 발생했습니다');
      } else {
        console.error("Network Error:", error.message);
        alert(error.message || '네트워크 오류가 발생했습니다');
      }
    }
  };

  const handlePostalSelect = (postalCode, address) => {
    setEditedItem(prev => ({
      ...prev,
      HC01060: postalCode,
      HC01080: address
    }));
  };

  return (
    <ModalBackground>
      <Draggable>
        <ModalContent onMouseDown={e => e.stopPropagation()}>
          <ModalHeader className="modal-header">
            <h2>{title}</h2>
            <button onClick={onClose}>Close</button>
          </ModalHeader>
          <ContentArea>
              <InputGroup>
                <Label>사업장코드</Label>
              <Input name="HC01010" value={editedItem.HC01010} onChange={handleChange} maxLength={2} style={{ flex: '0', width: '40px' }} />
            </InputGroup>
            <InputGroup>
              <Label>사업장명칭</Label>
              <Input name="HC01020" value={editedItem.HC01020} onChange={handleChange} />
            </InputGroup>
            <InputGroup>
              <Label>사업자번호</Label>
              <Input name="HC01030" value={editedItem.HC01030} onChange={handleChange} pattern="[0-9]{3}-[0-9]{2}-[0-9]{5}" style={{ flex: '0', width: '130px' }} onBlur={e => e.target.value = e.target.value.replace(/-/g, '')} placeholder='000-00-00000'/>
            </InputGroup>
            <InputGroup>
              <Label>대표자성명</Label>
              <Input name="HC01040" value={editedItem.HC01040} onChange={handleChange} />
            </InputGroup>
            <InputGroup>
              <Label>우편 번호</Label>
              <Input name="HC01060" value={editedItem.HC01060} onChange={handleChange} style={{ flex: '0', width:'65px' }} />
              <PostalSearch onSelect={handlePostalSelect} onClose={() => setIsPopupOpen(false)} /> {/* 우편번호 검색 컴포넌트 추가 */}
            </InputGroup>
            <InputGroup>
              <Label>사업장주소</Label>
              <Input name="HC01080" value={editedItem.HC01080} onChange={handleChange} />
            </InputGroup>
            <InputGroup>
              <Label>업태</Label>
              <Input name="HC01090" value={editedItem.HC01090} onChange={handleChange} />
            </InputGroup>
            <InputGroup>
              <Label>종목</Label>
              <Input name="HC01100" value={editedItem.HC01100} onChange={handleChange} />
            </InputGroup>
            <InputGroup>
              <Label>전화 번호</Label>
              <Input name="HC01120" value={editedItem.HC01120} onChange={handleChange} />
              <Label>FAX 번호</Label>
              <Input name="HC01140" value={editedItem.HC01140} onChange={handleChange} />
            </InputGroup> 
          </ContentArea>
          <ButtonGroup>
            <SaveButton onClick={handleSave}>저장</SaveButton>
            <CancelButton onClick={onClose}>취소</CancelButton>
          </ButtonGroup>
        </ModalContent>
      </Draggable>
    </ModalBackground>
  );
};

export default w_hc01010_01;
