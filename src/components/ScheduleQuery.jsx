import { Form, Input, Button, Card, Space, DatePicker } from 'antd';
import { Table, Tabs } from 'antd';
import { useState, useEffect } from 'react';
import vkbeautify from 'vkbeautify';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import dayjs from 'dayjs';

// 注册 XML 语言支持
SyntaxHighlighter.registerLanguage('xml', xml);

// localStorage 的 key
const SCHEDULE_FORM_KEY = 'schedule_query_form_data';

const ScheduleQuery = () => {
  const [response, setResponse] = useState('');
  const [tableData, setTableData] = useState([]);
  const [form] = Form.useForm();

  // 固定的密码值
  const DEFAULT_PASSWORD = '123456';

  // 组件加载时从 localStorage 读取上次的输入
  useEffect(() => {
    const savedData = localStorage.getItem(SCHEDULE_FORM_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // 转换日期字符串为 dayjs 对象
      if (parsedData.visitDate) {
        parsedData.visitDate = dayjs(parsedData.visitDate);
      }
      form.setFieldsValue(parsedData);
    }
  }, []);

  // 格式化 XML 响应
  const formatXMLResponse = (xmlString) => {
    try {
      const decodedXml = xmlString
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
      return vkbeautify.xml(decodedXml);
    } catch (error) {
      return xmlString;
    }
  };

  // 解析XML响应为表格数据
  const parseXMLToTableData = (xmlString) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      console.log('1. 解析后的 XML 文档:', xmlDoc);
      
      // 逐层获取节点
      const returnNode = xmlDoc.getElementsByTagName('return')[0];
      console.log('2. return 节点:', returnNode);
      if (!returnNode) return [];
      
      // 获取 return 节点的文本内容并解析为新的 XML 文档
      const returnContent = returnNode.textContent;
      console.log('2.1 return 节点内容:', returnContent);
      
      const bsXmlDoc = parser.parseFromString(returnContent, "text/xml");
      console.log('2.2 解析后的 BSXml 文档:', bsXmlDoc);
      
      const bsXml = bsXmlDoc.getElementsByTagName('BSXml')[0];
      console.log('3. BSXml 节点:', bsXml);
      if (!bsXml) return [];
      
      const msgBody = bsXml.getElementsByTagName('MsgBody')[0];
      console.log('4. MsgBody 节点:', msgBody);
      if (!msgBody) return [];
      
      const data = msgBody.getElementsByTagName('Data')[0];
      console.log('5. Data 节点:', data);
      if (!data) return [];
      
      const schedules = data.getElementsByTagName('Schedules')[0]?.getElementsByTagName('Schedule')[0];
      console.log('6. Schedule 节点:', schedules);
      if (!schedules) return [];
      
      // 获取基本信息
      const baseInfo = {
        doctorName: schedules.getElementsByTagName('DoctorName')[0]?.textContent || '-',
        deptName: schedules.getElementsByTagName('DeptName')[0]?.textContent || '-',
        visitDate: schedules.getElementsByTagName('VisitDate')[0]?.textContent?.split(' ')[0] || '-',
        registerCost: schedules.getElementsByTagName('RegisteredCost')[0]?.textContent || '0',
      };
      console.log('7. 解析的基本信息:', baseInfo);
      
      // 获取时间段信息
      const timeFramesContainer = schedules.getElementsByTagName('TimeFrames')[0];
      console.log('8. TimeFrames 容器:', timeFramesContainer);
      const timeFrames = timeFramesContainer ? Array.from(timeFramesContainer.getElementsByTagName('TimeFrame')) : [];
      console.log('9. 找到的时间段数组:', timeFrames);
      
      // 将每个时间段转换为一行数据
      const result = timeFrames.map((timeFrame, index) => {
        console.log(`10. 处理第 ${index + 1} 个时间段:`, timeFrame);
        const startTime = timeFrame.getElementsByTagName('ScheduleStartDateTime')[0]?.textContent?.split(' ')[1]?.slice(0, 5) || '';
        const endTime = timeFrame.getElementsByTagName('ScheduleEndDateTime')[0]?.textContent?.split(' ')[1]?.slice(0, 5) || '';
        
        const item = {
          key: index,
          ...baseInfo,
          timeRange: `${startTime}-${endTime}`,
          remainingNumber: timeFrame.getElementsByTagName('RemainingQuantity')[0]?.textContent || '0',
          totalNumber: timeFrame.getElementsByTagName('ResourceSlotResourceSumTotal')[0]?.textContent || '0',
          fee: baseInfo.registerCost,
        };
        console.log(`11. 第 ${index + 1} 个时间段解析结果:`, item);
        return item;
      });
      
      console.log('12. 最终解析结果:', result);
      return result;
      
    } catch (error) {
      console.error('解析XML失败:', error);
      console.error('原始XML:', xmlString);
      console.error('错误堆栈:', error.stack);
      return [];
    }
  };

  // 定义表格列
  const columns = [
    {
      title: '医生姓名',
      dataIndex: 'doctorName',
      key: 'doctorName',
    },
    {
      title: '科室名称',
      dataIndex: 'deptName',
      key: 'deptName',
    },
    {
      title: '就诊日期',
      dataIndex: 'visitDate',
      key: 'visitDate',
    },
    {
      title: '时间段',
      dataIndex: 'timeRange',
      key: 'timeRange',
    },
    {
      title: '总号源数',
      dataIndex: 'totalNumber',
      key: 'totalNumber',
    },
    {
      title: '剩余号源',
      dataIndex: 'remainingNumber',
      key: 'remainingNumber',
    },
    {
      title: '挂号费',
      dataIndex: 'fee',
      key: 'fee',
      render: (text) => `¥${text}`,
    },
  ];

  const onFinish = async (values) => {
    // 保存表单数据到 localStorage
    const dataToSave = { ...values };
    if (dataToSave.visitDate) {
      dataToSave.visitDate = dataToSave.visitDate.format('YYYY-MM-DD');
    }
    localStorage.setItem(SCHEDULE_FORM_KEY, JSON.stringify(dataToSave));

    const xmlData = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.config.hihis.bsoft.com/">  
        <soapenv:Header/>  
        <soapenv:Body> 
          <ws:invoke> 
            <service>ODS_ListNumber</service>  
            <urid>${values.urid}</urid>  
            <pwd>${DEFAULT_PASSWORD}</pwd>  
            <parameter><![CDATA[<?xml version="1.0" encoding="utf-8"?> 
              <BSXml> 
                <MsgHeader>  
                  <Sender>SORS</Sender>  
                  <MsgType>MSG_0101</MsgType>  
                  <MsgVersion>3.0</MsgVersion> 
                </MsgHeader> 
                <MsgBody>     
                  <Query>          
                    <VisitOrganization>455857289</VisitOrganization>         
                    <DeptName></DeptName>         
                    <DeptCode>${values.deptCode}</DeptCode>         
                    <DoctorCode>${values.doctorCode}</DoctorCode>         
                    <ResourceLevelCode></ResourceLevelCode>         
                    <ResourceLevelName></ResourceLevelName>         
                    <DcotorIdcard></DcotorIdcard>         
                    <DoctorName></DoctorName>         
                    <ResourceLevelCode></ResourceLevelCode>         
                    <VisitDate>${values.visitDate.format('YYYY-MM-DD')} 00:00:00</VisitDate>         
                    <DoctorDutyType></DoctorDutyType>                 
                    <ScheduleMark></ScheduleMark>      
                    <OutpatientType>yyqd45585728900001</OutpatientType>
                  </Query>  
                </MsgBody>
              </BSXml>
            ]]></parameter> 
          </ws:invoke> 
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    try {
      const response = await fetch('/api/hai/WebServiceEntry', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
        },
        body: xmlData,
      });
      const data = await response.text();
      console.log('API响应:', parseXMLToTableData(data));
      const formattedXML = formatXMLResponse(data);
      setResponse(formattedXML);
      setTableData(parseXMLToTableData(data));
    } catch (error) {
      setResponse('请求出错：' + error.message);
      setTableData([]);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card title="号源排班查询">
        <Form 
          form={form} 
          onFinish={onFinish} 
          layout="vertical"
          onReset={() => {
            localStorage.removeItem(SCHEDULE_FORM_KEY);
            form.resetFields();
          }}
        >
          <Form.Item label="用户名" name="urid" rules={[{ required: true }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="科室代码" name="deptCode" rules={[{ required: true }]}>
            <Input placeholder="请输入科室代码" />
          </Form.Item>
          <Form.Item label="医生代码" name="doctorCode" rules={[{ required: true }]}>
            <Input placeholder="请输入医生代码" />
          </Form.Item>
          <Form.Item label="就诊日期" name="visitDate" rules={[{ required: true }]}>
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
              placeholder="请选择就诊日期"
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button htmlType="reset">
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title="查询结果">
        <Tabs
          items={[
            {
              key: 'table',
              label: '表格视图',
              children: (
                <Table
                  columns={columns}
                  dataSource={tableData}
                  pagination={false}
                  scroll={{ x: true }}
                  locale={{
                    emptyText: '暂无数据'
                  }}
                />
              ),
            },
            {
              key: 'xml',
              label: 'XML视图',
              children: (
                <div style={{ 
                  padding: 0,
                  margin: 0,
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <SyntaxHighlighter
                    language="xml"
                    style={vs2015}
                    customStyle={{
                      margin: 0,
                      maxHeight: '400px',
                      fontSize: '14px',
                    }}
                    showLineNumbers={true}
                  >
                    {response || '等待请求...'}
                  </SyntaxHighlighter>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </Space>
  );
};

export default ScheduleQuery; 