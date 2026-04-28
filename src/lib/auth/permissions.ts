import { createAccessControl, } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";


export const statements = {
  ...defaultStatements,
  categories: ["list", "get", "create", "update", "delete"],
} as const;

export const accessControl = createAccessControl(statements);

export const user = accessControl.newRole({
  categories: ["list", "get"],
});

export const admin = accessControl.newRole({
  ...adminAc.statements,
  categories: statements.categories,
});


export const roles = {
  user,
  admin
}