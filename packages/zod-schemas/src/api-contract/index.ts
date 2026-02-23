import { initContract } from '@ts-rest/core';
import { adminContract } from './admin.contract';
import { authContract } from './auth.contract';
import { contestContract } from './contest.contract';
import { contestProblemContract } from './contest-problem.contract';
import { leaderboardContract } from './leaderboard.contract';
import { problemContract } from './problem.contract';
import { roomContract } from './room.contract';
import { roomMemberContract } from './room-member.contract';
import { submissionContract } from './submission.contract';
import { testcaseContract } from './testcase.contract';
import { userContract } from './user.contract';

const c = initContract();

export const appContract = c.router({
  Auth: authContract,
  Admin: adminContract,
  User: userContract,
  Room: roomContract,
  RoomMember: roomMemberContract,
  Contest: contestContract,
  ContestProblem: contestProblemContract,
  Problem: problemContract,
  Testcase: testcaseContract,
  Submission: submissionContract,
  Leaderboard: leaderboardContract,
});
