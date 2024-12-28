import { Layout, Menu } from 'antd';
import { useState } from 'react';
import ApiTest from './components/ApiTest';
import ScheduleQuery from './components/ScheduleQuery';

const { Sider, Content } = Layout;

function App() {
  const [selectedKeys, setSelectedKeys] = useState(['1']);

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
          {selectedKeys[0] === '1' ? <ApiTest /> : <ScheduleQuery />}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App; 