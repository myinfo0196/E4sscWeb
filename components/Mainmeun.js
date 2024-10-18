import React, { useState } from 'react'
import styled from '@emotion/styled'
import Card1 from './Card1'  // Card1 컴포넌트를 import 합니다.
import Card2 from './Card2'  // Card1 컴포넌트를 import 합니다.
import Card3 from './Card3'  // Card1 컴포넌트를 import 합니다.

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Arial, sans-serif;
`

const Header = styled.header`
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
  padding: 5px 10px;
`

const Logo = styled.div`
  font-weight: bold;
  color: #333;
`

const TabMenu = styled.div`
  display: flex;
  background-color: #e0e0e0;
  border-bottom: 1px solid #ccc;
`

const Tab = styled.div`
  padding: 5px 15px;
  cursor: pointer;
  background-color: ${props => props.active ? '#fff' : '#e0e0e0'};
  border-right: 1px solid #ccc;
  &:hover {
    background-color: #f0f0f0;
  }
`

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden; // 추가: 내부 스크롤을 위해 overflow를 hidden으로 설정
`

const Sidebar = styled.div`
  width: 250px;
  background-color: #f8f8f8;
  border-right: 1px solid #ccc;
  overflow-y: auto;
`

const SidebarItem = styled.div`
  padding: 5px 10px 5px ${props => props.level * 20}px;
  cursor: pointer;
  &:hover {
    background-color: #e8e8e8;
  }
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ExpandIcon = styled.span`
  font-size: 12px;
`

const MainContent = styled.div`
  flex: 1;
  padding: 0px;
  display: flex;
  flex-direction: column;
  overflow: hidden; // 변경: auto에서 hidden으로 변경
`

const CardContainer = styled.div`
  flex: 1;
  overflow: hidden; // 변경: auto에서 hidden으로 변경
`

export default function MainMenu() {
  const [activeTab, setActiveTab] = useState('기초업무')
  const [expandedItems, setExpandedItems] = useState({})
  const [selectedContent, setSelectedContent] = useState(null)

  // menuData를 컴포넌트 내부에서 정의
  const menuData = {
    '기초업무': [
    {
      name: '각종코드관리',
      children: [
        { name: '사업장 코드 관리' },
        { name: '하치장 코드 관리' },
        { name: '운송사 코드 관리' },
        { name: '운송 차량번호 관리' },
        { name: '품명 코드 관리' },
        { name: '규격 약호 관리' },
        { name: '생산 공정 관리' },
        { name: '포장 코드 관리' },
        { name: '결함 코드 관리' },
        { name: '단중 계산 확인' },
        { name: '코일 길이 계산' },
        { name: '코일 외경 계산' },
      ]
    },
    {
      name: '거래처 관리',
      children: [
        { name: '거래처 코드 관리' },
        { name: '거래처 등록 현황' },
        { name: '거래처별 단중 관리' },
        { name: '계좌 코드 관리' },
      ]
    },
    {
      name: '공지사항 관리',
      children: [
        { name: '공지사항 등록 관리' },
        { name: '업무연락서작성관리' },
        { name: '업무연락서발신내역' },
        { name: '업무연락서수신내역' },
        { name: '회 의 록 관 리' },
        { name: '교육일지 관 리' },
      ]
    }
  ],
  '수주업무': [
    {
      name: '수주품의 관리',
      children: [
        { name: '수주품의 등록 관리' },
        { name: '수주품의 승인 관리' },
        { name: '수주품의 내역 조회' },
        { name: '수주품의 종결 관리' },
      ]
    },
    {
      name: '주문구매 관리',
      children: [
        { name: '주문 구매 요청 관리' },
        { name: '주문서 확정 및 종결' },
        { name: '현대외 주문진행 관리' },
        { name: '현대외 주문진행 삭제' },
        { name: '출하 구매 요청 관리' },
      ]
    }
  ],
  '매입업무': [
    {
      name: '매입등록 관리',
      children: [
        { name: '매입입고 등록 관리' },
        { name: '매입입고 등록(현대)' },
        { name: '매입반품 등록 관리' },
        { name: '매입단가 일괄 수정' },
      ]
    },
    {
      name: '매입현황 관리',
      children: [
        { name: '매 입 일 보' },
        { name: '품명규격별매입현황' },
        { name: '매입처,품명별 현황' },
      ]
    },
    {
      name: '매입계산서 관리',
      children: [
        { name: '매입계산서 등록' },
        { name: '매입계산서 내역' },
      ]
    }
  ]
  };

  const toggleExpand = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }))
  }

  const handleItemClick = (item) => {
    if (item.children) {
      toggleExpand(item.name)
    } else {
      setSelectedContent(item.name)
    }
  }

  const renderSidebarItems = (items, level = 0) => {
    return items.map((item, index) => (
      <div key={index}>
        <SidebarItem 
          level={level} 
          onClick={() => handleItemClick(item)}
        >
          {item.name}
          {item.children && (
            <ExpandIcon>{expandedItems[item.name] ? '▼' : '▶'}</ExpandIcon>
          )}
        </SidebarItem>
        {item.children && expandedItems[item.name] && renderSidebarItems(item.children, level + 1)}
      </div>
    ))
  }

  const renderContent = () => {
    let content;
    switch (selectedContent) {
      case '사업장 코드 관리':
        content = <Card1 menuName={selectedContent} />;
        break;
      case '거래처 코드 관리':
        content = <Card2 menuName={selectedContent} />;
        break;
      case '품명 코드 관리':
        content = <Card3 menuName={selectedContent} />;
        break;
      default:
        content = selectedContent ? (
          <p>선택된 메뉴: {selectedContent}</p>
        ) : (
          <p>왼쪽 사이드바에서 메뉴를 선택해주세요.</p>
        );
    }
    return <CardContainer>{content}</CardContainer>;
  };

  return (
    <AppContainer>
      <TabMenu>
        <Tab active={activeTab === '기초업무'} onClick={() => setActiveTab('기초업무')}>기초업무</Tab>
        <Tab active={activeTab === '수주업무'} onClick={() => setActiveTab('수주업무')}>수주업무</Tab>
        <Tab active={activeTab === '매입업무'} onClick={() => setActiveTab('매입업무')}>매입업무</Tab>
        <Tab active={activeTab === '재고업무'} onClick={() => setActiveTab('재고업무')}>재고업무</Tab>
        <Tab active={activeTab === '전환업무'} onClick={() => setActiveTab('전환업무')}>전환업무</Tab>
        <Tab active={activeTab === '생산업무'} onClick={() => setActiveTab('생산업무')}>생산업무</Tab>
        <Tab active={activeTab === '판매업무'} onClick={() => setActiveTab('판매업무')}>판매업무</Tab>
        <Tab active={activeTab === '계산서업무'} onClick={() => setActiveTab('계산서업무')}>계산서업무</Tab>
      </TabMenu>
      <ContentArea>
        <Sidebar>
          {renderSidebarItems(menuData[activeTab] || [])}
        </Sidebar>
        <MainContent>
          {renderContent()}
        </MainContent>
      </ContentArea>
    </AppContainer>
  )
}
