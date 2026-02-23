import { SearchIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import ClearInputButton from '@/components/common/clear-input-button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { useIsMobile } from '@/hooks/use-mobile';

const SearchInput = ({
  defaultValue,
  onInputChange,
  placeholder = 'Tìm kiếm...',
  className,
}: {
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  onInputChange: (query?: string) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);

  const isMobile = useIsMobile();

  const [searchValue, setSearchValue] = useState(defaultValue);

  const clearInput = useCallback(() => {
    if (ref.current) ref.current.value = '';
    setSearchValue('');
  }, []);

  useEffect(() => {
    if (defaultValue !== searchValue) onInputChange(searchValue);
  }, [searchValue, onInputChange, defaultValue]);

  return (
    <InputGroup className={className}>
      <InputGroupInput
        placeholder={placeholder}
        name='query'
        autoComplete='off'
        defaultValue={defaultValue}
        className='pl-9 h-8 pr-9'
        onKeyDown={(e) => {
          if (e.key.toLowerCase() === 'escape') {
            clearInput();
            if (searchValue === '') return ref.current!.blur();
          }
        }}
        onChange={(e) => {
          setSearchValue(e.target.value);
        }}
        autoFocus={!isMobile}
        ref={ref}
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      {searchValue?.trim() && (
        <InputGroupAddon align='inline-end'>
          <ClearInputButton onClear={clearInput} />
        </InputGroupAddon>
      )}
    </InputGroup>
  );
};

export default SearchInput;
