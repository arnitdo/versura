import {db} from '@/utils/db'

import type {NextApiRequest, NextApiResponse} from "next";
import type {AuthUser} from "@/utils/apiTypedefs";

async function apiIndex(req: NextApiRequest, res: NextApiResponse){
	try {
		const dbClient = await db.connect()
		
		const {rows: authUserRows} = await dbClient.query<AuthUser>(
			`SELECT * FROM "authUsers"`
		);
		
		res.status(200).json({
			"requestStatus": "SUCCESS",
			"authUserData": authUserRows
		})
		
		dbClient.release()
	} catch (err: any){
		console.error(err)
		res.status(500).json({
			"requestStatus": "ERR_INTERNAL_ERROR"
		})
	}
}

export default apiIndex;