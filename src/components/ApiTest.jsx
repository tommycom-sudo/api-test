import { Form, Input, Button, Card, Space } from 'antd';
import { useState } from 'react';

const ApiTest = () => {
  const [response, setResponse] = useState('');
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const xmlData = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:ws="http://ws.config.hihis.bsoft.com/">
        <soapenv:Header />
        <soapenv:Body>
          <ws:invoke>
            <service>ODS_setCardsInfo</service>
            <urid>${values.urid}</urid>
            <pwd>${values.pwd}</pwd>
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
      setResponse(data);
    } catch (error) {
      setResponse('请求出错：' + error.message);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card title="病人信息录入">
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item label="用户名" name="urid" rules={[{ required: true }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="密码" name="pwd" rules={[{ required: true }]}>
            <Input.Password placeholder="请输入密码" />
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
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="接口响应">
        <pre style={{ maxHeight: '400px', overflow: 'auto' }}>
          {response}
        </pre>
      </Card>
    </Space>
  );
};

export default ApiTest; 