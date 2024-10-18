import React, { useState } from 'react';
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
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
  margin: 5px;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const DatePickerModal = ({ isOpen, onClose, onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState('');

  if (!isOpen) return null;

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSubmit = () => {
    onDateSelect(selectedDate);
    onClose();
  };

  return (
    <ModalBackground onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>날짜 선택</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
        />
        <div>
          <Button onClick={handleSubmit}>확인</Button>
          <Button onClick={onClose}>취소</Button>
        </div>
      </ModalContent>
    </ModalBackground>
  );
};

export default DatePickerModal;
