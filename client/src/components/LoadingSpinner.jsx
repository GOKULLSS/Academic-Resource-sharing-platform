import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const LoadingSpinner = ({ message = "Loading...", minHeight = "50vh" }) => {
  return (
    <Container 
      className="d-flex flex-column justify-content-center align-items-center w-100" 
      style={{ minHeight }}
    >
      <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      <h5 className="mt-3 text-muted">{message}</h5>
    </Container>
  );
};

export default LoadingSpinner;
