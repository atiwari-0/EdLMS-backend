export async function generateUniqueEmail(name: string, prisma: any): Promise<string> {
  const base = name.trim().toLowerCase().replace(/\s+/g, '');
  let email = `${base}@edlms.com`;
  let counter = 1;

  while (await prisma.user.findUnique({ where: { email } })) {
    email = `${base}${counter}@edlms.com`;
    counter++;
  }

  return email;
}
