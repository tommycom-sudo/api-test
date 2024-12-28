import { Layout, Menu } from 'antd';
import { useState } from 'react';
import ApiTest from './components/ApiTest';
import ScheduleQuery from './components/ScheduleQuery';
import AppointmentLock from './components/AppointmentLock';

const { Sider, Content } = Layout;

function App() {
  const [selectedKeys, setSelectedKeys] = useState(['1']);
  const [appointmentDefaults, setAppointmentDefaults] = useState(null);

  const navigateToAppointment = (defaults) => {
    setAppointmentDefaults(defaults);
    setSelectedKeys(['3']);
  };

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
      ],
    },
    // 后续可以在这里添加更多的主菜单项
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200}>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={['hospital']}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
          onSelect={({ key }) => setSelectedKeys([key])}
        />
      </Sider>
      <Layout style={{ padding: '24px' }}>
        <Content>
          {
            {
              '1': <ApiTest />,
              '2': <ScheduleQuery onNavigateToAppointment={navigateToAppointment} />,
              '3': <AppointmentLock defaultValues={appointmentDefaults} />,
            }[selectedKeys[0]]
          }
        </Content>
      </Layout>
    </Layout>
  );
}

export default App; 