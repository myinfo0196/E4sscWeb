import React, { useRef, Suspense, lazy, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from './vfs_fonts';

// Set PDFMake fonts
pdfMake.vfs = pdfFonts;


const GlobalPrintStyle = createGlobalStyle`
  @media print {
    html, body {
      height: 100%;
      margin: 0 !important;
      padding: 0 !important;
      font-family: 'Noto Sans', sans-serif;
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
      max-height: 80vh;
      overflow-y: auto;
    }

    .no-print {
      display: none !important;
    }

    header, footer {
      display: none !important;
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
  const componentRef = useRef();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Clean up the link element on component unmount
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (!isOpen || !printComponentPath) return null;

  const PrintComponent = lazy(() => {
    return import(`./${printComponentPath}`)
      .catch(err => {
        console.error('Error loading print component:', err);
        return Promise.resolve({ default: () => <div>Error loading component</div> });
      });
  });

  const handlePDF = async () => {
    const { default: Component, getFormattedData, getTableHeaders, getWidthData } = await import(`./${printComponentPath}`);
    
    // PDF에 대한 형식화된 데이터 가져오기
    const formattedData = getFormattedData(data);
    const headers = getTableHeaders(); // 테이블 헤더 가져오기

    // Noto Sans 폰트 등록
    pdfMake.vfs = pdfFonts; // 폰트가 등록되었는지 확인
    pdfMake.fonts = {
        NotoSans: {
            normal: 'NotoSans-Regular.otf',
            bold: 'NotoSans-Bold.otf',
            italics: 'NotoSans-Regular.otf',
            bolditalics: 'NotoSans-Regular.otf',
        },
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf',
      },
  };

    // 형식화된 데이터를 기반으로 문서 정의 생성
    const documentDefinition = {
        content: [
            { text: title, style: 'header' },
            {
                table: {
                    widths: getWidthData(), // 너비 결정에 getWidthData 사용
                    body: [
                        headers.map(header => ({ text: header, style: 'tableHeader' })), // 스타일이 적용된 헤더 사용
                        ...formattedData.map(row => row.map(cell => ({ text: cell, style: 'tableCell' }))), // 스타일이 적용된 셀 사용
                    ],
                },
                layout: 'lightHorizontalLines',
            },
            { text: `총 ${formattedData.length}건`, style: 'footer' },
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 20, 0, 10],
                font: 'NotoSans', // 헤더에 폰트 설정
            },
            footer: {
                margin: [0, 20, 0, 0],
                font: 'NotoSans', // 푸터에 폰트 설정
            },
            tableHeader: {
                bold: true,
                fontSize: 12,
                color: 'black',
                margin: [0, 5, 0, 5],
                font: 'NotoSans', // 테이블 헤더에 폰트 설정
            },
            tableCell: {
                fontSize: 10,
                margin: [0, 5, 0, 5],
                font: 'NotoSans', // 테이블 셀에 폰트 설정
            },
        },
        // footer: (currentPage, pageCount) => {
        //     return { text: `${currentPage} / ${pageCount}`, alignment: 'center' };
        // },
    };

    // PDF 생성 및 다운로드
    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download(`${printComponentPath}.pdf`);
  };

  const handlePrint = () => {
    // Add logic to print the component
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print</title><style>body, h1 { text-align: ' + componentRef.current.style.textAlign + '; }</style></head><body>');
    printWindow.document.write(componentRef.current.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
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
            <Button className="print" onClick={handlePDF}>
              PDF
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

