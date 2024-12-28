import { Form, Input, Button, Card, Space } from 'antd';
import { useState, useEffect } from 'react';
import vkbeautify from 'vkbeautify';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// 注册 XML 语言支持
SyntaxHighlighter.registerLanguage('xml', xml);

// localStorage 的 key
const FORM_DATA_KEY = 'api_test_form_data';

const ApiTest = () => {
  const [response, setResponse] = useState('');
  const [form] = Form.useForm();

  // 固定的密码值
  const DEFAULT_PASSWORD = '123456';

  // 组件加载时从 localStorage 读取上次的输入
  useEffect(() => {
    const savedData = localStorage.getItem(FORM_DATA_KEY);
    if (savedData) {
      form.setFieldsValue(JSON.parse(savedData));
    }
  }, []);

  // 格式化 XML 响应
  const formatXMLResponse = (xmlString) => {
    try {
      // 将 XML 字符串中的特殊字符转换回实体
      const decodedXml = xmlString
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
      // 格式化 XML
      return vkbeautify.xml(decodedXml);
    } catch (error) {
      return xmlString;
    }
  };

  const onFinish = async (values) => {
    // 保存表单数据到 localStorage，但排除密码字段
    const dataToSave = { ...values };
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(dataToSave));

    const xmlData = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:ws="http://ws.config.hihis.bsoft.com/">
        <soapenv:Header />
        <soapenv:Body>
          <ws:invoke>
            <service>ODS_setCardsInfo</service>
            <urid>${values.urid}</urid>
            <pwd>${DEFAULT_PASSWORD}</pwd>
            <parameter>
              <![CDATA[
                <BSXml>
                  <MsgHeader>
                    <Sender>SORS</Sender>
                    <MsgType>MSG_0101</MsgType>
                    <MsgVersion>3.0</MsgVersion>
                  </MsgHeader>
                  <MsgBody>
                    <MedicalCardInfos>
                      <IdCard>${values.idCard}</IdCard>
                      <Name>${values.name}</Name>
                      <Sex DisplayName="${values.sex}">${values.sex}</Sex>
                      <BirthDate>${values.birthDate}</BirthDate>
                      <!-- 其他字段可以根据需要添加 -->
                    </MedicalCardInfos>
                  </MsgBody>
                </BSXml>
              ]]>
            </parameter>
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
      <Card title="病人信息录入">
        <Form 
          form={form} 
          onFinish={onFinish} 
          layout="vertical"
          onReset={() => {
            localStorage.removeItem(FORM_DATA_KEY);
            form.resetFields();
          }}
        >
          <Form.Item label="用户名" name="urid" rules={[{ required: true }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="身份证号" name="idCard" rules={[{ required: true }]}>
            <Input placeholder="请输入身份证号" />
          </Form.Item>
          <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item label="性别" name="sex" rules={[{ required: true }]}>
            <Input placeholder="请输入性别代码" />
          </Form.Item>
          <Form.Item label="出生日期" name="birthDate" rules={[{ required: true }]}>
            <Input placeholder="格式：YYYY-MM-DD" />
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

      <Card 
        title="接口响应" 
        bodyStyle={{ 
          padding: 0,
          margin: 0,
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
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
      </Card>
    </Space>
  );
};

export default ApiTest; 