import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-2xl font-semibold">Authenticating...</div>
    </div>
  );
};

export default OAuthCallbackPage;
