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
  margin-bottom: 15px;
`;

const Label = styled.label`
  width: 80px;
  margin-right: 10px;
  font-weight: bold;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
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

const w_hc01110_01 = ({ item = {}, onClose, onSave, mode, title }) => {
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
            <Label>거래처명</Label>
            <Input
              name="HC11020"
              value={editedItem.HC11020}
              onChange={handleChange}
            />
          </InputGroup>
          <InputGroup>
            <Label>사업자No</Label>
            <Input
              name="HC11030"
              value={editedItem.HC11030}
              onChange={handleChange}
            />
          </InputGroup>
          <InputGroup>
            <Label>대 표 자</Label>
            <Input
              name="HC11040"
              value={editedItem.HC11040}
              onChange={handleChange}
            />
          </InputGroup>
          <InputGroup>
            <Label>담 당 자</Label>
            <Input
              name="HC11070"
              value={editedItem.HC11070}
              onChange={handleChange}
            />
          </InputGroup>
          <InputGroup>
            <Label>전화번호</Label>
            <Input
              name="HC11210"
              value={editedItem.HC11210}
              onChange={handleChange}
            />
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
