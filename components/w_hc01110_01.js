import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axiosInstance from './axiosConfig'; // Axios 인스턴스 import
import { ModalBackground, ModalContent, TitleArea, Title, ContentArea, InputGroup, Label, Input, Select } from './PopupStyles'; // Import common styles

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

const w_hc01110_01 = ({ item = {}, isOpen, onClose, onSave, mode, title }) => {
  const [editedItem, setEditedItem] = useState(item);

  useEffect(() => {
    setEditedItem(item); // Update editedItem when item changes
  }, [item]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = { 
          map: 'cd01.cd01110_s1', 
          table: JSON.parse(localStorage.getItem('LoginResults')).dboTable, 
          HC11010: item.HC11010 
        };
        const response = await axiosInstance.get('comm.jsp', {
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

    // Only fetch data if in edit mode and HC11010 exists
    if (mode === 'edit' && item.HC11010) {
      fetchData();
    }
  }, [mode, item.HC11010]); // Ensure dependencies are correct

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
        // 수정 시에는 Key(F04010)와 변경된 필드만 전송
        params.map = 'cd01.cd01110_u';
        params.HC11010 = item.HC11010; // Key는 필수
        params.HC11420 = 'SMIS';     
        
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
        params.map = 'cd01.cd01110_i';
        params = {
          ...params,
          HC11010: editedItem.HC11010 || '',
          HC11020: editedItem.HC11020 || '',
          HC11030: editedItem.HC11030 || '',
          HC11040: editedItem.HC11040 || '',
          HC11070: editedItem.HC11070 || '',
          HC11210: editedItem.HC11210 || '',
          HC11440: 'SMIS'
        };

        let jsp = 'comm_insert.jsp';
        const response = await axiosInstance.post(jsp, params);

        if (response.data && response.data.data && response.data.data.result > 0) {
          // 새로 등록된 데이터를 parent에 추가
          onSave({
            ...editedItem,
            HC11010: editedItem.HC11010,
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

  return (
    // 모달이 열릴 때만 렌더링
    <ModalBackground>
      <ModalContent>
        <TitleArea>
          <Title>{title}</Title>
        </TitleArea>
        <ContentArea>
          <InputGroup>
            <Label>거래처코드</Label>
            <Input name="HC11010" value={editedItem.HC11010} onChange={handleChange} style={{ width: '5px' }} />
            <Label>거래처구분</Label>
            <Select name="HC11011" value={editedItem.HC11011} onChange={handleChange} >
              {JSON.parse(localStorage.getItem('CommData')).filter(data => data.hz05020 === '011').map(data => (
                <option key={data.hz05030} value={data.hz05030} selected={editedItem.HC11011 === data.hz05030}>{data.hz05040}</option>
              ))} 
            </Select>
          </InputGroup>
          <InputGroup>
            <Label>거래처명</Label>
            <Input name="HC11020" value={editedItem.HC11020 || ''} onChange={handleChange} style={{ marginRight: '5px' }} />
            <Label>사업자번호</Label>
            <Input name="HC11030" value={editedItem.HC11030 || ''} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>대표자명</Label>
            <Input name="HC11040" value={editedItem.HC11040 || ''} onChange={handleChange} style={{ marginRight: '5px' }} />
            <Label>법인 번호</Label>
            <Input name="HC11080" value={editedItem.HC11080 || ''} onChange={handleChange} size={6} maxLength={6} />
            -<Input name="HC11090" value={editedItem.HC11090 || ''} onChange={handleChange} size={7} maxLength={7} />
          </InputGroup>
          <InputGroup>
            <Label>우편번호</Label>
            <Input name="HC11130" value={editedItem.HC11130 || ''} onChange={handleChange} style={{ marginRight: '5px' }} />
            <Label>주 소</Label>
            <Input name="HC11150" value={editedItem.HC11150 || ''} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>전화번호</Label>
            <Input name="HC11210" value={editedItem.HC11210 || ''} onChange={handleChange} style={{ marginRight: '5px' }} />
            <Label>FAX 번호</Label>
            <Input name="HC11200" value={editedItem.HC11200 || ''} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>담 당 자</Label>
            <Input name="HC11070" value={editedItem.HC11070 || ''} onChange={handleChange} />
          </InputGroup>
        </ContentArea>
        <ButtonGroup>
          <SaveButton onClick={handleSave}>저장</SaveButton>
          <CancelButton onClick={onClose}>취소</CancelButton>
        </ButtonGroup>
      </ModalContent>
    </ModalBackground>
  );
};

export default w_hc01110_01;
