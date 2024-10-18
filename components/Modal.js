import React from 'react';
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
  border-radius: 5px;
  width: 500px;
  overflow: hidden;
`;

const ModalTitle = styled.h2`
  background-color: #f0f0f0;
  margin: 0;
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
`;

const ModalBody = styled.div`
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
  white-space: nowrap;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 15px;
  margin-left: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const Modal = ({ isOpen, onClose, data, onSave }) => {
  if (!isOpen) return null;

  const [editedData, setEditedData] = React.useState(data);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(editedData);
    onClose();
  };

  return (
    <ModalBackground>
      <ModalContent>
        <ModalTitle>거래처 정보 수정</ModalTitle>
        <ModalBody>
          <InputGroup>
            <Label>거래처명 :</Label>
            <Input 
            name="HC11020" 
            value={editedData.HC11020} 
            onChange={handleChange} 
            placeholder="거래처명"
            />
          </InputGroup>
          <InputGroup>
            <Label>사업자No :</Label>
            <Input 
            name="HC11030" 
            value={editedData.HC11030} 
            onChange={handleChange} 
            placeholder="사업자번호"
            />
          </InputGroup>
          <InputGroup>
            <Label>대 표 자 :</Label>
            <Input 
            name="HC11070" 
            value={editedData.HC11070} 
            onChange={handleChange} 
            placeholder="대표자"
            />
          </InputGroup>
          <InputGroup>
            <Label>담 당 자 :</Label>
            <Input 
            name="HC11040" 
            value={editedData.HC11040} 
            onChange={handleChange} 
            placeholder="담당자"
            />
          </InputGroup>
          <InputGroup>
            <Label>전화번호 :</Label>
            <Input 
            name="HC11210" 
            value={editedData.HC11210} 
            onChange={handleChange} 
            placeholder="전화번호"
            />
          </InputGroup>
          <ButtonGroup>
            <Button onClick={handleSave}>저장</Button>
            <Button onClick={onClose}>취소</Button>
          </ButtonGroup>
        </ModalBody>
      </ModalContent>
    </ModalBackground>
  );
};

export default Modal;
