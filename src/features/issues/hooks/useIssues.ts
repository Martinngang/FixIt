import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

export const useIssues = () => {
  const issues = useSelector((state: RootState) => state.issues.issues);
  return { issues };
};