import { PrismaPg } from '@prisma/adapter-pg';
import { envData } from '@/env-data';
import { logger } from '@/utils/logger';
import { PrismaClient, type Role } from '../src/generated/prisma';
import { PasswordService } from '../src/services/password.service';

const adapter = new PrismaPg({ connectionString: envData.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Main seed function ───────────────────────────────────────────────────────

async function main() {
  const passwordHash = await PasswordService.hashPassword('123456');

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. USERS (1 admin, 2 teachers, 10 students)
  // ═══════════════════════════════════════════════════════════════════════════
  const usersToCreate: { email: string; displayName: string; role: Role }[] = [
    { email: 'admin@elp.local', displayName: 'Admin', role: 'ADMIN' },
    { email: 'teacher1@elp.local', displayName: 'Nguyễn Văn An', role: 'TEACHER' },
    { email: 'teacher2@elp.local', displayName: 'Trần Thị Bình', role: 'TEACHER' },
    ...Array.from({ length: 10 }, (_, i) => ({
      email: `student${i + 1}@elp.local`,
      displayName: `Sinh viên ${i + 1}`,
      role: 'STUDENT' as Role,
    })),
  ];

  const createdUsers: { id: number; email: string; role: Role }[] = [];

  for (const u of usersToCreate) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, displayName: u.displayName },
      create: {
        email: u.email,
        passwordHash,
        displayName: u.displayName,
        role: u.role,
        status: 'ACTIVE',
        emailVerified: true,
      },
    });
    createdUsers.push({ id: user.id, email: user.email, role: user.role });
  }

  logger.info(`Seed: ${createdUsers.length} users created (password: 123456)`);

  const teachers = createdUsers.filter((u) => u.role === 'TEACHER');
  const students = createdUsers.filter((u) => u.role === 'STUDENT');

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. ROOMS (3 rooms)
  // ═══════════════════════════════════════════════════════════════════════════
  const roomNames = [
    { name: 'Lập trình C++ cơ bản', desc: 'Phòng luyện tập C++ cho người mới bắt đầu' },
    { name: 'Thuật toán nâng cao', desc: 'Phòng luyện tập thuật toán và cấu trúc dữ liệu' },
    { name: 'Python Practice', desc: 'Phòng luyện tập Python' },
  ];

  const createdRooms: { id: number }[] = [];
  for (let i = 0; i < roomNames.length; i++) {
    const room = await prisma.room.create({
      data: {
        name: roomNames[i].name,
        description: roomNames[i].desc,
        ownerId: teachers[i % teachers.length].id,
      },
    });
    createdRooms.push({ id: room.id });
  }

  logger.info(`Seed: ${createdRooms.length} rooms created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ROOM MEMBERS (add students to rooms)
  // ═══════════════════════════════════════════════════════════════════════════
  let memberCount = 0;
  for (const room of createdRooms) {
    for (const student of students) {
      if (Math.random() > 0.3) {
        await prisma.roomMember.create({
          data: { roomId: room.id, userId: student.id },
        });
        memberCount++;
      }
    }
  }

  logger.info(`Seed: ${memberCount} room members created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. PROBLEMS (10 problems spread across rooms)
  // ═══════════════════════════════════════════════════════════════════════════
  const problemTemplates = [
    {
      title: 'Tổng hai số',
      statement: 'Cho hai số nguyên a và b. Tính tổng a + b.',
      inputSpec: 'Một dòng chứa hai số nguyên a, b (|a|, |b| ≤ 10^9)',
      outputSpec: 'In ra tổng a + b',
      timeLimitMs: 1000,
      memoryLimitKb: 262144,
    },
    {
      title: 'Số nguyên tố',
      statement: 'Cho số nguyên n. Kiểm tra n có phải số nguyên tố hay không.',
      inputSpec: 'Một dòng chứa số nguyên n (2 ≤ n ≤ 10^9)',
      outputSpec: 'In "YES" nếu n là số nguyên tố, "NO" ngược lại',
      timeLimitMs: 1000,
      memoryLimitKb: 262144,
    },
    {
      title: 'Fibonacci',
      statement: 'Cho số nguyên n. Tính số Fibonacci thứ n.',
      inputSpec: 'Một dòng chứa số nguyên n (0 ≤ n ≤ 45)',
      outputSpec: 'In ra số Fibonacci thứ n',
      timeLimitMs: 1000,
      memoryLimitKb: 262144,
    },
    {
      title: 'Sắp xếp mảng',
      statement: 'Cho mảng n số nguyên. Sắp xếp mảng theo thứ tự tăng dần.',
      inputSpec: 'Dòng 1: n (1 ≤ n ≤ 10^5). Dòng 2: n số nguyên',
      outputSpec: 'In mảng đã sắp xếp',
      timeLimitMs: 2000,
      memoryLimitKb: 262144,
    },
    {
      title: 'Tìm kiếm nhị phân',
      statement:
        'Cho mảng n số nguyên đã sắp xếp và q truy vấn. Với mỗi truy vấn, tìm vị trí xuất hiện đầu tiên của x trong mảng.',
      inputSpec: 'Dòng 1: n, q. Dòng 2: n số. Dòng 3..q+2: mỗi dòng chứa x',
      outputSpec: 'Với mỗi truy vấn, in vị trí hoặc -1',
      timeLimitMs: 2000,
      memoryLimitKb: 262144,
    },
    {
      title: 'Đếm ký tự',
      statement: 'Cho chuỗi s. Đếm số lần xuất hiện của mỗi ký tự.',
      inputSpec: 'Một dòng chứa chuỗi s (|s| ≤ 10^5)',
      outputSpec: 'In các ký tự và số lần xuất hiện theo thứ tự bảng chữ cái',
      timeLimitMs: 1000,
      memoryLimitKb: 262144,
    },
    {
      title: 'GCD và LCM',
      statement: 'Cho hai số nguyên dương a, b. Tính ƯCLN và BCNN.',
      inputSpec: 'Một dòng chứa hai số a, b (1 ≤ a, b ≤ 10^9)',
      outputSpec: 'In ƯCLN và BCNN trên một dòng, cách nhau bởi dấu cách',
      timeLimitMs: 1000,
      memoryLimitKb: 262144,
    },
    {
      title: 'Đảo chuỗi',
      statement: 'Cho chuỗi s. In chuỗi đảo ngược.',
      inputSpec: 'Một dòng chứa chuỗi s (|s| ≤ 10^5)',
      outputSpec: 'In chuỗi đảo ngược',
      timeLimitMs: 1000,
      memoryLimitKb: 262144,
    },
    {
      title: 'Ma trận xoắn ốc',
      statement: 'Cho số nguyên n. In ma trận n×n theo dạng xoắn ốc.',
      inputSpec: 'Một dòng chứa n (1 ≤ n ≤ 100)',
      outputSpec: 'In ma trận xoắn ốc n×n',
      timeLimitMs: 1000,
      memoryLimitKb: 262144,
    },
    {
      title: 'Dãy con tăng dài nhất',
      statement: 'Cho dãy n số nguyên. Tìm độ dài dãy con tăng dài nhất (LIS).',
      inputSpec: 'Dòng 1: n (1 ≤ n ≤ 10^5). Dòng 2: n số nguyên',
      outputSpec: 'In độ dài LIS',
      timeLimitMs: 2000,
      memoryLimitKb: 262144,
    },
  ];

  const createdProblems: { id: number; roomId: number }[] = [];
  for (let i = 0; i < problemTemplates.length; i++) {
    const tpl = problemTemplates[i];
    const room = createdRooms[i % createdRooms.length];
    const problem = await prisma.problem.create({
      data: {
        title: tpl.title,
        statement: tpl.statement,
        inputSpec: tpl.inputSpec,
        outputSpec: tpl.outputSpec,
        timeLimitMs: tpl.timeLimitMs,
        memoryLimitKb: tpl.memoryLimitKb,
        status: 'PUBLISHED',
        roomId: room.id,
      },
    });
    createdProblems.push({ id: problem.id, roomId: room.id });
  }

  logger.info(`Seed: ${createdProblems.length} problems created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. TEST CASES (3-5 per problem)
  // ═══════════════════════════════════════════════════════════════════════════
  let testCaseCount = 0;
  const sampleTestCases: Record<string, { input: string; output: string }[]> = {
    'Tổng hai số': [
      { input: '1 2', output: '3' },
      { input: '-5 10', output: '5' },
      { input: '0 0', output: '0' },
      { input: '1000000000 1000000000', output: '2000000000' },
    ],
    'Số nguyên tố': [
      { input: '2', output: 'YES' },
      { input: '7', output: 'YES' },
      { input: '4', output: 'NO' },
      { input: '1000000007', output: 'YES' },
    ],
    Fibonacci: [
      { input: '0', output: '0' },
      { input: '1', output: '1' },
      { input: '10', output: '55' },
      { input: '45', output: '1134903170' },
    ],
  };

  for (const problem of createdProblems) {
    const idx = createdProblems.indexOf(problem);
    const specificTests = sampleTestCases[problemTemplates[idx]?.title];
    const tests = specificTests || [
      { input: '1\n2\n', output: '1\n' },
      { input: '5\n1 3 2 5 4\n', output: '3\n' },
      { input: '10\n10 9 8 7 6 5 4 3 2 1\n', output: '1\n' },
    ];

    for (let j = 0; j < tests.length; j++) {
      await prisma.testCase.create({
        data: {
          problemId: problem.id,
          testNo: j + 1,
          input: tests[j].input,
          expectedOutput: tests[j].output,
        },
      });
      testCaseCount++;
    }
  }

  logger.info(`Seed: ${testCaseCount} test cases created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. CONTESTS (2 contests)
  // ═══════════════════════════════════════════════════════════════════════════
  const now = new Date();
  const contestData = [
    {
      name: 'Cuộc thi lập trình tuần 1',
      startAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      status: 'PUBLISHED' as const,
    },
    {
      name: 'Cuộc thi thuật toán tháng 2',
      startAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      status: 'PUBLISHED' as const,
    },
  ];

  const createdContests: { id: number; roomId: number }[] = [];
  for (let i = 0; i < contestData.length; i++) {
    const cd = contestData[i];
    const room = createdRooms[i % createdRooms.length];
    const contest = await prisma.contest.create({
      data: {
        name: cd.name,
        startAt: cd.startAt,
        endAt: cd.endAt,
        status: cd.status,
        roomId: room.id,
      },
    });
    createdContests.push({ id: contest.id, roomId: room.id });
  }

  logger.info(`Seed: ${createdContests.length} contests created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. CONTEST PROBLEMS (link problems to contests)
  // ═══════════════════════════════════════════════════════════════════════════
  let cpCount = 0;
  for (const contest of createdContests) {
    const roomProblems = createdProblems.filter((p) => p.roomId === contest.roomId);
    for (let j = 0; j < Math.min(roomProblems.length, 3); j++) {
      await prisma.contestProblem.create({
        data: {
          contestId: contest.id,
          problemId: roomProblems[j].id,
          maxScore: 100,
          order: j + 1,
        },
      });
      cpCount++;
    }
  }

  logger.info(`Seed: ${cpCount} contest-problem links created`);

  // ═══════════════════════════════════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════════════════════════════════
  logger.info('═══════════════════════════════════════════════════');
  logger.info('Seed completed successfully!');
  logger.info(`  Users:            ${createdUsers.length}`);
  logger.info(`  Rooms:            ${createdRooms.length}`);
  logger.info(`  Room Members:     ${memberCount}`);
  logger.info(`  Problems:         ${createdProblems.length}`);
  logger.info(`  Test Cases:       ${testCaseCount}`);
  logger.info(`  Contests:         ${createdContests.length}`);
  logger.info(`  Contest Problems: ${cpCount}`);
  logger.info('═══════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
