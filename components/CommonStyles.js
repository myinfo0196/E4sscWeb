import styled from 'styled-components';

export const CardContainer = styled.div`
  padding: 5px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const ConditionArea = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 5px;
`;

export const InputsWrapper = styled.div`
  display: flex;
  flex-grow: 1;
`;

export const InputGroup = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
`;

export const Label = styled.label`
  margin-right: 5px;
  white-space: nowrap;
`;

export const Input = styled.input`
  padding: 5px;
  width: 200px;
`;

export const Select = styled.select`
  padding: 5px;
  width: 200px;
`;

export const GridContainer = styled.div`
  height: 400px;
  width: 100%;
  flex: 1;
`;

export const ResultArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`; 