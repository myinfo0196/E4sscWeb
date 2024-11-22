import styled from 'styled-components';

export const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export const ModalHeader = styled.div`
  background-color: #007bff;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  color: white;
  margin-bottom: 10px;
`;

export const ModalInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const ModalButton = styled.button`
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

export const ModalList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 10px 0;
`;

export const ModalListItem = styled.li`
  padding: 10px;
  border-bottom: 1px solid #eee;

  &:hover {
    background-color: #f0f0f0;
  }
`;

export const InputGroup = styled.div`
display: flex;
align-items: center;
margin-bottom: 10px;
`;
