import pdfMake from 'pdfmake/build/pdfmake'; // Import pdfmake
import pdfFonts from './vfs_fonts'; // Import pdfmake fonts

const generatePdf = (header, data, itemMapper, filename) => {
  const documentDefinition = {
    content: [
      {
        table: {
          headerRows: 1, // Specify that the first row is a header row
          body: [
            // Header row
            header.map(col => ({ text: col, bold: true, style: 'tableHeader' })),
            // Data rows
            ...data.map(item => itemMapper(item).map(cell => ({ text: cell, style: 'tableCell' }))), // Use the itemMapper to transform each item and apply tableCell style
          ],
        },
      },
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
    pageSize: 'A4',
    pageOrientation: 'portrait', //'landscape',
  };
  pdfMake.vfs = pdfFonts; // Set the virtual file system for pdfmake
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
  
  pdfMake.createPdf(documentDefinition).download(`${filename}.pdf`); // Use pdfmake to download the PDF

};

export default generatePdf;
