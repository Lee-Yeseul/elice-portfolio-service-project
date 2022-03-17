import React, { useEffect, useState } from 'react';
import { Card, Button, Col, Row } from 'react-bootstrap';

import CertificateAddForm from './CertificateAddForm';
import CertificateList from './CertificateList';
import * as Api from '../../api';

const initCertificateList = [
  {
    title: '제목예시1',
    description: '내용 예시1',
    whenDate: '2022.03.15',
  },
  {
    title: '제목예시2',
    description: '내용 예시2',
    whenDate: '2022.03.15',
  },
  {
    title: '제목예시3',
    description: '내용 예시3',
    whenDate: '2022.03.15',
  },
];

function Certificate({ portfolioOwnerId, isEditable }) {
  const [isAdding, setIsAdding] = useState(false);
  // const [isEditing, setIsEditing] = useState(false);
  // useState 훅을 통해 certificate 상태를 생성함
  const [certificate, setCertificate] = useState(initCertificateList);

  useEffect(() => {
    // "certificates/유저id" 엔드포인트로 GET 요청을 하고, certificate를 response의 data로 세팅함.
    Api.get('certificates', portfolioOwnerId).then((res) =>
      setCertificate(res.data)
    );
  }, [portfolioOwnerId]);

  return (
    <>
      <Card style={{ width: '100%' }}>
        <Card.Body>
          <Card.Title>자격증</Card.Title>
          <Card.Text>
            <CertificateList
              certificate={certificate}
              isEditable={isEditable}
              setCertificate={setCertificate}
            />
          </Card.Text>
          {isEditable && (
            <Col>
              <Row className='mt-3 text-center text-info my-3'>
                <Col sm={{ span: 20 }}>
                  <Button
                    variant='primary'
                    size='md'
                    onClick={() => setIsAdding(true)}
                  >
                    +
                  </Button>
                </Col>
              </Row>
            </Col>
          )}
          {isAdding ? (
            <CertificateAddForm
              portfolioOwnerId={portfolioOwnerId}
              setIsAdding={setIsAdding}
              setCertificate={setCertificate}
            />
          ) : (
            <></>
          )}
        </Card.Body>
      </Card>
    </>
  );
}

export default Certificate;