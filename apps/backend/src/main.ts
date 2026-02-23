import bodyParser from 'body-parser';
import express, { type Express } from 'express';
import { corsConfig } from '@/config/cors.config';
import { envData } from '@/env-data';
import { errorHandler } from '@/middlewares/errorHandler.middleware';
import { responseJsonValidation } from '@/middlewares/responseJsonValidation';
import { responseRedirectLogger } from '@/middlewares/responseRedirectLogger';
import { responseStatusLogger } from '@/middlewares/responseStatusLogger';
import { createAdminEndpoint } from './routes/admin.router';
import { createAuthEndpoint } from './routes/auth.router';
import { createContestEndpoint } from './routes/contest.router';
import { createContestProblemEndpoint } from './routes/contest-problem.router';
import { createLeaderboardEndpoint } from './routes/leaderboard.router';
import { createProblemEndpoint } from './routes/problem.router';
import { createRoomEndpoint } from './routes/room.router';
import { createRoomMemberEndpoint } from './routes/room-member.router';
import { createSubmissionEndpoint } from './routes/submission.router';
import { createTestcaseEndpoint } from './routes/testcase.router';
import { createUserEndpoint } from './routes/user.router';
import { logger } from './utils/logger';

const app: Express = express();

app
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(corsConfig)
  .use(responseStatusLogger)
  .use(responseJsonValidation)
  .use(responseRedirectLogger);

createAuthEndpoint(app);
createAdminEndpoint(app);
createUserEndpoint(app);
createRoomEndpoint(app);
createRoomMemberEndpoint(app);
createContestEndpoint(app);
createContestProblemEndpoint(app);
createProblemEndpoint(app);
createTestcaseEndpoint(app);
createSubmissionEndpoint(app);
createLeaderboardEndpoint(app);

app.use(errorHandler);

app.listen(envData.PORT, () => {
  logger.info(`Server is running at http://localhost:${envData.PORT}`);
});
