import React from 'react';
import { SearchInput } from '../../molecules';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: any;
}

const SearchBar: React.FC<SearchBarProps> = (props) => {
  return <SearchInput {...props} />;
};

export default SearchBar;
