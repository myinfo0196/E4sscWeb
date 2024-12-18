import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Routes, Route, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import styled from '@emotion/styled'
import axiosInstance from './axiosConfig'; // Axios 인스턴스 import
import w_hc01010 from './w_hc01010'
import w_hc01110 from './w_hc01110'
import w_ac01040 from './w_ac01040'
import card2 from './Card2';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Arial, sans-serif;
  cursor: ${props => props.isLoading ? 'wait' : 'default'};
`

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const ButtonContainer = styled.div`
  display: flex;
`

const ActionButton = styled.button`
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`

const LogoutButton = styled(ActionButton)`
  background-color: #f44336; // Red color for logout
`

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid #ccc;
  background-color: #f0f0f0;
  overflow-x: auto;
`;

const TabItem = styled(NavLink)`
  padding: 10px 20px;
  text-decoration: none;
  color: #333;
  border-right: 1px solid #ccc;
  &.active {
    background-color: #fff;
    border-bottom: 2px solid #007bff;
  }
`;

const CloseButton = styled.span`
  margin-left: 10px;
  font-size: 14px;
  &:hover {
    color: red;
  }
`;

const Breadcrumb = styled.div`
  padding: 10px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
`;

const BreadcrumbItem = styled.span`
  color: #333;
  &:last-child {
    font-weight: bold;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.2em;
  color: #666;
`;

const MainMenu = () => {
  const [menuData, setMenuData] = useState({ mainMenus: [], subMenus: {} });
  const [activeMainTab, setActiveMainTab] = useState('')
  const [openTabs, setOpenTabs] = useState([])
  const [permissions, setPermissions] = useState({});
  const [activeTab, setActiveTab] = useState('')
  const [breadcrumb, setBreadcrumb] = useState([])
  const [expandedItems, setExpandedItems] = useState({})
  const cardRefs = useRef({});
  const [cachedData, setCachedData] = useState({})
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchInitialData();
  }, []); // ���포넌트가 마운트될 때 한 번만 실행

  const fetchInitialData = async () => {
    try {
      // Fetch data from comm.comm_s
      const commResponse = await axiosInstance.get('comm.jsp', {
        params: {
          map: 'comm.comm_s',
          table: JSON.parse(localStorage.getItem('LoginResults')).dboTable,
        },
      });

      // Cache the data in localStorage
      const commData = commResponse.data.data ? commResponse.data.data.result : [];
      localStorage.setItem('CommData', JSON.stringify(commData));

      // Now fetch menu data using the cached data
      fetchMenuData();
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchMenuData = async () => {
    try {
      const params = {
        map: 'comm.menu_s',
        table: JSON.parse(localStorage.getItem('LoginResults')).dboTable,
        buttonid: '',
      };

      const response = await axiosInstance.get('comm.jsp', {
        params,
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        }
      });

      console.log('API Response:', response.data); // 전체 응답 로깅
      const data = response.data.data ? response.data.data.result : []; // data가 undefined일 경우 빈 배열로 설정

      if (!Array.isArray(data)) {
        console.error('Unexpected data structure:', data);
        return;
      }
  
      const mainMenus = data.filter(item => item.module === 'parent');
      const subMenus = data.filter(item => item.module !== 'parent').reduce((acc, item) => {
        if (!acc[item.buttonid]) {
          acc[item.buttonid] = [];
        }
        acc[item.buttonid].push(item);
        return acc;
      }, {});
  
      console.log('Processed menu data:', { mainMenus, subMenus });
      setMenuData({ mainMenus, subMenus });
      if (mainMenus.length > 0) {
        setActiveMainTab(mainMenus[0].buttonid);
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
    }
  };

  useEffect(() => {
    const currentPath = location.pathname.split('/').pop();
    const currentMenu = Object.keys(menuData.subMenus).find(key => key.toLowerCase() === currentPath);
    
    if (currentMenu) {
      setActiveTab(currentMenu);
      setOpenTabs(prev => {
        if (!prev.includes(currentMenu)) {
          return [...prev, currentMenu];
        }
        return prev; // 같은 탭을 다시 추가하지 않도록 방지
      });
      updateBreadcrumb(currentMenu);
    } else if (openTabs.length > 0) {
      const lastTab = openTabs[openTabs.length - 1];
      if (lastTab) {
        navigate(`/${lastTab.toLowerCase()}`);
      }
    } else {
      navigate('/');
    }
  }, [location.pathname, menuData.subMenus]); // 이 효과가 필요한 경우에만 실행되도록 보장

  const handleTabChange = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      navigate(`/${tab.toLowerCase()}`); // menuToFileMap 사용하지 않고 직접 tab 사용
    }
  };
  
  const updateBreadcrumb = useCallback((menuName) => {
    const mainMenu = menuData.mainMenus.find(menu => 
      menuData.subMenus[menu.buttonid]?.some(subMenu => subMenu.module === menuName)
    );
  
    if (mainMenu) {
      const subMenu = menuData.subMenus[mainMenu.buttonid].find(sub => sub.module === menuName);
      if (subMenu) {
        setBreadcrumb([mainMenu.remark, subMenu.remark]);
        setActiveMainTab(mainMenu.buttonid);
      }
    } else {
      setBreadcrumb([menuName]);
    }
  }, [menuData]);
  const handlePermissionsChange = useCallback((menuName, newPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [menuName]: newPermissions
    }));
  }, []);

  const getActiveTabPermissions = useCallback(() => {
    return permissions[activeTab] || { view: false, add: false, update: false, delete: false };
  }, [permissions, activeTab]);

  const handleAction = useCallback((action) => {
    console.log(`Action triggered: ${action}`); // 로그 추가
    if (activeTab && cardRefs.current[activeTab]) {
      const cardRef = cardRefs.current[activeTab];
      const currentPermissions = permissions[activeTab] || {};
      
      if (cardRef && cardRef[action]) {
        switch (action) {
          case 'handleSearch':
            if (currentPermissions.view) cardRef.handleSearch();
            else alert('조회 권한이 없습니다.');
            break;
          case 'handleCreate':
            if (currentPermissions.add) cardRef.handleCreate();
            else alert('등록 권한이 없습니다.');
            break;
          case 'handleEdit':
            if (currentPermissions.update) cardRef.handleEdit();
            else alert('수정 권한이 없습니다.');
            break;
          case 'handleDelete':
            if (currentPermissions.delete) cardRef.handleDelete();
            else alert('삭제 권한이 없습니다.');
            break;
          case 'handlePrint':
            if (currentPermissions.print) cardRef.handlePrint();
            else alert('출력 권한이 없습니다.');
            break;
          case 'handleCsvDownload':
          case 'handlePdfDownload':
          case 'handleExcelDownload':
            if (currentPermissions.view) cardRef[action]();
            else alert('다운로드 권한이 없습니다.');
            break;
          case 'handleInint':
            if (currentPermissions.print) cardRef.handleInint();
            else alert('출력 권한이 없습니다.');
            break;
          default:
            console.error(`Unknown action: ${action}`);
            break;
        }
      } else {
        console.error(`Action ${action} not found on card ref`);
      }
    }
  }, [activeTab, permissions]);

  const openTab = useCallback((content) => {
    setIsLoading(true);
    setOpenTabs(prev => {
      if (!prev.includes(content)) {
        return [...prev, content];
      }
      return prev;
    });
    setActiveTab(content);
    updateBreadcrumb(content);
    navigate(`/${content.toLowerCase()}`);
  }, [navigate, updateBreadcrumb]);

  const closeTab = useCallback((tabToClose, event) => {
    event.stopPropagation();
    event.preventDefault(); // 기본 동작 방지

    setOpenTabs(prevTabs => {
      const tabIndex = prevTabs.indexOf(tabToClose);
      if (tabIndex === -1) return prevTabs; // 탭이 없으면 변경 음

      const updatedTabs = prevTabs.filter(tab => tab !== tabToClose);
      
      // 닫은 탭이 현재 활성 탭인 경우
      if (activeTab === tabToClose) {
        if (updatedTabs.length > 0) {
          const newActiveTab = tabIndex === prevTabs.length - 1
            ? updatedTabs[updatedTabs.length - 1] // 마지막 탭을 닫은 경우 새로운 마지막 탭으로
            : prevTabs[tabIndex + 1]; // 그 외의 경우 다음 탭으로
          
          setActiveTab(newActiveTab);
          updateBreadcrumb(newActiveTab);
          navigate(`/${newActiveTab.toLowerCase()}`); // menuToFileMap 사용하지 않고 직접 tab 사용
        } else {
          // 모든 탭이 닫힌 경우
          setActiveTab('');
          setBreadcrumb([]);
          navigate('/');
        }
      } else if (updatedTabs.length === 0) {
        // 마지막 탭을 닫았지만 활성 탭이 아닌 경우
        setActiveTab('');
        setBreadcrumb([]);
        navigate('/');
      } else {
        // 닫은 탭이 현재 활성 탭이 아닌 경우, 현재 활성 탭의 URL로 이동
        navigate(`/${activeTab.toLowerCase()}`); // menuToFileMap 사용하지 않고 직접 activeTab 사용
      }

      return updatedTabs;
    });
  }, [activeTab, navigate, updateBreadcrumb]);

  const handleDataChange = useCallback((menuName, newData) => {
    setCachedData(prev => ({
      ...prev,
      [menuName]: newData
    }));
  }, []);

  const renderSidebarItems = useCallback(() => {
    if (!menuData.subMenus[activeMainTab]) {
      console.log('No submenus for active main tab:', activeMainTab); // 디버깅을 위한 로그
      return null;
    }
  
    return menuData.subMenus[activeMainTab].map((item) => (
      <SidebarItem 
        key={item.module}
        onClick={() => openTab(item.module)}
      >
        {item.remark}
      </SidebarItem>
    ));
  }, [menuData, activeMainTab, openTab]);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500); // 500ms 후에 로딩 상태 해제
      return () => clearTimeout(timer);
    }
  }, [isLoading]);


  console.log('Active Tab:', activeTab);
  console.log('Permissions:', permissions);
  console.log('Active Tab Permissions:', getActiveTabPermissions());

  const renderContent = () => {
    let CardComponent = null;
    switch (activeTab) {
      case 'w_hc01010':
        CardComponent = w_hc01010;
        break;
      case 'w_hc01110':
        CardComponent = w_hc01110;
        break;
      case 'w_ac01040':
        CardComponent = w_ac01040;
        break;
      case 'card2':
        CardComponent = card2; // Ensure card2 is correctly assigned
        break;
      default:
        return <div>왼쪽 사이드바에서 메뉴를 선택해주세요.</div>;
    }

    return (
      <CardComponent 
        ref={el => cardRefs.current[activeTab] = el}
        onDataChange={(newData) => handleDataChange(activeTab, newData)}
        cachedData={cachedData[activeTab]}
        onPermissionsChange={(newPermissions) => handlePermissionsChange(activeTab, newPermissions)}
      />
    );
  };

  useEffect(() => {
    // 탭이 변경될 때마다 해당 컴포넌트의 권한을 다시 가져옵니다.
    if (activeTab && cardRefs.current[activeTab] && cardRefs.current[activeTab].current) {
      const currentCard = cardRefs.current[activeTab].current;
      if (typeof currentCard.refetchPermissions === 'function') {
        currentCard.refetchPermissions();
      }
    }
  }, [activeTab]);

  const renderBreadcrumb = () => {
    return (
      <Breadcrumb>
        {breadcrumb.map((item, index) => (
          <BreadcrumbItem key={index}>
            {item}{index < breadcrumb.length - 1 && ' > '}
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    );
  };

  const handleLogout = () => {
    // Perform any necessary logout actions here (e.g., clearing tokens)
    localStorage.clear(); // Clear all localStorage data
    window.location.href = '/'; // Redirect to the login page to ensure all state is reset
  };

  return (
    <AppContainer isLoading={isLoading}>
      <Header>
        <ButtonContainer>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </ButtonContainer>
        <TabMenu>
          {menuData.mainMenus.map(mainMenu => (
            <Tab 
              key={mainMenu.buttonid}
              active={activeMainTab === mainMenu.buttonid} 
              onClick={() => setActiveMainTab(mainMenu.buttonid)}
            >
              {mainMenu.remark}
            </Tab>
          ))}
        </TabMenu>
        <ButtonContainer>
          <ActionButton onClick={() => handleAction('handleSearch')} disabled={!permissions[activeTab]?.view}>조회</ActionButton>
          <ActionButton onClick={() => handleAction('handleCreate')} disabled={!permissions[activeTab]?.add}>등록</ActionButton>
          <ActionButton onClick={() => handleAction('handleEdit')} disabled={!permissions[activeTab]?.update}>수정</ActionButton>
          <ActionButton onClick={() => handleAction('handleDelete')} disabled={!permissions[activeTab]?.delete}>삭제</ActionButton>
          <ActionButton onClick={() => handleAction('handlePrint')} disabled={!permissions[activeTab]?.print}>출력</ActionButton>
          <ActionButton onClick={() => handleAction('handleCsvDownload')} disabled={!permissions[activeTab]?.print}>CSV</ActionButton>
          <ActionButton onClick={() => handleAction('handlePdfDownload')} disabled={!permissions[activeTab]?.print}>PDF</ActionButton>
          <ActionButton onClick={() => handleAction('handleExcelDownload')} disabled={!permissions[activeTab]?.print}>엑셀</ActionButton>
          <ActionButton onClick={() => handleAction('handleInint')} disabled={!permissions[activeTab]?.print}>초기화</ActionButton>
        </ButtonContainer>
      </Header>
      <ContentArea>
        <Sidebar>
          {renderSidebarItems()}
        </Sidebar>
        <MainContent>
          <TabList>
            {openTabs.map(tab => (
              <TabItem
                key={tab}
                to={`/${tab.toLowerCase()}`}
                onClick={() => handleTabChange(tab)}
                className={activeTab === tab ? 'active' : ''}
              >
                {menuData.subMenus[activeMainTab]?.find(item => item.module === tab)?.remark || tab}
                <CloseButton onClick={(e) => closeTab(tab, e)}>×</CloseButton>
              </TabItem>              
            ))}
          </TabList>
          <CardContainer>
            {renderContent()}
          </CardContainer>
        </MainContent>
      </ContentArea>
    </AppContainer>
  )
}

export default MainMenu;