import type { ChangeEvent, ComponentProps, FC } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useDebouncedCallback } from 'use-debounce';
import { m } from '@/paraglide/messages';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group.tsx';
import { IconX } from '@tabler/icons-react';

interface IProps extends ComponentProps<typeof InputGroup> {
}

export const SearchByNameInput: FC<IProps> = (props) => {
  const navigate = useNavigate({ from: '/products/' });
  const searchName = useSearch({ from: '/_public/products/', select: (search) => search.name ?? '' });
  const [value, setValue] = useState(searchName);

  useEffect(() => setValue(searchName), [searchName]);

  const updateSearch = useDebouncedCallback((name: string) => {
    const newValue = name ? name : undefined;
    void navigate({
      search: (prev) => ({ ...prev, name: newValue }),
      replace: true
    });
  }, 300);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;

    setValue(nextValue);
    updateSearch(nextValue);
  };

  const reset = () => {
    setValue('');
    updateSearch('');
  }

  return (
    <InputGroup {...props}>
      <InputGroupInput
        value={value}
        onChange={onChange}
        placeholder={m['components.shop.search_placeholder']()}
        aria-label={m['components.shop.search_placeholder']()}
      />

      {value && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={reset} size="icon-xs">
            <IconX/>
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
};