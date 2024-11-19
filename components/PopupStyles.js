import styled from 'styled-components';

export const ModalBackground = styled.div`
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

export const ModalContent = styled.div`
background-color: white;
border-radius: 8px;
width: 750px;
max-width: 90%;
overflow: hidden;
`;

export const TitleArea = styled.div`
background-color: blue;
padding: 15px 20px;
border-bottom: 1px solid #dee2e6;
`;

export const Title = styled.h2`
margin: 0;
font-size: 18px;
color: white;
`;

export const ContentArea = styled.div`
padding: 20px;
`;

export const InputGroup = styled.div`
display: flex;
align-items: center;
margin-bottom: 10px;
`;

export const Label = styled.label`
width: 80px;
margin-left: 5px;
margin-right: 5px;
font-weight: bold;
`;

export const Input = styled.input`
flex: 1;
padding: 8px;
border: 1px solid #ccc;
border-radius: 4px;
font-size: 14px;
`;

export const Select = styled.select`
  flex: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
`;

export const ModalHeader = styled.div`
  background-color: blue;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
`;


