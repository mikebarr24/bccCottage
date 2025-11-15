import { BookingStatus, IssuePriority, IssueStatus, PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.issueUpdate.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.calendarSync.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await hash('admin123', 10);
  const memberPassword = await hash('member123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Henry Admin',
      email: 'admin@bcc.local',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const member = await prisma.user.create({
    data: {
      name: 'Mournes Member',
      email: 'member@bcc.local',
      passwordHash: memberPassword,
      role: Role.MEMBER,
    },
  });

  const upcomingBooking = await prisma.booking.create({
    data: {
      title: 'Weekend Maintenance Party',
      notes: 'Tidy up the communal area and split logs.',
      startDate: addDays(new Date(), 7),
      endDate: addDays(new Date(), 9),
      status: BookingStatus.APPROVED,
      createdById: member.id,
      approvedById: admin.id,
      requesterName: 'Mournes Member',
      requesterEmail: 'member@bcc.local',
      requesterPhone: '0000 000 000',
    },
  });

  const electricsIssue = await prisma.issue.create({
    data: {
      title: 'Electrical circuit trips intermittently',
      description:
        'Power in the main room cuts out when the heater and kettle run together. Need electrician visit.',
      priority: IssuePriority.HIGH,
      status: IssueStatus.IN_PROGRESS,
      reportedById: member.id,
      assignedToId: admin.id,
      updates: {
        create: [
          {
            notes: 'Reported after weekend visit, noted smell of burning plastic.',
            authorId: member.id,
            status: IssueStatus.OPEN,
          },
          {
            notes: 'Admin contacted local electrician, awaiting visit Thursday.',
            authorId: admin.id,
            status: IssueStatus.IN_PROGRESS,
          },
        ],
      },
    },
  });

  await prisma.calendarSync.create({
    data: {
      googleCalendarId: 'primary',
      lastSyncedAt: null,
    },
  });

  console.log({
    admin,
    member,
    upcomingBooking,
    electricsIssue,
  });
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

