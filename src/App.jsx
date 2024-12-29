import { Layout, Menu } from 'antd';
import { useState } from 'react';
import ApiTest from './components/ApiTest';
import ScheduleQuery from './components/ScheduleQuery';
import AppointmentLock from './components/AppointmentLock';
import DepartmentList from './components/DepartmentList';

const { Sider, Content } = Layout;

function App() {
  const [selectedKey, setSelectedKey] = useState('1');
  const [appointmentDefaults, setAppointmentDefaults] = useState(null);

  const navigateToAppointment = (defaults) => {
    setAppointmentDefaults(defaults);
    setSelectedKey('3');
  };

  // 定义菜单项
  const menuItems = [
    {
      key: 'hospital',
      label: '医院接口',
      children: [
        {
          key: '1',
          label: '病人信息录入',
        },
        {
          key: '2',
          label: '号源排班查询',
        },
        {
          key: '3',
          label: '预约锁号',
        },
        {
          key: '4',
          label: '部门列表',
        },
      ],
    },
    {
      key: '5',
      label: 'API测试',
    },
  ];

  // 渲染内容区域
  const renderContent = () => {
    return (
      <div>
        <div style={{ display: selectedKey === '1' ? 'block' : 'none' }}>
          <ApiTest />
        </div>
        <div style={{ display: selectedKey === '2' ? 'block' : 'none' }}>
          <ScheduleQuery onNavigateToAppointment={navigateToAppointment} />
        </div>
        <div style={{ display: selectedKey === '3' ? 'block' : 'none' }}>
          <AppointmentLock defaults={appointmentDefaults} />
        </div>
        <div style={{ display: selectedKey === '4' ? 'block' : 'none' }}>
          <DepartmentList />
        </div>
        <div style={{ display: selectedKey === '5' ? 'block' : 'none' }}>
          <ApiTest />
        </div>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="light">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['hospital']}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
          onSelect={({ key }) => setSelectedKey(key)}
        />
      </Sider>
      <Layout style={{ padding: '24px' }}>
        <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App; 