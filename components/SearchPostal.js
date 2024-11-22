import React, { useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  background-color: #4CAF50;
  color: white;
`;

const SearchPostal = ({ onSelect, onClose }) => {
  useEffect(() => {
    // Load the Daum Postcode script
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSearch = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        // 선택된 주소 정보를 부모 컴포넌트에 전달
        onSelect(data.zonecode, data.address);
        onClose();
      }
    }).open();
  };

  return (
    <div>
      <Button onClick={handleSearch}>검색</Button>
    </div>
  );
};

export default SearchPostal; 