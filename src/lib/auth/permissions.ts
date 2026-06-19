import { createAccessControl, } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";


export const statements = {
  ...defaultStatements,
  categories: ["list", "get", "create", "update", "delete"],
  gallerySections: ["list", "get", "create", "update", "delete"],
  products: ["list", "get", "create", "update", "delete"],
  banners: ["list", "get", "create", "update", "delete"],
} as const;

export const accessControl = createAccessControl(statements);

export const user = accessControl.newRole({
  categories: ["list", "get"],
  gallerySections: ["list", "get"],
  products: ["list", "get"],
  banners: ["list", "get"],
});

export const admin = accessControl.newRole({
  ...adminAc.statements,
  categories: statements.categories,
  gallerySections: statements.gallerySections,
  products: statements.products,
  banners: statements.banners,
});


export const roles = {
  user,
  admin
}

export type TRole = keyof typeof roles;