import { Card, Table, Space } from 'antd';
import { useState, useEffect } from 'react';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';

const DepartmentList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // 将树形数据转换为表格数据，保持层级结构
  const transformDepartments = (departments, parentName = '', level = 0) => {
    return departments.map((dept, index) => {
      const current = {
        key: dept.id,  // 使用部门ID作为key
        id: dept.id,
        name: dept.name,
        parentName: parentName,
        level: level,
        code: dept.code || '-',
        parentId: dept.parentId || '-',
        children: dept.children && dept.children.length > 0 
          ? transformDepartments(dept.children, dept.name, level + 1) 
          : null
      };

      // 如果没有子节点，删除 children 属性
      if (!current.children) {
        delete current.children;
      }
      
      return current;
    });
  };

  // 定义表格列
  const columns = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span style={{ marginLeft: record.level * 20 }}>
          {record.children ? (
            <span 
              onClick={(e) => {
                e.stopPropagation();
                handleExpand(!expandedRowKeys.includes(record.key), record);
              }}
              style={{ cursor: 'pointer', marginRight: 8 }}
            >
              {expandedRowKeys.includes(record.key) ? 
                <CaretDownOutlined /> : 
                <CaretRightOutlined />
              }
            </span>
          ) : (
            <span style={{ marginRight: 24 }}></span>
          )}
          {text}
        </span>
      ),
      width: 300,
      fixed: 'left',
    },
    {
      title: '上级部门',
      dataIndex: 'parentName',
      key: 'parentName',
      width: 200,
    },
    {
      title: '部门代码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: '部门ID',
      dataIndex: 'id',
      key: 'id',
      width: 250,
    },
    {
      title: '上级部门ID',
      dataIndex: 'parentId',
      key: 'parentId',
      width: 250,
    },
  ];

  // 获取部门数据
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/departments/tree?orgId=6672a56ef88a25000102d4db');
      if (!response.ok) {
        throw new Error('获取部门数据失败');
      }
      const data = await response.json();
      if (data.code === '0' && data.data) {
        // 转换数据保持树形结构
        const treeData = transformDepartments(data.data);
        setData(treeData);
      } else {
        console.error('获取部门数据格式错误:', data);
      }
    } catch (error) {
      console.error('获取部门数据出错:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理展开/折叠
  const handleExpand = (expanded, record) => {
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeys, record.key]);
    } else {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.key));
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card title="部门列表">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            total: data.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1150 }}
          bordered
          size="middle"
          expandable={{
            expandedRowKeys,
            expandRowByClick: false,
            expandIcon: () => null,
          }}
        />
      </Card>
    </Space>
  );
};

export default DepartmentList; 