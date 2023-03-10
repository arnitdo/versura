// Refer to file `@/utils/init.sql` for PostgreSQL type definitions

type AuthUser = {
	walletId: string,
	userName: string,
	userPass: string
}

export {
	AuthUser
}