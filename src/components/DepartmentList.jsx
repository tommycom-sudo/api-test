import { Card, Table, Space, Form, Input, Button, Row, Col } from 'antd';
import { useState, useEffect } from 'react';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';

const DepartmentList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [searchForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

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

  // 获取当前页显示的数据
  const getCurrentPageData = () => {
    const { current, pageSize } = pagination;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  };

  // 处理分页变化
  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

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
        const treeData = transformDepartments(data.data);
        setData(treeData);
        setPagination(prev => ({
          ...prev,
          total: treeData.length,
          current: 1,
        }));
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

  // 处理模糊搜索
  const handleFuzzySearch = async (values) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('orgId', '6672a56ef88a25000102d4db');
      
      // 如果有搜索关键词，添加所有搜索条件
      if (values.keyword) {
        params.append('id', values.keyword);
        params.append('code', values.keyword);
        params.append('name', values.keyword);
      }
      
      const url = `http://localhost:8080/api/departments?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('获取部门数据失败');
      }
      const data = await response.json();
      if (data.code === '0' && data.data) {
        const treeData = transformDepartments(data.data);
        setData(treeData);
        setPagination(prev => ({
          ...prev,
          total: treeData.length,
          current: 1,
        }));
      } else {
        console.error('获取部门数据格式错误:', data);
      }
    } catch (error) {
      console.error('获取部门数据出错:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card title="部门列表">
        {/* 顶部模糊搜索 */}
        <Form
          form={searchForm}
          onFinish={handleFuzzySearch}
          style={{ marginBottom: 16 }}
        >
          <Row>
            <Col flex="auto">
              <Form.Item name="keyword" style={{ marginBottom: 0 }}>
                <Input.Search
                  placeholder="请输入关键词搜索（可匹配部门ID、编码、名称）"
                  allowClear
                  enterButton
                  onSearch={(value) => searchForm.submit()}
                />
              </Form.Item>
            </Col>
            <Col flex="none" style={{ marginLeft: 8 }}>
              <Button 
                onClick={() => {
                  searchForm.resetFields();
                  fetchDepartments();
                }}
              >
                重置
              </Button>
            </Col>
          </Row>
        </Form>

        <Table
          columns={columns}
          dataSource={getCurrentPageData()}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
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