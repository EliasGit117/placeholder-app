/**
 * Populate script: inserts (or repairs) a test admin user.
 *
 *   Email:    admin@mail.co
 *   Password: admin@mail.co
 *
 * Run with: bun run seed:admin
 *
 * Uses the better-auth server API to create the account so the password is
 * hashed exactly the way the login flow expects, then promotes the user to the
 * `admin` role and marks the email verified. Idempotent — re-running only
 * ensures the role/verification on an existing user.
 */
import { auth } from '@/lib/auth/better-auth.ts';
import { prisma } from '@/lib/db';

const email = 'admin@mail.co';
const password = 'admin@mail.co';
const name = 'Admin';

async function main() {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: 'admin', emailVerified: true },
    });
    console.log(`User ${email} already exists — ensured admin role + verified email.`);
    return;
  }

  await auth.api.signUpEmail({ body: { email, password, name } });
  await prisma.user.update({
    where: { email },
    data: { role: 'admin', emailVerified: true },
  });

  console.log(`Created admin user ${email} (password: ${password}).`);
}

main()
  .catch((error) => {
    console.error('Failed to seed admin user:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
