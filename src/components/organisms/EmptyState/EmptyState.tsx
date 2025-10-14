import React from 'react';
import { EmptyStateContent } from '../../molecules';
import {EmptyStateContentProps} from "../../molecules/EmptyStateContent/EmptyStateContent";

interface EmptyStateProps extends EmptyStateContentProps {}

const EmptyState: React.FC<EmptyStateProps> = (props) => {
  return <EmptyStateContent {...props} />;
};

export default EmptyState;
