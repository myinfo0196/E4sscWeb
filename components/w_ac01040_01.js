import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axiosInstance from './axiosConfig'; // Axios 인스턴스 import

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 700px;
  max-width: 90%;
  overflow: hidden;
`;


const TitleArea = styled.div`
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #dee2e6;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
`;

const ContentArea = styled.div`
  padding: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Label = styled.label`
  width: 120px;
  margin-right: 10px;
  font-weight: bold;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 14px;
`;

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

const w_ac01040_01 = ({ item = {}, onClose, onSave, mode, title }) => {
  const [editedItem, setEditedItem] = useState(item);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = { 
          map: 'cd01.ac01040_s1', 
          table: 'ssc_00_demo.dbo', 
          f04010: item.F04010 
        };
        const response = await axiosInstance.get('comm.jsp', { // 기본 URL 사용
          params,
          paramsSerializer: params => {
            return Object.entries(params)
              .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
              .join('&');
          }
        });
        setEditedItem(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (item.F04010) {
      fetchData();
    }
  }, [item.F04010]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      let params = {
        table: 'ssc_00_demo.dbo'
      };

      if (mode === 'edit') {
        // 수정 시에는 Key(F04010)와 변경된 필드만 전송
        params.map = 'cd01.ac01040_upt';
        params.F04010 = item.F04010; // Key는 필수
        params.F04210 = 'SMIS';     
        
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
        params.map = 'cd01.ac01040_ins';
        params = {
          ...params,
          F04010: editedItem.F04010 || '',
          F04020: editedItem.F04020 || '',
          F04030: editedItem.F04030 || '',
          F04100: editedItem.F04100 || '',
          F04110: editedItem.F04110 || '',
          F04120: editedItem.F04120 || ' ',
          F04130: editedItem.F04130 || '0',
          F04140: editedItem.F04140 || '0',
          F04150: editedItem.F04150 || '0',
          F04160: editedItem.F04160 || '',
          F04200: 'SMIS'
        };

        let jsp = 'comm_insert.jsp';
        const response = await axiosInstance.post(jsp, params);

        if (response.data && response.data.data && response.data.data.result > 0) {
          // 새로 등록된 데이터를 parent에 추가
          onSave({
            ...editedItem,
            F04010: editedItem.F04010,
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
    <ModalBackground>
      <ModalContent>
        <TitleArea>
          <Title>{title}</Title>
        </TitleArea>
        <ContentArea>
          <InputGroup>
            <Label>계좌코드</Label>
            <Input name="F04010" value={editedItem.F04010} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>번 호</Label>
            <Input name="F04020" value={editedItem.F04020} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>명 칭</Label>
            <Input name="F04030" value={editedItem.F04030} onChange={handleChange} />
          </InputGroup>
          <InputGroup style={{ display: 'flex', alignItems: 'center' }}>
            <Label>개설일자</Label>
            <Input name="F04100" value={editedItem.F04100} onChange={handleChange} style={{ marginRight: '10px' }} />
            <Label>금 액</Label>
            <Input name="F04130" value={editedItem.F04130} onChange={handleChange} />
          </InputGroup>
          <InputGroup style={{ display: 'flex', alignItems: 'center' }}>
            <Label>만기일자</Label>
            <Input name="F04110" value={editedItem.F04110} onChange={handleChange} style={{ marginRight: '10px' }} />
            <Label>년이자율</Label>
            <Input name="F04140" value={editedItem.F04140} onChange={handleChange} />
          </InputGroup>
          <InputGroup style={{ display: 'flex', alignItems: 'center' }}>
            <Label>폐기일자</Label>
            <Input name="F04120" value={editedItem.F04120} onChange={handleChange} style={{ marginRight: '10px' }} />
            <Label>월상환액</Label>
            <Input name="F04150" value={editedItem.F04150} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>비 고</Label>
            <Input name="F04160" value={editedItem.F04160} onChange={handleChange} />
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

export default w_ac01040_01;
