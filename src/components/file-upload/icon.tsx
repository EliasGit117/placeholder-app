import type { IFileMetadata } from 'src/hooks/use-file-upload.ts';
import {
  IconFileExcel,
  IconFileText,
  IconFileWord,
  IconFileZip,
  IconHeadphones,
  IconPhoto,
  IconVideo
} from '@tabler/icons-react';
import type { FC } from 'react';

interface IFileIconProps {
  file: File | IFileMetadata;
  className?: string;
}

const rules: [test: (t: string) => boolean, icon: typeof IconFileText][] = [
  [t => t.startsWith('image/'), IconPhoto],
  [t => t.startsWith('video/'), IconVideo],
  [t => t.startsWith('audio/'), IconHeadphones],
  [t => t.includes('pdf'), IconFileText],
  [t => t.includes('word') || t.includes('doc'), IconFileWord],
  [t => t.includes('excel') || t.includes('sheet'), IconFileExcel],
  [t => t.includes('zip') || t.includes('rar'), IconFileZip]
];

export const FileIcon: FC<IFileIconProps> = ({ file: { type }, ...props }) => {
  const Icon = rules.find(([test]) => test(type))?.[1] ?? IconFileText;
  return <Icon {...props}/>;
};