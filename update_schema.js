const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Update User model
const userModelRegex = /model User \{([\s\S]*?)\}/;
schema = schema.replace(userModelRegex, (match, contents) => {
  // Make passwordHash optional
  contents = contents.replace(/passwordHash\s+String/, 'passwordHash      String?');
  
  // Add emailVerified and image if not exist
  if (!contents.includes('emailVerified')) {
    contents = contents.replace(/email\s+String\s+@unique/, 'email             String          @unique\n  emailVerified     DateTime?');
  }
  if (!contents.includes('image')) {
    contents = contents.replace(/name\s+String/, 'name              String\n  image             String?');
  }
  
  // Add NextAuth relations
  if (!contents.includes('accounts Account[]')) {
    contents += '\n  accounts          Account[]\n  devices           Device[]\n  loginHistories    LoginHistory[]';
  }
  
  return `model User {${contents}}`;
});

// 2. Append NextAuth Models
const nextAuthModels = `
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  
  access_token       String?  
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Device {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  deviceString   String
  browser        String?
  os             String?
  ipAddress      String?
  lastActive     DateTime @default(now())
  createdAt      DateTime @default(now())
}

model LoginHistory {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider       String   // GOOGLE, MICROSOFT, APPLE, CREDENTIALS
  status         String   // SUCCESS, FAILED
  ipAddress      String?
  country        String?
  userAgent      String?
  createdAt      DateTime @default(now())
}
`;

if (!schema.includes('model Account {')) {
  schema += '\n' + nextAuthModels;
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Schema successfully updated with NextAuth models.');
