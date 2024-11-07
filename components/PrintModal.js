import React, { useRef, Suspense, lazy, useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalPrintStyle = createGlobalStyle`
  @media print {
    html, body {
      height: 100%;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    #root > *:not(.modal-overlay) {
      display: none !important;
    }
    
    .modal-overlay {
      position: absolute !important;
      background-color: transparent !important;
      padding: 0 !important;
      margin: 0 !important;
      left: 0 !important;
      top: 0 !important;
    }

    .modal-content {
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 !important;
      border-radius: 0 !important;
    }

    .print-content {
      display: block !important;
      position: relative !important;
      width: 100% !important;
      height: auto !important;
    }

    .no-print {
      display: none !important;
    }

    header, footer {
      display: none !important; /* Hide header and footer */
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  z-index: 1000;
  overflow-y: auto;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 1200px;
  margin: 20px auto;
  position: relative;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  
  &.print {
    background-color: #4CAF50;
    color: white;
  }
  
  &.close {
    background-color: #f44336;
    color: white;
  }
`;

const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
`;

const PrintModal = ({ isOpen, onClose, data, title, printComponentPath }) => {
  const [PrintJS, setPrintJS] = useState(null); // State to manage Print.js
  const componentRef = useRef();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('print-js').then((module) => {
        setPrintJS(() => module.default); // Load Print.js on the client side
      });
    }
  }, []);

  if (!isOpen || !printComponentPath) return null;

  const PrintComponent = lazy(() => {
    return import(`./${printComponentPath}`)
      .catch(err => {
        console.error('Error loading print component:', err);
        return Promise.resolve({ default: () => <div>Error loading component</div> }); // Fallback UI
      });
  });

  const handlePrint = () => {
    if (PrintJS) {
      PrintJS({
        printable: componentRef.current,
        type: 'html',
        targetStyles: ['*'],
      });
    }
  };

  return (
    <>
      <GlobalPrintStyle />
      <ModalOverlay className="modal-overlay">
        <ModalContent className="modal-content">
          <ButtonContainer className="no-print">
            <Button className="print" onClick={handlePrint}>
              인쇄
            </Button>
            <Button className="close" onClick={onClose}>
              닫기
            </Button>
          </ButtonContainer>
          <Suspense fallback={<LoadingMessage>로딩중...</LoadingMessage>}>
            <div ref={componentRef} className="print-content">
              <PrintComponent data={data} title={title} />
            </div>
          </Suspense>
        </ModalContent>
      </ModalOverlay>
    </>
  );
};

export default PrintModal;
