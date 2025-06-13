import React, { useState } from 'react';
import { setupUsers } from '../utils/setupUsers';
import styled from '@emotion/styled';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%);
  color: white;
  padding: 2rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  text-align: center;
`;

const Button = styled.button`
  padding: 0.75rem 2rem;
  margin-top: 1rem;
  border: none;
  border-radius: 8px;
  background: #4299e1;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #3182ce;
  }

  &:disabled {
    background: #718096;
    cursor: not-allowed;
  }
`;

const Setup = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    setStatus('Setting up users...');
    
    try {
      await setupUsers();
      setStatus('Setup completed successfully! You can now go to the login page.');
    } catch (error) {
      setStatus(`Error during setup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <h1>SMIS Initial Setup</h1>
        <p>This page will create the initial users in the system.</p>
        <Button onClick={handleSetup} disabled={loading}>
          {loading ? 'Setting up...' : 'Start Setup'}
        </Button>
        {status && <p>{status}</p>}
      </Card>
    </Container>
  );
};

export default Setup; 