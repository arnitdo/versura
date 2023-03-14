export type UserRole = "CLIENT" | "ADMIN"

export type AuthUsers = {
	walletId: string,
	userPass: string,
	userRole: UserRole
}