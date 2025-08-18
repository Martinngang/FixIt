import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

export const useAdmin = () => {
  const issues = useSelector((state: RootState) => state.issues.issues);
  return { issues };
};