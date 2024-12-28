import { Layout, Menu } from 'antd';
import { useState } from 'react';
import ApiTest from './components/ApiTest';

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
        // 后续可以在这里添加更多的子菜单项
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
          <ApiTest />
        </Content>
      </Layout>
    </Layout>
  );
}

export default App; 