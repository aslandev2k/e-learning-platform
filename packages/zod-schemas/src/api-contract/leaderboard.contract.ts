import { initContract } from '@ts-rest/core';
import z from 'zod';
import { ErrorCode } from '../api/error.schema';
import { serverResponseSchema } from '../api/response';
import { commonZod } from '../common';
import { contestScoreboardRowSchema } from '../entity/contest-score-schema';
import { OpenAPIHelper } from '../openapi/openAPI.helper';
import { jwtAuthHeaderSchema } from './schemas/token.schema';

const c = initContract();

export const leaderboardContract = c.router({
  // === GET CONTEST LEADERBOARD ===
  getContestLeaderboard: {
    summary: 'Get contest leaderboard',
    description: 'Get the leaderboard/scoreboard for a contest',
    method: 'GET',
    path: '/api/v1/contests/:contestId/leaderboard',
    headers: jwtAuthHeaderSchema,
    pathParams: z.object({
      contestId: commonZod.pathId,
    }),
    responses: {
      200: serverResponseSchema(z.array(contestScoreboardRowSchema)),
    },
    metadata: OpenAPIHelper.generateErrorCodes(ErrorCode.Forbidden, ErrorCode.ResourcesNotFound),
  },
});

Object.values(leaderboardContract).forEach((contract) => {
  if (!contract.path.startsWith('/api/v1'))
    throw Error(`'${contract.summary}': path must be start with '/api/v1'`);
});
