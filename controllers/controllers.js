const {
    query_database,
    update_database,
    append_database,
} = require('./database_controllers');

/*
################### ADD POINTS CONTROLLERS ###################
*/

const add_points = async (req, res) => {
    const {payer, points, timestamp} = req.body;
    if(!payer||!points||!timestamp){
        return res.status(400).json({
            error: 'Missing data fields'
        });
    }
    try{
        const sql = `INSERT INTO Points (
            payer, 
            points, 
            timestamp
        ) VALUES (
            ?, 
            ?, 
            ?
        )`
        const add_row = await append_database(sql, [payer, points, timestamp]);
        res.status(200).send();
    } catch(error){
        res.status(500).json({error: err.message});
    }
}

/*
################### REDEEM POINTS CONTROLLERS ###################
*/

const redeem_points = async (req, res) => {
    // First check if the total points is greater than the requested redemption amount
    let {points: target_points} = req.body;
    try{
        const sql_sum = `
            SELECT SUM(points) as points
            FROM Points
        `
        const rows = await query_database(sql_sum);
        if(!rows||rows.length===0){
            res.status(400).json({message: 'user does not have enough points'});
            return;
        }
        const total_points = rows[0].points;
        if(!total_points||total_points<target_points){
            res.status(400).json({message: 'user does not have enough points'});
            return;
        }
        
        const sql_shortlist = `
            WITH CumulativePoints AS (
                SELECT
                    *,
                    SUM(points) OVER (ORDER BY timestamp) AS cum_points
                FROM Points
            )
            SELECT * FROM (
                SELECT 
                    id, 
                    payer, 
                    points,
                    timestamp
                FROM CumulativePoints
                WHERE cum_points<=? AND points>0
                ORDER BY timestamp
            ) AS Subquery1
            UNION
            SELECT * FROM (
                SELECT 
                    id, 
                    payer, 
                    points,
                    timestamp
                FROM CumulativePoints
                WHERE cum_points>=? AND points>0
                ORDER BY timestamp
                LIMIT 1
            ) AS Subquery2
            ORDER BY timestamp;
        `;
        const shortlist_rows = await query_database(sql_shortlist, [target_points, target_points]);

        let answer = {};
        const updated_rows = shortlist_rows.map(row => {
            if(target_points<=0||row.points<=0) return row;
            const deduct_points = Math.min(target_points, row.points);
            row.points -= deduct_points;
            target_points -= deduct_points;
            if(row.payer in answer){
                answer[row.payer]+=-(deduct_points);
            }else{
                answer[row.payer]=-(deduct_points);
            }
            return row;
        });
        updated_rows.forEach(async (row) => {
            const update_row = `
                UPDATE Points
                set points = ?
                WHERE id = ?;
            `
            const updation = await update_database(update_row, [row.points, row.id]);
        });
        res.status(200).json(answer);
        return;
    } catch(error) {
        res.status(500).json({error:error.message});
        return;
    }
}

/*
################### GET POINTS BALANCE CONTROLLERS ###################
*/

const get_points_balance_table = async (req, res) => {
    try{
        const sql1 = `SELECT payer, 
                      SUM(points) as points
                      FROM Points
                      GROUP BY payer`
        
        const rows = await query_database(sql1);
        const balances = {};
        rows.forEach((row) => {
            balances[row.payer] = row.points;
        })
        res.status(200).json(balances);
    } catch(error) {
        res.status(500).json({error: err.message});
    }
}

module.exports = {
    add_points,
    redeem_points,
    get_points_balance_table,
}