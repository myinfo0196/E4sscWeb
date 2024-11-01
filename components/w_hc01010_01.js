import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

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
  width: 400px;
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
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
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

const w_hc01010_01 = ({ item = {}, onClose, onSave, mode, title }) => {
  const [editedItem, setEditedItem] = useState(item);

  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(editedItem);
    onClose();
  };

  return (
    <ModalBackground>
      <ModalContent>
        <TitleArea>
          <Title>{title}</Title>
        </TitleArea>
        <ContentArea>
            <InputGroup>
              <Label>사업장코드</Label>
            <Input name="HC01010" value={editedItem.HC01010} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>사업장명칭</Label>
            <Input name="HC01020" value={editedItem.HC01020} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>사업자등록번호</Label>
            <Input name="HC01030" value={editedItem.HC01030} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>대표자성명</Label>
            <Input name="HC01040" value={editedItem.HC01040} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>우편 번호</Label>
            <Input name="HC01050" value={editedItem.HC01050} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>사업장주소</Label>
            <Input name="HC01060" value={editedItem.HC01060} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>업태</Label>
            <Input name="HC01100" value={editedItem.HC01100} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>종목</Label>
            <Input name="HC01090" value={editedItem.HC01090} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>전화 번호</Label>
            <Input name="HC01110" value={editedItem.HC01110} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>FAX 번호</Label>
            <Input name="HC01120" value={editedItem.HC01120} onChange={handleChange} />
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

export default w_hc01010_01;
