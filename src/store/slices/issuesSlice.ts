import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Issue } from '../../types/issue';

interface IssuesState {
  issues: Issue[];
}

const initialState: IssuesState = {
  issues: [
    { id: 1, description: 'Pothole on Main St', category: 'Road', location: '4.0511, 9.7085', status: 'Received', image: null },
    { id: 2, description: 'Broken streetlight', category: 'Electricity', location: '4.0522, 9.7090', status: 'In Progress', image: null },
  ],
};

const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    addIssue: (state, action: PayloadAction<Issue>) => {
      state.issues.push({ ...action.payload, id: state.issues.length + 1 });
    },
    updateIssueStatus: (state, action: PayloadAction<{ id: number; status: Issue['status'] }>) => {
      const issue = state.issues.find(i => i.id === action.payload.id);
      if (issue) issue.status = action.payload.status;
    },
  },
});

export const { addIssue, updateIssueStatus } = issuesSlice.actions;
export default issuesSlice.reducer;