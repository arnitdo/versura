import {Pool} from 'pg';

const db = new Pool({
	connectionString: process.env.AWS_RDS_DB_URL
})

if (!db){
	console.error(
		"Critical error connecting to database!" +
		"Perhaps check the connection string and instance status"
	)
}

export {
	db
}