import React from 'react';
import { EmptyStateContent } from '../../molecules';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description: string;
  style?: any;
}

const EmptyState: React.FC<EmptyStateProps> = (props) => {
  return <EmptyStateContent {...props} />;
};

export default EmptyState;
