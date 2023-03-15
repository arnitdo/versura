export type UserRole = "CLIENT" | "ADMIN"

export type AuthUsers = {
	walletAddress: string,
	userPass: string,
	userRole: UserRole
}