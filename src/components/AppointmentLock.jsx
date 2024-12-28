import { Form, Input, Button, Card, Space } from 'antd';
import { Table, Tabs } from 'antd';
import { useState, useEffect } from 'react';
import vkbeautify from 'vkbeautify';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// 注册 XML 语言支持
SyntaxHighlighter.registerLanguage('xml', xml);

// localStorage 的 key
const LOCK_FORM_KEY = 'appointment_lock_form_data';

const AppointmentLock = ({ defaultValues }) => {
  const [response, setResponse] = useState('');
  const [form] = Form.useForm();

  // 固定的密码值
  const DEFAULT_PASSWORD = '123456';

  // 组件加载时从 localStorage 读取上次的输入
  useEffect(() => {
    const savedData = localStorage.getItem(LOCK_FORM_KEY);
    if (savedData) {
      form.setFieldsValue(JSON.parse(savedData));
    }
  }, []);

  // 处理传入的默认值
  useEffect(() => {
    if (defaultValues) {
      form.setFieldsValue(defaultValues);
    }
  }, [defaultValues]);

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

  const onFinish = async (values) => {
    // 保存表单数据到 localStorage
    localStorage.setItem(LOCK_FORM_KEY, JSON.stringify(values));

    const xmlData = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.config.hihis.bsoft.com/">  
        <soapenv:Header/>  
        <soapenv:Body> 
          <ws:invoke> 
            <service>ODS_ConfirmAppointment</service>  
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
                    <ChannelCode></ChannelCode>         
                    <MPI></MPI>         
                    <Operator>SF001</Operator>
                    <SourcePatientId>${values.sourcePatientId}</SourcePatientId>         
                    <OutpatientType>yyqd45585728900001</OutpatientType>         
                    <IdCardCode></IdCardCode>         
                    <IdCard>${values.idCard}</IdCard>         
                    <Name>${values.name}</Name>         
                    <MedicalCardType></MedicalCardType>         
                    <MedicalCardId></MedicalCardId>         
                    <PatientMobile>${values.mobile}</PatientMobile>         
                    <Age></Age>         
                    <AgeUnit></AgeUnit>         
                    <Sex>${values.sex}</Sex>         
                    <PatientAddress></PatientAddress>         
                    <GuarderIdCard></GuarderIdCard>         
                    <GuarderIdCardCode></GuarderIdCardCode>         
                    <GuarderName></GuarderName>         
                    <RequestDoctor></RequestDoctor>         
                    <DeptCode></DeptCode>         
                    <ResourcesId>${values.resourcesId}</ResourcesId>         
                    <SystemAppointmentDateTime></SystemAppointmentDateTime>         
                    <AppointmentStatus></AppointmentStatus>         
                    <AppointmentStatusDescription></AppointmentStatusDescription>         
                    <EmployeeAppointmentD>${values.appointmentDate}</EmployeeAppointmentD>         
                    <ResourceEndDateTime></ResourceEndDateTime>         
                    <ResourceStartDateTime></ResourceStartDateTime>         
                    <RegisteredCost></RegisteredCost>         
                    <ExaminationCost></ExaminationCost>         
                    <DoctorCost></DoctorCost>         
                    <CardCost></CardCost>         
                    <BookCost></BookCost>         
                    <AppointsRoute></AppointsRoute>         
                    <OperateDateTime></OperateDateTime>         
                    <RegisterOperator></RegisterOperator>         
                    <ScheduleMark>${values.scheduleMark}</ScheduleMark>      
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
      setResponse(formatXMLResponse(data));
    } catch (error) {
      setResponse('请求出错：' + error.message);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card title="预约锁号">
        <Form 
          form={form} 
          onFinish={onFinish} 
          layout="vertical"
          onReset={() => {
            localStorage.removeItem(LOCK_FORM_KEY);
            form.resetFields();
          }}
        >
          <Form.Item label="用户名" name="urid" rules={[{ required: true }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="患者ID" name="sourcePatientId" rules={[{ required: true }]}>
            <Input placeholder="请输入患者ID" />
          </Form.Item>
          <Form.Item label="身份证号" name="idCard" rules={[{ required: true }]}>
            <Input placeholder="请输入身份证号" />
          </Form.Item>
          <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item label="手机号" name="mobile" rules={[{ required: true }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="性别" name="sex" rules={[{ required: true }]}>
            <Input placeholder="请输入性别代码(1-男,2-女)" />
          </Form.Item>
          <Form.Item label="资源ID" name="resourcesId" rules={[{ required: true }]}>
            <Input placeholder="请输入资源ID" />
          </Form.Item>
          <Form.Item label="预约日期时间" name="appointmentDate" rules={[{ required: true }]}>
            <Input placeholder="格式：YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item label="排班标记" name="scheduleMark" rules={[{ required: true }]}>
            <Input placeholder="请输入排班标记" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
              <Button htmlType="reset">
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title="接口响应">
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
      </Card>
    </Space>
  );
};

export default AppointmentLock; 