import React from 'react';
import { LoadingContent } from '../../molecules';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  style?: any;
}

const LoadingState: React.FC<LoadingStateProps> = (props) => {
  return <LoadingContent {...props} />;
};

export default LoadingState;
